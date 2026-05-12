import uuid
import pytest
import responses as resp_mock
from unittest.mock import patch
from rest_framework.test import APIClient
from apps.lawyers.models import Lawyer
from apps.referrals.models import Referral

USER_MGMT_URL = "http://localhost:8001/internal/auth/validate"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def lawyer(db):
    uid = uuid.uuid4()
    return Lawyer.objects.create(
        user_id=uid,
        full_name="Lawyer B",
        email="lb@lb.com",
        phone="677000002",
        city="Douala",
        type=Lawyer.TYPE_REGISTERED,
        verification_status=Lawyer.STATUS_VERIFIED,
        is_listed=True,
        is_accepting_cases=True,
    )


@pytest.fixture
def pending_referral(db, lawyer):
    uid = uuid.uuid4()
    return Referral.objects.create(
        lawyer=lawyer,
        user_id=uid,
        user_name="Citizen Y",
        user_email="y@citizen.com",
        issue_summary="Unpaid wages.",
        domain="labor",
    )


@pytest.mark.django_db
class TestCreateReferralView:
    @resp_mock.activate
    @patch("apps.referrals.services.publish_referral_created")
    def test_citizen_creates_referral(self, mock_pub, client, lawyer):
        uid = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": uid, "role": "user"}, status=200)
        resp = client.post(
            f"/api/v1/lawyers/{lawyer.id}/referrals",
            data={"issue_summary": "I was not paid.", "user_email": "c@c.com"},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 201
        assert resp.data["status"] == "pending"

    @resp_mock.activate
    def test_scraped_lawyer_returns_403(self, client, db):
        scraped = Lawyer.objects.create(
            full_name="Scraped", email="sc@sc.com", phone="000", city="X",
            type=Lawyer.TYPE_SCRAPED, verification_status=Lawyer.STATUS_VERIFIED,
            is_listed=True, is_accepting_cases=True,
        )
        uid = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": uid, "role": "user"}, status=200)
        resp = client.post(
            f"/api/v1/lawyers/{scraped.id}/referrals",
            data={"issue_summary": "Issue."},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 403

    def test_unauthenticated_returns_403(self, client, lawyer):
        resp = client.post(
            f"/api/v1/lawyers/{lawyer.id}/referrals",
            data={"issue_summary": "Issue"},
            format="json",
        )
        assert resp.status_code in [401, 403]


@pytest.mark.django_db
class TestLawyerReferralListView:
    @resp_mock.activate
    def test_lawyer_sees_own_referrals(self, client, lawyer, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(lawyer.user_id), "role": "lawyer"}, status=200)
        resp = client.get("/api/v1/lawyers/me/referrals", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert len(resp.data) == 1

    @resp_mock.activate
    def test_filter_by_status(self, client, lawyer, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(lawyer.user_id), "role": "lawyer"}, status=200)
        resp = client.get("/api/v1/lawyers/me/referrals?status=pending", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert all(r["status"] == "pending" for r in resp.data)


@pytest.mark.django_db
class TestLawyerReferralActionView:
    @resp_mock.activate
    @patch("apps.referrals.services.publish_referral_accepted")
    def test_lawyer_accepts_referral(self, mock_pub, client, lawyer, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(lawyer.user_id), "role": "lawyer"}, status=200)
        resp = client.patch(
            f"/api/v1/lawyers/me/referrals/{pending_referral.id}",
            data={"action": "accept"},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "accepted"
        assert resp.data["contact_revealed"] is True

    @resp_mock.activate
    def test_lawyer_declines_referral(self, client, lawyer, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(lawyer.user_id), "role": "lawyer"}, status=200)
        resp = client.patch(
            f"/api/v1/lawyers/me/referrals/{pending_referral.id}",
            data={"action": "decline"},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "declined"

    @resp_mock.activate
    @patch("apps.referrals.services.publish_referral_accepted")
    def test_wrong_lawyer_gets_400(self, mock_pub, client, lawyer, pending_referral):
        other_id = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": other_id, "role": "lawyer"}, status=200)
        resp = client.patch(
            f"/api/v1/lawyers/me/referrals/{pending_referral.id}",
            data={"action": "accept"},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 400


@pytest.mark.django_db
class TestReferralDetailView:
    @resp_mock.activate
    def test_citizen_can_view_own_referral(self, client, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(pending_referral.user_id), "role": "user"}, status=200)
        resp = client.get(
            f"/api/v1/referrals/{pending_referral.id}",
            HTTP_AUTHORIZATION="Bearer token",
        )
        assert resp.status_code == 200

    @resp_mock.activate
    def test_unrelated_user_gets_403(self, client, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(uuid.uuid4()), "role": "user"}, status=200)
        resp = client.get(
            f"/api/v1/referrals/{pending_referral.id}",
            HTTP_AUTHORIZATION="Bearer token",
        )
        assert resp.status_code == 403


@pytest.mark.django_db
class TestReferralResolveView:
    @resp_mock.activate
    @patch("apps.referrals.services.publish_referral_resolved")
    @patch("apps.referrals.services.publish_referral_accepted")
    def test_citizen_resolves_accepted_referral(self, mock_acc, mock_res, client, lawyer, pending_referral):
        from apps.referrals.services import accept_referral
        with patch("apps.referrals.services.publish_referral_accepted"):
            accept_referral(pending_referral.id, lawyer.user_id)
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(pending_referral.user_id), "role": "user"}, status=200)
        resp = client.patch(
            f"/api/v1/referrals/{pending_referral.id}/resolve",
            HTTP_AUTHORIZATION="Bearer token",
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "resolved"

    @resp_mock.activate
    def test_cannot_resolve_pending(self, client, pending_referral):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(pending_referral.user_id), "role": "user"}, status=200)
        resp = client.patch(
            f"/api/v1/referrals/{pending_referral.id}/resolve",
            HTTP_AUTHORIZATION="Bearer token",
        )
        assert resp.status_code == 400
