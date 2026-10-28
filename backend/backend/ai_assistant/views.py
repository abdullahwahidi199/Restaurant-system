from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.db import DatabaseError
from django.utils.translation import get_language_from_request
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView
from knowledge.errors import GatewayError

from .config import Limits
from .errors import AssistantError
from .models import Conversation
from .serializers import ChatInput
from .service import ConversationService, get_gateway, principal_for, scope_for, serialize_message


class AssistantThrottle(UserRateThrottle):
    scope = "ai_assistant"

    def get_rate(self):
        rate = getattr(settings, "AI_ASSISTANT_THROTTLE_RATE", "10/min")
        try:
            count, _ = self.parse_rate(rate)
            if not count or count < 1:
                raise ValueError
        except (ValueError, TypeError, KeyError, AttributeError, IndexError):
            raise AssistantError("configuration_invalid", "The assistant request limit is not configured correctly.") from None
        return rate

    def allow_request(self, request, view):
        try:
            return super().allow_request(request, view)
        except Exception:
            raise AssistantError("assistant_throttle_unavailable", "Assistant request limits could not be verified. Please try again later.") from None


class AssistantView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    throttle_classes = [AssistantThrottle]

    def handle_exception(self, exc):
        if isinstance(exc, (AssistantError, GatewayError)):
            response = {"error": exc.as_dict() if isinstance(exc, AssistantError) else {"code": exc.code, "message": exc.message}}
            for name in ("conversation_id", "request_id"):
                if hasattr(exc, name):
                    response[name] = getattr(exc, name)
            return Response(response, status=exc.status if isinstance(exc, AssistantError) else 503)
        if isinstance(exc, DatabaseError):
            return Response({"error": {"code": "assistant_storage_unavailable", "message": "The assistant's storage or authorization is unavailable. Please try again."}}, status=503)
        return super().handle_exception(exc)


class ChatView(AssistantView):
    def post(self, request):
        limit = Limits.configured().request_bytes
        try:
            if len(request.body) > limit:
                raise AssistantError("request_too_large", "The chat request exceeds the supported size.", 413)
        except RequestDataTooBig:
            raise AssistantError("request_too_large", "The chat request exceeds the supported size.", 413) from None
        data = ChatInput(data=request.data)
        data.is_valid(raise_exception=True)
        language = get_language_from_request(request).split("-")[0]
        result = ConversationService().reply(user=request.user, question=data.validated_data["message"], conversation_id=data.validated_data.get("conversation_id"), preferred_language=language)
        return Response(result, status=status.HTTP_200_OK)


class ConversationList(AssistantView):
    def get(self, request):
        principal = principal_for(request.user, get_gateway())
        page = _page(request)
        queryset = Conversation.objects.filter(**scope_for(request.user, principal))
        items = list(queryset[page * 20:(page + 1) * 20 + 1])
        return Response({"results": [{"id": str(item.pk), "title": item.title, "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()} for item in items[:20]],
                         "next_page": page + 1 if len(items) > 20 else None})


def _page(request):
    try:
        page = int(request.query_params.get("page", "0"))
        if page < 0 or page > 10000:
            raise ValueError
        return page
    except (ValueError, TypeError):
        raise AssistantError("invalid_page", "Page must be an integer between 0 and 10000.", 400) from None


class ConversationMessages(AssistantView):
    def get(self, request, conversation_id):
        gateway = get_gateway()
        principal = principal_for(request.user, gateway)
        conversation = Conversation.objects.filter(id=conversation_id, **scope_for(request.user, principal)).first()
        if not conversation:
            raise AssistantError("conversation_not_found", "The conversation is not available in the current context.", 404)
        page = _page(request)
        items = list(conversation.messages.all()[page * 40:(page + 1) * 40 + 1])
        index = gateway.repository.get() if any(item.sources for item in items[:40]) else None
        return Response({"conversation_id": str(conversation.pk), "results": [serialize_message(item, principal=principal, index=index) for item in items[:40]],
                         "next_page": page + 1 if len(items) > 40 else None})
