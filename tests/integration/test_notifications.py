"""
Notification service integration tests.
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 15


class TestNotifications:
    URL = f"{BASE_URL}/api/v1/notifications"

    def test_list_notifications_returns_list(self, session):
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_notifications_with_limit(self, session):
        resp = session.get(f"{self.URL}?limit=5", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) <= 5
