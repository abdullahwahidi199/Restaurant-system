"""Read-only section discovery with authorization before ranking or previews."""
import re
import threading
from collections import Counter, defaultdict

from .access import can_read_document
from .ranking import Aliases, FIELD_WEIGHTS, TYPE_WEIGHTS, inverse_frequency, lexical_score, normalize, prepare, terms


class SearchEngine:
    def __init__(self, index):
        self.version = index.version
        self.documents = {d["document_id"]: d for d in index.iter_documents()}
        self.sections = {s["section_id"]: s for s in index.iter_sections()}
        self.modules = index.get_capability_map()["modules"]
        self.aliases = Aliases()
        capabilities = defaultdict(list)
        module_names = {m["module"]: m["name"] for m in self.modules}
        module_terms = [set(terms(" ".join([m["module"], m["name"], *(c["label"] for c in m["capabilities"])]))) for m in self.modules]
        frequencies = Counter(term for group in module_terms for term in group)
        self.distinctive_module_terms = {term for term, frequency in frequencies.items() if frequency == 1 and len(term) >= 4}
        for module in self.modules:
            for capability in module["capabilities"]:
                capabilities[capability["section_id"]].append(capability["label"])
        self.records = {}
        self._prepare_lock = threading.RLock()
        self._capability_labels = capabilities
        self._module_names = module_names

    def _prepare_visible(self, visible):
        # Prepare each authorized section once, on demand. Ordinary workers no
        # longer tokenize every internal/unmounted/QA section at first question.
        # The cache is bounded by immutable section IDs, not arbitrary queries.
        with self._prepare_lock:
            for sid in visible:
                if sid in self.records:
                    continue
                self.records[sid] = self._prepare_record(sid)

    def _prepare_record(self, sid):
        section = self.sections[sid]
        doc = self.documents[section["document_id"]]
        record = prepare({
            "heading": section["heading"], "title": doc["title"],
            "module": " ".join((doc["module"], self._module_names.get(doc["module"], ""))),
            "description": doc["description"], "keywords": " ".join(doc["keywords"]),
            "capability": " ".join(self._capability_labels[sid]), "content": section["content"],
        })
        record["heading_only"] = not re.sub(r"^#{1,6}\s.*$", "", section["content"], flags=re.MULTILINE).strip()
        return record

    def authorized(self, principal):
        return {did for did, doc in self.documents.items() if can_read_document(principal, doc)}

    def overview(self, allowed):
        visible = []
        associated = defaultdict(list)
        for did, doc in self.documents.items():
            if did in allowed and doc["document_type"] not in {"backend_reference", "interface_reference"}:
                associated[doc["module"]].append(did)
        for module in self.modules:
            primary = [did for did in module["primary_documents"] if did in allowed]
            documents = associated.get(module["module"], [])
            if not primary and not documents:
                continue
            visible.append({"module": module["module"], "name": module["name"], "description": self.documents[(primary or documents)[0]]["description"], "primary_documents": primary, "documents": documents,
                            "capabilities": [c for c in module["capabilities"] if c["document_id"] in allowed],
                            "workflows": [w for w in module["workflows"] if w["document_id"] in allowed],
                            "related_modules": module["related_modules"]})
        known = {m["module"] for m in visible}
        for module, documents in sorted(associated.items()):
            if module not in known:
                visible.append({"module": module, "name": module.replace("_", " ").title(), "description": self.documents[documents[0]]["description"], "documents": documents,
                                "primary_documents": [], "capabilities": [], "workflows": [], "related_modules": []})
        names = {m["module"] for m in visible}
        for module in visible:
            module["related_modules"] = [m for m in module["related_modules"] if m in names]
        return visible

    def result(self, sid, score, rank):
        section = self.sections[sid]
        doc = self.documents[section["document_id"]]
        return {"document_id": doc["document_id"], "section_id": sid, "title": section["heading"], "heading_path": section["heading_path"],
                "document_title": doc["title"], "module": doc["module"], "document_type": doc["document_type"], "availability": doc["availability"],
                "verification_status": doc["status"], "summary": doc["description"][:240], "rank": rank, "relevance_score": round(score, 6)}

    def search(self, principal, *, query="", module=None, topics=(), limit=5, mode="search", offset=0):
        allowed = self.authorized(principal)
        overview = self.overview(allowed)
        compact = [{key: m[key] for key in ("module", "name", "description")} for m in overview]
        context = next((m for m in overview if m["module"] == module), None)
        response = {"query": query, "mode": mode, "available_modules": compact, "module_context": context, "results": [], "result_count": 0,
                    "ranking_method": "weighted_length_normalized_tfidf_v2 (raw relevance units, not confidence)", "next_offset": None}
        visible = [sid for sid, section in self.sections.items() if section["document_id"] in allowed]
        if mode == "browse":
            if not module:
                response["explanation"] = "Choose an available module to browse its documented procedures."
                return response
            # Capability procedures first; then other sections of authorized module docs.
            featured = {c["section_id"] for c in (context or {}).get("capabilities", [])}
            candidates = [sid for sid in visible if self.sections[sid]["module"] == module]
            candidates.sort(key=lambda sid: (sid not in featured, not self.documents[self.sections[sid]["document_id"]]["operator_guidance"], self.sections[sid]["document_id"], self.sections[sid]["position"], sid))
            selected = candidates[offset:offset + limit]
            response["results"] = [self.result(sid, 0, offset + i + 1) for i, sid in enumerate(selected)]
            response["ranking_method"] = "browse: capabilities, operator guidance, document ID, section order"
            response["next_offset"] = offset + len(selected) if offset + len(selected) < len(candidates) else None
        else:
            self._prepare_visible(visible)
            weights, _, phrases = self.aliases.query(query, topics)
            if not weights:
                response["explanation"] = "No searchable terms. Try a feature, action, or module name, or use browse mode."
                return response
            idf = {term: inverse_frequency(len(visible), sum(term in self.records[sid]["terms"] for sid in visible)) for term in weights}
            averages = {field: sum(self.records[sid]["lengths"][field] for sid in visible) / max(1, len(visible)) for field in FIELD_WEIGHTS}
            scored = {}
            doc_best = defaultdict(float)
            validation = bool(set(terms(query)).intersection({"validation", "invalid", "reject", "rejected", "server", "serializer", "required", "error", "errors"}))
            for sid in visible:
                section = self.sections[sid]
                doc = self.documents[section["document_id"]]
                record = self.records[sid]
                score = lexical_score(record, weights, phrases, idf, averages)
                if normalize(query.strip()) == normalize(doc["document_id"]):
                    score += 120
                if normalize(query.strip()) == normalize(sid):
                    score += 160
                if normalize(query.strip()) == normalize(doc["title"]):
                    score += 80
                if normalize(query.strip()) == normalize(section["heading"]):
                    score += 90
                if score <= 0:
                    continue
                factor = TYPE_WEIGHTS.get(doc["document_type"], .7)
                # Inherited module metadata locates the document; actual local
                # text must distinguish which of its procedures answers a query.
                local = set(record["counts"]["heading"]) | set(record["counts"]["content"]) | set(record["counts"]["capability"])
                matched = {term for term in weights if term in record["terms"]}
                local_coverage = sum(weights[t] * idf[t] for t in matched if t in local) / max(1, sum(weights[t] * idf[t] for t in matched))
                factor *= .45 + .55 * local_coverage
                if validation:
                    factor *= {"backend_reference": 2.4, "form_reference": 1.3, "troubleshooting": 1.3}.get(doc["document_type"], 1)
                if record["heading_only"]:
                    factor *= .3
                score *= factor
                # Bounded additive hints; they never filter candidates or create matches.
                if module and doc["module"] == module:
                    score += 4
                elif context and doc["module"] in context["related_modules"]:
                    score += 1
                scored[sid] = score
                doc_best[doc["document_id"]] = max(doc_best[doc["document_id"]], score)
            for sid in scored:
                related = self.documents[self.sections[sid]["document_id"]]["related_docs"]
                scored[sid] += min(4, .06 * max((doc_best.get(did, 0) for did in related if did in allowed), default=0))
            candidates = sorted(scored, key=lambda sid: (-scored[sid], self.sections[sid]["document_id"], self.sections[sid]["position"], sid))
            selected, per_doc = [], defaultdict(int)
            # Near-tied modules provide clarification candidates for ambiguous queries.
            specific_domain = self.distinctive_module_terms.intersection(weights)
            if candidates and not module and not specific_domain:
                # Diversity must not displace the highest-scoring result when
                # that result belongs to navigation/troubleshooting/workflows.
                best = candidates[0]
                selected.append(best)
                per_doc[self.sections[best]["document_id"]] += 1
                seen_modules = {self.sections[best]["module"]}
                business_modules = {m["module"] for m in self.modules}
                for sid in candidates:
                    if scored[sid] < scored[candidates[0]] * .45 or len(selected) >= min(limit, 5):
                        break
                    domain = self.sections[sid]["module"]
                    if domain in business_modules and domain not in seen_modules:
                        selected.append(sid)
                        per_doc[self.sections[sid]["document_id"]] += 1
                        seen_modules.add(domain)
            for sid in candidates:
                if len(selected) >= limit:
                    break
                did = self.sections[sid]["document_id"]
                if sid not in selected and per_doc[did] < 3:
                    selected.append(sid)
                    per_doc[did] += 1
            response["results"] = [self.result(sid, scored[sid], i + 1) for i, sid in enumerate(selected)]
            response["search_strategy"] = "original query + bounded topic/alias expansion; all authorized modules; one-hop related-document support"
        response["result_count"] = len(response["results"])
        if not response["results"]:
            response["explanation"] = "No matching authorized documentation was found. Try more specific terms or browse an available module."
        return response
