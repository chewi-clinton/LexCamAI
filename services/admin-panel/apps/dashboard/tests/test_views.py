import uuid
import pytest
import responses as resp_mock
from unittest.mock import patch, MagicMock
from django.utils import timezone
from rest_framework.test import APIClient
from apps.dashboard.models import AuditLog, PlatformStats, FlaggedFeedback

USER_MGMT_URL = "http://user-management-test/internal/auth/validate"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def admin_id():
    return str(uuid.uuid4())


@pytest.fixture
def user_id():
    return str(uuid.uuid4())


@pytest.mark.django_db
class TestTriggerScraperView:
    @resp_mock.activate
    @patch("apps.dashboard.events.pika.BlockingConnection")
    def test_admin_can_trigger(self, mock_pika, client, admin_id):
        mock_conn = MagicMock()
        mock_channel = MagicMock()
        mock_pika.return_value = mock_conn
        mock_conn.channel.return_value = mock_channel

        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.post("/api/v1/admin/scraper/trigger", HTTP_AUTHORIZATION="Bearer valid-token")

        assert resp.status_code == 200
        assert resp.data["status"] == "triggered"
        assert mock_channel.basic_publish.called
        assert AuditLog.objects.filter(action=AuditLog.ACTION_TRIGGER_SCRAPER).exists()

    @resp_mock.activate
    def test_non_admin_is_rejected(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post("/api/v1/admin/scraper/trigger", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 403

    def test_unauthenticated_is_rejected(self, client):
        resp = client.post("/api/v1/admin/scraper/trigger")
        assert resp.status_code in (401, 403)

    @resp_mock.activate
    @patch("apps.dashboard.events.pika.BlockingConnection")
    def test_rabbitmq_failure_returns_502(self, mock_pika, client, admin_id):
        mock_pika.side_effect = Exception("RabbitMQ down")
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.post("/api/v1/admin/scraper/trigger", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 502


@pytest.mark.django_db
class TestStatsView:
    @resp_mock.activate
    def test_returns_latest_stats(self, client, admin_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        PlatformStats.objects.create(
            stat_date=timezone.now().date(),
            total_users=100,
            total_verified_lawyers=20,
            total_documents_generated=50,
            total_revenue_xaf=500000,
        )
        resp = client.get("/api/v1/admin/stats", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert resp.data["total_users"] == 100
        assert resp.data["total_revenue_xaf"] == 500000

    @resp_mock.activate
    def test_returns_empty_when_no_stats(self, client, admin_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.get("/api/v1/admin/stats", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert resp.data == {}

    @resp_mock.activate
    def test_non_admin_is_rejected(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/admin/stats", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 403

    def test_unauthenticated_is_rejected(self, client):
        resp = client.get("/api/v1/admin/stats")
        assert resp.status_code in (401, 403)


@pytest.mark.django_db
class TestAuditLogListView:
    @resp_mock.activate
    def test_returns_logs(self, client, admin_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        AuditLog.objects.create(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_TRIGGER_SCRAPER)
        AuditLog.objects.create(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_VERIFY_LAWYER)

        resp = client.get("/api/v1/admin/audit-logs", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert len(resp.data) == 2

    @resp_mock.activate
    def test_empty_list(self, client, admin_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.get("/api/v1/admin/audit-logs", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert resp.data == []

    @resp_mock.activate
    def test_non_admin_is_rejected(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/admin/audit-logs", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 403

    def test_unauthenticated_is_rejected(self, client):
        resp = client.get("/api/v1/admin/audit-logs")
        assert resp.status_code in (401, 403)

    @resp_mock.activate
    def test_capped_at_100(self, client, admin_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        AuditLog.objects.bulk_create([
            AuditLog(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_TRIGGER_SCRAPER)
            for _ in range(120)
        ])
        resp = client.get("/api/v1/admin/audit-logs", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert len(resp.data) == 100
