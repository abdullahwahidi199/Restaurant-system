from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from django.db import models, transaction
from django.utils import timezone

from .constants import AuditAction, AuditModule
from .models import AuditLog


SENSITIVE_FIELD_NAMES = {
    "password",
    "token",
    "access",
    "refresh",
    "secret",
    "api_key",
    "authorization",
    "credentials",
}


def bounded_audit_text(field_name, value):
    """Normalize audit identifiers to the limits declared by the model."""
    text = str(value or "")
    max_length = AuditLog._meta.get_field(field_name).max_length
    return text[:max_length] if max_length else text


def _is_sensitive(field_name):
    normalized = str(field_name or "").lower()
    return any(part in normalized for part in SENSITIVE_FIELD_NAMES)


def normalize_audit_value(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, datetime):
        if timezone.is_aware(value):
            value = timezone.localtime(value)
        return value.isoformat()
    if isinstance(value, (date, time)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, models.Model):
        return {
            "id": value.pk,
            "repr": str(value),
        }
    if isinstance(value, dict):
        return {
            str(key): normalize_audit_value(val)
            for key, val in value.items()
            if not _is_sensitive(key)
        }
    if isinstance(value, (list, tuple, set)):
        return [normalize_audit_value(item) for item in value]
    return value


def snapshot_instance(instance, fields=None):
    if not instance:
        return {}

    data = {}
    model_fields = [
        field
        for field in instance._meta.get_fields()
        if getattr(field, "concrete", False) and not getattr(field, "many_to_many", False)
    ]
    allowed = set(fields) if fields else None

    for field in model_fields:
        if allowed and field.name not in allowed and field.attname not in allowed:
            continue
        if _is_sensitive(field.name):
            continue

        if isinstance(field, models.ForeignKey):
            related = getattr(instance, field.name, None)
            data[field.name] = normalize_audit_value(related)
        else:
            data[field.name] = normalize_audit_value(getattr(instance, field.name, None))

    for field in instance._meta.many_to_many:
        if allowed and field.name not in allowed:
            continue
        if not instance.pk:
            data[field.name] = []
        else:
            data[field.name] = [
                normalize_audit_value(obj)
                for obj in getattr(instance, field.name).all()
            ]

    return data


def calculate_field_changes(old_values, new_values, fields=None):
    old_values = old_values or {}
    new_values = new_values or {}
    field_names = set(fields or old_values.keys() | new_values.keys())
    changes = {}

    for field in sorted(field_names):
        if _is_sensitive(field):
            continue
        old = normalize_audit_value(old_values.get(field))
        new = normalize_audit_value(new_values.get(field))
        if old != new:
            changes[field] = {"old": old, "new": new}

    return changes


def changed_old_values(changes):
    return {field: values.get("old") for field, values in (changes or {}).items()}


def changed_new_values(changes):
    return {field: values.get("new") for field, values in (changes or {}).items()}


def actor_name(request=None, user=None):
    actor = user or getattr(request, "user", None)
    staff = getattr(actor, "staff_profile", None)
    return getattr(staff, "name", None) or getattr(actor, "get_username", lambda: "System")()


def get_client_ip(request):
    if not request:
        return None
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def create_audit_log(
    *,
    request=None,
    user=None,
    restaurant=None,
    branch=None,
    action,
    module,
    object_type=None,
    object_id=None,
    object_repr="",
    description="",
    old_values=None,
    new_values=None,
    metadata=None,
    on_commit=True,
):
    actor = user or getattr(request, "user", None)
    if not restaurant and hasattr(actor, "staff_profile"):
        restaurant = actor.staff_profile.restaurant
    if not branch:
        branch = getattr(request, "active_branch", None)

    if not restaurant:
        return None

    payload = {
        "restaurant": restaurant,
        "branch": branch,
        "user": actor if getattr(actor, "is_authenticated", False) else None,
        "action": bounded_audit_text("action", action),
        "module": bounded_audit_text("module", module),
        "object_type": bounded_audit_text("object_type", object_type),
        "object_id": bounded_audit_text("object_id", object_id),
        "object_repr": bounded_audit_text("object_repr", object_repr),
        "description": description or "",
        "old_values": normalize_audit_value(old_values or {}),
        "new_values": normalize_audit_value(new_values or {}),
        "metadata": normalize_audit_value(metadata or {}),
        "ip_address": get_client_ip(request),
        # Some production databases predate the TextField definition and still
        # enforce varchar(100). Migration 0003 repairs that schema drift; this
        # bound also keeps audit logging safe while deployments are rolling.
        "user_agent": (
            request.META.get("HTTP_USER_AGENT", "")[:100] if request else ""
        ),
    }

    def _create():
        return AuditLog.objects.create(**payload)

    if on_commit:
        # Audit logging must not turn a completed business operation into a 500.
        # Django logs callback failures when robust=True so they remain visible.
        transaction.on_commit(_create, robust=True)
        return None
    return _create()


