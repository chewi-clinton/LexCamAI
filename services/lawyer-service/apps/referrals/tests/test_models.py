import uuid
import pytest
from apps.lawyers.models import Lawyer
from apps.referrals.models import Referral


@pytest.fixture
def lawyer(db):
    return Lawyer.objects.create(
        user_id=uuid.uuid4(),
        full_name="Test Lawyer",
        email="tl@tl.com",
        phone="600000000",
        city="Douala",
        type=Lawyer.TYPE_REGISTERED,
        verification_status=Lawyer.STATUS_VERIFIED,
        is_listed=True,
        is_accepting_cases=True,
    )


@pytest.mark.django_db
class TestReferralModel:
    def test_create_referral(self, lawyer):
        ref = Referral.objects.create(
            lawyer=lawyer,
            user_id=uuid.uuid4(),
            user_name="Citizen Joe",
            user_email="joe@citizen.com",
            issue_summary="I was fired without notice.",
            domain="labor",
        )
        assert ref.status == Referral.STATUS_PENDING
        assert ref.contact_revealed is False

    def test_referral_str(self, lawyer):
        ref = Referral(
            lawyer=lawyer,
            user_name="Joe",
            status=Referral.STATUS_PENDING,
        )
        assert "Joe" in str(ref)
        assert "pending" in str(ref)
