from types import SimpleNamespace

from django.core import signing
from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from audit.constants import AuditAction, AuditModule
from audit.services import create_audit_log
from restaurants.branching import get_active_branch
from restaurants.models import Branch, Restaurant

from .authentication import set_session_validity
from .models import AuthSession
from .permissions import CanMonitorUserActivity, CanRevokeUserSessions
from .presence import (
    broadcast_presence_change,
    classify_presence,
    get_presence_many,
    get_restaurant_presence,
    idle_threshold,
    iso_from_timestamp,
    online_threshold,
    remove_presence,
    touch_presence,
)


def _viewer_scope(request):
    if request.user.is_superuser:
        restaurant_id = request.query_params.get("restaurant") or request.data.get("restaurant")
        if not restaurant_id:
            raise ValidationError({"restaurant": "A restaurant is required for platform-wide monitoring."})
        restaurant = get_object_or_404(Restaurant, pk=restaurant_id)
        branch_id = request.query_params.get("branch") or request.data.get("branch")
        branch = None
        if branch_id and branch_id != "all":
            branch = get_object_or_404(Branch, pk=branch_id, restaurant=restaurant)
        return restaurant, branch

    staff = getattr(request.user, "staff_profile", None)
    if not staff or not staff.restaurant_id:
        raise PermissionDenied("No restaurant is assigned to this user.")

    requested = request.query_params.get("branch") or request.data.get("branch")
    if staff.role == "BranchAdmin":
        assigned = staff.get_assigned_branch()
        if requested and requested not in ("all", str(getattr(assigned, "id", ""))):
            raise PermissionDenied("Branch administrators can only monitor their assigned branch.")
        return staff.restaurant, assigned

    if requested == "all":
        if staff.role == "Admin" or staff.has_all_branch_access:
            return staff.restaurant, None
        raise PermissionDenied("You cannot monitor all branches.")

    if requested:
        branch = get_object_or_404(Branch, pk=requested, restaurant=staff.restaurant, is_active=True)
        if not staff.can_access_branch(branch):
            raise PermissionDenied("You do not have access to this branch.")
        return staff.restaurant, branch

    return staff.restaurant, get_active_branch(request, raise_exception=False)


def _valid_sessions(restaurant, branch=None):
    qs = AuthSession.objects.filter(
        restaurant=restaurant,
        ended_at__isnull=True,
        revoked_at__isnull=True,
        refresh_expires_at__gt=timezone.now(),
    )
    return qs.filter(branch=branch) if branch else qs


def _record_expired_sessions(restaurant):
    """Persist expiry once, without requiring a heartbeat or browser-close event."""
    expired = list(
        AuthSession.objects.filter(
            restaurant=restaurant,
            ended_at__isnull=True,
            revoked_at__isnull=True,
            refresh_expires_at__lte=timezone.now(),
        ).select_related("user", "restaurant", "branch")[:200]
    )
    for session in expired:
        session.ended_at = session.refresh_expires_at
        session.end_reason = AuthSession.END_EXPIRED
        session.save(update_fields=["ended_at", "end_reason"])
        set_session_validity(session.id, False, timeout=86400)
        remove_presence(session.id, session.restaurant_id, session.branch_id)
        create_audit_log(
            request=None,
            user=session.user,
            restaurant=session.restaurant,
            branch=session.branch,
            action=AuditAction.SESSION_EXPIRED,
            module=AuditModule.SECURITY,
            object_type="AuthSession",
            object_id=str(session.id),
            object_repr=session.user.username,
            description=f"Session for {session.user.username} expired.",
            metadata={"session_id": str(session.id), "severity": "INFO"},
        )
        broadcast_presence_change(session.restaurant_id, session.branch_id, "expired")


