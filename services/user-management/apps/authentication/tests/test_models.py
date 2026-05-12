import uuid
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            password="securepass123",
            full_name="Test User",
        )
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.role == "user"
        assert user.is_active is True
        assert user.is_email_verified is False

    def test_user_pk_is_uuid(self):
        user = User.objects.create_user(
            email="uuid@example.com",
            full_name="UUID User",
        )
        assert isinstance(user.id, uuid.UUID)

    def test_email_is_unique(self):
        User.objects.create_user(email="dup@example.com", full_name="First")
        with pytest.raises(Exception):
            User.objects.create_user(email="dup@example.com", full_name="Second")

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="admin123",
            full_name="Admin",
        )
        assert admin.role == "admin"
        assert admin.is_staff is True
        assert admin.is_superuser is True

    def test_preferred_language_defaults_fr(self):
        user = User.objects.create_user(email="fr@example.com", full_name="French")
        assert user.preferred_language == "fr"

    def test_consent_given_at_nullable(self):
        user = User.objects.create_user(email="noconsent@example.com", full_name="No Consent")
        assert user.consent_given_at is None
