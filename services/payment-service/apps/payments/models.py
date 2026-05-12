import uuid
from django.db import models


class Transaction(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_FAILED = "failed"
    STATUS_EXPIRED = "expired"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_FAILED, "Failed"),
        (STATUS_EXPIRED, "Expired"),
    ]

    OPERATOR_MTN = "mtn"
    OPERATOR_ORANGE = "orange"
    OPERATOR_CHOICES = [
        (OPERATOR_MTN, "MTN"),
        (OPERATOR_ORANGE, "Orange"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()
    document_id = models.UUIDField()
    amount = models.IntegerField()
    phone_number = models.CharField(max_length=20)
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES)
    campay_reference = models.CharField(max_length=255, null=True, blank=True)
    internal_reference = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    webhook_payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transactions"

    def __str__(self):
        return f"Transaction({self.internal_reference}, {self.status})"
