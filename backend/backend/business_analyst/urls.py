from django.urls import path
from .views import ChatView, ConversationList, ConversationMessages, ModelOptions

app_name = "business_analyst"
urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),
    path("model-options/", ModelOptions.as_view(), name="model-options"),
    path("conversations/", ConversationList.as_view(), name="conversations"),
    path("conversations/<uuid:conversation_id>/messages/", ConversationMessages.as_view(), name="messages"),
]
