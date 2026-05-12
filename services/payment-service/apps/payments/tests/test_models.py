import uuid
import pytest
from apps.payments.models import Transaction


@pytest.mark.django_db
class TestTransactionModel:
    def test_create_transaction(self, db):
        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677123456",
            operator=Transaction.OPERATOR_MTN,
            internal_reference=str(uuid.uuid4()),
        )
        assert tx.status == Transaction.STATUS_PENDING
        assert tx.campay_reference is None
        assert tx.webhook_payload is None

    def test_str_repr(self, db):
        ref = "test-ref-001"
        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=3000,
            phone_number="699000001",
            operator=Transaction.OPERATOR_ORANGE,
            internal_reference=ref,
        )
        assert str(tx) == f"Transaction({ref}, pending)"

    def test_uuid_primary_key(self, db):
        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=1000,
            phone_number="677000001",
            operator=Transaction.OPERATOR_MTN,
            internal_reference=str(uuid.uuid4()),
        )
        assert isinstance(tx.id, uuid.UUID)

    def test_status_choices(self):
        statuses = [c[0] for c in Transaction.STATUS_CHOICES]
        assert "pending" in statuses
        assert "confirmed" in statuses
        assert "failed" in statuses
        assert "expired" in statuses

    def test_operator_choices(self):
        operators = [c[0] for c in Transaction.OPERATOR_CHOICES]
        assert "mtn" in operators
        assert "orange" in operators

    def test_internal_reference_unique(self, db):
        from django.db import IntegrityError
        ref = str(uuid.uuid4())
        Transaction.objects.create(
            user_id=uuid.uuid4(), document_id=uuid.uuid4(),
            amount=1000, phone_number="677", operator="mtn",
            internal_reference=ref,
        )
        with pytest.raises(IntegrityError):
            Transaction.objects.create(
                user_id=uuid.uuid4(), document_id=uuid.uuid4(),
                amount=2000, phone_number="699", operator="orange",
                internal_reference=ref,
            )

    def test_update_status(self, db):
        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677123456",
            operator=Transaction.OPERATOR_MTN,
            internal_reference=str(uuid.uuid4()),
        )
        tx.status = Transaction.STATUS_CONFIRMED
        tx.save(update_fields=["status"])
        tx.refresh_from_db()
        assert tx.status == Transaction.STATUS_CONFIRMED

    def test_webhook_payload_stored(self, db):
        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677123456",
            operator=Transaction.OPERATOR_MTN,
            internal_reference=str(uuid.uuid4()),
            webhook_payload={"reference": "abc", "status": "SUCCESSFUL"},
        )
        tx.refresh_from_db()
        assert tx.webhook_payload["status"] == "SUCCESSFUL"
