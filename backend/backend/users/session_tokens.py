from datetime import datetime, timezone as datetime_timezone

from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .authentication import is_session_valid, set_session_validity
from .models import AuthSession
from .presence import broadcast_presence_change, parse_user_agent, touch_presence


def create_staff_auth_session(request, user, refresh):
    staff = getattr(user, "staff_profile", None)
    if not staff or not staff.restaurant_id:
        return None
    active_branch = staff.get_or_set_active_branch()
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:512] if request else ""
    browser, operating_system, device_label = parse_user_agent(user_agent)
    expires_at = datetime.fromtimestamp(int(refresh["exp"]), tz=datetime_timezone.utc)
    session = AuthSession.objects.create(
        user=user,
        restaurant=staff.restaurant,
        branch=active_branch,
        role=staff.role,
        refresh_jti=str(refresh["jti"]),
        browser=browser,
        operating_system=operating_system,
        device_label=device_label,
        ip_address=(request.META.get("REMOTE_ADDR") if request else None),
        user_agent=user_agent,
        refresh_expires_at=expires_at,
    )
    refresh["sid"] = str(session.id)
    set_session_validity(session.id, True)
    _, changed = touch_presence(session=session, branch=active_branch, idle_seconds=0)
    if changed:
        broadcast_presence_change(session.restaurant_id, session.branch_id, "login")
    return session


class SessionTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        incoming = self.token_class(attrs["refresh"])
        session_id = incoming.get("sid")
        user_id = incoming.get("user_id")
        if session_id and not is_session_valid(session_id, user_id):
            raise AuthenticationFailed(
                "This session has ended or was revoked.",
                code="session_revoked",
            )

        data = super().validate(attrs)
        if session_id:
            rotated = RefreshToken(data.get("refresh") or attrs["refresh"])
            AuthSession.objects.filter(
                id=session_id,
                user_id=user_id,
                ended_at__isnull=True,
                revoked_at__isnull=True,
            ).update(
                refresh_jti=str(rotated["jti"]),
                refresh_expires_at=datetime.fromtimestamp(
                    int(rotated["exp"]),
                    tz=datetime_timezone.utc,
                ),
            )
            set_session_validity(session_id, True)
        elif user_id:
            # Transparently upgrade pre-deployment staff refresh tokens without
            # forcing mobile/web clients through a breaking login-flow change.
            user = get_user_model().objects.filter(pk=user_id, is_active=True).first()
            if user:
                upgraded = RefreshToken(data.get("refresh") or attrs["refresh"])
                session = create_staff_auth_session(
                    self.context.get("request"),
                    user,
                    upgraded,
                )
                if session:
                    data["refresh"] = str(upgraded)
                    data["access"] = str(upgraded.access_token)
        return data


class SessionTokenRefreshView(TokenRefreshView):
    serializer_class = SessionTokenRefreshSerializer
