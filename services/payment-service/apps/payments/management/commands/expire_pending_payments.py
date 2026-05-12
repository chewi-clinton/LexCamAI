from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.payments.events import publish_payment_confirmed
from apps.payments.models import Transaction
from apps.payments.services import get_campay_payment_status

# Campay mobile money prompts time out after ~10 min; we check after 15
EXPIRY_MINUTES = 15


class Command(BaseCommand):
    help = "Reconcile old pending payments with Campay before expiring them"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(minutes=EXPIRY_MINUTES)
        pending = list(
            Transaction.objects.filter(status=Transaction.STATUS_PENDING, created_at__lt=cutoff)
        )
        total = len(pending)
        self.stdout.write(f"Found {total} pending transactions older than {EXPIRY_MINUTES} minutes")

        confirmed = failed = expired = skipped = 0

        for tx in pending:
            if not tx.campay_reference:
                # Never reached Campay (initiate failed after DB write) — safe to expire
                tx.status = Transaction.STATUS_EXPIRED
                tx.save(update_fields=["status"])
                expired += 1
                continue

            try:
                campay_status = get_campay_payment_status(tx.campay_reference)
            except Exception as exc:
                # Campay API unreachable — do NOT expire blindly, user may have paid
                self.stderr.write(f"  SKIP {tx.internal_reference}: cannot check Campay — {exc}")
                skipped += 1
                continue

            if campay_status == "SUCCESSFUL":
                tx.status = Transaction.STATUS_CONFIRMED
                tx.save(update_fields=["status"])
                if not tx.event_published:
                    published = publish_payment_confirmed(tx)
                    if published:
                        tx.event_published = True
                        tx.save(update_fields=["event_published"])
                confirmed += 1
                self.stdout.write(f"  CONFIRMED {tx.internal_reference}")
            elif campay_status == "FAILED":
                tx.status = Transaction.STATUS_FAILED
                tx.save(update_fields=["status"])
                failed += 1
            elif campay_status == "EXPIRED":
                tx.status = Transaction.STATUS_EXPIRED
                tx.save(update_fields=["status"])
                expired += 1
            else:
                # Campay still shows PENDING — leave it, retry next run
                skipped += 1

        self.stdout.write(
            f"Done: confirmed={confirmed} failed={failed} expired={expired} skipped={skipped}"
        )
