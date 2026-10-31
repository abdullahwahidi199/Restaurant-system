"""Explicit isolated test settings. Never connect to the project's database/Redis/provider."""
from backend.settings import *  # noqa: F403
import atexit
import shutil
import tempfile

MEDIA_ROOT = tempfile.mkdtemp(prefix="business-analyst-tests-")
atexit.register(shutil.rmtree, MEDIA_ROOT, ignore_errors=True)

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
DEEPSEEK_API_KEY = ""
ALLOWED_HOSTS = ["testserver", "localhost"]
BUSINESS_ANALYST_THROTTLE_RATE = "1000/min"
