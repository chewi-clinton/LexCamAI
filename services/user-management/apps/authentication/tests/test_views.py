import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch

from apps.authentication.services import generate_otp, hash_password
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def verified_user(db):
    user = User.objects.create_user(
        email="verified@example.com",
        full_name="Verified User",
    )
    user.password = hash_password("Password123!")
    user.is_email_verified = True
    user.save()
    return user


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRegister:
    url = "/api/v1/auth/register"

    @patch("apps.authentication.views.send_mail")
    def test_register_success(self, mock_mail, client):
        resp = client.post(self.url, {
            "email": "new@example.com",
            "password": "SecurePass1!",
            "full_name": "New User",
            "preferred_language": "fr",
            "consent_given": True,
        }, format="json")
        assert resp.status_code == 201
        assert User.objects.filter(email="new@example.com").exists()
        mock_mail.assert_called_once()

    def test_register_duplicate_email(self, client, verified_user):
        resp = client.post(self.url, {
            "email": "verified@example.com",
            "password": "SecurePass1!",
            "full_name": "Duplicate",
            "consent_given": True,
        }, format="json")
        assert resp.status_code == 400

    def test_register_no_consent(self, client):
        resp = client.post(self.url, {
            "email": "noconsent@example.com",
            "password": "SecurePass1!",
            "full_name": "No Consent",
            "consent_given": False,
        }, format="json")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogin:
    url = "/api/v1/auth/login"

    def test_login_success(self, client, verified_user):
        resp = client.post(self.url, {
            "email": "verified@example.com",
            "password": "Password123!",
        }, format="json")
        assert resp.status_code == 200
        assert "access_token" in resp.data
        assert "refresh_token" in resp.data

    def test_login_wrong_password(self, client, verified_user):
        resp = client.post(self.url, {
            "email": "verified@example.com",
            "password": "WrongPass",
        }, format="json")
        assert resp.status_code == 401

    def test_login_unverified_email(self, client, db):
        user = User.objects.create_user(email="unverified@example.com", full_name="Unverified")
        user.password = hash_password("Password123!")
        user.save()
        resp = client.post(self.url, {
            "email": "unverified@example.com",
            "password": "Password123!",
        }, format="json")
        assert resp.status_code == 403

    def test_login_nonexistent_user(self, client):
        resp = client.post(self.url, {
            "email": "ghost@example.com",
            "password": "Password123!",
        }, format="json")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Verify Email
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestVerifyEmail:
    url = "/api/v1/auth/verify-email"

    @patch("apps.authentication.views.events.publish_user_registered")
    def test_verify_email_success(self, mock_event, client, db):
        user = User.objects.create_user(email="toverify@example.com", full_name="ToVerify")
        code = generate_otp(str(user.id), "email_verify")
        resp = client.post(self.url, {"email": "toverify@example.com", "code": code}, format="json")
        assert resp.status_code == 200
        user.refresh_from_db()
        assert user.is_email_verified is True
        mock_event.assert_called_once()

    def test_verify_email_wrong_code(self, client, db):
        user = User.objects.create_user(email="wrongcode@example.com", full_name="WrongCode")
        generate_otp(str(user.id), "email_verify")
        resp = client.post(self.url, {"email": "wrongcode@example.com", "code": "000000"}, format="json")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Token Refresh
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTokenRefresh:
    url = "/api/v1/auth/refresh"

    def test_refresh_success(self, client, verified_user):
        from apps.authentication.services import generate_refresh_token_pair
        raw, _ = generate_refresh_token_pair(verified_user)
        resp = client.post(self.url, {"refresh_token": raw}, format="json")
        assert resp.status_code == 200
        assert "access_token" in resp.data

    def test_refresh_invalid_token(self, client):
        resp = client.post(self.url, {"refresh_token": "invalid"}, format="json")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogout:
    url = "/api/v1/auth/logout"

    def test_logout_success(self, client, verified_user):
        from apps.authentication.services import generate_refresh_token_pair
        raw, _ = generate_refresh_token_pair(verified_user)
        resp = client.post(self.url, {"refresh_token": raw}, format="json")
        assert resp.status_code == 200

    def test_logout_revokes_token(self, client, verified_user):
        from apps.authentication.services import generate_refresh_token_pair, validate_refresh_token
        raw, _ = generate_refresh_token_pair(verified_user)
        client.post(self.url, {"refresh_token": raw}, format="json")
        assert validate_refresh_token(raw) is None


