from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Read-only representation of the full user profile."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "city",
            "preferred_language",
            "role",
            "is_email_verified",
            "created_at",
        ]
        read_only_fields = fields


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Allows updating: full_name, phone, city, preferred_language.
    Email and role are explicitly excluded.
    """

    class Meta:
        model = User
        fields = ["full_name", "phone", "city", "preferred_language"]

    def validate_preferred_language(self, value):
        if value not in ("fr", "en"):
            raise serializers.ValidationError("Language must be 'fr' or 'en'.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(write_only=True, min_length=8)
