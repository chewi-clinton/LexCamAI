from rest_framework import serializers
from .models import AuditLog, PlatformStats, FlaggedFeedback


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ["id", "admin_user_id", "action", "target_type", "target_id", "details", "created_at"]
        read_only_fields = fields


class PlatformStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformStats
        fields = [
            "id", "stat_date", "total_users", "total_verified_lawyers",
            "total_documents_generated", "total_revenue_xaf", "recorded_at",
        ]
        read_only_fields = fields


class FlaggedFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlaggedFeedback
        fields = ["id", "feedback_id", "session_id", "message_index", "reviewed", "reviewed_by", "reviewed_at", "created_at"]
        read_only_fields = fields
