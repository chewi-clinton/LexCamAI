from __future__ import annotations

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
os.environ.setdefault("USER_MANAGEMENT_URL", "http://user-management-test")
os.environ.setdefault("INTERNAL_SERVICE_KEY", "test-key")
os.environ.setdefault("SMTP_USER", "test@example.com")
os.environ.setdefault("SMTP_PASSWORD", "test-password")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import services


class TestGetUserEmail(unittest.TestCase):

    @patch("services.requests.get")
    def test_returns_email(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"user_id": "u1", "email": "user@example.com"},
        )
        email = services.get_user_email("u1")
        self.assertEqual(email, "user@example.com")
        mock_get.assert_called_once()


class TestSendEmail(unittest.TestCase):

    @patch("services.smtplib.SMTP")
    def test_send_email_uses_smtp(self, mock_smtp_cls):
        mock_smtp = MagicMock()
        mock_smtp_cls.return_value.__enter__ = lambda s: mock_smtp
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)
        services.send_email("to@example.com", "Test Subject", "<p>Hello</p>")
        mock_smtp_cls.assert_called_once()

    @patch("services.smtplib.SMTP")
    def test_send_email_sends_message(self, mock_smtp_cls):
        mock_smtp = MagicMock()
        mock_smtp_cls.return_value.__enter__ = lambda s: mock_smtp
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)
        services.send_email("to@example.com", "Subject", "<p>body</p>")
        mock_smtp.send_message.assert_called_once()


class TestRenderTemplate(unittest.TestCase):

    def test_welcome_renders(self):
        html = services.render_template("welcome.html", {
            "full_name": "John Doe",
            "email": "john@example.com",
        })
        self.assertIn("John Doe", html)
        self.assertIn("LexCam", html)

    def test_lawyer_verified_approved_renders(self):
        html = services.render_template("lawyer_verified.html", {
            "full_name": "Maître Ndongo",
            "status": "verified",
            "approved": True,
        })
        self.assertIn("Maître Ndongo", html)
        self.assertIn("verified", html.lower())

    def test_lawyer_verified_rejected_renders(self):
        html = services.render_template("lawyer_verified.html", {
            "full_name": "Maître Mballa",
            "status": "rejected",
            "approved": False,
        })
        self.assertIn("Maître Mballa", html)
        self.assertIn("rejected", html.lower())

    def test_referral_created_renders(self):
        html = services.render_template("referral_created.html", {
            "user_name": "Alice Nkomo",
            "domain": "labor",
            "referral_id": "ref-123",
        })
        self.assertIn("Alice Nkomo", html)
        self.assertIn("labor", html)
        self.assertIn("ref-123", html)

    def test_referral_accepted_renders(self):
        html = services.render_template("referral_accepted.html", {
            "lawyer_name": "Maître Talla",
            "lawyer_phone": "+237 677 000 111",
            "referral_id": "ref-456",
        })
        self.assertIn("Maître Talla", html)
        self.assertIn("+237 677 000 111", html)

    def test_payment_receipt_renders(self):
        html = services.render_template("payment_receipt.html", {
            "amount": "5000",
            "operator": "mtn",
            "transaction_id": "txn-789",
        })
        self.assertIn("5000", html)
        self.assertIn("MTN", html)
        self.assertIn("txn-789", html)

    def test_document_ready_renders(self):
        html = services.render_template("document_ready.html", {
            "file_url": "https://minio.example.com/doc.pdf",
            "document_id": "doc-001",
        })
        self.assertIn("https://minio.example.com/doc.pdf", html)
        self.assertIn("doc-001", html)


class TestHandlers(unittest.TestCase):

    @patch("services.send_email")
    def test_handle_user_registered_calls_send_email(self, mock_send):
        services.handle_user_registered({
            "user_id": "u1",
            "email": "user@example.com",
            "full_name": "Test User",
        })
        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        self.assertEqual(args[0], "user@example.com")
        self.assertIn("Welcome", args[1])

    @patch("services.send_email")
    def test_handle_lawyer_verified_approved(self, mock_send):
        services.handle_lawyer_verified({
            "lawyer_id": "l1",
            "full_name": "Maître Test",
            "email": "lawyer@example.com",
            "status": "verified",
        })
        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        self.assertEqual(args[0], "lawyer@example.com")
        self.assertIn("verified", args[1].lower())

    @patch("services.send_email")
    def test_handle_referral_created(self, mock_send):
        services.handle_referral_created({
            "referral_id": "r1",
            "lawyer_email": "lawyer@example.com",
            "user_name": "Citizen A",
            "domain": "housing",
        })
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], "lawyer@example.com")

    @patch("services.send_email")
    def test_handle_referral_accepted(self, mock_send):
        services.handle_referral_accepted({
            "referral_id": "r1",
            "user_email": "user@example.com",
            "lawyer_name": "Maître Dupont",
            "lawyer_phone": "+237 6XX XXX XXX",
        })
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], "user@example.com")

    @patch("services.send_email")
    @patch("services.get_user_email", return_value="user@example.com")
    def test_handle_payment_confirmed(self, mock_get, mock_send):
        services.handle_payment_confirmed({
            "transaction_id": "txn-1",
            "user_id": "u1",
            "document_id": "d1",
            "amount": 5000,
            "operator": "orange",
        })
        mock_get.assert_called_once_with("u1")
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], "user@example.com")

    @patch("services.send_email")
    def test_handle_document_ready(self, mock_send):
        services.handle_document_ready({
            "document_id": "d1",
            "user_id": "u1",
            "user_email": "user@example.com",
            "file_url": "https://minio.example.com/doc.pdf",
        })
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], "user@example.com")


class TestRetryLogic(unittest.TestCase):

    def test_max_retries_constant(self):
        import worker
        self.assertEqual(worker.MAX_RETRIES, 3)

    def test_all_six_event_types_have_handlers(self):
        import worker
        expected = {
            "user.registered", "lawyer.verified", "referral.created",
            "referral.accepted", "payment.confirmed", "document.ready",
        }
        self.assertEqual(set(worker.HANDLERS.keys()), expected)


if __name__ == "__main__":
    unittest.main()
