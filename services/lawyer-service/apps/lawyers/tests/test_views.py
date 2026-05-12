import uuid
import pytest
import responses as resp_mock
from unittest.mock import patch
from rest_framework.test import APIClient
from apps.lawyers.models import Lawyer, Specialization

USER_MGMT_URL = "http://localhost:8001/internal/auth/validate"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def specialization(db):
    return Specialization.objects.create(name="labor", name_fr="Droit du travail")


@pytest.fixture
def verified_lawyer_obj(db, specialization):
    uid = uuid.uuid4()
    lawyer = Lawyer.objects.create(
        user_id=uid,
        full_name="Marie Kamga",
        email="marie@example.com",
        phone="699000001",
        city="Yaounde",
        type=Lawyer.TYPE_REGISTERED,
        verification_status=Lawyer.STATUS_VERIFIED,
        is_listed=True,
        is_accepting_cases=True,
    )
    lawyer.specializations.add(specialization)
    return lawyer


@pytest.mark.django_db
class TestPublicLawyerList:
    def test_list_returns_listed_lawyers(self, client, verified_lawyer_obj):
        resp = client.get("/api/v1/lawyers")
        assert resp.status_code == 200
        assert len(resp.data) >= 1

    def test_filter_by_city(self, client, verified_lawyer_obj):
        resp = client.get("/api/v1/lawyers?city=Yaounde")
        assert resp.status_code == 200
        assert all(l["city"] == "Yaounde" for l in resp.data)

    def test_unlisted_not_returned(self, client, db):
        Lawyer.objects.create(
            full_name="Hidden", email="h@x.com", phone="000",
            city="Douala", is_listed=False,
        )
        resp = client.get("/api/v1/lawyers")
        names = [l["full_name"] for l in resp.data]
        assert "Hidden" not in names

    def test_filter_by_specialization(self, client, verified_lawyer_obj):
        resp = client.get("/api/v1/lawyers?specialization=labor")
        assert resp.status_code == 200


@pytest.mark.django_db
class TestLawyerDetail:
    def test_returns_listed_lawyer(self, client, verified_lawyer_obj):
        resp = client.get(f"/api/v1/lawyers/{verified_lawyer_obj.id}")
        assert resp.status_code == 200
        assert resp.data["full_name"] == "Marie Kamga"

    def test_404_for_unlisted(self, client, db):
        lawyer = Lawyer.objects.create(
            full_name="Hidden", email="h2@x.com", phone="000",
            city="Douala", is_listed=False,
        )
        resp = client.get(f"/api/v1/lawyers/{lawyer.id}")
        assert resp.status_code == 404


@pytest.mark.django_db
class TestLawyerRegisterView:
    @resp_mock.activate
    def test_register_creates_profile(self, client, specialization):
        user_id = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/lawyers/register",
            data={"full_name": "New Lawyer", "email": "new@law.com", "phone": "677", "city": "Douala"},
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 201
        assert resp.data["verification_status"] == "pending"

    @resp_mock.activate
    def test_duplicate_profile_returns_400(self, client, verified_lawyer_obj):
        user_id = str(verified_lawyer_obj.user_id)
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/lawyers/register",
            data={"full_name": "Dup", "email": "dup@d.com", "phone": "000", "city": "X"},
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 400

    @resp_mock.activate
    def test_no_auth_returns_403(self, client):
        resp = client.post("/api/v1/lawyers/register", data={}, format="json")
        assert resp.status_code in [401, 403]


@pytest.mark.django_db
class TestLawyerMeView:
    @resp_mock.activate
    def test_get_own_profile(self, client, verified_lawyer_obj):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(verified_lawyer_obj.user_id), "role": "lawyer"}, status=200)
        resp = client.get("/api/v1/lawyers/me", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert resp.data["full_name"] == "Marie Kamga"

    @resp_mock.activate
    def test_patch_updates_profile(self, client, verified_lawyer_obj):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(verified_lawyer_obj.user_id), "role": "lawyer"}, status=200)
        resp = client.patch(
            "/api/v1/lawyers/me",
            data={"is_accepting_cases": False},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["is_accepting_cases"] is False


@pytest.mark.django_db
class TestAdminViews:
    @resp_mock.activate
    def test_admin_lists_all_lawyers(self, client, verified_lawyer_obj):
        admin_id = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.get("/api/v1/admin/lawyers", HTTP_AUTHORIZATION="Bearer admin-token")
        assert resp.status_code == 200

    @resp_mock.activate
    def test_non_admin_gets_403_on_list(self, client, db):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": str(uuid.uuid4()), "role": "user"}, status=200)
        resp = client.get("/api/v1/admin/lawyers", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 403

    @resp_mock.activate
    @patch("apps.lawyers.services.publish_lawyer_verified")
    def test_admin_verifies_lawyer(self, mock_pub, client, db):
        lawyer = Lawyer.objects.create(
            full_name="Pending", email="p@p.com", phone="000", city="Douala"
        )
        admin_id = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": admin_id, "role": "admin"}, status=200)
        resp = client.patch(
            f"/api/v1/admin/lawyers/{lawyer.id}/verify",
            data={"status": "verified"},
            HTTP_AUTHORIZATION="Bearer admin-token",
            format="json",
        )
        assert resp.status_code == 200
        lawyer.refresh_from_db()
        assert lawyer.is_listed is True

    @resp_mock.activate
    def test_non_admin_cannot_verify(self, client, db):
        lawyer = Lawyer.objects.create(
            full_name="L", email="l@l.com", phone="000", city="X"
        )
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": str(uuid.uuid4()), "role": "user"}, status=200)
        resp = client.patch(
            f"/api/v1/admin/lawyers/{lawyer.id}/verify",
            data={"status": "verified"},
            HTTP_AUTHORIZATION="Bearer user-token",
            format="json",
        )
        assert resp.status_code == 403
