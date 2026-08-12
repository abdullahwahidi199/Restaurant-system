import hashlib
import logging
import time

from django.conf import settings
from django.core.cache import cache
from django.core.cache import caches
from django.core.cache.backends.locmem import LocMemCache

from .models import LoginRateLimitConfig


logger = logging.getLogger(__name__)


class LoginRateLimitUnavailable(Exception):
    pass


class LoginRateLimitBlocked(Exception):
    def __init__(self, retry_after):
        self.retry_after = max(1, int(retry_after or 1))
        super().__init__("Too many login attempts.")


def _cache_is_process_local():
    return isinstance(caches["default"], LocMemCache)


def _ensure_shared_cache():
    if settings.DEBUG:
        return
    if _cache_is_process_local():
        raise LoginRateLimitUnavailable(
            "Login rate limiting requires a shared cache outside DEBUG."
        )


def _normalized_identifier(identifier):
    return str(identifier or "").strip().lower()


def _hash(value):
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()


def _client_ip(request):
    remote_addr = request.META.get("REMOTE_ADDR") or "unknown"
    trusted_proxies = set(getattr(settings, "TRUSTED_PROXY_IPS", []))

    # Do not trust forwarded IP headers from arbitrary clients. They are accepted
    # only when the direct peer is a configured trusted proxy such as Cloudflare.
    if remote_addr in trusted_proxies:
        forwarded = request.META.get("HTTP_CF_CONNECTING_IP") or request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip() or remote_addr

    return remote_addr


def _cache_keys(namespace, identifier, request):
    identifier_key = _hash(_normalized_identifier(identifier))
    ip_key = _hash(_client_ip(request))
    return (
        f"login_rl:{namespace}:identifier:{identifier_key}",
        f"login_rl:{namespace}:ip:{ip_key}",
    )


def _lock_key(counter_key):
    return f"{counter_key}:lock"


def _read_retry_after(keys):
    retry_after = 0
    now = time.time()
    for key in keys:
        lock_until = cache.get(_lock_key(key))
        if not lock_until:
            continue
        remaining = int(lock_until - now)
        if remaining > 0:
            retry_after = max(retry_after, remaining)
        else:
            cache.delete(_lock_key(key))
    return retry_after


def _delete_many(keys):
    delete_keys = []
    for key in keys:
        delete_keys.extend([key, _lock_key(key)])
    cache.delete_many(delete_keys)


def check_login_allowed(request, *, namespace, identifier):
    config = LoginRateLimitConfig.load()
    if not config.enabled:
        return config

    _ensure_shared_cache()
    keys = _cache_keys(namespace, identifier, request)
    try:
        retry_after = _read_retry_after(keys)
    except Exception as exc:
        logger.exception("Login rate-limit cache read failed")
        raise LoginRateLimitUnavailable(str(exc)) from exc
    if retry_after:
        raise LoginRateLimitBlocked(retry_after)
    return config


def record_failed_login(request, *, namespace, identifier, config=None):
    config = config or LoginRateLimitConfig.load()
    if not config.enabled:
        return

    _ensure_shared_cache()
    window_seconds = int(config.window_minutes) * 60
    lockout_seconds = int(config.lockout_minutes) * 60
    max_attempts = int(config.max_failed_attempts)

    for key in _cache_keys(namespace, identifier, request):
        try:
            cache.add(key, 0, timeout=window_seconds)
            attempts = cache.incr(key)
            if attempts >= max_attempts:
                cache.set(_lock_key(key), time.time() + lockout_seconds, timeout=lockout_seconds)
        except Exception as exc:
            logger.exception("Login rate-limit cache write failed")
            raise LoginRateLimitUnavailable(str(exc)) from exc


def reset_login_attempts(request, *, namespace, identifier):
    config = LoginRateLimitConfig.load()
    if not config.enabled:
        return

    _ensure_shared_cache()
    try:
        _delete_many(_cache_keys(namespace, identifier, request))
    except Exception as exc:
        logger.exception("Login rate-limit cache delete failed")
        raise LoginRateLimitUnavailable(str(exc)) from exc
