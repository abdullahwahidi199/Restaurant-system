"""Immutable generations + atomic manifest commit provide multi-file publication."""
import json
import os
import shutil
import tempfile
import uuid
from pathlib import Path

from .loader import IndexError, validate_records
from .markdown import canonical_json, digest
from .schemas import SCHEMA_VERSION, SOURCE_PREFIX


def serialize_artifacts(result):
    return {
        "documents.json": (canonical_json({"schema_version": SCHEMA_VERSION, "documents": result.documents}) + "\n").encode("utf-8"),
        "sections.jsonl": ("".join(canonical_json(s) + "\n" for s in result.sections)).encode("utf-8"),
        "capability_map.json": (canonical_json(result.capability_map) + "\n").encode("utf-8"),
    }


def make_manifest(result, artifacts):
    hashes = {name: {"sha256": digest(raw), "bytes": len(raw)} for name, raw in artifacts.items()}
    base = {
        "schema_version": SCHEMA_VERSION, "source_prefix": SOURCE_PREFIX,
        "source_hashes": result.source_hashes, "configuration_hash": result.configuration_hash,
        "complete": not bool(result.errors), "summary": result.summary(),
        "diagnostics": [issue.to_dict() for issue in result.issues], "excluded": result.excluded,
        "artifacts": hashes,
    }
    build_hash = digest(canonical_json(base))
    generation = f"generations/{build_hash}"
    return {
        **base, "build_hash": build_hash, "generation": generation,
        "artifacts": {name: {**info, "path": f"{generation}/{name}"} for name, info in hashes.items()},
    }


def _write_synced(path, raw):
    with open(path, "xb") as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())


def publish_index(result, output_root, *, allow_partial=False):
    if result.errors and not allow_partial:
        raise IndexError("Build has errors; current committed index was not replaced. Review diagnostics or explicitly allow a partial index.")
    if not result.documents:
        raise IndexError("Refusing to publish an empty index.")
    # Identity/ownership corruption is fatal even when metadata recovery is allowed.
    validate_records(result.documents, result.sections, result.capability_map, complete=not bool(result.errors))
    artifacts = serialize_artifacts(result)
    manifest = make_manifest(result, artifacts)
    root = Path(output_root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    generations = root / "generations"
    if generations.is_symlink():
        raise IndexError("Generation storage must not be a symlink.")
    generations.mkdir(exist_ok=True)
    generation = root / manifest["generation"]
    # Windows mkdtemp uses an owner-only DACL (mode 0700). Renaming that
    # directory preserves the DACL and locks out a different Django account.
    # Inherit the private storage parent's deployment ACL instead. The random
    # name and exclusive mkdir still prevent collisions/pre-created staging.
    staging = generations / (".staging-" + uuid.uuid4().hex)
    staging.mkdir(mode=0o777)
    temp_manifest = None
    try:
        for name, raw in artifacts.items():
            _write_synced(staging / name, raw)
        # Re-parse/validate staged bytes before they become visible to readers.
        staged_docs = json.loads((staging / "documents.json").read_text(encoding="utf-8"))["documents"]
        staged_sections = [json.loads(line) for line in (staging / "sections.jsonl").read_text(encoding="utf-8").splitlines()]
        staged_map = json.loads((staging / "capability_map.json").read_text(encoding="utf-8"))
        validate_records(staged_docs, staged_sections, staged_map, complete=manifest["complete"])
        if generation.exists():
            if generation.is_symlink() or any((generation / name).read_bytes() != raw for name, raw in artifacts.items()):
                raise IndexError("Existing immutable generation differs from expected bytes.")
        else:
            try:
                os.replace(staging, generation)
            except OSError:
                # A concurrent identical build may have installed the same generation.
                if not generation.is_dir() or generation.is_symlink() or any((generation / name).read_bytes() != raw for name, raw in artifacts.items()):
                    raise
        fd, filename = tempfile.mkstemp(prefix=".manifest-", suffix=".tmp", dir=root)
        temp_manifest = Path(filename)
        with os.fdopen(fd, "wb") as stream:
            stream.write((canonical_json(manifest) + "\n").encode("utf-8"))
            stream.flush()
            os.fsync(stream.fileno())
        # Sole commit point: existing readers retain their previous immutable files.
        os.replace(temp_manifest, root / "manifest.json")
        temp_manifest = None
        return manifest
    finally:
        if staging.exists() and staging.resolve().is_relative_to(root) and staging.name.startswith(".staging-"):
            shutil.rmtree(staging)
        if temp_manifest and temp_manifest.exists():
            temp_manifest.unlink()
