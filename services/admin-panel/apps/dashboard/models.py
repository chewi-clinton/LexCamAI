import uuid
from django.db import models


class AuditLog(models.Model):
    ACTION_VERIFY_LAWYER = "verify_lawyer"
    ACTION_REJECT_LAWYER = "reject_lawyer"
    ACTION_TRIGGER_SCRAPER = "trigger_scraper"
    ACTION_REVIEW_FEEDBACK = "review_feedback"
    ACTION_CHOICES = [
        (ACTION_VERIFY_LAWYER, "Verify Lawyer"),
        (ACTION_REJECT_LAWYER, "Reject Lawyer"),
        (ACTION_TRIGGER_SCRAPER, "Trigger Scraper"),
        (ACTION_REVIEW_FEEDBACK, "Review Feedback"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_user_id = models.UUIDField()
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_type = models.CharField(max_length=50, blank=True, default="")
    target_id = models.UUIDField(null=True, blank=True)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"AuditLog({self.action}, {self.admin_user_id})"


class PlatformStats(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stat_date = models.DateField(unique=True)
    total_users = models.IntegerField(default=0)
    total_verified_lawyers = models.IntegerField(default=0)
    total_documents_generated = models.IntegerField(default=0)
    total_revenue_xaf = models.IntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "platform_stats"
        ordering = ["-stat_date"]

    def __str__(self):
        return f"PlatformStats({self.stat_date})"


class FlaggedFeedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feedback_id = models.UUIDField(unique=True)
    session_id = models.UUIDField()
    message_index = models.IntegerField()
    reviewed = models.BooleanField(default=False)
    reviewed_by = models.UUIDField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "flagged_feedback"
        ordering = ["-created_at"]

    def __str__(self):
        return f"FlaggedFeedback({self.feedback_id}, reviewed={self.reviewed})"
