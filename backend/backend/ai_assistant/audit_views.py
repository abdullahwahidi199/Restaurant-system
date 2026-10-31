"""Global SuperAdmin-only read API; never reuse restaurant-admin permissions."""
import logging
from cryptography.fernet import InvalidToken
from django.contrib.auth import get_user_model
from django.db import DatabaseError
from django.db.models import Sum, BigIntegerField, Count
from django.db.models.functions import Cast
from rest_framework import generics, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from users.permissions import IsSuperAdmin

from .audit_payloads import read_blob, redact
from .errors import AssistantError
from .models import TurnAudit, AuditEvent, AuditAccess, Conversation
from .agents import AGENT_LABELS
from .model_configuration import public_configuration_snapshot

logger = logging.getLogger("ai_assistant")


def authorized(user):
    return bool(user and user.is_authenticated and user.is_active and user.is_superuser and
                get_user_model().objects.filter(pk=user.pk, is_active=True, is_superuser=True).exists())


class AuditPermission(IsSuperAdmin):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and authorized(request.user)


class AuditPage(PageNumberPagination):
    page_size = 20
    max_page_size = 50
    page_size_query_param = "page_size"


class Filters(serializers.Serializer):
    agent_type = serializers.RegexField(r"^[a-z][a-z0-9_]{0,63}$", required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    user = serializers.IntegerField(required=False, min_value=1)
    restaurant = serializers.IntegerField(required=False, min_value=1)
    branch = serializers.IntegerField(required=False, min_value=1)
    conversation = serializers.UUIDField(required=False)
    status = serializers.ChoiceField(choices=["processing","completed","failed","interrupted"], required=False)
    model = serializers.CharField(required=False, max_length=100)
    tool = serializers.RegexField(r"^[a-z][a-z0-9_.]{0,99}$", required=False)
    error_category = serializers.CharField(required=False, max_length=100)
    error_code = serializers.CharField(required=False, max_length=80)


def access(request, kind, turn=None, sequence=None):
    # This write must succeed before returning sensitive content. No recursive
    # full-payload recording and no request headers/filters/user contents here.
    AuditAccess.objects.create(user=request.user, actor_identifier=request.user.pk, turn_identifier=turn, event_sequence=sequence, access_type=kind)


def event_metadata(event):
    return {"id":event.pk, "sequence":event.sequence, "event_type":event.event_type, "status":event.status,
        "started_at":event.started_at, "finished_at":event.finished_at, "duration_ms":event.duration_ms,
        "model_ordinal":event.model_ordinal, "tool_call_id":event.tool_call_id or None, "tool_name":event.tool_name or None,
        "payload_bytes":event.payload.byte_count, "legacy_id": event.legacy_id}


def summary(turn):
    question = read_blob(turn.question_payload) if turn.question_payload_id else {}
    return {"id":str(turn.pk), "request_id":str(turn.pk), "conversation_id":str(turn.conversation_identifier),
        "agent_type": turn.agent_type, "agent_label": AGENT_LABELS.get(turn.agent_type, turn.agent_type),
        "user":{"id":question.get("user_id",turn.user_id),
                "username":question.get("username") or (redact(turn.user.username) if turn.user_id else "Deleted user"),
                "username_is_snapshot": "username" in question},
        "restaurant_id":question.get("restaurant_id",turn.restaurant_id), "branch_id":question.get("branch_id",turn.branch_id), "language":turn.language,
        "question_preview":question.get("content","")[:180], "status":turn.status, "model":turn.model, "provider":turn.provider,
        "model_configuration":public_configuration_snapshot(redact(turn.model_configuration or question.get('model_configuration'))),
        "legacy_capture": question.get("legacy_capture"),
        "started_at":turn.started_at, "finished_at":turn.finished_at, "duration_ms":turn.duration_ms,
        "model_calls":turn.model_calls, "completed_model_calls":turn.completed_model_calls,
        "tool_calls":turn.tool_calls, "completed_tool_calls":turn.completed_tool_calls,
        "batches": turn.batches, "operations": turn.operations,
        "usage":turn.usage, "usage_complete":turn.usage_complete, "estimated_cost":None,
        "error_code":turn.error_code or None, "error_category":turn.error_category or None, "failure_stage":turn.failure_stage or None}


def rollup(conversation_id, agent_type):
    qs = TurnAudit.objects.filter(conversation_identifier=conversation_id, agent_type=agent_type)
    values = qs.aggregate(model_calls=Sum("model_calls"), tool_calls=Sum("tool_calls"), duration_ms=Sum("duration_ms"),
        **{k:Sum(Cast("usage__"+k,BigIntegerField())) for k in ("prompt_tokens","completion_tokens","total_tokens","prompt_cache_hit_tokens","prompt_cache_miss_tokens")})
    return {"turns":qs.count(), "usage_complete":not qs.filter(usage_complete=False).exists(), "estimated_cost":None, **values}


class AuditView(generics.GenericAPIView):
    permission_classes = [AuditPermission]
    pagination_class = AuditPage
    http_method_names = ["get", "head", "options"]

    def turns(self):
        # Explicit query-level gate as well as the DRF permission check.
        return TurnAudit.objects.select_related("question_payload", "user").all() if authorized(self.request.user) else TurnAudit.objects.none()

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request,response,*args,**kwargs)
        response["Cache-Control"] = "no-store, private"
        response["X-Robots-Tag"] = "noindex, nofollow"
        response["Pragma"] = "no-cache"
        return response

    def handle_exception(self, exc):
        if isinstance(exc,(DatabaseError,InvalidToken,AssistantError,ValueError,KeyError)):
            return Response({"error":{"code":"audit_unavailable","message":"Audit storage or its encrypted payload is unavailable."}}, status=503)
        try:
            return super().handle_exception(exc)
        except Exception:
            logger.error("assistant_audit_read_failed",extra={"exception_category":type(exc).__name__,"failure_stage":"audit_read"})
            return Response({"error":{"code":"audit_unavailable","message":"Audit data is unavailable."}},status=503)

    def page(self, rows, render):
        page = self.paginate_queryset(rows)
        return self.get_paginated_response([render(item) for item in page])


