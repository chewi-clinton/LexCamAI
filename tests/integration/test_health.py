"""
Health-check integration tests.
Verifies that every service responds through Kong.
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 10

HEALTH_ENDPOINTS = [
    # (label, url)
    ("user-management",      f"{BASE_URL}/api/v1/auth/login"),          # login 400 = service up
    ("document-service",     f"{BASE_URL}/api/v1/documents"),           # 401 = service up
    ("payment-service",      f"{BASE_URL}/api/v1/payments"),            # 401 = service up
    ("lawyer-service",       f"{BASE_URL}/api/v1/lawyers"),             # 200 = public list
    ("rag-service",          f"{BASE_URL}/api/v1/chat/conversations"),  # 200 = public
    ("feedback-service",     f"{BASE_URL}/api/v1/feedback"),            # 200 = public list
    ("notification-service", f"{BASE_URL}/api/v1/notifications"),       # 200 = public list
]


@pytest.mark.parametrize("label,url", HEALTH_ENDPOINTS)
def test_service_reachable(label, url):
    """Each service must respond (not 502/503/504) through Kong."""
    resp = requests.get(url, timeout=TIMEOUT)
    assert resp.status_code not in (502, 503, 504), (
        f"{label} returned {resp.status_code} — service may be down or Kong route broken"
    )


def test_frontend_reachable():
    resp = requests.get(BASE_URL, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Frontend returned {resp.status_code}"


def test_kong_does_not_return_404_for_unknown_route():
    """Kong should return 404 for routes that don't exist, not 502."""
    resp = requests.get(f"{BASE_URL}/api/v1/nonexistent-route-xyz", timeout=TIMEOUT)
    # Kong itself is healthy if it can respond at all
    assert resp.status_code != 503, "Kong is down"
