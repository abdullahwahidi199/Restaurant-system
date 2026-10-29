"""Handled no-answer outcomes are distinct from orchestration/system errors."""
import json
from dataclasses import replace
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIClient
from knowledge.errors import GatewayError

from ai_assistant.audit_payloads import read_blob
from ai_assistant.config import Limits
from ai_assistant.errors import AssistantError
from ai_assistant.language import TEXT
from ai_assistant.model_configuration import ModelConfiguration
from ai_assistant.models import Conversation, Message, TurnAudit
from ai_assistant.orchestrator import Orchestrator, decode_answer
from ai_assistant.provider import Completion
from ai_assistant.service import get_gateway
from ai_assistant.testing import ScriptedProvider, call, final, tool_results
from .helpers import answer_latest, fetch_latest, gateway_fixture, search, tools
from .test_evaluation_hardening import DatabaseFixture, EVAL_SETTINGS

PYTHON_QUESTION = 'What is the sum() function in Python?'
EMPTY_QUESTION = 'zzzxxyy qqqkkk undocumented fluxcapacitor'


def limitation(status=None, **extra):
    # Intentionally reproduce the audited provider shape: citations omitted.
    value = {'kind': 'limitation', 'content': 'UNTRUSTED_UNSUPPORTED_PROCEDURE'}
    if status:
        value['application_status'] = status
    return Completion(json.dumps({**value, **extra}))


