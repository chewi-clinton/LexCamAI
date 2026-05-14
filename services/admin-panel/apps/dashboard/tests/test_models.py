import uuid
import pytest
from django.utils import timezone
from apps.dashboard.models import AuditLog, PlatformStats, FlaggedFeedback


@pytest.mark.django_db
class TestAuditLog:
    def test_create(self):
        log = AuditLog.objects.create(
            admin_user_id=uuid.uuid4(),
            action=AuditLog.ACTION_TRIGGER_SCRAPER,
            target_type="scraper",
        )
        assert log.details == {}
        assert log.target_id is None

    def test_str(self):
        uid = uuid.uuid4()
        log = AuditLog.objects.create(admin_user_id=uid, action=AuditLog.ACTION_TRIGGER_SCRAPER)
        assert str(log) == f"AuditLog(trigger_scraper, {uid})"

    def test_action_choices(self):
        actions = [c[0] for c in AuditLog.ACTION_CHOICES]
        assert "verify_lawyer" in actions
        assert "reject_lawyer" in actions
        assert "trigger_scraper" in actions
        assert "review_feedback" in actions

    def test_uuid_primary_key(self):
        log = AuditLog.objects.create(admin_user_id=uuid.uuid4(), action=AuditLog.ACTION_TRIGGER_SCRAPER)
        assert isinstance(log.id, uuid.UUID)

    def test_details_stored(self):
        details = {"lawyer_id": str(uuid.uuid4()), "reason": "documents verified"}
        log = AuditLog.objects.create(
            admin_user_id=uuid.uuid4(),
            action=AuditLog.ACTION_VERIFY_LAWYER,
            target_type="lawyer",
            details=details,
        )
        log.refresh_from_db()
        assert log.details["reason"] == "documents verified"


@pytest.mark.django_db
class TestPlatformStats:
    def test_create(self):
        today = timezone.now().date()
        stats = PlatformStats.objects.create(
            stat_date=today,
            total_users=100,
            total_verified_lawyers=20,
            total_documents_generated=50,
            total_revenue_xaf=250000,
        )
        assert str(stats) == f"PlatformStats({today})"

    def test_stat_date_unique(self):
        from django.db import IntegrityError
        today = timezone.now().date()
        PlatformStats.objects.create(stat_date=today)
        with pytest.raises(IntegrityError):
            PlatformStats.objects.create(stat_date=today)

    def test_defaults_are_zero(self):
        import datetime
        stats = PlatformStats.objects.create(stat_date=datetime.date(2026, 1, 1))
        assert stats.total_users == 0
        assert stats.total_revenue_xaf == 0


@pytest.mark.django_db
class TestFlaggedFeedback:
    def test_create(self):
        fid = uuid.uuid4()
        ff = FlaggedFeedback.objects.create(
            feedback_id=fid,
            session_id=uuid.uuid4(),
            message_index=3,
        )
        assert ff.reviewed is False
        assert ff.reviewed_by is None

    def test_str(self):
        fid = uuid.uuid4()
        ff = FlaggedFeedback.objects.create(
            feedback_id=fid, session_id=uuid.uuid4(), message_index=0
        )
        assert str(ff) == f"FlaggedFeedback({fid}, reviewed=False)"

    def test_feedback_id_unique(self):
        from django.db import IntegrityError
        fid = uuid.uuid4()
        FlaggedFeedback.objects.create(feedback_id=fid, session_id=uuid.uuid4(), message_index=0)
        with pytest.raises(IntegrityError):
            FlaggedFeedback.objects.create(feedback_id=fid, session_id=uuid.uuid4(), message_index=1)

    def test_mark_reviewed(self):
        ff = FlaggedFeedback.objects.create(
            feedback_id=uuid.uuid4(), session_id=uuid.uuid4(), message_index=1
        )
        admin_id = uuid.uuid4()
        ff.reviewed = True
        ff.reviewed_by = admin_id
        ff.reviewed_at = timezone.now()
        ff.save()
        ff.refresh_from_db()
        assert ff.reviewed is True
        assert ff.reviewed_by == admin_id
