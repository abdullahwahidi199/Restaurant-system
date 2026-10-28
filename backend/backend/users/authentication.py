import logging

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import AuthSession


logger = logging.getLogger(__name__)


def session_validity_key(session_id):
    return f"pakhlai:auth-session-valid:{session_id}"


def set_session_validity(session_id, is_valid, timeout=None):
    try:
        cache.set(
            session_validity_key(session_id),
            "1" if is_valid else "0",
            timeout or int(getattr(settings, "SESSION_VALIDATION_CACHE_SECONDS", 60)),
        )
    except Exception:
        logger.warning("session_validity_cache_write_failed", exc_info=True)


def is_session_valid(session_id, user_id):
    key = session_validity_key(session_id)
    cached = None
    try:
        cached = cache.get(key)
    except Exception:
        logger.warning("session_validity_cache_read_failed", exc_info=True)
    if cached in ("1", b"1", True):
        return True
    if cached in ("0", b"0", False):
        return False

    valid = AuthSession.objects.filter(
        id=session_id,
        user_id=user_id,
        ended_at__isnull=True,
        revoked_at__isnull=True,
        refresh_expires_at__gt=timezone.now(),
    ).exists()
    set_session_validity(session_id, valid)
    return valid


class SessionJWTAuthentication(JWTAuthentication):
    """JWT authentication plus server-side validation for session-aware tokens."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, token = result
        session_id = token.get("sid")
        if (
            not session_id
            and getattr(settings, "SESSION_REQUIRE_SID_FOR_STAFF", False)
            and hasattr(user, "staff_profile")
        ):
            raise AuthenticationFailed(
                "Please sign in again to establish a managed session.",
                code="managed_session_required",
            )
        if session_id and not is_session_valid(session_id, user.id):
            raise AuthenticationFailed("This session has ended or was revoked.", code="session_revoked")
        request.auth_session_id = str(session_id) if session_id else None
        return user, token