@override_settings(AI_RETRIEVAL_MODE='legacy', DEEPSEEK_REASONING_EFFORT='none')
class NoAnswerEngineTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gateway, cls.index, _ = gateway_fixture()

    def run_turn(self, responses, question=PYTHON_QUESTION, limits=None, **kwargs):
        provider = ScriptedProvider(responses)
        engine = Orchestrator(provider, self.gateway, limits or Limits())
        return engine.run(user=object(), question=question, **kwargs), provider

    def test_audited_python_refusal_without_citations_is_accepted_before_unrelated_fetch(self):
        question = 'what does the sum function does in python'
        results = self.gateway.search_documentation(user=object(), query=question)
        self.assertGreater(len(results['results']), 0)  # Incidental lexical matches, not Python docs.
        second = tools(call('search_documentation', {'query': 'python sum function built-in programming language',
                       'topics': ['python', 'sum', 'programming']}, 'search_2'))
        result, provider = self.run_turn([search(question), second, limitation()], question)
        self.assertEqual(len(provider.requests), 3)
        self.assertEqual(result.application_status, 'insufficient_evidence')
        self.assertEqual(result.metrics['searches'], 2)
        self.assertEqual(result.metrics['fetches'], 0)
        self.assertEqual(result.sources, [])
        self.assertNotIn('UNTRUSTED', result.content)

    def test_explicit_out_of_scope_accepts_null_citations_and_never_explains_python(self):
        for mode in ('legacy', 'auto_fetch'):
            with self.subTest(mode=mode), override_settings(AI_RETRIEVAL_MODE=mode):
                result, provider = self.run_turn([search(PYTHON_QUESTION), limitation('out_of_scope', citations=None)])
            self.assertEqual(result.application_status, 'out_of_scope')
            self.assertEqual(result.content, TEXT['en']['out_of_scope'])
            self.assertEqual(result.sources, [])
            self.assertEqual(len(provider.requests), 2)

    def test_empty_search_can_end_normally_without_forced_second_search_or_fetch(self):
        result, provider = self.run_turn([search(EMPTY_QUESTION), limitation()], EMPTY_QUESTION)
        self.assertEqual(tool_results(provider.requests[-1])[0]['results'], [])
        self.assertEqual(provider.requests[-1]['tool_choice'], 'auto')
        self.assertEqual(result.application_status, 'documentation_not_found')
        self.assertEqual(result.metrics['ranked_searches'], 1)
        self.assertEqual(result.sources, [])

    def test_scope_limitations_are_localized_without_returning_model_claims(self):
        for language, question in [('fa', 'تابع sum در پایتون چیست؟'), ('ps', 'په پایتون کې sum څه کوي؟')]:
            with self.subTest(language=language):
                result, _ = self.run_turn([search(question), limitation('out_of_scope')], question)
                self.assertEqual(result.content, TEXT[language]['out_of_scope'])
                self.assertEqual(result.sources, [])

    def test_complete_retrieval_does_not_force_an_unsupported_factual_answer(self):
        result, provider = self.run_turn([search(), fetch_latest, limitation('insufficient_evidence')],
            'How do I recover from an undocumented contractor integration?')
        self.assertEqual(len(provider.requests), 3)
        self.assertEqual(result.application_status, 'insufficient_evidence')
        self.assertEqual(result.metrics['fetches'], 1)
        self.assertFalse(result.sources)

    def test_partial_evidence_may_be_declined_but_is_never_cited(self):
        result, provider = self.run_turn([search(), lambda request: fetch_latest(request, max_characters=10), limitation('insufficient_evidence')],
            'How do I recover from an undocumented contractor integration?', configuration=ModelConfiguration('deepseek-v4-pro', 'high'))
        self.assertEqual(result.application_status, 'insufficient_evidence')
        fetched = next(r for r in tool_results(provider.requests[-1]) if r.get('sections'))
        self.assertTrue(fetched['sections'][0]['is_partial'])
        self.assertEqual(result.sources, [])

    def test_factual_schema_and_non_factual_status_validation_remain_strict(self):
        bad = [
            {'kind': 'answer', 'content': 'Unfetched fact.'},
            {'kind': 'answer', 'content': 'Unfetched fact.', 'citations': None},
            {'kind': 'answer', 'content': 'Unfetched fact.', 'citations': [], 'application_status': 'out_of_scope'},
            {'kind': 'limitation', 'content': 'Bad status.', 'application_status': 'provider_timeout'},
            {'kind': 'limitation', 'content': 'Bad citation.', 'citations': [{'document_id': 'invented', 'section_id': 'invented'}]},
            {'kind': 'limitation', 'content': 'Extra fields.', 'extra': True},
        ]
        for value in bad:
            with self.subTest(value=value), self.assertRaises(AssistantError):
                decode_answer(json.dumps(value), Limits())

    def test_malformed_non_factual_response_is_repaired_without_forcing_unrelated_fetch(self):
        malformed = Completion('{"kind":"limitation","content":""}')
        result, provider = self.run_turn([search(PYTHON_QUESTION), malformed, limitation('out_of_scope')])
        self.assertEqual(provider.requests[-1]['tool_choice'], 'auto')
        self.assertEqual(result.metrics['fetches'], 0)

    def test_valid_refusal_still_requires_a_successful_ranked_search_or_revalidated_evidence(self):
        with self.assertRaises(AssistantError) as caught:
            self.run_turn([limitation('out_of_scope'), limitation('out_of_scope')])
        self.assertEqual(caught.exception.code, 'answer_repair_stalled')

    def test_loop_after_empty_search_is_a_real_orchestration_error_not_missing_docs(self):
        with self.assertRaises(AssistantError) as caught:
            self.run_turn([search(EMPTY_QUESTION, call_id=f's{i}') for i in range(3)], EMPTY_QUESTION,
                          limits=replace(Limits(), model_requests=3))
        self.assertEqual(caught.exception.code, 'orchestration_limit')

    def test_invalid_json_and_fabricated_factual_citations_still_fail(self):
        for bad in (Completion('not json'), final('Unsupported claim', [{'document_id': 'invented', 'section_id': 'invented'}]),
                    Completion('{"kind":"answer","content":"Missing references"}')):
            with self.subTest(bad=bad), self.assertRaises(AssistantError) as caught:
                self.run_turn([search(PYTHON_QUESTION), bad, bad])
            self.assertEqual(caught.exception.code, 'answer_repair_stalled')

    def test_provider_and_index_failures_are_not_converted_to_limitations(self):
        for code, status in [('provider_timeout', 504), ('provider_invalid_response', 502), ('provider_unavailable', 503)]:
            with self.subTest(code=code), self.assertRaises(AssistantError) as caught:
                self.run_turn([search(PYTHON_QUESTION), AssistantError(code, 'Safe provider failure.', status)])
            self.assertEqual((caught.exception.code, caught.exception.status), (code, status))
        with patch.object(self.gateway.repository, 'get', side_effect=GatewayError('index_unavailable', 'Index unavailable.')), self.assertRaises(AssistantError) as caught:
            self.run_turn([])
        self.assertEqual((caught.exception.code, caught.exception.status), ('index_unavailable', 503))

    def test_local_live_data_limitation_is_not_mislabeled_as_missing_documentation(self):
        result, provider = self.run_turn([], "What are today's actual sales?")
        self.assertEqual(result.application_status, 'live_data_unavailable')
        self.assertEqual(len(provider.requests), 0)


