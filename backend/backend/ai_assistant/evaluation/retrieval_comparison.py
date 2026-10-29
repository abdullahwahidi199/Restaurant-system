"""Paired protocol benchmark; scripted choices are not a model-quality score."""
import copy
import json
import time

from django.test import override_settings
from knowledge.gateway import KnowledgeGateway
from knowledge.markdown import canonical_json, digest

from ai_assistant.config import Limits
from ai_assistant.evidence import reference_for
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.provider import Completion
from ai_assistant.testing import call, final, tool_results
from .dataset import evaluation_principal, load_dataset
from .retrieval import FixedSnapshot


class ComparisonProvider:
    """Use frozen annotations only after discovery, never to grant access."""
    def __init__(self, record, index):
        self.record, self.index = record, index
        self.requests = []

    def complete(self, **request):
        self.requests.append(copy.deepcopy(request))
        record = self.record
        results = tool_results(request)
        fetched = {s['section_id']: s for r in results for s in r.get('sections', []) if not s.get('is_partial')}
        if record['expected_behavior'] == 'followup_reuse':
            return final('Scripted evidence witness: ' + record['source_checks'][0]['contains'],
                         [{'document_id': record['expected_documents'][0], 'section_id': record['expected_sections'][0]}])
        def search():
            return Completion(tool_calls=(call('search_documentation', {'query': record['question'], 'limit': 15}, 'search_' + str(len(self.requests))),), finish_reason='tool_calls')
        if not results:
            return search()
        if record['expected_behavior'] == 'clarify':
            return final('Clarify the module.', kind='clarification')
        if record['expected_behavior'] == 'unsupported':
            return final('No supported procedure.', kind='limitation') if len(results) >= 2 else search()
        if set(record['expected_sections']).issubset(fetched):
            return final('Scripted evidence witnesses:\n' + '\n'.join(c['contains'] for c in record['source_checks']),
                         [{'document_id': fetched[s]['document_id'], 'section_id': s} for s in record['expected_sections']])
        discovered = {r['section_id']: (r, result.get('search_token')) for result in results for r in result.get('results', [])}
        missing = [s for s in record['expected_sections'] if s not in fetched]
        if missing and all(s in discovered for s in missing):
            selected, token = [], discovered[missing[0]][1]
            for sid in missing:
                if discovered[sid][1] == token:
                    selected.append({k: discovered[sid][0][k] for k in ('document_id', 'section_id')})
            return Completion(tool_calls=(call('fetch_documentation', {'search_token': token, 'sections': selected, 'max_characters': 12000}, 'fetch_' + str(len(self.requests))),), finish_reason='tool_calls')
        # A compact auto result may omit discovery candidates. Ask again only
        # when its complete evidence does not cover the frozen source witness.
        if any(r.get('evidence_available') for r in results) and len(self.requests) < 4:
            return search()
        if len([r for r in results if 'results' in r]) < 2 and not discovered:
            return search()
        return final('Source witness not found by this scripted search.', kind='limitation')


def compare(records, index, mode):
    cases = []
    for record in records:
        principal = evaluation_principal(record['principal'])
        gateway = KnowledgeGateway(repository=FixedSnapshot(index), principal_resolver=lambda user: principal)
        provider = ComparisonProvider(record, index)
        history = []
        if record['expected_behavior'] == 'followup_reuse':
            s = index.get_section(record['expected_sections'][0])
            history = [{'role': 'assistant', 'kind': 'answer', 'content': 'Previously verified source.',
                        'sources': [reference_for(s, index.get_document(s['document_id']), index.version)]}]
        events, started = [], time.perf_counter()
        engine = Orchestrator(provider, gateway, Limits(), observer=events.append)
        case = {'id': record['id'], 'question': record['question'], 'language': record['language'], 'expected_behavior': record['expected_behavior']}
        try:
            with override_settings(AI_RETRIEVAL_MODE=mode):
                result = engine.run(user=object(), question=record['question'], history=history)
            expected = {'retrieve_and_answer': 'answer', 'followup_reuse': 'answer', 'clarify': 'clarification', 'unsupported': 'limitation', 'live_data_unavailable': 'limitation'}[record['expected_behavior']]
            source_ids = {s['section_id'] for s in result.sources}
            case.update(kind=result.kind, source_references_correct=all(index.get_section(s['section_id'])['content_hash'] == s['content_hash'] for s in result.sources),
                        answer_witness_correct=result.kind == expected and (expected != 'answer' or set(record['expected_sections']).issubset(source_ids)),
                        usage=result.usage or None, metrics=result.metrics)
        except Exception as exc:
            case.update(error_code=getattr(exc, 'code', type(exc).__name__), answer_witness_correct=False, source_references_correct=False, metrics=engine.metrics)
        case.update(duration_ms=round((time.perf_counter()-started)*1000, 3), model_requests=len(provider.requests),
                    request_context_bytes=sum(len(canonical_json(r['messages']).encode('utf-8')) for r in provider.requests), events=events)
        payloads = [r for request in provider.requests[-1:] for r in tool_results(request)]
        case['search_payload_bytes'] = sum(len(canonical_json(r).encode('utf-8')) for r in payloads if 'results' in r or r.get('evidence_available'))
        case['fetched_evidence_bytes'] = sum(len(s['content'].encode('utf-8')) for r in payloads for s in r.get('sections', []))
        cases.append(case)
    return {'mode': mode, 'cases': cases, 'summary': {
        'cases': len(cases), 'model_requests': sum(c['model_requests'] for c in cases),
        'answer_witness_correct': sum(c['answer_witness_correct'] for c in cases),
        'source_references_correct': sum(c['source_references_correct'] for c in cases),
        'orchestration_errors': sum('error_code' in c for c in cases),
        **{k: sum(c[k] for c in cases) for k in ('duration_ms', 'request_context_bytes', 'search_payload_bytes', 'fetched_evidence_bytes')}}}


def load_comparison_dataset(root, index):
    config = json.loads((root / 'config.json').read_text(encoding='utf-8'))
    records, source_hash = load_dataset(root / config['dataset'], index, config['dataset_sha256'])
    extra_path = root / 'retrieval_clear_cases.json'
    if extra_path.exists():
        extra = json.loads(extra_path.read_text(encoding='utf-8'))
        for record in extra:
            for check in record['source_checks']:
                section = index.get_section(check['section_id'])
                if not section or section['document_id'] != check['document_id'] or section['heading'] != check['heading'] or check['contains'] not in section['content']:
                    raise ValueError('Clear-case source witness changed; review its annotation.')
        records += extra
        source_hash = digest(canonical_json([source_hash, digest(extra_path.read_bytes())]))
    return records, source_hash
