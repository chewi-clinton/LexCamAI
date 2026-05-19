from __future__ import annotations

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
os.environ.setdefault("LAWYER_SERVICE_URL", "http://lawyer-service-test")
os.environ.setdefault("INTERNAL_SERVICE_KEY", "test-key")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import services


class TestValidateLawyerRecord(unittest.TestCase):

    def test_validate_lawyer_record_requires_name_city_and_contact(self):
        ok, _ = services.validate_lawyer_record({"email": "a@b.com", "city": "Yaounde"})
        self.assertFalse(ok)

        ok, _ = services.validate_lawyer_record({"full_name": "Jane", "city": "Yaounde"})
        self.assertFalse(ok)

        ok, normalized = services.validate_lawyer_record({
            "name": "Jane Doe",
            "city": "Yaounde",
            "phone": "+237 600 000 000",
        })
        self.assertTrue(ok)
        self.assertEqual(normalized["full_name"], "Jane Doe")


class TestDeduplicateLawyers(unittest.TestCase):

    def test_dedupe_lawyers_by_email_and_name_city(self):
        lawyers = [
            {"full_name": "Alice", "email": "a@example.com", "city": "Yaounde", "phone": "111"},
            {"full_name": "Bob", "email": "a@example.com", "city": "Douala", "phone": "222"},
            {"full_name": "Cara", "email": "", "city": "Yaounde", "phone": "333"},
            {"full_name": "Cara", "email": "c@example.com", "city": "Yaounde", "phone": "444"},
        ]

        deduped, skipped = services.dedupe_lawyers_by_email_and_name_city(lawyers)
        self.assertEqual(len(deduped), 2)
        self.assertEqual(skipped, 2)


class TestPrepareAndSend(unittest.TestCase):

    @patch("services.requests.post")
    def test_prepare_and_send_calls_post(self, mock_post):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"inserted": 1, "skipped": 0}
        mock_post.return_value = mock_response

        lawyers = [
            {"full_name": "Alice", "email": "a@example.com", "city": "Yaounde", "phone": "111"}
        ]
        result = services.prepare_and_send(lawyers)

        mock_post.assert_called_once()
        url = mock_post.call_args[0][0]
        self.assertIn("/internal/lawyers/ingest", url)
        payload = mock_post.call_args[1]["json"]
        self.assertEqual(payload["lawyers"][0]["full_name"], "Alice")
        headers = mock_post.call_args[1]["headers"]
        self.assertEqual(headers["X-Internal-Key"], "test-key")
        self.assertEqual(result["inserted"], 1)


if __name__ == "__main__":
    unittest.main()
