from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.db import DatabaseError, transaction
from django.utils.decorators import method_decorator
from rest_framework import serializers
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import EFFORTS, MODELS
from .config import Limits
from .context import principal_for, scope_for
from .documents import DocumentRepository
from .models import Conversation
from .service import ConversationService, serialize_message


class ChatInput(serializers.Serializer):
    message = serializers.CharField(trim_whitespace=True, max_length=16000)
    conversation_id = serializers.UUIDField(required=False)
    model = serializers.ChoiceField(choices=MODELS, required=False)
    reasoning_effort = serializers.ChoiceField(choices=EFFORTS, required=False)

    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) - set(self.fields):
            raise serializers.ValidationError({"non_field_errors": ["Unexpected chat fields."]})
        return super().to_internal_value(data)


class BusinessAnalystThrottle(UserRateThrottle):
    scope = "business_analyst"

    def get_rate(self):
        rate = getattr(settings, "BUSINESS_ANALYST_THROTTLE_RATE", "10/min")
        try:
            count, _ = self.parse_rate(rate)
            if not count or count < 1:
                raise ValueError
        except (ValueError, TypeError, KeyError, AttributeError, IndexError):
            raise AssistantError("configuration_invalid", "The Business Analyst request limit is invalid.") from None
        return rate

    def allow_request(self, request, view):
        try:
            return super().allow_request(request, view)
        except AssistantError:
            raise
        except Exception:
            raise AssistantError("throttle_unavailable", "The Business Analyst request limiter is unavailable.") from None


class AnalystView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    throttle_classes = [BusinessAnalystThrottle]

    def handle_exception(self, exc):
        if isinstance(exc, AssistantError):
            body = {"error": exc.as_dict()}
            for key in ("conversation_id", "request_id"):
                if hasattr(exc, key):
                    body[key] = getattr(exc, key)
            return Response(body, status=exc.status)
        if isinstance(exc, DatabaseError):
            return Response({"error": {"code": "storage_unavailable", "message": "Business Analyst storage is unavailable."}}, status=503)
        return super().handle_exception(exc)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store, private"
        return response


@method_decorator(transaction.non_atomic_requests, name="dispatch")
class ChatView(AnalystView):
    def post(self, request):
        try:
            if len(request.body) > Limits.configured().request_bytes:
                raise AssistantError("request_too_large", "The chat request exceeds the size limit.", 413)
        except RequestDataTooBig:
            raise AssistantError("request_too_large", "The chat request exceeds the size limit.", 413) from None
        data = ChatInput(data=request.data)
        data.is_valid(raise_exception=True)
        values = dict(data.validated_data)
        values["question"] = values.pop("message")
        return Response(ConversationService().reply(user=request.user, **values))


def page_for(request):
    try:
        page = int(request.query_params.get("page", "0"))
        if not 0 <= page <= 10000:
            raise ValueError
        return page
    except (ValueError, TypeError):
        raise AssistantError("invalid_page", "Page must be between 0 and 10000.", 400) from None


class ConversationList(AnalystView):
    def get(self, request):
        principal = principal_for(request.user)
        page = page_for(request)
        items = list(Conversation.objects.filter(**scope_for(request.user, principal))[page * 20:page * 20 + 21])
        return Response({"results": [{"id": str(item.pk), "title": item.title,
                                     "updated_at": item.updated_at.isoformat()} for item in items[:20]],
                         "next_page": page + 1 if len(items) > 20 else None})


class ConversationMessages(AnalystView):
    def get(self, request, conversation_id):
        principal = principal_for(request.user)
        conversation = Conversation.objects.filter(pk=conversation_id, **scope_for(request.user, principal)).first()
        if not conversation:
            raise AssistantError("conversation_not_found", "The conversation is not available in the current context.", 404)
        page = page_for(request)
        items = list(conversation.messages.all()[page * 40:page * 40 + 41])
        documents, limits = DocumentRepository(), Limits.configured()
        return Response({"conversation_id": str(conversation.pk),
                         "results": [serialize_message(item, documents, principal, limits) for item in items[:40]],
                         "next_page": page + 1 if len(items) > 40 else None})
