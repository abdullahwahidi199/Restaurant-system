"""Documented path conventions, not application authorization policy."""
from pathlib import PurePosixPath

from .schemas import AVAILABILITIES, DOCUMENT_TYPES

QA_FILES = frozenset({
    "coverage_matrix.md", "qa_report.md", "retrieval_readiness_report.md",
    "retrieval_conventions.md", "troubleshooting/verification_register.md",
    "reference/source_disposition.md",
})


def classify(relative_path, metadata):
    explicit = metadata.get("document_type")
    # Preserve legacy convention names as normalized types, keeping raw metadata.
    aliases = {"form": "form_reference"}
    if explicit is not None:
        kind = aliases.get(explicit, explicit)
        if kind not in DOCUMENT_TYPES:
            raise ValueError("Unsupported explicit document_type.")
    elif relative_path in QA_FILES:
        kind = "quality_assurance"
    elif relative_path == "index.md":
        kind = "index"
    elif relative_path.startswith("reference/interface/"):
        kind = "interface_reference"
    elif relative_path.startswith("reference/backend/"):
        kind = "backend_reference"
    else:
        kind = {
            "modules": "operator_guide", "role_guides": "role_guide",
            "workflows": "workflow", "forms": "form_reference",
            "navigation": "navigation", "troubleshooting": "troubleshooting",
        }.get(PurePosixPath(relative_path).parts[0])
        if kind is None:
            raise ValueError("No document_type metadata or established directory convention.")

    availability = metadata.get("availability")
    if availability is not None:
        if availability not in AVAILABILITIES:
            raise ValueError("Unsupported explicit availability.")
    elif kind == "quality_assurance":
        availability = "qa_only"
    elif kind == "backend_reference":
        availability = "reference_only"
    elif relative_path.startswith("modules/public_ordering/"):
        availability = "customer_context"
    elif kind == "interface_reference":
        routes = metadata["frontend_routes"]
        # Customer component scope is contextual, not a guessed staff role.
        if relative_path.startswith(("reference/interface/component_customer_", "reference/interface/component_publicmenu_")):
            availability = "customer_context"
        else:
            availability = "mounted_context" if routes else "needs_verification"
    else:
        availability = "operator_guidance"
    return kind, availability


def is_operator_guidance(kind, availability, status):
    """A future ranking hint only. Never a permission check."""
    return (
        kind in {"operator_guide", "role_guide", "workflow", "form_reference", "navigation", "troubleshooting"}
        and availability == "operator_guidance"
        and status == "source_verified"
    )
