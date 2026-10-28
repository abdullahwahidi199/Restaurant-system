"""Use Markdown block parsing for boundaries, but slice original normalized text."""
import hashlib
import json
import re
import unicodedata
from collections import Counter

from mistune import BlockParser, BlockState, Markdown
from mistune.plugins import import_plugin

from .schemas import Heading


def digest(value):
    return hashlib.sha256(value.encode("utf-8") if isinstance(value, str) else value).hexdigest()


def canonical_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


class OffsetState(BlockState):
    def add_paragraph(self, text):
        previous = self.last_token()
        super().add_paragraph(text)
        token = self.last_token()
        if token is not previous:
            token["source_start"] = self.cursor


class HeadingParser(BlockParser):
    state_cls = OffsetState

    def parse_atx_heading(self, match, state):
        end = super().parse_atx_heading(match, state)
        if state.parent is None:
            state.last_token().update(source_start=match.start(), source_end=end)
        return end

    def parse_setex_heading(self, match, state):
        end = super().parse_setex_heading(match, state)
        if end and state.parent is None and state.last_token()["type"] == "heading":
            state.last_token()["source_end"] = end
        return end


def parse_headings(markdown):
    parser = Markdown(block=HeadingParser(), plugins=[import_plugin("table")])
    state = OffsetState()
    state.process(markdown if markdown.endswith("\n") else markdown + "\n")
    parser.block.parse(state)
    # Root tokens only: a heading inside a list/quote must not split a procedure.
    return [
        Heading(token["attrs"]["level"], token.get("text", "").strip(),
                token["source_start"], min(token["source_end"], len(markdown)))
        for token in state.tokens
        if token["type"] == "heading" and "source_start" in token
    ]


def section_slug(title):
    text = unicodedata.normalize("NFKC", title).casefold()
    return re.sub(r"[^\w]+", "_", text, flags=re.UNICODE).strip("_")[:64] or "section"


def heading_anchor(title):
    """Source-document fragment convention; independent from opaque section IDs."""
    title = re.sub(r"<[^>]*>", "", title.lower())
    return re.sub(r"[^\w\-\s]", "", title, flags=re.UNICODE).replace(" ", "-")


def extract_sections(document):
    headings = document.headings
    boundaries = []
    if not headings:
        boundaries.append((0, None))
    elif document.markdown[:headings[0].start].strip():
        boundaries.append((0, None))
    boundaries.extend((h.start, h) for h in headings)
    if boundaries and not document.markdown[:boundaries[0][0]].strip():
        boundaries[0] = (0, boundaries[0][1])
    stack, records, occurrences, anchors_seen = [], [], Counter(), Counter()
    for position, (start, heading) in enumerate(boundaries):
        end = boundaries[position + 1][0] if position + 1 < len(boundaries) else len(document.markdown)
        level, title = (heading.level, heading.title) if heading else (0, "Introduction")
        while stack and stack[-1]["level"] >= level:
            stack.pop()
        hierarchy = [{"level": x["level"], "heading": x["heading"]} for x in stack]
        hierarchy.append({"level": level, "heading": title})
        identity = canonical_json(hierarchy)
        occurrences[identity] += 1
        # Full hash plus document ID: duplicate paths are distinguished by occurrence.
        suffix = digest(canonical_json([hierarchy, occurrences[identity]]))
        section_id = f"{document.document_id}::{section_slug(title)}_{suffix}"
        content = document.markdown[start:end]
        anchor = heading_anchor(title) if heading else None
        if anchor is not None:
            count = anchors_seen[anchor]
            anchors_seen[anchor] += 1
            anchor += f"-{count}" if count else ""
        records.append({
            "section_id": section_id, "document_id": document.document_id,
            "heading": title, "heading_level": level, "heading_path": hierarchy,
            "parent_section_id": stack[-1]["section_id"] if stack else None,
            "position": position, "start_offset": start, "end_offset": end,
            "heading_anchor": anchor,
            "content": content, "content_hash": digest(content),
            "anchors": re.findall(r'\bid=["\']([^"\']+)["\']', content),
            "document_title": document.metadata["title"],
            "module": document.metadata["module"], "path": document.path,
            "document_type": document.document_type, "availability": document.availability,
            "status": document.metadata["status"], "roles": document.metadata["roles"],
            "keywords": document.metadata["keywords"],
            "frontend_routes": document.metadata["frontend_routes"],
        })
        if heading:
            stack.append({"level": level, "heading": title, "section_id": section_id})
    return records
