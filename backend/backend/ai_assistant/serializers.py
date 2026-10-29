from rest_framework import serializers

from .config import Limits
from .model_configuration import MODELS, EFFORTS


class ChatInput(serializers.Serializer):
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    message = serializers.CharField(trim_whitespace=False, allow_blank=False)
    model = serializers.ChoiceField(choices=MODELS, required=False)
    reasoning_effort = serializers.ChoiceField(choices=EFFORTS, required=False)

    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) - set(self.fields):
            raise serializers.ValidationError({"non_field_errors": ["Only message, conversation_id, model and reasoning_effort are accepted."]})
        if not isinstance(data.get("message"), str):
            raise serializers.ValidationError({"message": ["Message must be a string."]})
        return super().to_internal_value(data)

    def validate_message(self, value):
        try:
            value.encode("utf-8")
        except UnicodeError:
            raise serializers.ValidationError("Message must contain valid Unicode text.") from None
        if not value.strip() or len(value) > Limits.configured().input_characters:
            raise serializers.ValidationError("Enter a nonempty message within the configured length limit.")
        return value
