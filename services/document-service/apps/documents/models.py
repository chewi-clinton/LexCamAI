from __future__ import annotations

import uuid

from django.db import models


class DocumentTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=100, unique=True)
    name_fr = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    description_fr = models.TextField()
    description_en = models.TextField()
    template_file = models.CharField(max_length=255)
    price_xaf = models.IntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "document_templates"

    def __str__(self) -> str:
        return self.name_fr


class DocumentField(models.Model):
    FIELD_TYPES = [
        ("text", "Text"),
        ("number", "Number"),
        ("date", "Date"),
        ("textarea", "Textarea"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        DocumentTemplate, on_delete=models.CASCADE, related_name="fields"
    )
    field_key = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    label_fr = models.CharField(max_length=255)
    label_en = models.CharField(max_length=255)
    required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = "document_fields"
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.template.slug} — {self.field_key}"


class UserDocument(models.Model):
    STATUS_AWAITING = "awaiting_payment"
    STATUS_GENERATING = "generating"
    STATUS_READY = "ready"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_AWAITING, "Awaiting Payment"),
        (STATUS_GENERATING, "Generating"),
        (STATUS_READY, "Ready"),
        (STATUS_FAILED, "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()
    template = models.ForeignKey(
        DocumentTemplate, on_delete=models.PROTECT, related_name="user_documents"
    )
    payment_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_AWAITING
    )
    form_data = models.JSONField(default=dict)
    file_url = models.CharField(max_length=1024, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_documents"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user_id} — {self.template.slug} — {self.status}"