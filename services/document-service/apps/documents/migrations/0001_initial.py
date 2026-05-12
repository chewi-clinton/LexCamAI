import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="DocumentTemplate",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("slug", models.CharField(max_length=100, unique=True)),
                ("name_fr", models.CharField(max_length=255)),
                ("name_en", models.CharField(max_length=255)),
                ("description_fr", models.TextField()),
                ("description_en", models.TextField()),
                ("template_file", models.CharField(max_length=255)),
                ("price_xaf", models.IntegerField()),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"db_table": "document_templates"},
        ),
        migrations.CreateModel(
            name="DocumentField",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                (
                    "template",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fields",
                        to="documents.documenttemplate",
                    ),
                ),
                ("field_key", models.CharField(max_length=100)),
                (
                    "field_type",
                    models.CharField(
                        choices=[
                            ("text", "Text"),
                            ("number", "Number"),
                            ("date", "Date"),
                            ("textarea", "Textarea"),
                        ],
                        max_length=20,
                    ),
                ),
                ("label_fr", models.CharField(max_length=255)),
                ("label_en", models.CharField(max_length=255)),
                ("required", models.BooleanField(default=True)),
                ("order", models.IntegerField(default=0)),
            ],
            options={"db_table": "document_fields", "ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="UserDocument",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("user_id", models.UUIDField()),
                (
                    "template",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="user_documents",
                        to="documents.documenttemplate",
                    ),
                ),
                ("payment_id", models.UUIDField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("awaiting_payment", "Awaiting Payment"),
                            ("generating", "Generating"),
                            ("ready", "Ready"),
                            ("failed", "Failed"),
                        ],
                        default="awaiting_payment",
                        max_length=20,
                    ),
                ),
                ("form_data", models.JSONField(default=dict)),
                ("file_url", models.CharField(blank=True, max_length=1024, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "user_documents", "ordering": ["-created_at"]},
        ),
    ]
