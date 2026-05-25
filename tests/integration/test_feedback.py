"""
Feedback service integration tests.
Submission is public; admin review requires auth.
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 15


class TestFeedbackSubmission:
    URL = f"{BASE_URL}/api/v1/feedback"

    def test_submit_feedback_no_auth(self, session):
        """Feedback can be submitted without authentication."""
        payload = {
            "text": "Integration test feedback — this is a test.",
            "rating": 4,
            "session_id": "integration-test-session",
            "message_index": 0,
            "flagged": False,
        }
        resp = session.post(self.URL, json=payload, timeout=TIMEOUT)
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "id" in data

    def test_list_feedback_returns_list(self, session):
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_submit_flagged_feedback(self, session):
        payload = {
            "text": "This answer was misleading",
            "rating": 1,
            "session_id": "integration-test-session",
            "message_index": 1,
            "flagged": True,
            "flag_reason": "incorrect_information",
        }
        resp = session.post(self.URL, json=payload, timeout=TIMEOUT)
        assert resp.status_code in (200, 201)

    def test_get_feedback_by_id(self, session):
        """Create feedback then retrieve it by ID."""
        payload = {"text": "Test", "rating": 3, "session_id": "sess-xyz", "message_index": 0}
        create = session.post(self.URL, json=payload, timeout=TIMEOUT)
        fb_id = create.json()["id"]

        resp = session.get(f"{self.URL}/{fb_id}", timeout=TIMEOUT)
        assert resp.status_code == 200
        assert resp.json()["id"] == fb_id

    def test_get_nonexistent_feedback(self, session):
        resp = session.get(f"{self.URL}/9999999", timeout=TIMEOUT)
        assert resp.status_code == 404

    def test_flag_existing_feedback(self, session):
        payload = {"text": "Flag me", "rating": 2, "session_id": "flag-test", "message_index": 0}
        create = session.post(self.URL, json=payload, timeout=TIMEOUT)
        fb_id = create.json()["id"]

        resp = session.post(f"{self.URL}/{fb_id}/flag", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert "flag_count" in data or "flagged" in data
