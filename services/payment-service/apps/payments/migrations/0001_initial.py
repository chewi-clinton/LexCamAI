import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("user_id", models.UUIDField()),
                ("document_id", models.UUIDField()),
                ("amount", models.IntegerField()),
                ("phone_number", models.CharField(max_length=20)),
                ("operator", models.CharField(
                    choices=[("mtn", "MTN"), ("orange", "Orange")],
                    max_length=20,
                )),
                ("campay_reference", models.CharField(blank=True, max_length=255, null=True)),
                ("internal_reference", models.CharField(max_length=255, unique=True)),
                ("status", models.CharField(
                    choices=[
                        ("pending", "Pending"),
                        ("confirmed", "Confirmed"),
                        ("failed", "Failed"),
                        ("expired", "Expired"),
                    ],
                    default="pending",
                    max_length=20,
                )),
                ("webhook_payload", models.JSONField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "transactions"},
        ),
    ]
