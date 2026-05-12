import pytest
from django.contrib.auth import get_user_model
from apps.profiles.services import anonymise_user

User = get_user_model()


@pytest.mark.django_db
class TestProfileModel:
    def test_user_profile_fields(self):
        user = User.objects.create_user(
            email="profile@example.com",
            full_name="Profile User",
            city="Yaoundé",
            preferred_language="fr",
        )
        assert user.city == "Yaoundé"
        assert user.preferred_language == "fr"

    def test_phone_nullable(self):
        user = User.objects.create_user(
            email="nophone@example.com",
            full_name="No Phone",
        )
        assert user.phone is None


@pytest.mark.django_db
class TestAnonymiseUser:
    def test_anonymise_replaces_pii(self):
        user = User.objects.create_user(
            email="real@example.com",
            full_name="Real Name",
            phone="+237600000000",
        )
        user_id = str(user.id)
        anonymise_user(user)

        user.refresh_from_db()
        assert user.email == f"deleted_{user_id}@lexcam.invalid"
        assert user.full_name == "Deleted User"
        assert user.phone is None
        assert user.is_active is False

    def test_anonymise_does_not_delete_row(self):
        user = User.objects.create_user(
            email="keeprow@example.com",
            full_name="Keep Row",
        )
        user_id = user.id
        anonymise_user(user)
        assert User.objects.filter(id=user_id).exists()
