import logging
import re
import time
from datetime import datetime, timezone as datetime_timezone

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone


logger = logging.getLogger(__name__)
PREFIX = "pakhlai:presence"


def online_threshold():
    return int(getattr(settings, "PRESENCE_ONLINE_THRESHOLD_SECONDS", 90))


def idle_threshold():
    return int(getattr(settings, "PRESENCE_IDLE_THRESHOLD_SECONDS", 300))


def retention_seconds():
    return max(int(getattr(settings, "PRESENCE_RETENTION_SECONDS", 86400)), online_threshold() * 2)


def parse_user_agent(value):
    value = (value or "")[:512]
    browsers = [
        ("Edge", r"Edg/"),
        ("Chrome", r"(?:Chrome|CriOS)/"),
        ("Firefox", r"(?:Firefox|FxiOS)/"),
        ("Safari", r"Safari/"),
    ]
    systems = [
        ("Windows", r"Windows NT"),
        ("Android", r"Android"),
        ("iOS", r"(?:iPhone|iPad|iPod)"),
        ("macOS", r"Mac OS X"),
        ("Linux", r"Linux"),
    ]
    browser = next((name for name, pattern in browsers if re.search(pattern, value, re.I)), "Unknown browser")
    operating_system = next((name for name, pattern in systems if re.search(pattern, value, re.I)), "Unknown OS")
    device = "Mobile" if re.search(r"Mobile|Android|iPhone|iPod", value, re.I) else "Tablet" if re.search(r"iPad|Tablet", value, re.I) else "Computer"
    return browser, operating_system, f"{device} · {browser} on {operating_system}"


def _redis_client():
    client = getattr(cache, "client", None)
    if not client or not hasattr(client, "get_client"):
        return None
    return client.get_client(write=True)


def _session_key(session_id):
    return f"{PREFIX}:session:{session_id}"


def _restaurant_key(restaurant_id):
    return f"{PREFIX}:restaurant:{restaurant_id}"


def _branch_key(restaurant_id, branch_id):
    return f"{PREFIX}:restaurant:{restaurant_id}:branch:{branch_id}"


def _decode_hash(values):
    decoded = {}
    for key, value in (values or {}).items():
        if isinstance(key, bytes):
            key = key.decode("utf-8")
        if isinstance(value, bytes):
            value = value.decode("utf-8")
        decoded[key] = value
    for key in ("user_id", "restaurant_id", "branch_id"):
        if decoded.get(key) not in (None, "", "None"):
            try:
                decoded[key] = int(decoded[key])
            except (TypeError, ValueError):
                pass
        elif key == "branch_id":
            decoded[key] = None
    for key in ("last_seen", "last_activity"):
        if decoded.get(key) is not None:
            decoded[key] = float(decoded[key])
    return decoded


def classify_presence(record, now=None):
    if not record:
        return "offline"
    now = now or time.time()
    last_seen = float(record.get("last_seen") or 0)
    last_activity = float(record.get("last_activity") or 0)
    if now - last_seen > online_threshold():
        return "offline"
    if now - last_activity > idle_threshold():
        return "idle"
    return "active"


def touch_presence(*, session, branch, idle_seconds=0):
    """Update ephemeral state. Cache failures never block normal app traffic."""
    now = time.time()
    idle_seconds = max(0, min(int(idle_seconds or 0), retention_seconds()))
    payload = {
        "session_id": str(session.id),
        "user_id": session.user_id,
        "restaurant_id": session.restaurant_id,
        "branch_id": branch.id if branch else "",
        "role": session.role,
        "last_seen": now,
        "last_activity": now - idle_seconds,
    }
    previous = get_presence(str(session.id))
    try:
        redis = _redis_client()
        if redis:
            pipe = redis.pipeline(transaction=False)
            key = _session_key(session.id)
            pipe.hset(key, mapping={key: str(value) for key, value in payload.items()})
            pipe.expire(key, retention_seconds())
            pipe.zadd(_restaurant_key(session.restaurant_id), {str(session.id): now})
            pipe.expire(_restaurant_key(session.restaurant_id), retention_seconds() * 2)
            if branch:
                pipe.zadd(_branch_key(session.restaurant_id, branch.id), {str(session.id): now})
                pipe.expire(_branch_key(session.restaurant_id, branch.id), retention_seconds() * 2)
            if previous and previous.get("branch_id") and previous.get("branch_id") != getattr(branch, "id", None):
                pipe.zrem(_branch_key(session.restaurant_id, previous["branch_id"]), str(session.id))
            pipe.execute()
        else:
            cache.set(_session_key(session.id), payload, retention_seconds())
            index_key = _restaurant_key(session.restaurant_id)
            session_ids = set(cache.get(index_key, []))
            session_ids.add(str(session.id))
            cache.set(index_key, list(session_ids), retention_seconds() * 2)
    except Exception:
        logger.warning("presence_touch_failed", exc_info=True)
        return payload, False

    changed = (
        not previous
        or classify_presence(previous, now) != classify_presence(payload, now)
        or previous.get("branch_id") != getattr(branch, "id", None)
    )
    if previous and previous.get("branch_id") != getattr(branch, "id", None):
        payload["_previous_branch_id"] = previous.get("branch_id")
    return payload, changed