def _summary_for(restaurant, branch):
    valid_qs = _valid_sessions(restaurant, branch)
    valid_rows = list(valid_qs.values("id", "user_id", "role", "branch_id"))
    valid_ids = {str(row["id"]) for row in valid_rows}
    user_by_session = {str(row["id"]): row["user_id"] for row in valid_rows}
    row_by_session = {str(row["id"]): row for row in valid_rows}
    presence = get_restaurant_presence(restaurant.id)
    active_users = set()
    idle_users = set()
    online_sessions = 0
    role_sessions = {}
    role_users = {}
    branch_sessions = {}
    branch_users = {}
    for session_id, record in presence.items():
        if session_id not in valid_ids:
            continue
        if branch and record.get("branch_id") != branch.id:
            continue
        state = classify_presence(record)
        user_id = user_by_session[session_id]
        if state == "active":
            active_users.add(user_id)
            online_sessions += 1
        elif state == "idle":
            idle_users.add(user_id)
            online_sessions += 1
        else:
            continue
        row = row_by_session[session_id]
        role_name = row["role"] or "Unknown"
        current_branch_id = record.get("branch_id") or row["branch_id"]
        role_sessions[role_name] = role_sessions.get(role_name, 0) + 1
        role_users.setdefault(role_name, set()).add(user_id)
        if current_branch_id:
            branch_sessions[current_branch_id] = branch_sessions.get(current_branch_id, 0) + 1
            branch_users.setdefault(current_branch_id, set()).add(user_id)
    idle_users -= active_users
    return {
        "unique_active_users": len(active_users),
        "active_sessions": online_sessions,
        "idle_users": len(idle_users),
        "valid_accounts": len({row["user_id"] for row in valid_rows}),
        "valid_sessions": len(valid_rows),
        "online_users": len(active_users | idle_users),
        "by_role": [
            {"role": role, "users": len(role_users[role]), "sessions": sessions}
            for role, sessions in sorted(role_sessions.items())
        ],
        "by_branch": [
            {
                "branch_id": branch_id,
                "branch": branch_name,
                "users": len(branch_users.get(branch_id, set())),
                "sessions": branch_sessions.get(branch_id, 0),
            }
            for branch_id, branch_name in Branch.objects.filter(
                restaurant=restaurant,
                id__in=branch_sessions,
            ).values_list("id", "name")
        ],
        "definitions": {
            "active": f"A heartbeat in the last {online_threshold()} seconds and meaningful activity in the last {idle_threshold()} seconds.",
            "idle": f"A heartbeat in the last {online_threshold()} seconds but no meaningful activity for {idle_threshold()} seconds.",
            "offline": f"No valid heartbeat for more than {online_threshold()} seconds.",
            "valid_session": "A server-side session that is not logged out, revoked, or past its refresh-token expiry.",
        },
    }


