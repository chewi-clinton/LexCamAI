import uuid
from django.db import models
from apps.lawyers.models import Lawyer


class Referral(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_DECLINED = "declined"
    STATUS_RESOLVED = "resolved"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_DECLINED, "Declined"),
        (STATUS_RESOLVED, "Resolved"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lawyer = models.ForeignKey(Lawyer, on_delete=models.CASCADE, related_name="referrals")
    # user_id, user_name, user_email are copied from the JWT at creation time
    # so the referral record is self-contained even if the user account changes
    user_id = models.UUIDField()
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    issue_summary = models.TextField()
    domain = models.CharField(max_length=50, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    # contact_revealed flips to true when lawyer accepts — unlocks lawyer contact details
    contact_revealed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "referrals"

    def __str__(self):
        return f"Referral({self.user_name} → {self.lawyer.full_name}, {self.status})"
