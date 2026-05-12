import pytest
from rest_framework.test import APIClient
from unittest.mock import patch

from apps.authentication.services import (
    generate_access_token,
    generate_refresh_token_pair,
    hash_password,
)
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def auth_user(db):
    user = User.objects.create_user(
        email="me@example.com",
        full_name="Me User",
        city="Douala",
        preferred_language="fr",
        phone="+237600000001",
    )
    user.password = hash_password("Password123!")
    user.is_email_verified = True
    user.save()
    return user


@pytest.fixture
def auth_client(client, auth_user):
    token = generate_access_token(auth_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client, auth_user


@pytest.mark.django_db
class TestGetProfile:
    def test_get_profile_success(self, auth_client):
        client, user = auth_client
        resp = client.get("/api/v1/users/me")
        assert resp.status_code == 200
        assert resp.data["email"] == user.email
        assert resp.data["full_name"] == user.full_name
        assert "id" in resp.data
        assert "role" in resp.data
        assert "is_email_verified" in resp.data

    def test_get_profile_unauthenticated(self, client):
        resp = client.get("/api/v1/users/me")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestUpdateProfile:
    def test_update_allowed_fields(self, auth_client):
        client, user = auth_client
        resp = client.patch("/api/v1/users/me", {
            "full_name": "Updated Name",
            "city": "Bafoussam",
            "preferred_language": "en",
        }, format="json")
        assert resp.status_code == 200
        assert resp.data["full_name"] == "Updated Name"
        assert resp.data["city"] == "Bafoussam"
        assert resp.data["preferred_language"] == "en"

    def test_cannot_update_email(self, auth_client):
        client, user = auth_client
        resp = client.patch("/api/v1/users/me", {"email": "hacked@example.com"}, format="json")
        # Email field is ignored; no error but email unchanged
        assert resp.status_code == 200
        assert resp.data["email"] == user.email

    def test_cannot_update_role(self, auth_client):
        client, user = auth_client
        resp = client.patch("/api/v1/users/me", {"role": "admin"}, format="json")
        assert resp.status_code == 200
        user.refresh_from_db()
        assert user.role == "user"

    def test_invalid_language(self, auth_client):
        client, _ = auth_client
        resp = client.patch("/api/v1/users/me", {"preferred_language": "de"}, format="json")
        assert resp.status_code == 400

    def test_update_unauthenticated(self, client):
        resp = client.patch("/api/v1/users/me", {"full_name": "Ghost"}, format="json")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestDeleteProfile:
    @patch("apps.profiles.views.events.publish_user_deleted")
    def test_delete_anonymises_account(self, mock_event, auth_client):
        client, user = auth_client
        resp = client.delete("/api/v1/users/me")
        assert resp.status_code == 204
        user.refresh_from_db()
        assert user.is_active is False
        assert "deleted_" in user.email

    @patch("apps.profiles.views.events.publish_user_deleted")
    def test_delete_publishes_event(self, mock_event, auth_client):
        client, user = auth_client
        client.delete("/api/v1/users/me")
        mock_event.assert_called_once_with(user_id=str(user.id))

    @patch("apps.profiles.views.events.publish_user_deleted")
    def test_delete_revokes_refresh_tokens(self, mock_event, auth_client):
        client, user = auth_client
        raw, _ = generate_refresh_token_pair(user)
        client.delete("/api/v1/users/me")
        from apps.authentication.models import RefreshToken
        assert RefreshToken.objects.filter(user=user, revoked=False).count() == 0

    def test_delete_unauthenticated(self, client):
        resp = client.delete("/api/v1/users/me")
        assert resp.status_code == 401
