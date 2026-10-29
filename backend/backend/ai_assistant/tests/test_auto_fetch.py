from dataclasses import replace
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APIClient
from knowledge.errors import GatewayError
from knowledge.markdown import canonical_json
from knowledge.tests.gateway_helpers import identity

from ai_assistant.config import Limits, RetrievalSettings
from ai_assistant.errors import AssistantError
from ai_assistant.evaluation.retrieval_comparison import compare, load_comparison_dataset
from ai_assistant.models import Conversation, TurnAudit
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.retrieval import select_sections
from ai_assistant.testing import ScriptedProvider, call, final, tool_results
from ai_assistant.service import get_gateway
from .helpers import INDEX_ROOT, answer_latest, fetch_latest, gateway_fixture, search, tools
from . import test_auditing
from .test_evaluation_hardening import DatabaseFixture, EVAL_SETTINGS


@override_settings(AI_RETRIEVAL_MODE='auto_fetch', AI_AUTO_FETCH_LIMITS={})
class AutoFetchTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gateway, cls.index, cls.context = gateway_fixture()

    def setUp(self):
        self.context['principal'] = identity()

    def run_turn(self, responses, question='How do I create a contractor invoice?', **kwargs):
        provider = ScriptedProvider(responses)
        events = []
        engine = Orchestrator(provider, self.gateway, kwargs.pop('limits', Limits()), observer=events.append)
        return engine.run(user=object(), question=question, **kwargs), provider, events

    def test_clear_questions_use_two_calls_and_complete_authorized_citations(self):
        cases = [
            ('What are employees in Pakhlai?', 'Page and authority'),
            ('How do I create an employee?', 'Create form field reference'),
            ('How do I record employee attendance?', 'Attendance'),
            ('How do I create a contractor invoice?', 'Create invoice: fields and submission'),
            ('How do I record a contractor payment?', 'Record a contractor payment and outstanding balance'),
            ('How do I record a supplier payment?', 'Record a partial or full supplier payment'),
            ('How do I create a reservation?', 'Create form'),
        ]
        for question, heading in cases:
            with self.subTest(question=question):
                result, provider, events = self.run_turn([search(question), answer_latest], question)
                self.assertEqual(len(provider.requests), 2)
                self.assertEqual(provider.requests[1]['tool_choice'], 'auto')
                self.assertEqual(result.metrics['fetches'], 1)
                self.assertEqual(result.metrics['tool_calls'], 2)
                self.assertIn(heading, [s['heading'] for s in result.sources])
                payload = tool_results(provider.requests[1])[0]
                self.assertTrue(payload['evidence_available'])
                self.assertNotIn('results', payload)
                self.assertNotIn('search_token', payload)
                self.assertTrue(all(not s['is_partial'] and s['content'] == self.index.get_section(s['section_id'])['content'] for s in payload['sections']))
                self.assertEqual(len([e for e in events if e.get('automatic')]), 1)

    def test_live_search_arguments_with_omitted_limit_find_rank_eight_overview(self):
        question = 'What are employees in Pakhlai?'
        arguments = {'query': question, 'topics': ['employees', 'staff', 'shifts', 'attendance'], 'module': 'employees'}
        narrow = self.gateway.search_documentation(user=object(), **arguments)
        self.assertFalse(select_sections(question, narrow, self.index, RetrievalSettings()).sections)
        result, provider, events = self.run_turn([tools(call('search_documentation', arguments, 'live_search_replay')), answer_latest], question)
        self.assertEqual(len(provider.requests), 2)
        self.assertEqual(result.metrics['automatic_fetch_attempts'], 1)
        self.assertEqual([s['heading'] for s in result.sources], ['Page and authority'])
        self.assertTrue(tool_results(provider.requests[1])[0]['evidence_available'])

    def test_explicit_search_limit_is_preserved_when_auto_default_is_broadened(self):
        original, limits = self.gateway.execute, []
        def execute(**kwargs):
            if kwargs['name'] == 'search_documentation' and kwargs['arguments'].get('mode') != 'browse':
                limits.append(kwargs['arguments'].get('limit'))
            return original(**kwargs)
        with patch.object(self.gateway, 'execute', side_effect=execute):
            self.run_turn([search(limit=1), final('Please choose the task.', kind='clarification')], 'Teach me the entire contractor module.')
        self.assertEqual(limits, [1])

    @override_settings(AI_RETRIEVAL_MODE='legacy')
    def test_legacy_remains_three_call_workflow(self):
        result, provider, events = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(len(provider.requests), 3)
        self.assertFalse(any(e.get('automatic') for e in events))
        self.assertEqual(result.metrics['retrieval_mode'], 'legacy')

    def test_ambiguous_invoice_ignores_wrong_model_hint_and_never_auto_fetches(self):
        result, provider, events = self.run_turn([search(module='contractors', topics=['contractor invoice'])], 'How do I pay an invoice?')
        self.assertEqual(result.kind, 'clarification')
        self.assertEqual(result.metrics['fetches'], 0)
        self.assertEqual(result.metrics['retrieval_mode'], 'auto_fetch_fallback')

    def test_complex_and_multilingual_questions_retain_explicit_fetch(self):
        for question in ('How do I create, approve, and pay a contractor invoice?', 'Why can I not save an employee?', '\u0686\u06af\u0648\u0646\u0647 \u06a9\u0627\u0631\u0645\u0646\u062f \u0627\u06cc\u062c\u0627\u062f \u06a9\u0646\u0645\u061f'):
            found = self.gateway.search_documentation(user=object(), query=question, topics=['employee create'], limit=8)
            self.assertFalse(select_sections(question, found, self.index, RetrievalSettings()).sections)
        result, provider, _ = self.run_turn([search(), lambda r: fetch_latest(r, count=3), answer_latest], 'How do I create, approve, and pay a contractor invoice?')
        self.assertEqual(len(provider.requests), 3)
        self.assertGreaterEqual(len(result.sources), 2)

    def test_compact_fallback_retains_exact_ids_and_discovery(self):
        question = 'Teach me the entire employee module.'
        result, provider, _ = self.run_turn([search(), fetch_latest, answer_latest], question)
        payload = tool_results(provider.requests[1])[0]
        self.assertEqual(payload['search_token'], 'discovery_1')
        self.assertNotIn('available_modules', payload)
        self.assertNotIn('module_context', payload)
        self.assertLessEqual(len(canonical_json(payload).encode()), 12000)
        self.assertTrue(all(set(r) == {'document_id', 'section_id', 'document_title', 'title', 'module', 'summary', 'rank'} for r in payload['results']))
        self.assertEqual(result.kind, 'answer')

    def test_internal_fetch_uses_real_issued_signed_discovery_and_rechecks_scope(self):
        original = self.gateway.execute
        tokens = []
        def execute(**kwargs):
            value = original(**kwargs)
            if kwargs['name'] == 'search_documentation' and value.get('search_token'):
                tokens.append(value['search_token'])
            if kwargs['name'] == 'fetch_documentation':
                self.assertIn(kwargs['arguments']['search_token'], tokens)
                self.assertNotEqual(kwargs['arguments']['search_token'], 'discovery_1')
            return value
        with patch.object(self.gateway, 'execute', side_effect=execute):
            self.run_turn([search(), answer_latest])

    def test_branch_change_during_automatic_fetch_aborts_before_next_model_call(self):
        original = self.gateway.execute
        provider = ScriptedProvider([search(), answer_latest])
        def execute(**kwargs):
            if kwargs['name'] == 'fetch_documentation':
                self.context['principal'] = replace(self.context['principal'], branch_id='different')
            return original(**kwargs)
        with patch.object(self.gateway, 'execute', side_effect=execute), self.assertRaises(AssistantError) as caught:
            Orchestrator(provider, self.gateway, Limits()).run(user=object(), question='How do I create a contractor invoice?')
        self.assertEqual(caught.exception.code, 'context_changed')
        self.assertEqual(len(provider.requests), 1)

    def test_gateway_failure_falls_back_to_normal_fetch(self):
        original, attempts = self.gateway.execute, []
        def execute(**kwargs):
            if kwargs['name'] == 'fetch_documentation':
                attempts.append(True)
                if len(attempts) == 1:
                    kwargs = {**kwargs, 'arguments': {**kwargs['arguments'], 'search_token': 'invalid-signed-token'}}
            return original(**kwargs)
        with patch.object(self.gateway, 'execute', side_effect=execute):
            result, provider, events = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(len(provider.requests), 3)
        self.assertEqual(result.metrics['retrieval_mode'], 'auto_fetch_fallback')
        self.assertEqual(events[0]['error_code'], 'discovery_invalid')

    def test_undiscovered_or_forbidden_selection_cannot_bypass_gateway(self):
        from ai_assistant.retrieval import Selection
        section = next(s for s in self.index.iter_sections() if self.index.get_document(s['document_id'])['document_type'] == 'backend_reference')
        selection = Selection(({'document_id': section['document_id'], 'section_id': section['section_id']},), 'test_untrusted_selection')
        with patch('ai_assistant.orchestrator.select_sections', return_value=selection):
            result, _, events = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(events[0]['error_code'], 'section_not_available')
        self.assertNotIn(section['section_id'], [s['section_id'] for s in result.sources])

    def test_expired_discovery_auto_fetch_falls_back_without_weakening_validation(self):
        original, attempts = self.gateway.execute, []
        def execute(**kwargs):
            if kwargs['name'] == 'fetch_documentation' and not attempts:
                attempts.append(True)
                raise GatewayError('discovery_expired', 'Search again.')
            return original(**kwargs)
        with patch.object(self.gateway, 'execute', side_effect=execute):
            result, _, events = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(events[0]['error_code'], 'discovery_expired')
        self.assertEqual(result.kind, 'answer')

    def test_index_change_during_auto_fetch_aborts(self):
        original = self.gateway.execute
        def execute(**kwargs):
            value = original(**kwargs)
            if kwargs['name'] == 'fetch_documentation':
                value['index_version'] = 'changed'
            return value
        with patch.object(self.gateway, 'execute', side_effect=execute), self.assertRaises(AssistantError) as caught:
            self.run_turn([search(), answer_latest])
        self.assertEqual(caught.exception.code, 'documentation_changed')

    @override_settings(AI_AUTO_FETCH_LIMITS={'evidence_bytes': 512})
    def test_procedure_budget_declines_auto_without_truncation(self):
        result, provider, events = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(result.metrics['automatic_fetch_attempts'], 0)
        self.assertEqual(tool_results(provider.requests[1])[0]['selection_reason'], 'complete_evidence_over_budget')
        self.assertEqual(result.sources[0]['content_hash'], self.index.get_section(result.sources[0]['section_id'])['content_hash'])

    @override_settings(AI_AUTO_FETCH_LIMITS={'evidence_bytes': 1000})
    def test_fetched_envelope_over_budget_is_not_used_as_unseen_evidence(self):
        result, provider, events = self.run_turn([search('What are employees in Pakhlai?'), fetch_latest, answer_latest], 'What are employees in Pakhlai?')
        payload = tool_results(provider.requests[1])[0]
        self.assertFalse(payload['evidence_available'])
        self.assertNotIn('sections', payload)
        self.assertEqual(result.metrics['automatic_fetch_attempts'], 1)
        self.assertEqual(len(provider.requests), 3)

    def test_partial_automatic_result_never_becomes_citable_evidence(self):
        original, count = self.gateway.execute, []
        def execute(**kwargs):
            value = original(**kwargs)
            if kwargs['name'] == 'fetch_documentation' and not count:
                count.append(True)
                s = value['sections'][0]
                s.update(content=s['content'][:20], is_partial=True, next_offset=20,
                         content_range={'start': 0, 'end': 20, 'total': s['content_range']['total']})
            return value
        with patch.object(self.gateway, 'execute', side_effect=execute):
            result, provider, _ = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(tool_results(provider.requests[1])[0]['selection_reason'], 'incomplete_evidence')
        self.assertEqual(result.kind, 'answer')

    def test_automatic_fetch_counts_against_existing_tool_limit(self):
        result, _, events = self.run_turn([search(), final('Which procedure?', kind='clarification')], limits=replace(Limits(), tool_calls=1))
        self.assertEqual(result.metrics['tool_calls'], 1)
        self.assertEqual(result.metrics['automatic_fetch_attempts'], 0)

    def test_wrong_citation_after_auto_fetch_remains_rejected_and_bounded(self):
        bad = final('Unsupported.', [{'document_id': 'invented', 'section_id': 'invented'}])
        with self.assertRaises(AssistantError) as caught:
            self.run_turn([search(), bad, bad])
        self.assertEqual(caught.exception.code, 'answer_repair_stalled')

    def test_followup_reuses_auto_evidence_with_no_new_tools(self):
        first, _, _ = self.run_turn([search(), answer_latest])
        citations = [{k: s[k] for k in ('document_id', 'section_id')} for s in first.sources]
        result, provider, events = self.run_turn([final('Required fields are in the prior verified section.', citations)], 'What fields are required?',
                    history=[{'role': 'assistant', 'kind': 'answer', 'content': first.content, 'sources': first.sources}])
        self.assertEqual(len(provider.requests), 1)
        self.assertFalse(events)
        self.assertEqual(result.metrics['searches'], 0)

    def test_provider_error_after_auto_fetch_is_propagated(self):
        with self.assertRaises(AssistantError) as caught:
            self.run_turn([search(), AssistantError('provider_timeout', 'Timed out.', 504)])
        self.assertEqual(caught.exception.code, 'provider_timeout')

    def test_explicit_fetch_over_payload_budget_cannot_create_unseen_citable_evidence(self):
        def cite_search(request):
            found = next(r for r in tool_results(request) if r.get('results'))['results'][0]
            return final('Unseen evidence must not be accepted.', [{k: found[k] for k in ('document_id', 'section_id')}])
        with self.assertRaises(AssistantError) as caught:
            self.run_turn([search(limit=1), fetch_latest, cite_search, cite_search],
                          'How do I create, approve, and pay a contractor invoice?', limits=replace(Limits(), tool_result_bytes=1500))
        self.assertEqual(caught.exception.code, 'answer_repair_stalled')

    def test_existing_mock_cli_provider_supports_auto_evidence(self):
        from ai_assistant.testing import DemoProvider
        question = 'How do I create a contractor invoice?'
        provider = DemoProvider(question)
        result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=question)
        self.assertEqual(result.kind, 'answer')
        self.assertEqual(len(provider.requests), 2)

    def test_104_frozen_cases_have_no_quality_or_citation_regression(self):
        records, _ = load_comparison_dataset(INDEX_ROOT.parent / 'evaluation', self.index)
        self.assertGreaterEqual(len(records), 104)
        legacy, auto = compare(records, self.index, 'legacy'), compare(records, self.index, 'auto_fetch')
        for a, b, record in zip(legacy['cases'], auto['cases'], records):
            with self.subTest(id=record['id']):
                self.assertNotIn('error_code', b)
                self.assertEqual(a['answer_witness_correct'], b['answer_witness_correct'])
                self.assertTrue(b['source_references_correct'])
                automatic = [e for e in b['events'] if e.get('automatic') and e['status'] == 'ok']
                if automatic and record['expected_behavior'] == 'retrieve_and_answer':
                    self.assertTrue(all(set(e['documents']).issubset(record['expected_documents']) for e in automatic))
                    self.assertEqual(b['model_requests'], 2)
        self.assertLess(auto['summary']['request_context_bytes'], legacy['summary']['request_context_bytes'])

    def test_settings_validation_is_fail_closed(self):
        for setting in ({'AI_RETRIEVAL_MODE': 'unknown'}, {'AI_AUTO_FETCH_LIMITS': {'max_sections': 6}}, {'AI_AUTO_FETCH_LIMITS': {'evidence_bytes': True}}):
            with override_settings(**setting), self.assertRaises(AssistantError):
                RetrievalSettings.configured()


