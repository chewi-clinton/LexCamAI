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

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import services

_FAKE_PDF = b"%PDF-1.4 fake content " + b"x" * 200


def _mock_html_cls(string=""):
    m = MagicMock()
    m.write_pdf.return_value = _FAKE_PDF
    return m


class TestRenderPdf(unittest.TestCase):

    @patch("weasyprint.HTML", side_effect=_mock_html_cls)
    def test_render_pdf_returns_bytes(self, _mock):
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
        # PDF files start with %PDF
        self.assertTrue(pdf.startswith(b"%PDF"))

    @patch("weasyprint.HTML", side_effect=_mock_html_cls)
    def test_render_pdf_logement(self, _mock):
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

    @patch("weasyprint.HTML", side_effect=_mock_html_cls)
    def test_render_pdf_lettre_reclamation(self, _mock):
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

    @patch("weasyprint.HTML", side_effect=_mock_html_cls)
    def test_render_pdf_optional_amount_omitted(self, _mock):
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
    def test_upload_returns_minio_url(self, mock_minio):
        mock_minio.put_object.return_value = None
        url = services.upload_to_minio("user-1", "doc-2", b"fake-pdf")
        self.assertIn("lexcam-documents", url)
        self.assertIn("user-1/doc-2.pdf", url)


if __name__ == "__main__":
    unittest.main()
