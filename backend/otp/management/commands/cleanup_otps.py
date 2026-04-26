from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from otp.models import OTPVerification


class Command(BaseCommand):
    help = 'Delete old OTP verification records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Delete OTP records older than this many days (default: 7)',
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff = timezone.now() - timedelta(days=days)
        count, _ = OTPVerification.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} old OTP record(s)'))