def filtered_turns(qs, values):
    for key,value in values.items():
        if key == "tool":
            qs = qs.filter(events__tool_name=value, events__event_type__in=["tool_call", "operation_finished"]).distinct()
        else:
            field = {"start_date":"started_at__date__gte", "end_date":"started_at__date__lte", "user":"user_id",
                     "restaurant":"restaurant_id", "branch":"branch_id", "conversation":"conversation_identifier"}.get(key,key)
            qs = qs.filter(**{field:value})
    return qs


class AuditTurns(AuditView):
    def get(self, request):
        filters = Filters(data=request.query_params)
        filters.is_valid(raise_exception=True)
        qs = filtered_turns(self.turns(), filters.validated_data)
        access(request,"turn_list")
        return self.page(qs,summary)


class AuditTurnDetail(AuditView):
    def get(self, request, turn_id):
        turn = generics.get_object_or_404(self.turns(),pk=turn_id)
        access(request,"turn_detail",turn.pk)
        result = summary(turn)
        generated = turn.events.filter(event_type="answer_generated").select_related("payload").last()
        final_answer = {"message_id": turn.assistant_message.public_id if turn.assistant_message_id else None,
                        **read_blob(generated.payload)} if generated else None
        if final_answer is None and turn.assistant_message_id:
            message = turn.assistant_message
            final_answer = redact({"message_id": message.public_id, "content": message.content, "kind": message.kind,
                "sources": message.sources, "capture_boundary": "legacy_stored_message", "original_snapshot_unavailable": True})
        result.update(question=read_blob(turn.question_payload) if turn.question_payload_id else {}, stage_durations=turn.stage_durations,
            final_answer=final_answer,
            conversation_totals=rollup(turn.conversation_identifier, turn.agent_type),
            last_event=event_metadata(turn.events.select_related("payload").last()) if turn.events.exists() else None,
            recent_access=[{"user_id":a.actor_identifier,"type":a.access_type,"time":a.created_at} for a in AuditAccess.objects.filter(turn_identifier=turn.pk).order_by("-created_at")[:10]])
        return Response(result)