def get_presence(session_id):
    try:
        redis = _redis_client()
        if redis:
            return _decode_hash(redis.hgetall(_session_key(session_id))) or None
        value = cache.get(_session_key(session_id))
        return value if isinstance(value, dict) else None
    except Exception:
        logger.warning("presence_read_failed", exc_info=True)
        return None


def get_presence_many(session_ids):
    session_ids = [str(value) for value in session_ids]
    if not session_ids:
        return {}
    try:
        redis = _redis_client()
        if redis:
            pipe = redis.pipeline(transaction=False)
            for session_id in session_ids:
                pipe.hgetall(_session_key(session_id))
            rows = pipe.execute()
            return {
                session_id: decoded
                for session_id, row in zip(session_ids, rows)
                if (decoded := _decode_hash(row))
            }
        values = cache.get_many([_session_key(value) for value in session_ids])
        return {
            session_id: values[_session_key(session_id)]
            for session_id in session_ids
            if isinstance(values.get(_session_key(session_id)), dict)
        }
    except Exception:
        logger.warning("presence_multi_read_failed", exc_info=True)
        return {}


def get_restaurant_presence(restaurant_id):
    """Read only indexed session IDs; this never scans the Redis keyspace."""
    cutoff = time.time() - retention_seconds()
    try:
        redis = _redis_client()
        if redis:
            index_key = _restaurant_key(restaurant_id)
            redis.zremrangebyscore(index_key, "-inf", cutoff)
            ids = redis.zrangebyscore(index_key, cutoff, "+inf")
            ids = [value.decode("utf-8") if isinstance(value, bytes) else str(value) for value in ids]
            return get_presence_many(ids)
        return get_presence_many(cache.get(_restaurant_key(restaurant_id), []))
    except Exception:
        logger.warning("presence_index_read_failed", exc_info=True)
        return {}


def remove_presence(session_id, restaurant_id=None, branch_id=None):
    try:
        current = get_presence(session_id) or {}
        restaurant_id = restaurant_id or current.get("restaurant_id")
        branch_id = branch_id or current.get("branch_id")
        redis = _redis_client()
        if redis:
            pipe = redis.pipeline(transaction=False)
            pipe.delete(_session_key(session_id))
            if restaurant_id:
                pipe.zrem(_restaurant_key(restaurant_id), str(session_id))
            if restaurant_id and branch_id:
                pipe.zrem(_branch_key(restaurant_id, branch_id), str(session_id))
            pipe.execute()
        else:
            cache.delete(_session_key(session_id))
    except Exception:
        logger.warning("presence_remove_failed", exc_info=True)


def iso_from_timestamp(value):
    if not value:
        return None
    return datetime.fromtimestamp(float(value), tz=datetime_timezone.utc).isoformat().replace("+00:00", "Z")


def broadcast_presence_change(restaurant_id, branch_id=None, reason="presence_changed"):
    layer = get_channel_layer()
    if not layer:
        return
    event = {
        "type": "presence.changed",
        "message": {
            "type": "presence_changed",
            "reason": reason,
            "at": timezone.now().isoformat(),
        },
    }
    groups = [f"activity_restaurant_{restaurant_id}"]
    if branch_id:
        groups.append(f"activity_restaurant_{restaurant_id}_branch_{branch_id}")
    for group in groups:
        try:
            async_to_sync(layer.group_send)(group, event)
        except Exception:
            logger.warning("presence_broadcast_failed group=%s", group, exc_info=True)