def _serialize_session(session, presence, concurrent_count, can_revoke):
    staff = getattr(session.user, "staff_profile", None)
    current_presence = presence.get(str(session.id))
    state = classify_presence(current_presence) if session.is_valid else session.lifecycle_status
    return {
        "session_id": str(session.id),
        "session_label": str(session.id).split("-")[0].upper(),
        "user_id": session.user_id,
        "display_name": getattr(staff, "name", None) or session.user.get_full_name() or session.user.username,
        "username": session.user.username,
        "role": session.role or getattr(staff, "role", ""),
        "restaurant": {"id": session.restaurant_id, "name": session.restaurant.name},
        "branch": ({"id": session.branch_id, "name": session.branch.name} if session.branch_id else None),
        "browser": session.browser,
        "operating_system": session.operating_system,
        "device": session.device_label,
        "started_at": session.started_at,
        "last_seen_at": iso_from_timestamp(current_presence.get("last_seen")) if current_presence else None,
        "status": state,
        "concurrent_sessions": concurrent_count,
        "valid_until": session.refresh_expires_at,
        "ended_at": session.ended_at,
        "end_reason": session.lifecycle_status if not session.is_valid else None,
        "can_revoke": bool(can_revoke and session.is_valid),
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def heartbeat(request):
    session_id = getattr(request, "auth_session_id", None)
    staff = getattr(request.user, "staff_profile", None)
    if not session_id or not staff or not staff.restaurant_id:
        return Response({"detail": "Re-authentication is required to register presence."}, status=status.HTTP_409_CONFLICT)
    branch = get_active_branch(request, raise_exception=False)
    session_ref = SimpleNamespace(
        id=session_id,
        user_id=request.user.id,
        restaurant_id=staff.restaurant_id,
        role=staff.role,
    )
    try:
        idle_seconds = int(request.data.get("idle_seconds", 0))
    except (TypeError, ValueError):
        idle_seconds = 0
    record, changed = touch_presence(session=session_ref, branch=branch, idle_seconds=idle_seconds)
    if changed:
        broadcast_presence_change(staff.restaurant_id, getattr(branch, "id", None), "status_changed")
        previous_branch_id = record.get("_previous_branch_id")
        if previous_branch_id:
            broadcast_presence_change(staff.restaurant_id, previous_branch_id, "branch_changed")
    return Response({
        "status": classify_presence(record),
        "server_time": timezone.now(),
        "heartbeat_interval_seconds": int(getattr(settings, "PRESENCE_HEARTBEAT_INTERVAL_SECONDS", 30)),
        "online_threshold_seconds": online_threshold(),
        "idle_threshold_seconds": idle_threshold(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, CanMonitorUserActivity])
def activity_overview(request):
    restaurant, branch = _viewer_scope(request)
    _record_expired_sessions(restaurant)
    return Response(_summary_for(restaurant, branch))


def _session_list_response(request, history=False):
    restaurant, branch = _viewer_scope(request)
    _record_expired_sessions(restaurant)
    if history:
        qs = AuthSession.objects.filter(restaurant=restaurant)
        if branch:
            qs = qs.filter(branch=branch)
    else:
        qs = _valid_sessions(restaurant, branch)

    role = request.query_params.get("role")
    if role:
        qs = qs.filter(role=role)
    search = request.query_params.get("search", "").strip()
    if search:
        qs = qs.filter(Q(user__username__icontains=search) | Q(user__staff_profile__name__icontains=search))
    qs = qs.select_related("user", "user__staff_profile", "restaurant", "branch")
    sessions = list(qs.order_by("-started_at"))
    presence = get_presence_many([session.id for session in sessions])
    requested_status = request.query_params.get("status")
    if requested_status:
        sessions = [
            session for session in sessions
            if (
                classify_presence(presence.get(str(session.id))) if session.is_valid
                else session.lifecycle_status
            ) == requested_status
        ]

    concurrent = dict(
        _valid_sessions(restaurant, branch)
        .values("user_id")
        .annotate(total=Count("id"))
        .values_list("user_id", "total")
    )
    try:
        page_size = max(1, min(int(request.query_params.get("page_size", 20)), 100))
        page_number = max(1, int(request.query_params.get("page", 1)))
    except (TypeError, ValueError):
        page_size, page_number = 20, 1
    paginator = Paginator(sessions, page_size)
    page = paginator.get_page(page_number)
    can_revoke = CanRevokeUserSessions().has_permission(request, None)
    results = [
        _serialize_session(session, presence, concurrent.get(session.user_id, 0), can_revoke)
        for session in page.object_list
    ]
    branches = request.user.staff_profile.get_available_branches() if not request.user.is_superuser else restaurant.branches.filter(is_active=True)
    return Response({
        "count": paginator.count,
        "page": page.number,
        "pages": paginator.num_pages,
        "results": results,
        "summary": _summary_for(restaurant, branch) if not history else None,
        "filter_options": {
            "roles": list(AuthSession.objects.filter(restaurant=restaurant).exclude(role="").values_list("role", flat=True).distinct().order_by("role")),
            "branches": list(branches.values("id", "name")),
            "statuses": (["active", "idle", "offline"] if not history else ["active", "idle", "offline", "logout", "revoked", "expired"]),
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, CanMonitorUserActivity])
def activity_sessions(request):
    return _session_list_response(request, history=False)


@api_view(["GET"])
@permission_classes([IsAuthenticated, CanMonitorUserActivity])
def activity_history(request):
    return _session_list_response(request, history=True)


def _blacklist_session_jti(session):
    outstanding = OutstandingToken.objects.filter(jti=session.refresh_jti).first()
    if outstanding:
        BlacklistedToken.objects.get_or_create(token=outstanding)


def _revoke_sessions(request, sessions):
    sessions = list(sessions)
    now = timezone.now()
    for session in sessions:
        session.revoked_at = now
        session.ended_at = now
        session.end_reason = AuthSession.END_REVOKED
        session.revoked_by = request.user
        session.save(update_fields=["revoked_at", "ended_at", "end_reason", "revoked_by"])
        _blacklist_session_jti(session)
        set_session_validity(session.id, False, timeout=86400)
        remove_presence(session.id, session.restaurant_id, session.branch_id)
        broadcast_presence_change(session.restaurant_id, session.branch_id, "revoked")
    return sessions


@api_view(["POST"])
@permission_classes([IsAuthenticated, CanRevokeUserSessions])
def revoke_session(request, session_id):
    restaurant, branch = _viewer_scope(request)
    target = get_object_or_404(_valid_sessions(restaurant, branch), id=session_id)
    _revoke_sessions(request, [target])
    create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=target.branch,
        action=AuditAction.SESSION_REVOKED,
        module=AuditModule.SECURITY,
        object_type="AuthSession",
        object_id=str(target.id),
        object_repr=target.user.username,
        description=f"{request.user.get_username()} revoked a session for {target.user.username}.",
        metadata={"target_user_id": target.user_id, "session_id": str(target.id), "severity": "WARNING"},
    )
    return Response({"detail": "Session revoked.", "revoked": 1})


@api_view(["POST"])
@permission_classes([IsAuthenticated, CanRevokeUserSessions])
def revoke_user_sessions(request, user_id):
    restaurant, branch = _viewer_scope(request)
    targets = _valid_sessions(restaurant, branch).filter(user_id=user_id)
    revoked = _revoke_sessions(request, targets)
    if revoked:
        create_audit_log(
            request=request,
            restaurant=restaurant,
            branch=branch,
            action=AuditAction.SESSION_REVOKED,
            module=AuditModule.SECURITY,
            object_type="AuthSession",
            object_id=f"user:{user_id}",
            object_repr=revoked[0].user.username,
            description=f"{request.user.get_username()} revoked {len(revoked)} session(s) for {revoked[0].user.username}.",
            metadata={"target_user_id": user_id, "revoked_count": len(revoked), "severity": "WARNING"},
        )
    return Response({"detail": "Account sessions revoked.", "revoked": len(revoked)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_session(request):
    session_id = getattr(request, "auth_session_id", None)
    refresh_value = request.data.get("refresh")
    if refresh_value:
        try:
            RefreshToken(refresh_value).blacklist()
        except (TokenError, AttributeError):
            pass
    session = AuthSession.objects.filter(id=session_id, user=request.user, ended_at__isnull=True).first() if session_id else None
    if session:
        session.ended_at = timezone.now()
        session.end_reason = AuthSession.END_LOGOUT
        session.save(update_fields=["ended_at", "end_reason"])
        set_session_validity(session.id, False, timeout=86400)
        remove_presence(session.id, session.restaurant_id, session.branch_id)
        broadcast_presence_change(session.restaurant_id, session.branch_id, "logout")
        create_audit_log(
            request=request,
            restaurant=session.restaurant,
            branch=session.branch,
            action=AuditAction.LOGOUT,
            module=AuditModule.SECURITY,
            object_type="AuthSession",
            object_id=str(session.id),
            object_repr=request.user.get_username(),
            description=f"{request.user.get_username()} logged out.",
            metadata={"session_id": str(session.id), "severity": "INFO"},
        )
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated, CanMonitorUserActivity])
def activity_socket_ticket(request):
    restaurant, branch = _viewer_scope(request)
    ticket = signing.dumps(
        {
            "user_id": request.user.id,
            "restaurant_id": restaurant.id,
            "branch_id": branch.id if branch else None,
        },
        salt="activity-dashboard-socket",
        compress=True,
    )
    return Response({"ticket": ticket})