@override_settings(**EVAL_SETTINGS)
class AutoFetchAuditTests(DatabaseFixture, TestCase):
    send = test_auditing.AuditingTests.send
    payload = test_auditing.AuditingTests.payload

    @classmethod
    def setUpTestData(cls):
        cls.make_data()
        cls.superadmin = User.objects.create_superuser(username='auto-fetch-auditor', password='test-password')

    def setUp(self):
        cache.clear()
        get_gateway.cache_clear()
        self.client = self.client_for_user()
        self.admin = APIClient()
        self.admin.force_authenticate(self.superadmin)

    @override_settings(AI_RETRIEVAL_MODE='auto_fetch')
    def test_optimized_api_contract_persistence_and_real_timeline(self):
        response, provider = self.send([search(), answer_latest])
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(set(response.data), {'conversation_id', 'request_id', 'message'})
        turn = TurnAudit.objects.get()
        self.assertEqual(turn.model_calls, 2)
        self.assertEqual(turn.tool_calls, 2)
        self.assertEqual(turn.completed_tool_calls, 2)
        self.assertEqual(str(turn.conversation_identifier), response.data['conversation_id'])
        self.assertEqual(turn.assistant_message.sources, response.data['message']['sources'])
        self.assertIsNone(Conversation.objects.get(pk=turn.conversation_identifier).active_request)
        events = list(turn.events.select_related('payload'))
        ranked = next(e for e in events if e.event_type == 'gateway_result' and e.tool_name == 'search_documentation')
        fetched = next(e for e in events if e.event_type == 'tool_result' and e.tool_name == 'fetch_documentation')
        self.assertLess(ranked.sequence, fetched.sequence)
        self.assertTrue(self.payload(fetched)['automatic'])
        self.assertTrue(self.payload(fetched)['accepted_as_evidence'])
        self.assertEqual(fetched.model_ordinal, 1)
        second = next(e for e in events if e.event_type == 'model_request' and e.model_ordinal == 2)
        self.assertLess(fetched.sequence, second.sequence)
        selection = next(e for e in events if e.event_type == 'retrieval_selection')
        self.assertEqual(self.payload(selection)['retrieval_mode'], 'auto_fetch')
        self.assertEqual(self.client.get('/api/assistant/audit/turns/').status_code, 403)
        self.assertEqual(self.admin.get(f'/api/assistant/audit/turns/{turn.pk}/').status_code, 200)
