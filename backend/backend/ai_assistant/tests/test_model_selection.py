import json
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from unittest.mock import patch

import httpx
from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIClient

from ai_assistant.audit_payloads import read_blob
from ai_assistant.config import Limits
from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import EFFORTS, MODELS, ModelConfiguration, model_options
from ai_assistant.models import TurnAudit
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.provider import Completion, DeepSeekProvider, parse_completion
from ai_assistant.service import get_gateway
from ai_assistant.testing import call, final
from knowledge.tool_definitions import get_tool_definitions
from .helpers import gateway_fixture, tools
from .test_evaluation_hardening import DatabaseFixture, EVAL_SETTINGS

CONFIG = {'DEEPSEEK_API_KEY': 'model-selection-synthetic-key', 'DEEPSEEK_BASE_URL': 'https://api.deepseek.com',
          'DEEPSEEK_MODEL': 'deepseek-flash', 'DEEPSEEK_REASONING_EFFORT': 'none', 'AI_RETRIEVAL_MODE': 'legacy', 'AI_AUTO_FETCH_LIMITS': {}}
QUESTION = 'How do I create a contractor invoice?'


def envelope(completion, body, ordinal=1):
    message = completion.message()
    if body['thinking']['type'] == 'enabled':
        message['reasoning_content'] = f'PRIVATE_REASONING_SENTINEL_{ordinal}'
    return {'model': body['model'], 'choices': [{'message': message, 'finish_reason': completion.finish_reason}],
            'usage': {'prompt_tokens': 10, 'completion_tokens': 5, 'total_tokens': 15, 'prompt_cache_hit_tokens': 7, 'prompt_cache_miss_tokens': 3}}


def adaptive_provider(*, premature=False, early_fetch=False):
    """Real adapter and gateway; only HTTP transport is mocked."""
    sent = []
    def handle(request):
        body = json.loads(request.content)
        sent.append(body)
        results = [json.loads(m['content']) for m in body['messages'] if m['role'] == 'tool']
        if len(sent) == 1 and premature:
            completion = final('UNSUPPORTED_EARLY_ANSWER', [{'document_id': 'invented', 'section_id': 'invented'}])
        elif len(sent) == 1 and early_fetch:
            completion = tools(call('fetch_documentation', {'search_token': 'invented', 'sections': [{'document_id': 'invented', 'section_id': 'invented'}]}, 'early_fetch'))
        elif not results or 'error' in results[-1]:
            completion = tools(call('search_documentation', {'query': QUESTION}, f'search_{len(sent)}'))
        elif results[-1].get('results'):
            result = results[-1]
            first = result['results'][0]
            completion = tools(call('fetch_documentation', {'search_token': result['search_token'],
                'sections': [{k: first[k] for k in ('document_id', 'section_id')}], 'max_characters': 12000}, f'fetch_{len(sent)}'))
        else:
            section = results[-1]['sections'][0]
            completion = final('Use the documented invoice form.', [{k: section[k] for k in ('document_id', 'section_id')}])
        return httpx.Response(200, json=envelope(completion, body, len(sent)))
    return DeepSeekProvider(transport=httpx.MockTransport(handle)), sent


