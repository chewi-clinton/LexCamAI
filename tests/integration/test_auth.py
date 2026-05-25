"""
Auth flow integration tests.
Covers login, token refresh, user profile, and rejection of bad credentials.
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 15


class TestLogin:
    URL = f"{BASE_URL}/api/v1/auth/login"

    def test_login_success(self, session, auth_token):
        """Successful login returns access + refresh tokens."""
        assert auth_token  # fixture already validated this

    def test_login_wrong_password(self, session):
        resp = session.post(
            self.URL,
            json={"email": "notreal@example.com", "password": "wrongpass"},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 401, 403)

    def test_login_missing_fields(self, session):
        resp = session.post(self.URL, json={}, timeout=TIMEOUT)
        assert resp.status_code == 400

    def test_login_returns_both_tokens(self, session, auth_headers):
        from conftest import TEST_EMAIL, TEST_PASSWORD
        if not TEST_EMAIL:
            pytest.skip("No test credentials configured")
        resp = session.post(
            self.URL,
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert "access" in data
        assert "refresh" in data


class TestTokenRefresh:
    URL = f"{BASE_URL}/api/v1/auth/refresh"

    def test_refresh_with_valid_token(self, session):
        from conftest import TEST_EMAIL, TEST_PASSWORD
        if not TEST_EMAIL:
            pytest.skip("No test credentials configured")

        login = session.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=TIMEOUT,
        )
        refresh_token = login.json()["refresh"]

        resp = session.post(self.URL, json={"refresh": refresh_token}, timeout=TIMEOUT)
        assert resp.status_code == 200
        assert "access" in resp.json()

    def test_refresh_with_invalid_token(self, session):
        resp = session.post(self.URL, json={"refresh": "not.a.real.token"}, timeout=TIMEOUT)
        assert resp.status_code in (400, 401)


class TestUserProfile:
    URL = f"{BASE_URL}/api/v1/users/me"

    def test_get_profile_authenticated(self, session, auth_headers):
        resp = session.get(self.URL, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert "full_name" in data

    def test_get_profile_unauthenticated(self, session):
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

    def test_get_profile_bad_token(self, session):
        resp = session.get(
            self.URL,
            headers={"Authorization": "Bearer fake.jwt.token"},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (401, 403)