class AuditEvents(AuditView):
    def get(self, request, turn_id):
        turn = generics.get_object_or_404(self.turns(),pk=turn_id)
        access(request,"timeline",turn.pk)
        return self.page(turn.events.select_related("payload").defer("payload__ciphertext").all(),event_metadata)


class AuditEventDetail(AuditView):
    def get(self, request, turn_id, sequence):
        turn = generics.get_object_or_404(self.turns(),pk=turn_id)
        event = generics.get_object_or_404(turn.events.select_related("payload"),sequence=sequence)
        access(request,"event_payload",turn.pk,event.sequence)
        return Response({**event_metadata(event), "payload":read_blob(event.payload)})


class AuditConversations(AuditView):
    def get(self, request):
        qs = Conversation.objects.select_related("user").annotate(audited_turns=Count("audits", distinct=True)).order_by("-updated_at", "-pk") if authorized(request.user) else Conversation.objects.none()
        filters = Filters(data=request.query_params)
        filters.is_valid(raise_exception=True)
        values = filters.validated_data
        for key in ("agent_type", "user", "restaurant", "branch", "conversation"):
            if key in values:
                field = {"user": "user_id", "restaurant": "restaurant_id", "branch": "branch_id", "conversation": "pk"}.get(key, key)
                qs = qs.filter(**{field: values[key]})
        if set(values) & {"status", "model", "tool", "error_category", "error_code"}:
            qs = qs.filter(pk__in=filtered_turns(self.turns(), values).values("conversation_id"))
        else:
            for key, lookup in (("start_date", "gte"), ("end_date", "lte")):
                if key in values:
                    qs = qs.filter(**{f"updated_at__date__{lookup}": values[key]})
        access(request,"conversation_list")
        return self.page(qs,lambda c:{"id":str(c.pk),"title":redact(c.title),"user_id":c.user_id,
            "agent_type": c.agent_type, "agent_label": AGENT_LABELS.get(c.agent_type, c.agent_type),
            "username":redact(c.user.username), "updated_at":c.updated_at,"audited_turns":c.audited_turns,
            "trace_available":bool(c.audited_turns)})


class AuditConversationMessages(AuditView):
    def get(self, request, conversation_id):
        qs = Conversation.objects.all() if authorized(request.user) else Conversation.objects.none()
        conversation = generics.get_object_or_404(qs,pk=conversation_id)
        access(request,"conversation_messages",conversation.pk)
        # Legacy messages are shown as legacy, never reconstructed into events.
        messages = self.paginate_queryset(conversation.messages.all())
        audited = set(conversation.audits.filter(pk__in=[m.request_id for m in messages]).values_list("request_id",flat=True))
        response = self.get_paginated_response([redact({"id":m.public_id,"role":m.role,"content":m.content,
            "state":m.state,"created_at":m.created_at.isoformat(),"sources":m.sources,"request_id":str(m.request_id),
            "trace_available":m.request_id in audited}) for m in messages])
        response.data["conversation_totals"] = rollup(conversation.pk, conversation.agent_type)
        response.data["agent_type"] = conversation.agent_type
        return response


class AuditAgents(AuditView):
    def get(self, request):
        access(request, "agent_list")
        known = set(AGENT_LABELS) | set(self.turns().order_by().values_list("agent_type", flat=True).distinct())
        if authorized(request.user):
            known.update(Conversation.objects.order_by().values_list("agent_type", flat=True).distinct())
        tools = set(AuditEvent.objects.filter(turn__in=self.turns()).exclude(tool_name="").order_by().values_list("tool_name", flat=True).distinct())
        return Response({"agents": [{"value": value, "label": AGENT_LABELS.get(value, value)} for value in sorted(known)],
                         "tools": sorted(tools | {"search_documentation", "fetch_documentation", "retrieve_business_context"})})
