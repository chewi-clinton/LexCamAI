from __future__ import annotations

from rest_framework import serializers

from .models import DocumentField, DocumentTemplate, UserDocument


class DocumentFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentField
        fields = [
            "id",
            "field_key",
            "field_type",
            "label_fr",
            "label_en",
            "required",
            "order",
        ]


class DocumentTemplateListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = [
            "id",
            "slug",
            "name_fr",
            "name_en",
            "description_fr",
            "description_en",
            "price_xaf",
        ]


class DocumentTemplateDetailSerializer(serializers.ModelSerializer):
    fields = DocumentFieldSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentTemplate
        fields = [
            "id",
            "slug",
            "name_fr",
            "name_en",
            "description_fr",
            "description_en",
            "template_file",
            "price_xaf",
            "fields",
        ]


class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = [
            "id",
            "template",
            "payment_id",
            "status",
            "form_data",
            "file_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "file_url",
            "created_at",
            "updated_at",
        ]


class CreateDocumentSerializer(serializers.Serializer):
    template_id = serializers.UUIDField()
    form_data = serializers.DictField()

    def validate_template_id(self, value):
        try:
            template = DocumentTemplate.objects.get(id=value, is_active=True)
        except DocumentTemplate.DoesNotExist:
            raise serializers.ValidationError("Template not found or inactive.")
        return template


class MarkReadySerializer(serializers.Serializer):
    file_url = serializers.CharField(max_length=1024)