"""Frozen source annotations, validated independently of search rankings."""
import json
import re
from pathlib import Path

from knowledge.access import LOGIN_ROLES, Principal, can_read_document
from knowledge.markdown import digest


def evaluation_principal(role):
    if role == "Superuser":
        return Principal("evaluation-superuser", superuser=True)
    if role not in LOGIN_ROLES:
        raise ValueError("Unknown evaluation principal classification.")
    return Principal("evaluation-operator", staff_id="evaluation-staff", restaurant_id="evaluation-restaurant", branch_id="evaluation-branch", role=role,
                     monitor_activity=role in {"Admin", "BranchAdmin"}, revoke_sessions=role == "Admin")


def load_dataset(path, index, expected_hash=None):
    raw = Path(path).read_bytes()
    if expected_hash and digest(raw) != expected_hash:
        raise ValueError("Frozen evaluation dataset hash changed; review annotations explicitly before updating configuration.")
    records = [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]
    if not 80 <= len(records) <= 100:
        raise ValueError("Expected 80–100 evaluation questions.")
    seen = set()
    for record in records:
        rid = record.get("id")
        if not isinstance(rid, str) or not re.fullmatch(r"EVAL-\d{3}", rid) or rid in seen:
            raise ValueError("Evaluation IDs must be unique EVAL-nnn strings.")
        seen.add(rid)
        if record.get("language") not in {"en", "fa", "ps"} or not isinstance(record.get("question"), str) or not record["question"].strip():
            raise ValueError(f"{rid}: invalid question/language.")
        if record.get("expected_behavior") not in {"retrieve_and_answer", "clarify", "unsupported", "live_data_unavailable", "followup_reuse"} or type(record.get("retrieval_metric")) is not bool:
            raise ValueError(f"{rid}: invalid behavior/metric classification.")
        principal = evaluation_principal(record.get("principal"))
        if not isinstance(record.get("expected_sections"), list) or not isinstance(record.get("expected_documents"), list) or not isinstance(record.get("source_checks"), list):
            raise ValueError(f"{rid}: malformed annotations.")
        if record["retrieval_metric"] and (record["expected_behavior"] != "retrieve_and_answer" or not record["expected_sections"]):
            raise ValueError(f"{rid}: answerable metrics require specific supporting sections.")
        checked = set()
        for check in record["source_checks"]:
            doc, section = index.get_document(check["document_id"]), index.get_section(check["section_id"])
            if not doc or not section or section["document_id"] != doc["document_id"] or doc["document_id"] not in record["expected_documents"] or section["heading"] != check["heading"] or not check["contains"] or check["contains"] not in section["content"]:
                raise ValueError(f"{rid}: source annotation does not resolve to its inspected content.")
            if not can_read_document(principal, doc):
                raise ValueError(f"{rid}: expected supporting source is forbidden for its evaluation principal.")
            checked.add(section["section_id"])
        if set(record["expected_sections"]) != checked:
            raise ValueError(f"{rid}: every expected section needs an inspected source witness.")
    return records, digest(raw)
