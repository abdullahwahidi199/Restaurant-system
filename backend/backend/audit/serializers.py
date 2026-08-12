from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    branch_name = serializers.ReadOnlyField(source="branch.name")
    action_display = serializers.ReadOnlyField(source="get_action_display")
    module_display = serializers.ReadOnlyField(source="get_module_display")
    changes = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "restaurant",
            "branch",
            "branch_name",
            "user",
            "user_name",
            "user_role",
            "action",
            "action_display",
            "module",
            "module_display",
            "object_type",
            "object_id",
            "object_repr",
            "description",
            "old_values",
            "new_values",
            "changes",
            "metadata",
            "ip_address",
            "user_agent",
            "created_at",
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        if not obj.user_id:
            return "System"
        staff = getattr(obj.user, "staff_profile", None)
        return getattr(staff, "name", None) or obj.user.get_username()

    def get_user_role(self, obj):
        staff = getattr(obj.user, "staff_profile", None) if obj.user_id else None
        return getattr(staff, "role", "") or ""

    def get_changes(self, obj):
        keys = set((obj.old_values or {}).keys()) | set((obj.new_values or {}).keys())
        return {
            key: {
                "old": (obj.old_values or {}).get(key),
                "new": (obj.new_values or {}).get(key),
            }
            for key in sorted(keys)
        }

