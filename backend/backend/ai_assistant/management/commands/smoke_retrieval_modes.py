"""Opt-in, bounded paired test through the authenticated route and real provider."""
import json
import time
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from ai_assistant.audit_payloads import read_blob
from ai_assistant.models import TurnAudit
from ai_assistant.management.commands.smoke_ai_assistant import BudgetProvider


class Command(BaseCommand):
    help = 'Opt-in paired live retrieval smoke test. At most ten underlying provider attempts, no retries.'

    def add_arguments(self, parser):
        parser.add_argument('--live', action='store_true', required=True)
        parser.add_argument('--user-id', type=int, required=True)
        parser.add_argument('--max-requests', type=int, default=10)
        parser.add_argument('--output', required=True)

    def handle(self, **options):
        if not 1 <= options['max_requests'] <= 10:
            raise CommandError('Use a total provider-attempt cap of 1–10.')
        if not settings.DEEPSEEK_API_KEY:
            raise CommandError('Live testing unavailable: no configured provider credential.')
        user = get_user_model().objects.filter(pk=options['user_id'], is_active=True).first()
        if not user:
            raise CommandError('Choose an existing active authorized operator.')
        budget = BudgetProvider(options['max_requests'])
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(AccessToken.for_user(user)))
        rows = []
        report = {'scope': 'Real DeepSeek transport via in-process authenticated Django API; local persistence/audits included. No load test or retries.',
                  'model': settings.DEEPSEEK_MODEL, 'maximum_provider_attempts': budget.maximum, 'results': rows}
        output = Path(options['output'])
        questions = ['What are employees in Pakhlai?', 'How do I record a contractor payment?']
        stop = False
        try:
            for question in questions:
                for mode in ('legacy', 'auto_fetch'):
                    if stop or budget.used >= budget.maximum:
                        break
                    before, started = budget.used, time.perf_counter()
                    with override_settings(AI_RETRIEVAL_MODE=mode, ALLOWED_HOSTS=[*settings.ALLOWED_HOSTS, 'testserver']), \
                            patch('ai_assistant.service.get_provider', return_value=budget):
                        response = client.post('/api/assistant/chat/', {'message': question}, format='json')
                    body = response.data
                    row = {'question': question, 'mode': mode, 'http_status': response.status_code,
                           'duration_ms': round((time.perf_counter()-started)*1000, 3), 'provider_attempts': budget.used-before,
                           'answer': body.get('message', {}), 'error_code': body.get('error', {}).get('code'),
                           'request_id': body.get('request_id'), 'model_calls': budget.calls[before:]}
                    turn = TurnAudit.objects.filter(pk=body.get('request_id')).first()
                    if turn:
                        completed = turn.events.filter(event_type='turn_completed').select_related('payload').first()
                        row.update(usage=turn.usage, usage_complete=turn.usage_complete, tool_calls=turn.tool_calls,
                                   metrics=read_blob(completed.payload).get('metrics', {}) if completed else {},
                                   model_durations_ms=list(turn.events.filter(event_type='model_response').values_list('duration_ms', flat=True)))
                    rows.append(row)
                    self.stdout.write(json.dumps({k: row[k] for k in ('mode', 'http_status', 'duration_ms', 'provider_attempts', 'usage') if k in row}))
                    stop = response.status_code != 200
        finally:
            report.update(actual_provider_attempts=budget.used, calls=budget.calls)
            output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
