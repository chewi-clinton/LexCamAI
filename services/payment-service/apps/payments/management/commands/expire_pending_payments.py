from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.payments.models import Transaction

# Campay mobile money prompts time out after ~10 min; we expire after 15 to be safe
EXPIRY_MINUTES = 15


class Command(BaseCommand):
    help = "Mark pending transactions as expired if they are older than 15 minutes"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(minutes=EXPIRY_MINUTES)
        qs = Transaction.objects.filter(
            status=Transaction.STATUS_PENDING,
            created_at__lt=cutoff,
        )
        count = qs.count()
        updated = qs.update(status=Transaction.STATUS_EXPIRED)
        self.stdout.write(f"Expired {updated}/{count} pending transactions older than {EXPIRY_MINUTES} minutes")
