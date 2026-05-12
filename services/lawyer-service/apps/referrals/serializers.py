from rest_framework import serializers
from .models import Referral


class ReferralCreateSerializer(serializers.Serializer):
    issue_summary = serializers.CharField()
    domain = serializers.CharField(required=False, allow_blank=True, default="")


class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = [
            "id", "lawyer_id", "user_id", "user_name", "user_email",
            "issue_summary", "domain", "status", "contact_revealed",
            "created_at", "updated_at",
        ]


class ReferralActionSerializer(serializers.Serializer):
    """Lawyer accepts or declines a referral."""
    action = serializers.ChoiceField(choices=["accept", "decline"])