def record_instance_create(
    *,
    request,
    instance,
    module,
    description=None,
    fields=None,
    object_type=None,
    object_repr=None,
    branch=None,
    metadata=None,
    severity="INFO",
):
    values = snapshot_instance(instance, fields=fields)
    resolved_branch = branch if branch is not None else getattr(instance, "branch", None)
    restaurant = getattr(instance, "restaurant", None) or getattr(resolved_branch, "restaurant", None)
    return create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=resolved_branch,
        action=AuditAction.CREATE,
        module=module,
        object_type=object_type or instance.__class__.__name__,
        object_id=instance.pk,
        object_repr=object_repr or str(instance),
        description=description or f"{actor_name(request)} created {instance}.",
        new_values=values,
        metadata={**(metadata or {}), "severity": severity},
    )


def record_instance_update(
    *,
    request,
    instance,
    old_values,
    module,
    description=None,
    fields=None,
    object_type=None,
    object_repr=None,
    branch=None,
    action=None,
    status_fields=("status", "is_active"),
    assignment_fields=("branches", "active_branch", "station", "stations", "permissions"),
    metadata=None,
    severity="INFO",
):
    new_values = snapshot_instance(instance, fields=fields)
    changes = calculate_field_changes(old_values, new_values, fields=fields)
    if not changes:
        return None

    changed_fields = set(changes)
    resolved_action = action
    if resolved_action is None:
        if changed_fields & set(assignment_fields):
            resolved_action = AuditAction.ASSIGNMENT_CHANGE
        elif changed_fields & set(status_fields):
            resolved_action = AuditAction.STATUS_CHANGE
        else:
            resolved_action = AuditAction.UPDATE

    resolved_branch = branch if branch is not None else getattr(instance, "branch", None)
    restaurant = getattr(instance, "restaurant", None) or getattr(resolved_branch, "restaurant", None)
    return create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=resolved_branch,
        action=resolved_action,
        module=module,
        object_type=object_type or instance.__class__.__name__,
        object_id=instance.pk,
        object_repr=object_repr or str(instance),
        description=description or f"{actor_name(request)} updated {instance}.",
        old_values=changed_old_values(changes),
        new_values=changed_new_values(changes),
        metadata={**(metadata or {}), "changes": changes, "severity": severity},
    )


def record_instance_delete(
    *,
    request,
    instance,
    module,
    description=None,
    fields=None,
    object_type=None,
    object_repr=None,
    branch=None,
    metadata=None,
    severity="WARNING",
):
    old_values = snapshot_instance(instance, fields=fields)
    resolved_branch = branch if branch is not None else getattr(instance, "branch", None)
    restaurant = getattr(instance, "restaurant", None) or getattr(resolved_branch, "restaurant", None)
    return create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=resolved_branch,
        action=AuditAction.DELETE,
        module=module,
        object_type=object_type or instance.__class__.__name__,
        object_id=instance.pk,
        object_repr=object_repr or str(instance),
        description=description or f"{actor_name(request)} deleted {instance}.",
        old_values=old_values,
        metadata={**(metadata or {}), "severity": severity},
        on_commit=False,
    )


def record_report_export(
    *,
    request,
    report_type,
    export_format="pdf",
    branch=None,
    start=None,
    end=None,
    metadata=None,
):
    staff = getattr(request.user, "staff_profile", None)
    restaurant = getattr(staff, "restaurant", None)
    if not restaurant:
        return None

    export_metadata = {
        "report_type": report_type,
        "format": export_format,
        "date_from": start,
        "date_to": end,
        "branch": getattr(branch, "name", "All Branches" if branch is None else None),
        "severity": "WARNING",
    }
    if metadata:
        export_metadata.update(metadata)

    return create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=branch,
        action=AuditAction.EXPORT,
        module=AuditModule.REPORTS,
        object_type="ReportExport",
        object_id=f"{report_type}:{export_format}",
        object_repr=f"{report_type} {export_format.upper()}",
        description=(
            f"{actor_name(request)} exported {report_type} report"
            f" as {export_format.upper()}."
        ),
        metadata=export_metadata,
    )
