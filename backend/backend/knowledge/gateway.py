"""The only two registered provider-independent tools; no HTTP or model calls."""
import copy
import threading

from django.core import signing
from django.db import DatabaseError

from .access import resolve_principal
from .errors import GatewayError
from .fetch import fetch_sections
from .repository import IndexRepository
from .search import SearchEngine
from .tool_definitions import get_tool_definitions
from .validation import validate

TOKEN_TTL_SECONDS = 300
TOKEN_SALT = "pakhlai.knowledge.discovery.v1"


class KnowledgeGateway:
    def __init__(self, *, index_root=None, repository=None, principal_resolver=None):
        # Dependency injection is a trusted Python testing seam, never tool args.
        if repository is None:
            if index_root is None:
                from django.conf import settings
                index_root = settings.KNOWLEDGE_INDEX_ROOT
            repository = IndexRepository(index_root)
        self.repository = repository
        self.principal_resolver = principal_resolver or resolve_principal
        self._engine = None
        self._lock = threading.RLock()
        self._definitions = {d["name"]: d["parameters"] for d in get_tool_definitions()}

    def _search_engine(self, index):
        with self._lock:
            if self._engine is None or self._engine.version != index.version:
                self._engine = SearchEngine(index)
            return self._engine

    def execute(self, *, name, arguments, user):
        if not isinstance(name, str) or name not in self._definitions:
            raise GatewayError("unknown_tool", "Only search_documentation and fetch_documentation are registered.")
        validate(arguments, self._definitions[name])
        if name == "search_documentation":
            mode = arguments.get("mode", "search")
            if mode == "search" and (not arguments.get("query", "").strip() or arguments.get("offset", 0)):
                raise GatewayError("invalid_arguments", "Ranked search requires a nonempty query and no browse offset.")
        try:
            principal = self.principal_resolver(user)
        except DatabaseError:
            raise GatewayError("authorization_unavailable", "Account permissions could not be verified. Try again when authentication storage is available.") from None
        index = self.repository.get()
        if name == "search_documentation":
            result = self._search_engine(index).search(principal, **arguments)
            permitted = [[r["document_id"], r["section_id"]] for r in result["results"]]
            result["search_token"] = signing.dumps({"version": 1, "subject": principal.binding, "index": index.version, "sections": permitted}, salt=TOKEN_SALT, compress=True) if permitted else None
            result["token_expires_in_seconds"] = TOKEN_TTL_SECONDS if permitted else None
            result["index_version"] = index.version
            return copy.deepcopy(result)
        try:
            payload = signing.loads(arguments["search_token"], salt=TOKEN_SALT, max_age=TOKEN_TTL_SECONDS)
        except signing.SignatureExpired:
            raise GatewayError("discovery_expired", "Discovery expired. Search again before fetching.") from None
        except (signing.BadSignature, ValueError, TypeError):
            raise GatewayError("discovery_invalid", "A valid discovery token from search_documentation is required.") from None
        if not isinstance(payload, dict) or payload.get("version") != 1 or payload.get("subject") != principal.binding:
            raise GatewayError("discovery_invalid", "Discovery does not match the current authenticated context. Search again.")
        if payload.get("index") != index.version:
            raise GatewayError("discovery_stale", "The index changed after discovery. Search again for current sections.")
        try:
            discovered = {tuple(pair) for pair in payload["sections"] if len(pair) == 2}
        except (KeyError, TypeError):
            raise GatewayError("discovery_invalid", "Invalid discovery contents. Search again.") from None
        return fetch_sections(index, principal, arguments["sections"], discovered, arguments.get("max_characters", 8000))

    def search_documentation(self, *, user, **arguments):
        return self.execute(name="search_documentation", arguments=arguments, user=user)

    def fetch_documentation(self, *, user, **arguments):
        return self.execute(name="fetch_documentation", arguments=arguments, user=user)