@override_settings(**CONFIG)
class ModelProviderTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gateway, cls.index, _ = gateway_fixture()

    def test_both_models_and_all_efforts_use_correct_wire_parameters_and_limits(self):
        for model, _ in MODELS:
            for effort, _ in EFFORTS:
                with self.subTest(model=model, effort=effort):
                    sent = []
                    def handle(request):
                        body = json.loads(request.content); sent.append(body)
                        return httpx.Response(200, json=envelope(final('Safe final.'), body))
                    provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
                    result = provider.complete(messages=[{'role': 'user', 'content': 'test'}], tools=get_tool_definitions(),
                        tool_choice='search_documentation', limits=Limits(), timeout=15, request_id='mock', configuration=ModelConfiguration(model, effort))
                    body = sent[0]
                    self.assertEqual(body['model'], model)
                    self.assertEqual(body['thinking'], {'type': 'disabled' if effort == 'none' else 'enabled'})
                    self.assertEqual(body['tool_choice'], {'type': 'function', 'function': {'name': 'search_documentation'}} if effort == 'none' else 'auto')
                    self.assertEqual(body['max_tokens'], Limits().output_tokens)
                    self.assertFalse(body['stream'])
                    if effort == 'none':
                        self.assertNotIn('reasoning_effort', body)
                    else:
                        self.assertEqual(body['reasoning_effort'], effort)
                    self.assertNotIn('reasoning_content', result.message())
                    self.assertNotIn('PRIVATE_REASONING_SENTINEL', repr(result))

    def test_defaults_preserve_env_model_and_historical_thinking_off(self):
        self.assertEqual(ModelConfiguration.resolve(), ModelConfiguration('deepseek-flash', 'none'))
        with override_settings(DEEPSEEK_MODEL='deepseek-v4-pro'):
            self.assertEqual(model_options()['defaults'], {'model': 'deepseek-v4-pro', 'reasoning_effort': 'none'})
        with override_settings(DEEPSEEK_REASONING_EFFORT='low'):
            self.assertEqual(ModelConfiguration.resolve().reasoning_effort, 'low')
        self.assertEqual(ModelConfiguration.resolve().reasoning_effort, 'none')

    def test_direct_invalid_options_and_invalid_defaults_fail_closed(self):
        for model, effort in [('arbitrary-model', 'none'), ('deepseek-flash', 'ultra'), ({}, 'high'), ('deepseek-flash', []), ('', 'high')]:
            with self.subTest(model=model, effort=effort), self.assertRaises(AssistantError) as caught:
                ModelConfiguration.resolve(model, effort)
            self.assertEqual(caught.exception.status, 400)
        with override_settings(DEEPSEEK_MODEL='unsupported-default'), self.assertRaises(AssistantError) as caught:
            ModelConfiguration.resolve()
        self.assertEqual(caught.exception.code, 'configuration_invalid')

    def test_thinking_tool_loop_preserves_exact_reasoning_and_order_for_each_model_effort(self):
        for model, _ in MODELS:
            for effort in ('low', 'high', 'max'):
                with self.subTest(model=model, effort=effort):
                    provider, sent = adaptive_provider()
                    result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=QUESTION, configuration=ModelConfiguration(model, effort))
                    self.assertEqual(result.kind, 'answer')
                    self.assertEqual(len(sent), 3)
                    for index, body in enumerate(sent):
                        self.assertEqual(body['tool_choice'], 'auto')
                        self.assertEqual(body['model'], model)
                        previous = [m for m in body['messages'] if m['role'] == 'assistant']
                        self.assertEqual([m['reasoning_content'] for m in previous], [f'PRIVATE_REASONING_SENTINEL_{n}' for n in range(1, index+1)])
                        for position, message in enumerate(body['messages']):
                            if message['role'] == 'tool':
                                self.assertEqual(body['messages'][position-1]['tool_calls'][0]['id'], message['tool_call_id'])
                    self.assertTrue(result.sources)
                    self.assertEqual(result.sources[0]['content_hash'], self.index.get_section(result.sources[0]['section_id'])['content_hash'])

    @override_settings(AI_RETRIEVAL_MODE='auto_fetch')
    def test_thinking_reuses_existing_automatic_fetch_path_in_two_calls(self):
        provider, sent = adaptive_provider()
        result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=QUESTION,
            configuration=ModelConfiguration('deepseek-v4-pro', 'high'))
        self.assertEqual(len(sent), 2)
        self.assertEqual(result.metrics['automatic_fetch_attempts'], 1)
        self.assertEqual(result.metrics['fetches'], 1)
        self.assertTrue(result.sources)

    def test_thinking_premature_final_still_requires_search_and_fetch(self):
        provider, sent = adaptive_provider(premature=True)
        result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=QUESTION,
            configuration=ModelConfiguration('deepseek-flash', 'high'))
        self.assertEqual(len(sent), 4)
        self.assertEqual(result.metrics['searches'], 1)
        self.assertEqual(result.metrics['fetches'], 1)
        self.assertNotIn('UNSUPPORTED_EARLY_ANSWER', json.dumps(sent[1]))
        self.assertEqual(next(m for m in sent[1]['messages'] if m['role'] == 'assistant')['reasoning_content'], 'PRIVATE_REASONING_SENTINEL_1')

    def test_thinking_fetch_before_discovery_is_rejected_without_relaxing_gateway(self):
        provider, sent = adaptive_provider(early_fetch=True)
        result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=QUESTION,
            configuration=ModelConfiguration('deepseek-v4-pro', 'max'))
        first_result = next(m for m in sent[1]['messages'] if m['role'] == 'tool')
        self.assertEqual(json.loads(first_result['content'])['error']['code'], 'discovery_invalid')
        self.assertEqual(result.kind, 'answer')
        self.assertEqual(result.metrics['fetches'], 1)

    def test_shared_provider_concurrent_requests_do_not_share_model_or_effort(self):
        barrier, sent = threading.Barrier(2), []
        def handle(request):
            body = json.loads(request.content); sent.append(body); barrier.wait(timeout=5)
            return httpx.Response(200, json=envelope(final('Safe.'), body))
        provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
        configurations = [ModelConfiguration('deepseek-flash', 'none'), ModelConfiguration('deepseek-v4-pro', 'max')]
        def run(configuration):
            return provider.complete(messages=[{'role': 'user', 'content': 'test'}], tools=get_tool_definitions(), tool_choice='required',
                limits=Limits(), timeout=10, request_id=configuration.model, configuration=configuration)
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(run, configurations))
        self.assertEqual({(b['model'], b.get('reasoning_effort', 'none')) for b in sent}, {(c.model, c.reasoning_effort) for c in configurations})
        self.assertEqual(settings.DEEPSEEK_MODEL, 'deepseek-flash')
        self.assertEqual(settings.DEEPSEEK_REASONING_EFFORT, 'none')

    def test_thinking_batch_retains_tool_ids_arguments_results_and_reasoning_order(self):
        sent = []
        batch = tools(call('search_documentation', {'query': QUESTION}, 'first_search'),
                      call('search_documentation', {'query': QUESTION, 'module': 'contractors'}, 'second_search'))
        def handle(request):
            body = json.loads(request.content); sent.append(body)
            if len(sent) == 1:
                completion = batch
            elif len(sent) == 2:
                found = json.loads(body['messages'][-1]['content'])
                completion = tools(call('fetch_documentation', {'search_token': found['search_token'],
                    'sections': [{k: found['results'][0][k] for k in ('document_id', 'section_id')}]}, 'exact_fetch'))
            else:
                section = json.loads(body['messages'][-1]['content'])['sections'][0]
                completion = final('Use the documented form.', [{k: section[k] for k in ('document_id', 'section_id')}])
            return httpx.Response(200, json=envelope(completion, body, len(sent)))
        provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
        result = Orchestrator(provider, self.gateway, Limits()).run(user=object(), question=QUESTION,
            configuration=ModelConfiguration('deepseek-v4-pro', 'low'))
        messages = sent[1]['messages']
        position = next(i for i, m in enumerate(messages) if m['role'] == 'assistant')
        self.assertEqual(messages[position]['tool_calls'], batch.message()['tool_calls'])
        self.assertEqual(messages[position]['reasoning_content'], 'PRIVATE_REASONING_SENTINEL_1')
        self.assertEqual([m['tool_call_id'] for m in messages[position+1:position+3]], ['first_search', 'second_search'])
        self.assertEqual(result.metrics['tool_calls'], 3)

    def test_private_reasoning_counts_toward_existing_context_limit_without_leaking(self):
        sent = []
        def handle(request):
            body = json.loads(request.content); sent.append(body)
            response = envelope(tools(call('search_documentation', {'query': QUESTION}, 'search')), body)
            response['choices'][0]['message']['reasoning_content'] = 'PRIVATE_LARGE_REASONING_' + 'z'*40000
            return httpx.Response(200, json=response)
        provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
        with self.assertLogs('ai_assistant', level='INFO') as captured, self.assertRaises(AssistantError) as caught:
            Orchestrator(provider, self.gateway, replace(Limits(), context_bytes=35000)).run(user=object(), question=QUESTION,
                configuration=ModelConfiguration('deepseek-flash', 'max'))
        self.assertEqual(caught.exception.code, 'context_limit')
        self.assertEqual(len(sent), 1)
        self.assertNotIn('PRIVATE_LARGE_REASONING', str(captured.output))

    def test_provider_errors_with_thinking_remain_safe_without_retry(self):
        handler_calls = []
        def handle(request):
            handler_calls.append(True)
            return httpx.Response(400, text='PRIVATE_PROVIDER_ERROR model-selection-synthetic-key')
        provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
        with self.assertRaises(AssistantError) as caught:
            provider.complete(messages=[{'role': 'user', 'content': 'test'}], tools=get_tool_definitions(), tool_choice='required',
                limits=Limits(), timeout=10, request_id='mock', configuration=ModelConfiguration('deepseek-v4-pro', 'high'))
        self.assertEqual(caught.exception.code, 'provider_request_failed')
        self.assertEqual(len(handler_calls), 1)
        self.assertNotIn('PRIVATE_PROVIDER_ERROR', str(caught.exception))

    def test_reasoning_is_protocol_validated_and_bounded(self):
        base = {'choices': [{'message': {'role': 'assistant', 'content': 'Final.', 'reasoning_content': 'Private.'}, 'finish_reason': 'stop'}]}
        with self.assertRaises(AssistantError):
            parse_completion(base)  # Off keeps its previous strict behavior.
        parsed = parse_completion(base, thinking=True)
        self.assertEqual(parsed.message(include_reasoning=True)['reasoning_content'], 'Private.')
        self.assertNotIn('reasoning_content', parsed.message())
        for value in (None, [], 'x' * 256001):
            base['choices'][0]['message']['reasoning_content'] = value
            with self.assertRaises(AssistantError):
                parse_completion(base, thinking=True)


