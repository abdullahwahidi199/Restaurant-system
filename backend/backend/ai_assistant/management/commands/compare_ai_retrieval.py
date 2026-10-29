import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from knowledge.loader import load_index
from ai_assistant.evaluation.retrieval_comparison import compare, load_comparison_dataset


class Command(BaseCommand):
    help = 'Offline paired retrieval benchmark against frozen verified source witnesses (no API calls).'

    def add_arguments(self, parser):
        parser.add_argument('--output', required=True)
        parser.add_argument('--modes', nargs='+', choices=['legacy', 'auto_fetch'], default=['legacy', 'auto_fetch'])

    def handle(self, **options):
        index = load_index(settings.KNOWLEDGE_INDEX_ROOT)
        records, dataset_hash = load_comparison_dataset(settings.KNOWLEDGE_DOCUMENTATION_ROOT.parent / 'evaluation', index)
        report = {'scope': 'Mock protocol and frozen source witnesses; no real model answer-quality or token measurement. Local timings exclude network.',
                  'index_version': index.version, 'dataset_sha256': dataset_hash,
                  'results': [compare(records, index, mode) for mode in options['modes']]}
        Path(options['output']).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        for result in report['results']:
            self.stdout.write(json.dumps({'mode': result['mode'], **result['summary']}))
