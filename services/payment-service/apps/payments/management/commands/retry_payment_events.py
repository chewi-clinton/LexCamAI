from django.core.management.base import BaseCommand

from apps.payments.events import publish_payment_confirmed
from apps.payments.models import Transaction


class Command(BaseCommand):
    help = "Retry publishing payment.confirmed for confirmed transactions where publish failed"

    def handle(self, *args, **options):
        qs = Transaction.objects.filter(
            status=Transaction.STATUS_CONFIRMED,
            event_published=False,
        )
        total = qs.count()
        self.stdout.write(f"Found {total} unpublished confirmed transactions")

        success = 0
        for tx in qs:
            published = publish_payment_confirmed(tx)
            if published:
                tx.event_published = True
                tx.save(update_fields=["event_published"])
                success += 1
                self.stdout.write(f"  OK  {tx.internal_reference}")
            else:
                self.stderr.write(f"  FAIL {tx.internal_reference}")

        self.stdout.write(f"Done: {success}/{total} published")
