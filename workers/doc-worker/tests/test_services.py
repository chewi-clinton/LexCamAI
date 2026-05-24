from __future__ import annotations

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Provide env vars before importing modules that read them at import time
os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
os.environ.setdefault("DOCUMENT_SERVICE_URL", "http://document-service-test")
os.environ.setdefault("USER_MANAGEMENT_URL", "http://user-management-test")
os.environ.setdefault("INTERNAL_SERVICE_KEY", "test-key")
os.environ.setdefault("MINIO_ENDPOINT", "localhost:9000")
os.environ.setdefault("MINIO_ACCESS_KEY", "minioadmin")
os.environ.setdefault("MINIO_SECRET_KEY", "minioadmin")

# WeasyPrint requires native GTK/GLib libs (libpango, libcairo2, etc.) that the
# Docker image installs but the bare Jenkins environment does not have.
# Stub the whole module before importing services so the native libs are never
# loaded in CI. In production the real weasyprint runs inside the Docker container.
_FAKE_PDF = b"%PDF-1.4 fake content " + b"x" * 200
_fake_weasyprint = MagicMock()
_fake_weasyprint.HTML.return_value.write_pdf.return_value = _FAKE_PDF
sys.modules.setdefault("weasyprint", _fake_weasyprint)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import services


class TestRenderPdf(unittest.TestCase):

    def test_render_pdf_returns_bytes(self):
        form_data = {
            "sender_name": "Jean Dupont",
            "sender_address": "123 Rue de la Paix",
            "sender_city": "Yaoundé",
            "sender_phone": "+237 6XX XXX XXX",
            "sender_email": "jean@example.com",
            "employer_name": "Entreprise ACME",
            "employer_address": "456 Avenue du Commerce, Douala",
            "start_date": "01 January 2023",
            "amount_owed": "150,000",
            "period": "October–December 2024",
            "deadline_days": "15",
            "city": "Yaoundé",
            "date": "15 May 2026",
        }
        pdf = services.render_pdf("mise-en-demeure-salaire", form_data)
        self.assertIsInstance(pdf, bytes)
        self.assertGreater(len(pdf), 100)
        self.assertTrue(pdf.startswith(b"%PDF"))

    def test_render_pdf_logement(self):
        form_data = {
            "sender_name": "Marie Mballa",
            "sender_address": "12 Quartier Bastos",
            "sender_city": "Yaoundé",
            "sender_phone": "+237 6XX XXX XXX",
            "sender_email": "marie@example.com",
            "landlord_name": "Propriétaire Nkomo",
            "landlord_address": "78 Rue Foucauld, Douala",
            "property_address": "12 Quartier Bastos, Yaoundé",
            "amount_owed": "80,000",
            "period": "November–December 2024",
            "deadline_days": "8",
            "city": "Yaoundé",
            "date": "15 May 2026",
        }
        pdf = services.render_pdf("mise-en-demeure-logement", form_data)
        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b"%PDF"))

    def test_render_pdf_lettre_reclamation(self):
        form_data = {
            "sender_name": "Paul Atangana",
            "sender_address": "5 Avenue Kennedy",
            "sender_city": "Douala",
            "sender_phone": "+237 6XX XXX XXX",
            "sender_email": "paul@example.com",
            "recipient_name": "Direction Générale Orange Cameroun",
            "recipient_address": "Boulevard de la Liberté, Douala",
            "subject": "Billing Dispute — Invoice #INV-2024-1234",
            "claim_description": (
                "I was billed twice for the period of October 2024. "
                "I request a full refund of the duplicate charge."
            ),
            "amount_claimed": "25,000",
            "deadline_days": "10",
            "city": "Douala",
            "date": "15 May 2026",
        }
        pdf = services.render_pdf("lettre-reclamation", form_data)
        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b"%PDF"))

    def test_render_pdf_optional_amount_omitted(self):
        form_data = {
            "sender_name": "Paul Atangana",
            "sender_address": "5 Avenue Kennedy",
            "sender_city": "Douala",
            "sender_phone": "+237 6XX XXX XXX",
            "sender_email": "paul@example.com",
            "recipient_name": "Mairie de Douala",
            "recipient_address": "Place du Gouvernement, Douala",
            "subject": "Request for Information",
            "claim_description": "I request a copy of my building permit records.",
            "amount_claimed": None,
            "deadline_days": "30",
            "city": "Douala",
            "date": "15 May 2026",
        }
        pdf = services.render_pdf("lettre-reclamation", form_data)
        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b"%PDF"))


