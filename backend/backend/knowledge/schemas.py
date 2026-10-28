"""Versioned, provider-independent records used by the offline index."""
from dataclasses import asdict, dataclass, field
from typing import Any

SCHEMA_VERSION = 1
SOURCE_PREFIX = "03_operator_guides"
DOCUMENT_TYPES = frozenset({
    "operator_guide", "role_guide", "workflow", "form_reference", "navigation",
    "troubleshooting", "interface_reference", "backend_reference",
    "quality_assurance", "index",
})
AVAILABILITIES = frozenset({
    "operator_guidance", "mounted_context", "shared", "unmounted", "inactive",
    "customer_context", "reference_only", "qa_only", "needs_verification",
})
KNOWN_ROLES = frozenset({
    "SuperAdmin", "Admin", "BranchAdmin", "Manager", "Cashier", "Waiter",
    "Kitchen_manager", "InventoryManager", "FinanceManager", "OperationsManager",
    "Call_operator", "DeliveryBoy", "Customer", "Other",
})


@dataclass(frozen=True)
class Issue:
    severity: str
    category: str
    code: str
    path: str
    message: str

    def to_dict(self):
        return asdict(self)


@dataclass(frozen=True)
class Heading:
    level: int
    title: str
    start: int
    end: int


@dataclass
class Document:
    metadata: dict[str, Any]
    path: str
    markdown: str
    source_hash: str
    content_hash: str
    headings: list[Heading]
    document_type: str
    availability: str

    @property
    def document_id(self):
        return self.metadata["id"]


@dataclass
class ScanResult:
    documents: list[Document] = field(default_factory=list)
    issues: list[Issue] = field(default_factory=list)
    excluded: list[dict[str, str]] = field(default_factory=list)
    scanned: int = 0
    source_hashes: dict[str, str] = field(default_factory=dict)


@dataclass
class BuildResult:
    documents: list[dict]
    sections: list[dict]
    capability_map: dict
    issues: list[Issue]
    excluded: list[dict]
    scanned: int
    source_hashes: dict[str, str]
    configuration_hash: str

    @property
    def errors(self):
        return [i for i in self.issues if i.severity == "error"]

    def summary(self):
        return {
            "markdown_files_scanned": self.scanned,
            "documents_indexed": len(self.documents),
            "sections_indexed": len(self.sections),
            "capability_modules": len(self.capability_map["modules"]),
            "metadata_errors": sum(i.category == "metadata" for i in self.errors),
            "unresolved_references": sum(i.category == "reference" for i in self.errors),
            "errors": len(self.errors),
            "warnings": sum(i.severity == "warning" for i in self.issues),
            "excluded": len(self.excluded),
        }
