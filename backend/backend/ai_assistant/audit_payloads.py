"""Encrypted content-addressed payloads. No filesystem or raw HTTP headers."""
import base64
import hashlib
import json
import os
import re

from cryptography.fernet import Fernet, MultiFernet
from django.conf import settings
from django.db import transaction

from .errors import AssistantError
from .models import AuditBlob, AuditBlobReference

REDACTED = "[REDACTED]"
SENSITIVE = re.compile(r"authorization|cookie|password|passwd|secret|apikey|accesstoken|refreshtoken|sessiontoken|sessionid|searchtoken|discoverytoken|privatekey|jwt|^(?:sid|access|refresh|token)$", re.I)
REASONING = {"reasoning", "reasoningcontent", "chainofthought", "hiddenreasoning"}


def unavailable():
    return AssistantError("audit_unavailable", "The assistant's audit storage is unavailable. Please try again later.", 503)


def cipher():
    keys = getattr(settings, "AI_AUDIT_ENCRYPTION_KEYS", None) or [settings.SECRET_KEY, *getattr(settings, "SECRET_KEY_FALLBACKS", [])]
    if not isinstance(keys, (tuple, list)) or not keys or any(not isinstance(k, str) or not k for k in keys):
        raise unavailable()
    return MultiFernet([Fernet(base64.urlsafe_b64encode(hashlib.sha256(("pakhlai.ai.audit.v1\0" + key).encode()).digest())) for key in keys])


def secrets():
    values = [getattr(settings, "DEEPSEEK_API_KEY", ""), settings.SECRET_KEY,
              *getattr(settings, "SECRET_KEY_FALLBACKS", []), *getattr(settings, "AI_AUDIT_ENCRYPTION_KEYS", [])]
    values.extend(db.get("PASSWORD", "") for db in settings.DATABASES.values())
    values.extend(v for k, v in os.environ.items() if SENSITIVE.search(re.sub(r"[^a-z]", "", k.lower())))
    return sorted({v for v in values if isinstance(v, str) and len(v) >= 6}, key=len, reverse=True)


def redact(value, *, known=None, depth=0, schema=False):
    if depth > 64:
        raise unavailable()
    known = secrets() if known is None else known
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if not isinstance(key, str):
                raise unavailable()
            normalized = re.sub(r"[^a-z]", "", key.lower())
            if normalized in REASONING:
                continue
            schema_declaration = schema and isinstance(item,dict) and item.get("type") == "string" and set(item) <= {"type","description","title","minLength","maxLength","format","pattern"}
            if SENSITIVE.search(normalized) and not schema_declaration:
                result[key] = REDACTED
            else:
                result[key] = redact(item, known=known, depth=depth + 1, schema=schema or key in {"parameters", "schema"})
        return result
    if isinstance(value, (list, tuple)):
        return [redact(v, known=known, depth=depth + 1, schema=schema) for v in value]
    if isinstance(value, str):
        # Tool arguments/results are JSON strings on the provider wire. Preserve
        # exact strings when unchanged, but inspect their nested secret fields.
        if value.lstrip().startswith(("{", "[")):
            try:
                decoded = json.loads(value)
                clean = redact(decoded, known=known, depth=depth + 1, schema=schema)
                if clean != decoded:
                    value = json.dumps(clean, ensure_ascii=False)
            except (ValueError, TypeError, RecursionError):
                pass
        for secret in known:
            value = value.replace(secret, REDACTED)
        value = re.sub(r"(?i)\bBearer\s+[^\s\"'<>]+", "Bearer " + REDACTED, value)
        value = re.sub(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", REDACTED, value)
        value = re.sub(r"[.A-Za-z0-9_-]{20,}:[A-Za-z0-9_-]{1,16}:[A-Za-z0-9_-]{20,}", REDACTED, value)
        value = re.sub(r"\bdiscovery_\d+\b", REDACTED, value)
        value = re.sub(r"\bsk-[A-Za-z0-9_-]{12,}\b", REDACTED, value)
        value = re.sub(r"-----BEGIN [^-]*PRIVATE KEY-----.*?-----END [^-]*PRIVATE KEY-----", REDACTED, value, flags=re.S)
        label = r"(?:api[_ -]?key|password|secret|access[_ -]?token|refresh[_ -]?token)"
        value = re.sub(r"(?i)(\b"+label+r"[\"']?\s*[:=]\s*)([\"'])(.*?)\2", lambda m:m[1]+m[2]+REDACTED+m[2], value)
        value = re.sub(r"(?i)\b("+label+r"[\"']?\s*[:=]\s*)[^\s,;\"'<>]+", r"\1" + REDACTED, value)
        return value
    if value is None or isinstance(value, (int, float, bool)):
        return value
    raise unavailable()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


@transaction.atomic
def put_blob(value):
    """Large repeated strings share encrypted blobs across events/turns."""
    value = redact(value)
    encoded = canonical(value).encode("utf-8")
    if len(encoded) > getattr(settings, "AI_AUDIT_MAX_EVENT_BYTES", 1_000_000):
        raise unavailable()  # Never silently truncate an allegedly exact trace.
    children = []
    def split(item):
        if isinstance(item, str) and len(item.encode("utf-8")) > 2048:
            raw = item.encode("utf-8")
            digest = hashlib.sha256(b"text\0" + raw).hexdigest()
            AuditBlob.objects.get_or_create(id=digest, defaults={"kind":"text", "ciphertext":cipher().encrypt(raw).decode(), "byte_count":len(raw)})
            children.append(digest)
            return {"__audit_text_blob__": digest}
        if isinstance(item, dict):
            if set(item) in ({"__audit_text_blob__"},{"__audit_literal__"}):
                return {"__audit_literal__":[[k,split(v)] for k,v in item.items()]}
            return {k:split(v) for k,v in item.items()}
        if isinstance(item, list):
            return [split(v) for v in item]
        return item
    packed = canonical(split(value)).encode("utf-8")
    digest = hashlib.sha256(b"json\0" + packed).hexdigest()
    blob, _ = AuditBlob.objects.get_or_create(id=digest, defaults={"kind":"json", "ciphertext":cipher().encrypt(packed).decode(), "byte_count":len(encoded), "children":sorted(set(children))})
    for child in set(children):
        AuditBlobReference.objects.get_or_create(parent=blob,child_id=child)
    return blob


def read_blob(blob):
    try:
        return _read_blob(blob)
    except Exception:
        raise unavailable() from None


def _read_blob(blob):
    raw = cipher().decrypt(blob.ciphertext.encode())
    if hashlib.sha256(blob.kind.encode() + b"\0" + raw).hexdigest() != blob.pk:
        raise unavailable()
    if blob.kind == "text":
        return raw.decode("utf-8")
    value = json.loads(raw)
    def expand(item, depth=0):
        if depth > 64:
            raise unavailable()
        if isinstance(item, dict) and set(item) == {"__audit_literal__"}:
            return {k:expand(v,depth+1) for k,v in item["__audit_literal__"]}
        if isinstance(item, dict) and set(item) == {"__audit_text_blob__"}:
            target = item["__audit_text_blob__"]
            if target not in blob.children:
                raise unavailable()
            return read_blob(AuditBlob.objects.get(pk=target, kind="text"))
        if isinstance(item, dict):
            return {k:expand(v, depth+1) for k,v in item.items()}
        if isinstance(item, list):
            return [expand(v, depth+1) for v in item]
        return item
    result = expand(value)
    size = len(canonical(result).encode("utf-8"))
    if size != blob.byte_count or size > getattr(settings, "AI_AUDIT_MAX_EVENT_BYTES", 1_000_000):
        raise unavailable()
    return result
