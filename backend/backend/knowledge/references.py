"""Validate links inside the scanned Markdown registry, without filesystem reads."""
import posixpath
from urllib.parse import unquote, urlsplit

from mistune import create_markdown

from .schemas import Issue


def validate_markdown_links(documents, sections):
    parser = create_markdown(renderer="ast", plugins=["table"])
    docs = {d.path: d for d in documents}
    anchors = {d.path: set() for d in documents}
    for section in sections:
        anchors[section["path"]].update(section["anchors"])
        if section["heading_anchor"]:
            anchors[section["path"]].add(section["heading_anchor"])
    issues = []

    def links(tokens):
        for token in tokens:
            if token["type"] in {"link", "image"}:
                yield token["attrs"]["url"]
            yield from links(token.get("children", []))

    for doc in documents:
        for href in dict.fromkeys(links(parser(doc.markdown))):
            try:
                url = urlsplit(href)
            except ValueError:
                issues.append(Issue("error", "reference", "invalid_markdown_link", doc.path, "Malformed Markdown link."))
                continue
            if url.scheme in {"http", "https", "mailto"} or url.netloc:
                continue
            target = posixpath.normpath(posixpath.join(posixpath.dirname(doc.path), unquote(url.path))) if url.path else doc.path
            if url.scheme or "\\" in target or target not in docs:
                issues.append(Issue("error", "reference", "unresolved_markdown_document", doc.path, "Local Markdown target is outside the scanned document registry: " + href))
            elif url.fragment and unquote(url.fragment) not in anchors[target]:
                issues.append(Issue("error", "reference", "unresolved_markdown_anchor", doc.path, "Local Markdown fragment does not resolve: " + href))
    return issues
