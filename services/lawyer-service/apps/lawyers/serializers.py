from rest_framework import serializers
from .models import Lawyer, LawyerDocument, Specialization


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ["id", "name", "name_fr"]


class LawyerPublicSerializer(serializers.ModelSerializer):
    """Read-only public view — shown in /lawyers listing and profile page."""
    specializations = SpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = Lawyer
        fields = [
            "id", "full_name", "city", "region", "bio", "profile_photo_url",
            "type", "verification_status", "is_accepting_cases", "specializations",
        ]


class LawyerRegisterSerializer(serializers.Serializer):
    """Fields required to create a new registered lawyer profile."""
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    region = serializers.CharField(max_length=100, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    specializations = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )


class LawyerUpdateSerializer(serializers.Serializer):
    """Fields a lawyer can update on their own profile."""
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=20, required=False)
    city = serializers.CharField(max_length=100, required=False)
    region = serializers.CharField(max_length=100, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    is_accepting_cases = serializers.BooleanField(required=False)
    specializations = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class LawyerMeSerializer(serializers.ModelSerializer):
    """Full profile view for the authenticated lawyer."""
    specializations = SpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = Lawyer
        fields = [
            "id", "user_id", "full_name", "email", "phone", "city", "region",
            "bio", "profile_photo_url", "type", "verification_status",
            "is_listed", "is_accepting_cases", "specializations", "created_at",
        ]


class LawyerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerDocument
        fields = ["id", "document_type", "file_url", "uploaded_at", "status"]


class AdminVerifySerializer(serializers.Serializer):
    """Admin sets verification status."""
    status = serializers.ChoiceField(choices=[
        Lawyer.STATUS_VERIFIED,
        Lawyer.STATUS_REJECTED,
        Lawyer.STATUS_SUSPENDED,
    ])


class AdminLawyerSerializer(serializers.ModelSerializer):
    """Admin listing — includes all fields including unlisted lawyers."""
    specializations = SpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = Lawyer
        fields = "__all__"