@override_settings(**{**EVAL_SETTINGS, **CONFIG})
class ModelAPITests(DatabaseFixture, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.make_data()
        cls.superadmin = User.objects.create_superuser(username='model-config-auditor', password='test-password')

    def setUp(self):
        cache.clear(); get_gateway.cache_clear()
        self.client = self.client_for_user()

    def test_options_are_authenticated_authorized_and_contain_only_supported_values_and_defaults(self):
        denied = APIClient().get('/api/assistant/model-options/')
        self.assertIn(denied.status_code, (401, 403))
        response = self.client.get('/api/assistant/model-options/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, model_options())
        self.assertEqual(set(response.data), {'models', 'reasoning_efforts', 'defaults'})
        self.assertNotIn('model-selection-synthetic-key', json.dumps(response.data))
        self.assertEqual(TurnAudit.objects.count(), 0)

    def test_invalid_frontend_selections_are_controlled_400_without_provider_or_persistence(self):
        for extra in ({'model': 'arbitrary'}, {'reasoning_effort': 'ultra'}, {'model': None}, {'model': {}}, {'reasoning_effort': ['high']}, {'api_key': 'no'}):
            with self.subTest(extra=extra), patch('ai_assistant.service.get_provider') as provider:
                response = self.client.post('/api/assistant/chat/', {'message': QUESTION, **extra}, format='json')
            self.assertEqual(response.status_code, 400, response.data)
            provider.assert_not_called()
        self.assertEqual(TurnAudit.objects.count(), 0)

    def test_old_requests_default_to_env_and_model_switching_preserves_conversation_and_history(self):
        provider, sent = adaptive_provider()
        with patch('ai_assistant.service.get_provider', return_value=provider):
            first = self.client.post('/api/assistant/chat/', {'message': QUESTION}, format='json')
            self.assertEqual(first.status_code, 200, first.data)
            second = self.client.post('/api/assistant/chat/', {'message': QUESTION, 'conversation_id': first.data['conversation_id'],
                'model': 'deepseek-v4-pro', 'reasoning_effort': 'high'}, format='json')
        self.assertEqual(second.status_code, 200, second.data)
        self.assertEqual(first.data['conversation_id'], second.data['conversation_id'])
        old, new = [TurnAudit.objects.get(pk=r.data['request_id']) for r in (first, second)]
        self.assertEqual(old.model, 'deepseek-flash')
        self.assertEqual(new.model, 'deepseek-v4-pro')
        self.assertEqual(old.assistant_message.content, first.data['message']['content'])
        history = self.client.get(f"/api/assistant/conversations/{first.data['conversation_id']}/messages/")
        self.assertEqual(history.status_code, 200)
        self.assertEqual(len(history.data['results']), 4)
        self.assertEqual({b['model'] for b in sent[:3]}, {'deepseek-flash'})
        self.assertEqual({b['model'] for b in sent[3:]}, {'deepseek-v4-pro'})
        self.assertEqual(settings.DEEPSEEK_MODEL, 'deepseek-flash')
        # Old reasoning is not persisted/replayed into a different user turn.
        self.assertFalse(any('reasoning_content' in m for m in sent[3]['messages']))
        self.assertTrue(any(m['role'] == 'user' and m['content'].startswith('Previously saved assistant response') for m in sent[3]['messages']))

    def test_requested_and_actual_settings_are_audited_without_any_private_reasoning(self):
        provider, sent = adaptive_provider()
        with self.assertLogs('ai_assistant', level='INFO') as captured, patch('ai_assistant.service.get_provider', return_value=provider):
            response = self.client.post('/api/assistant/chat/', {'message': QUESTION, 'model': 'deepseek-v4-pro', 'reasoning_effort': 'max'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        turn = TurnAudit.objects.get()
        question = read_blob(turn.question_payload)
        self.assertEqual(question['model_configuration'], {'requested_model': 'deepseek-v4-pro', 'requested_reasoning_effort': 'max',
            'model': 'deepseek-v4-pro', 'reasoning_effort': 'max', 'thinking': {'type': 'enabled'}})
        persisted = [read_blob(e.payload) for e in turn.events.select_related('payload')]
        for value in (persisted, response.data, turn.assistant_message.sources, captured.output):
            self.assertNotIn('PRIVATE_REASONING_SENTINEL', str(value))
            self.assertNotIn('model-selection-synthetic-key', str(value))
        wire_requests = list(turn.events.filter(event_type='model_request').select_related('payload'))
        for event, wire in zip(wire_requests, sent):
            recorded = read_blob(event.payload)['payload']
            self.assertEqual(recorded['model'], wire['model'])
            self.assertEqual(recorded['thinking'], wire['thinking'])
            self.assertEqual(recorded['reasoning_effort'], wire['reasoning_effort'])
            self.assertFalse(any('reasoning_content' in m for m in recorded['messages']))
        admin = APIClient(); admin.force_authenticate(self.superadmin)
        detail = admin.get(f'/api/assistant/audit/turns/{turn.pk}/')
        self.assertEqual(detail.data['model_configuration'], question['model_configuration'])
        self.assertEqual(self.client.get('/api/assistant/audit/turns/').status_code, 403)