class TestGetDocument(unittest.TestCase):

    @patch("services.requests.get")
    def test_get_document_success(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "document_id": "abc-123",
                "user_id": "user-456",
                "template_slug": "mise-en-demeure-salaire",
                "form_data": {"sender_name": "Test"},
                "status": "awaiting_payment",
            },
        )
        doc = services.get_document("abc-123")
        self.assertEqual(doc["template_slug"], "mise-en-demeure-salaire")

    @patch("services.requests.get")
    def test_get_user_email(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"user_id": "user-456", "email": "user@example.com", "full_name": "Test"},
        )
        email = services.get_user_email("user-456")
        self.assertEqual(email, "user@example.com")


class TestUploadToMinio(unittest.TestCase):

    @patch("services._minio")
    def test_upload_returns_public_https_url(self, mock_minio):
        mock_minio.bucket_exists.return_value = True
        mock_minio.put_object.return_value = None
        mock_minio.set_bucket_policy.return_value = None
        url = services.upload_to_minio("user-1", "doc-2", b"fake-pdf")
        self.assertTrue(url.startswith("https://"))
        self.assertIn("lexcam-documents", url)
        self.assertIn("user-1/doc-2.pdf", url)

    @patch("services._minio")
    def test_upload_creates_bucket_when_missing(self, mock_minio):
        mock_minio.bucket_exists.return_value = False
        mock_minio.make_bucket.return_value = None
        mock_minio.put_object.return_value = None
        mock_minio.set_bucket_policy.return_value = None
        services.upload_to_minio("user-1", "doc-3", b"fake-pdf")
        mock_minio.make_bucket.assert_called_once()

    @patch("services._minio")
    def test_upload_swallows_policy_error(self, mock_minio):
        mock_minio.bucket_exists.return_value = True
        mock_minio.put_object.return_value = None
        mock_minio.set_bucket_policy.side_effect = Exception("policy error")
        url = services.upload_to_minio("user-1", "doc-4", b"fake-pdf")
        self.assertIn("user-1/doc-4.pdf", url)


class TestMarkDocumentReady(unittest.TestCase):

    @patch("services.requests.post")
    def test_mark_ready_calls_correct_url(self, mock_post):
        mock_post.return_value = MagicMock(status_code=200)
        services.mark_document_ready("doc-abc", "https://example.com/doc.pdf")
        call_url = mock_post.call_args[0][0]
        self.assertIn("doc-abc/mark-ready", call_url)
        self.assertFalse(call_url.endswith("/"))


class TestProcessPaymentConfirmed(unittest.TestCase):

    @patch("services.get_user_email", return_value="user@example.com")
    @patch("services.mark_document_ready")
    @patch("services.upload_to_minio", return_value="https://example.com/doc.pdf")
    @patch("services.render_pdf", return_value=b"%PDF-1.4 fake")
    @patch("services.get_document", return_value={
        "document_id": "d1", "user_id": "u1",
        "template_slug": "mise-en-demeure-salaire",
        "form_data": {"sender_name": "Test"},
    })
    def test_process_returns_url_and_email(self, mock_doc, mock_pdf, mock_upload, mock_ready, mock_email):
        file_url, email = services.process_payment_confirmed("u1", "d1")
        self.assertEqual(file_url, "https://example.com/doc.pdf")
        self.assertEqual(email, "user@example.com")
        mock_ready.assert_called_once_with("d1", "https://example.com/doc.pdf")


if __name__ == "__main__":
    unittest.main()
