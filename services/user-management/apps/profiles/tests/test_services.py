import pytest
from django.contrib.auth import get_user_model
from apps.profiles.services import anonymise_user

User = get_user_model()


@pytest.mark.django_db
class TestProfileService:
    def test_anonymise_sets_inactive(self):
        user = User.objects.create_user(email="active@example.com", full_name="Active User")
        anonymise_user(user)
        assert user.is_active is False

    def test_anonymise_email_format(self):
        user = User.objects.create_user(email="fmt@example.com", full_name="Fmt User")
        uid = str(user.id)
        anonymise_user(user)
        assert user.email == f"deleted_{uid}@lexcam.invalid"

    def test_anonymise_clears_name(self):
        user = User.objects.create_user(email="name@example.com", full_name="Real Name")
        anonymise_user(user)
        assert user.full_name == "Deleted User"

    def test_anonymise_clears_phone(self):
        user = User.objects.create_user(email="phone@example.com", full_name="Phone User", phone="+237699000000")
        anonymise_user(user)
        assert user.phone is None
