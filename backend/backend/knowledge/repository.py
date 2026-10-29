"""Per-worker immutable snapshot cache, refreshed through the atomic manifest."""
import threading
import logging
from pathlib import Path

from .capability_map import DEFAULT_CURATION
from .errors import GatewayError
from .loader import IndexError, load_index
from .markdown import digest
from .scanner import discover_sources
from .schemas import SOURCE_PREFIX

logger = logging.getLogger("ai_assistant")


class IndexRepository:
    def __init__(self, root, *, source_root=None, curation_path=None):
        self.root = Path(root).resolve()
        self._lock = threading.RLock()
        self._key = None
        self._index = None
        self.source_root = Path(source_root).resolve() if source_root else None
        self.curation_path = Path(curation_path or DEFAULT_CURATION)
        self._source_key = None

    def _validate_sources(self, index):
        if self.source_root is None:
            return  # A production deployment may package only the snapshot.
        candidates, _ = discover_sources(self.source_root)
        paths = [(f"{SOURCE_PREFIX}/{name}", path) for name, path in candidates]
        paths.append(("curation", self.curation_path))
        states = []
        for name, path in paths:
            stat = path.stat()
            states.append((name, stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns, stat.st_ino))
        key = index.version, tuple(states)
        if key == self._source_key:
            return
        hashes = {name: digest(path.read_bytes()) for name, path in paths}
        manifest = index.manifest
        if hashes.pop("curation") != manifest["configuration_hash"] or hashes != manifest["source_hashes"]:
            raise IndexError("Source documentation or capability curation changed; run build_knowledge_index.")
        self._source_key = key

    def _fingerprint(self):
        manifest = self.root / "manifest.json"
        if manifest.is_symlink():
            raise ValueError("Unsafe manifest")
        raw = manifest.read_bytes()
        # Check immutable artifact presence/change cheaply, even after caching.
        import json
        data = json.loads(raw)
        states = []
        for name in ("documents.json", "sections.jsonl", "capability_map.json"):
            target = self.root / data["artifacts"][name]["path"]
            if target.is_symlink() or not target.resolve().is_relative_to(self.root):
                raise ValueError("Unsafe artifact")
            stat = target.stat()
            states.append((stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns, stat.st_ino))
        return digest(raw), tuple(states)

    def get(self):
        try:
            with self._lock:
                for _ in range(2):
                    key = self._fingerprint()
                    if key == self._key and self._index is not None:
                        self._validate_sources(self._index)
                        return self._index
                    index = load_index(self.root)
                    self._validate_sources(index)
                    if self._fingerprint() == key:
                        self._key, self._index = key, index
                        return index
        except (OSError, IndexError, ValueError, KeyError, TypeError) as exc:
            logger.warning("knowledge_index_failed", extra={"failure_stage": "knowledge_index_loading", "exception_category": type(exc).__name__,
                           "internal_error_code": "index_unavailable", "knowledge_index_status": "unavailable", "index_root": str(self.root),
                           "os_errno": getattr(exc, "errno", None), "os_winerror": getattr(exc, "winerror", None),
                           "index_reason": str(exc) if isinstance(exc, IndexError) else "Index paths, permissions or manifest are invalid."})
        raise GatewayError("index_unavailable", "The knowledge index is unavailable or inconsistent. Ask an administrator to validate and rebuild it.")
