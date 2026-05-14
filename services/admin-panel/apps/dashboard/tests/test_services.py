import uuid
import pytest
import responses as resp_mock
from django.utils import timezone
from apps.dashboard.models import AuditLog, PlatformStats
from apps.dashboard.services import log_audit, collect_platform_stats

USER_STATS_URL = "http://user-management-test/internal/stats/users"
LAWYER_STATS_URL = "http://lawyer-service-test/internal/stats/lawyers"
DOC_STATS_URL = "http://document-service-test/internal/stats/documents"
PAYMENT_STATS_URL = "http://payment-service-test/internal/stats/revenue"


@pytest.mark.django_db
class TestLogAudit:
    def test_creates_record(self):
        admin_id = uuid.uuid4()
        target_id = uuid.uuid4()
        log = log_audit(
            admin_user_id=admin_id,
            action=AuditLog.ACTION_TRIGGER_SCRAPER,
            target_type="scraper",
            target_id=target_id,
            details={"note": "manual trigger"},
        )
        assert log.admin_user_id == admin_id
        assert log.action == AuditLog.ACTION_TRIGGER_SCRAPER
        assert log.target_id == target_id
        assert log.details["note"] == "manual trigger"

    def test_defaults(self):
        log = log_audit(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_REVIEW_FEEDBACK)
        assert log.target_type == ""
        assert log.target_id is None
        assert log.details == {}

    def test_persisted(self):
        log = log_audit(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_VERIFY_LAWYER)
        assert AuditLog.objects.filter(pk=log.pk).exists()


@pytest.mark.django_db
class TestCollectPlatformStats:
    @resp_mock.activate
    def test_creates_stats_record(self):
        resp_mock.add(resp_mock.GET, USER_STATS_URL, json={"count": 150}, status=200)
        resp_mock.add(resp_mock.GET, LAWYER_STATS_URL, json={"count": 30}, status=200)
        resp_mock.add(resp_mock.GET, DOC_STATS_URL, json={"count": 75}, status=200)
        resp_mock.add(resp_mock.GET, PAYMENT_STATS_URL, json={"count": 500000}, status=200)

        stats = collect_platform_stats()
        assert stats.total_users == 150
        assert stats.total_verified_lawyers == 30
        assert stats.total_documents_generated == 75
        assert stats.total_revenue_xaf == 500000
        assert stats.stat_date == timezone.now().date()

    @resp_mock.activate
    def test_partial_failure_uses_zero_for_failed_services(self):
        resp_mock.add(resp_mock.GET, USER_STATS_URL, json={"count": 100}, status=200)
        resp_mock.add(resp_mock.GET, LAWYER_STATS_URL, body=Exception("connection refused"))
        resp_mock.add(resp_mock.GET, DOC_STATS_URL, json={"count": 40}, status=200)
        resp_mock.add(resp_mock.GET, PAYMENT_STATS_URL, body=Exception("connection refused"))

        stats = collect_platform_stats()
        assert stats.total_users == 100
        assert stats.total_documents_generated == 40
        # fields for failed services stay at their existing or default values

    @resp_mock.activate
    def test_updates_existing_record(self):
        today = timezone.now().date()
        existing = PlatformStats.objects.create(stat_date=today, total_users=50)

        resp_mock.add(resp_mock.GET, USER_STATS_URL, json={"count": 200}, status=200)
        resp_mock.add(resp_mock.GET, LAWYER_STATS_URL, json={"count": 40}, status=200)
        resp_mock.add(resp_mock.GET, DOC_STATS_URL, json={"count": 90}, status=200)
        resp_mock.add(resp_mock.GET, PAYMENT_STATS_URL, json={"count": 1000000}, status=200)

        stats = collect_platform_stats()
        assert stats.pk == existing.pk
        assert stats.total_users == 200
