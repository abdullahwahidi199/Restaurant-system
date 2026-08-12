from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "restaurant",
        "branch",
        "user",
        "module",
        "action",
        "object_type",
        "object_id",
    )
    list_filter = ("module", "action", "restaurant", "branch", "created_at")
    search_fields = ("object_repr", "description", "object_type", "object_id")
    readonly_fields = [field.name for field in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

