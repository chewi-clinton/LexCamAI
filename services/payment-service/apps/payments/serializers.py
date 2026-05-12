from rest_framework import serializers

from .models import Transaction


class InitiatePaymentSerializer(serializers.Serializer):
    document_id = serializers.UUIDField()
    amount = serializers.IntegerField(min_value=1)
    phone_number = serializers.CharField(max_length=20)
    operator = serializers.ChoiceField(choices=[("mtn", "MTN"), ("orange", "Orange")])


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "user_id",
            "document_id",
            "amount",
            "phone_number",
            "operator",
            "campay_reference",
            "internal_reference",
            "status",
            "event_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
