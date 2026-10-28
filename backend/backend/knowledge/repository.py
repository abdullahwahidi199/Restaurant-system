"""Per-worker immutable snapshot cache, refreshed through the atomic manifest."""
import threading
from pathlib import Path

from .errors import GatewayError
from .loader import IndexError, load_index
from .markdown import digest


class IndexRepository:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self._lock = threading.RLock()
        self._key = None
        self._index = None

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
                        return self._index
                    index = load_index(self.root)
                    if self._fingerprint() == key:
                        self._key, self._index = key, index
                        return index
        except (OSError, IndexError, ValueError, KeyError, TypeError):
            pass
        raise GatewayError("index_unavailable", "The knowledge index is unavailable or inconsistent. Ask an administrator to validate and rebuild it.")