@override_settings(**{**EVAL_SETTINGS, 'AI_RETRIEVAL_MODE': 'legacy', 'DEEPSEEK_REASONING_EFFORT': 'none'})
class NoAnswerAPITests(DatabaseFixture, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.make_data()
        cls.auditor = User.objects.create_superuser(username='no-answer-auditor', password='test-password')

    def setUp(self):
        cache.clear(); get_gateway.cache_clear()
        self.client = self.client_for_user()

    def send(self, responses, question=PYTHON_QUESTION):
        provider = ScriptedProvider(responses)
        with patch('ai_assistant.service.get_provider', return_value=provider):
            response = self.client.post('/api/assistant/chat/', {'message': question}, format='json')
        return response, provider

    def test_successful_no_answer_statuses_are_http_200_complete_and_audited(self):
        cases = [('out_of_scope', PYTHON_QUESTION, [search(PYTHON_QUESTION), limitation('out_of_scope')]),
                 ('documentation_not_found', EMPTY_QUESTION, [search(EMPTY_QUESTION), limitation()]),
                 ('insufficient_evidence', 'How do I recover an undocumented contractor integration?', [search(), fetch_latest, limitation('insufficient_evidence')])]
        for status, question, responses in cases:
            with self.subTest(status=status):
                response, provider = self.send(responses, question)
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data['application_status'], status)
                self.assertEqual(response.data['message']['kind'], 'limitation')
                self.assertEqual(response.data['message']['state'], 'complete')
                self.assertEqual(response.data['message']['sources'], [])
                self.assertIsNone(response.data['message']['error_code'])
                turn = TurnAudit.objects.get(pk=response.data['request_id'])
                self.assertEqual(turn.status, 'completed')
                self.assertEqual(turn.error_code, '')
                self.assertEqual(turn.user_message.state, 'complete')
                self.assertEqual(turn.model_calls, len(provider.requests))
                self.assertEqual(turn.assistant_message.content, TEXT['en'][status])
                event = turn.events.get(event_type='no_answer_available')
                payload = read_blob(event.payload)
                self.assertEqual(payload['application_status'], status)
                self.assertEqual(payload['previous_state'], 'EVIDENCE_AVAILABLE' if status == 'insufficient_evidence' else 'SEARCH_COMPLETE')
                generated = read_blob(turn.events.get(event_type='answer_generated').payload)
                self.assertEqual(generated['application_status'], status)
                self.assertEqual(generated['sources'], [])
                self.assertIsNone(Conversation.objects.get(pk=turn.conversation_identifier).active_request)
                history = self.client.get(f'/api/assistant/conversations/{turn.conversation_identifier}/messages/')
                self.assertEqual(history.status_code, 200)
                self.assertEqual(history.data['results'][-1]['state'], 'complete')
                admin = APIClient(); admin.force_authenticate(self.auditor)
                detail = admin.get(f'/api/assistant/audit/turns/{turn.pk}/')
                self.assertEqual(detail.data['final_answer']['application_status'], status)
        self.assertEqual(self.client.get('/api/assistant/audit/turns/').status_code, 403)

    def test_genuine_errors_keep_non_200_status_and_failed_audit_without_fabricated_assistant(self):
        cases = [([search(PYTHON_QUESTION), Completion('bad JSON'), Completion('bad JSON')], 'answer_repair_stalled', 422),
                 ([search(PYTHON_QUESTION), AssistantError('provider_timeout', 'Provider timed out.', 504)], 'provider_timeout', 504),
                 ([search(PYTHON_QUESTION), AssistantError('provider_invalid_response', 'Invalid provider response.', 502)], 'provider_invalid_response', 502),
                 ([search(PYTHON_QUESTION, call_id=f's{i}') for i in range(6)], 'orchestration_limit', 422),
                 ([tools(call('unregistered_tool', {}, call_id=f'bad{i}')) for i in range(6)], 'orchestration_limit', 422)]
        for responses, code, status in cases:
            with self.subTest(code=code):
                response, _ = self.send(responses)
                self.assertEqual(response.status_code, status, response.data)
                self.assertEqual(response.data['error']['code'], code)
                self.assertNotIn('application_status', response.data)
                turn = TurnAudit.objects.get(pk=response.data['request_id'])
                self.assertEqual(turn.status, 'failed')
                self.assertIsNone(turn.assistant_message_id)
                self.assertFalse(turn.events.filter(event_type='no_answer_available').exists())
                self.assertFalse(Message.objects.filter(request_id=turn.pk, role='assistant').exists())
                self.assertIsNone(Conversation.objects.get(pk=turn.conversation_identifier).active_request)

    def test_authorization_failure_remains_403(self):
        with patch('ai_assistant.views.principal_for', side_effect=AssistantError('access_denied', 'Access denied.', 403)):
            response = self.client.get('/api/assistant/model-options/')
        self.assertEqual(response.status_code, 403)
        with patch('ai_assistant.service.principal_for', side_effect=AssistantError('access_denied', 'Access denied.', 403)):
            response, provider = self.send([])
        self.assertEqual(response.status_code, 403)
        self.assertEqual(provider.requests, [])
        self.assertEqual(TurnAudit.objects.count(), 0)
