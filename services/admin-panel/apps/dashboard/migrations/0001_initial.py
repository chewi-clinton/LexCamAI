import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AuditLog",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("admin_user_id", models.UUIDField()),
                ("action", models.CharField(choices=[
                    ("verify_lawyer", "Verify Lawyer"),
                    ("reject_lawyer", "Reject Lawyer"),
                    ("trigger_scraper", "Trigger Scraper"),
                    ("review_feedback", "Review Feedback"),
                ], max_length=50)),
                ("target_type", models.CharField(blank=True, default="", max_length=50)),
                ("target_id", models.UUIDField(blank=True, null=True)),
                ("details", models.JSONField(default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "audit_logs", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="PlatformStats",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("stat_date", models.DateField(unique=True)),
                ("total_users", models.IntegerField(default=0)),
                ("total_verified_lawyers", models.IntegerField(default=0)),
                ("total_documents_generated", models.IntegerField(default=0)),
                ("total_revenue_xaf", models.IntegerField(default=0)),
                ("recorded_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "platform_stats", "ordering": ["-stat_date"]},
        ),
        migrations.CreateModel(
            name="FlaggedFeedback",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("feedback_id", models.UUIDField(unique=True)),
                ("session_id", models.UUIDField()),
                ("message_index", models.IntegerField()),
                ("reviewed", models.BooleanField(default=False)),
                ("reviewed_by", models.UUIDField(blank=True, null=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "flagged_feedback", "ordering": ["-created_at"]},
        ),
    ]
