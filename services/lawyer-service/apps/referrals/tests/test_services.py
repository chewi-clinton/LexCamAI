import uuid
import pytest
from unittest.mock import patch
from apps.lawyers.models import Lawyer
from apps.referrals.models import Referral
from apps.referrals.services import (
    create_referral, accept_referral, decline_referral, resolve_referral,
)


@pytest.fixture
def lawyer(db):
    return Lawyer.objects.create(
        user_id=uuid.uuid4(),
        full_name="Lawyer A",
        email="la@la.com",
        phone="600000001",
        city="Douala",
        type=Lawyer.TYPE_REGISTERED,
        verification_status=Lawyer.STATUS_VERIFIED,
        is_listed=True,
        is_accepting_cases=True,
    )


@pytest.fixture
def pending_referral(db, lawyer):
    return Referral.objects.create(
        lawyer=lawyer,
        user_id=uuid.uuid4(),
        user_name="Citizen X",
        user_email="x@citizen.com",
        issue_summary="Housing dispute.",
        domain="housing",
    )


@pytest.mark.django_db
class TestCreateReferral:
    @patch("apps.referrals.services.publish_referral_created")
    def test_creates_pending_referral(self, mock_pub, lawyer):
        uid = uuid.uuid4()
        ref = create_referral(lawyer.id, uid, "Joe", "joe@j.com", "Labor issue", "labor")
        assert ref.status == Referral.STATUS_PENDING
        assert ref.contact_revealed is False
        mock_pub.assert_called_once()

    def test_raises_for_scraped_lawyer(self, db):
        scraped = Lawyer.objects.create(
            full_name="Scraped", email="s@s.com", phone="000", city="X",
            type=Lawyer.TYPE_SCRAPED, verification_status=Lawyer.STATUS_VERIFIED,
            is_listed=True, is_accepting_cases=True,
        )
        with pytest.raises(ValueError, match="not available"):
            create_referral(scraped.id, uuid.uuid4(), "Joe", "j@j.com", "Issue")

    def test_raises_for_pending_lawyer(self, db):
        pending = Lawyer.objects.create(
            full_name="Pending L", email="pl@pl.com", phone="000", city="X",
            type=Lawyer.TYPE_REGISTERED, verification_status=Lawyer.STATUS_PENDING,
        )
        with pytest.raises(ValueError, match="not available"):
            create_referral(pending.id, uuid.uuid4(), "Joe", "j@j.com", "Issue")

    def test_raises_when_not_accepting(self, db):
        lawyer = Lawyer.objects.create(
            full_name="Busy L", email="bl@bl.com", phone="000", city="X",
            type=Lawyer.TYPE_REGISTERED, verification_status=Lawyer.STATUS_VERIFIED,
            is_accepting_cases=False,
        )
        with pytest.raises(ValueError, match="not available"):
            create_referral(lawyer.id, uuid.uuid4(), "Joe", "j@j.com", "Issue")


@pytest.mark.django_db
class TestAcceptReferral:
    @patch("apps.referrals.services.publish_referral_accepted")
    def test_accept_reveals_contact(self, mock_pub, pending_referral, lawyer):
        ref = accept_referral(pending_referral.id, lawyer.user_id)
        assert ref.status == Referral.STATUS_ACCEPTED
        assert ref.contact_revealed is True
        mock_pub.assert_called_once()

    def test_accept_wrong_lawyer_raises(self, pending_referral):
        with pytest.raises(PermissionError):
            accept_referral(pending_referral.id, uuid.uuid4())

    @patch("apps.referrals.services.publish_referral_accepted")
    def test_accept_already_accepted_raises(self, mock_pub, pending_referral, lawyer):
        accept_referral(pending_referral.id, lawyer.user_id)
        with pytest.raises(ValueError, match="accepted"):
            accept_referral(pending_referral.id, lawyer.user_id)


@pytest.mark.django_db
class TestDeclineReferral:
    def test_decline_sets_status(self, pending_referral, lawyer):
        ref = decline_referral(pending_referral.id, lawyer.user_id)
        assert ref.status == Referral.STATUS_DECLINED

    def test_decline_wrong_lawyer_raises(self, pending_referral):
        with pytest.raises(PermissionError):
            decline_referral(pending_referral.id, uuid.uuid4())


@pytest.mark.django_db
class TestResolveReferral:
    @patch("apps.referrals.services.publish_referral_resolved")
    def test_citizen_can_resolve(self, mock_pub, pending_referral, lawyer):
        # First accept
        with patch("apps.referrals.services.publish_referral_accepted"):
            accepted = accept_referral(pending_referral.id, lawyer.user_id)
        ref = resolve_referral(accepted.id, accepted.user_id)
        assert ref.status == Referral.STATUS_RESOLVED
        mock_pub.assert_called_once()

    def test_cannot_resolve_pending(self, pending_referral, lawyer):
        with pytest.raises(ValueError, match="pending"):
            resolve_referral(pending_referral.id, pending_referral.user_id)

    def test_unrelated_user_cannot_resolve(self, pending_referral, lawyer):
        with pytest.raises(PermissionError):
            resolve_referral(pending_referral.id, uuid.uuid4())
