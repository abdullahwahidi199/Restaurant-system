from django.urls import path

from .views import ChatView, ConversationList, ConversationMessages

app_name = "ai_assistant"
urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),
    path("conversations/", ConversationList.as_view(), name="conversations"),
    path("conversations/<uuid:conversation_id>/messages/", ConversationMessages.as_view(), name="messages"),
]
