from django.urls import path

from .views import ChatView, ConversationList, ConversationMessages
from .audit_views import AuditTurns, AuditTurnDetail, AuditEvents, AuditEventDetail, AuditConversations, AuditConversationMessages

app_name = "ai_assistant"
urlpatterns = [
    path("audit/turns/", AuditTurns.as_view(), name="audit-turns"),
    path("audit/turns/<uuid:turn_id>/", AuditTurnDetail.as_view(), name="audit-turn"),
    path("audit/turns/<uuid:turn_id>/events/", AuditEvents.as_view(), name="audit-events"),
    path("audit/turns/<uuid:turn_id>/events/<int:sequence>/", AuditEventDetail.as_view(), name="audit-event"),
    path("audit/conversations/", AuditConversations.as_view(), name="audit-conversations"),
    path("audit/conversations/<uuid:conversation_id>/messages/", AuditConversationMessages.as_view(), name="audit-conversation-messages"),
    path("chat/", ChatView.as_view(), name="chat"),
    path("conversations/", ConversationList.as_view(), name="conversations"),
    path("conversations/<uuid:conversation_id>/messages/", ConversationMessages.as_view(), name="messages"),
]
