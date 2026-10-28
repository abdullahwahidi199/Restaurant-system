"""Controlled identities in tests only. Production resolution reloads Django state."""
import os
from pathlib import Path

import django
from django.apps import apps

if not apps.ready:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()

from knowledge.access import Principal
from knowledge.gateway import KnowledgeGateway
from knowledge.loader import load_index

INDEX_ROOT = Path(__file__).resolve().parents[4] / "docs/ai_knowledge/.generated"


class MemoryRepository:
    def __init__(self, index):
        self.index = index

    def get(self):
        return self.index


def identity(role="Admin", *, user_id="11", superuser=False, **kwargs):
    return Principal(user_id=user_id, staff_id="12", restaurant_id="13", branch_id="14", role=role, superuser=superuser, **kwargs)


def repository_gateway(principal=None):
    index = load_index(INDEX_ROOT)
    current = {"principal": principal or identity()}
    gateway = KnowledgeGateway(repository=MemoryRepository(index), principal_resolver=lambda user: current["principal"])
    return gateway, index, current
