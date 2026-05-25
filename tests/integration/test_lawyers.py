"""
Lawyer service integration tests.
Public endpoints require no auth; lawyer registration requires auth.
"""

import pytest
from conftest import BASE_URL

TIMEOUT = 15


class TestLawyerDirectory:
    URL = f"{BASE_URL}/api/v1/lawyers"

    def test_list_lawyers_returns_list(self, session):
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list) or isinstance(data, dict)

    def test_list_lawyers_no_auth_required(self, session):
        """Lawyer directory is public — no JWT needed."""
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code == 200

    def test_list_specializations(self, session):
        resp = session.get(f"{BASE_URL}/api/v1/specializations", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    def test_get_nonexistent_lawyer(self, session):
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        resp = session.get(f"{self.URL}/{fake_uuid}", timeout=TIMEOUT)
        assert resp.status_code == 404

    def test_lawyer_register_requires_auth(self, session):
        """Registering as a lawyer without a JWT must be rejected."""
        resp = session.post(
            f"{self.URL}/register",
            json={"bar_number": "CAM-TEST-001", "specializations": []},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (401, 403)

    def test_lawyer_me_requires_auth(self, session):
        resp = session.get(f"{self.URL}/me", timeout=TIMEOUT)
        assert resp.status_code in (401, 403)


class TestLawyerAuthenticated:
    def test_get_my_lawyer_profile_if_lawyer(self, session, auth_headers):
        """
        If the test user is a registered lawyer, GET /lawyers/me returns their profile.
        If not, expect 404 (not a lawyer) or 403 — both are acceptable.
        """
        resp = session.get(f"{BASE_URL}/api/v1/lawyers/me", headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code in (200, 403, 404)
