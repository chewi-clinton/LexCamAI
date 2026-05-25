"""
Shared fixtures for LexCam integration tests.

Set these env vars before running:
  LEXCAM_BASE_URL        (default: https://lexcam.flakyfantasy.com)
  LEXCAM_TEST_EMAIL      pre-verified user email
  LEXCAM_TEST_PASSWORD   that user's password

To create a test user:
  1. Register at /register on the frontend
  2. Verify the OTP emailed to you
  3. Export the credentials above
"""

import os
import pytest
import requests

BASE_URL = os.getenv("LEXCAM_BASE_URL", "https://lexcam.flakyfantasy.com").rstrip("/")
TEST_EMAIL = os.getenv("LEXCAM_TEST_EMAIL", "")
TEST_PASSWORD = os.getenv("LEXCAM_TEST_PASSWORD", "")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def session():
    """Requests session with a 15-second timeout for all calls."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(session):
    """
    Login and return the JWT access token.
    Skips the calling test if credentials are not configured.
    """
    if not TEST_EMAIL or not TEST_PASSWORD:
        pytest.skip("LEXCAM_TEST_EMAIL / LEXCAM_TEST_PASSWORD not set — skipping auth test")

    resp = session.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=15,
    )
    assert resp.status_code == 200, f"Login failed ({resp.status_code}): {resp.text}"
    token = resp.json().get("access")
    assert token, "Login response missing 'access' token"
    return token


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