# ---------------------------------------------------------------------------
# Forgot / Reset Password
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestForgotResetPassword:
    forgot_url = "/api/v1/auth/forgot-password"
    reset_url = "/api/v1/auth/reset-password"

    @patch("apps.authentication.views.send_mail")
    def test_forgot_password_sends_code(self, mock_mail, client, verified_user):
        resp = client.post(self.forgot_url, {"email": "verified@example.com"}, format="json")
        assert resp.status_code == 200
        mock_mail.assert_called_once()

    @patch("apps.authentication.views.send_mail")
    def test_forgot_password_unknown_email(self, mock_mail, client):
        resp = client.post(self.forgot_url, {"email": "nobody@example.com"}, format="json")
        assert resp.status_code == 200  # No enumeration
        mock_mail.assert_not_called()

    def test_reset_password_success(self, client, verified_user):
        code = generate_otp(str(verified_user.id), "password_reset")
        resp = client.post(self.reset_url, {
            "email": "verified@example.com",
            "code": code,
            "new_password": "NewPassword123!",
        }, format="json")
        assert resp.status_code == 200

    def test_reset_password_wrong_code(self, client, verified_user):
        generate_otp(str(verified_user.id), "password_reset")
        resp = client.post(self.reset_url, {
            "email": "verified@example.com",
            "code": "000000",
            "new_password": "NewPassword123!",
        }, format="json")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Full integration flow: register → verify → login → refresh → logout
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestFullAuthFlow:
    @patch("apps.authentication.views.send_mail")
    @patch("apps.authentication.views.events.publish_user_registered")
    def test_full_flow(self, mock_event, mock_mail, client, db):
        # 1. Register
        resp = client.post("/api/v1/auth/register", {
            "email": "flow@example.com",
            "password": "FlowPass123!",
            "full_name": "Flow User",
            "consent_given": True,
        }, format="json")
        assert resp.status_code == 201

        user = User.objects.get(email="flow@example.com")

        # 2. Verify email
        code = generate_otp(str(user.id), "email_verify")
        resp = client.post("/api/v1/auth/verify-email", {
            "email": "flow@example.com",
            "code": code,
        }, format="json")
        assert resp.status_code == 200
        mock_event.assert_called_once()

        # 3. Login (password was set during registration)
        resp = client.post("/api/v1/auth/login", {
            "email": "flow@example.com",
            "password": "FlowPass123!",
        }, format="json")
        assert resp.status_code == 200
        access = resp.data["access_token"]
        refresh = resp.data["refresh_token"]

        # 4. Refresh
        resp = client.post("/api/v1/auth/refresh", {"refresh_token": refresh}, format="json")
        assert resp.status_code == 200
        new_access = resp.data["access_token"]
        assert new_access != access

        # 5. Logout
        resp = client.post("/api/v1/auth/logout", {"refresh_token": refresh}, format="json")
        assert resp.status_code == 200

        # 6. Refresh after logout should fail
        resp = client.post("/api/v1/auth/refresh", {"refresh_token": refresh}, format="json")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Internal validate endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestInternalValidate:
    url = "/internal/auth/validate"

    def test_valid_token(self, client, verified_user):
        token = generate_access_token = __import__(
            "apps.authentication.services", fromlist=["generate_access_token"]
        ).generate_access_token
        access = token(verified_user)
        resp = client.post(self.url, {"token": access}, format="json")
        assert resp.status_code == 200
        assert resp.data["user_id"] == str(verified_user.id)

    def test_invalid_token(self, client):
        resp = client.post(self.url, {"token": "bad.token.here"}, format="json")
        assert resp.status_code == 401
