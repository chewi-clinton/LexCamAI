import uuid
import pytest
import responses as resp_mock
from rest_framework.test import APIClient
from apps.documents.models import DocumentTemplate, UserDocument

USER_MGMT_URL = "http://user-management-test/internal/auth/validate"
INTERNAL_KEY = "test-internal-key"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def template(db):
    return DocumentTemplate.objects.create(
        slug="test-notice-wages",
        name_fr="Mise en Demeure — Salaire",
        name_en="Formal Notice — Wages",
        description_fr="Desc", description_en="Desc",
        template_file="documents/mise-en-demeure-salaire.html",
        price_xaf=2000,
        is_active=True,
    )


@pytest.fixture
def inactive_template(db):
    return DocumentTemplate.objects.create(
        slug="inactive-template",
        name_fr="Inactif", name_en="Inactive",
        description_fr="", description_en="",
        template_file="documents/x.html",
        price_xaf=500,
        is_active=False,
    )


@pytest.fixture
def user_id():
    return str(uuid.uuid4())


@pytest.fixture
def document(db, template, user_id):
    return UserDocument.objects.create(
        user_id=uuid.UUID(user_id),
        template=template,
        form_data={"employee_name": "Paul"},
    )


@pytest.mark.django_db
class TestTemplateListView:
    def test_returns_active_templates(self, client, template, inactive_template):
        resp = client.get("/api/v1/templates/")
        assert resp.status_code == 200
        slugs = [t["slug"] for t in resp.data]
        assert "mise-en-demeure-salaire" in slugs
        assert "inactive-template" not in slugs

    def test_no_auth_required(self, client, template):
        resp = client.get("/api/v1/templates/")
        assert resp.status_code == 200


@pytest.mark.django_db
class TestTemplateDetailView:
    def test_returns_template_with_fields(self, client, template):
        resp = client.get(f"/api/v1/templates/{template.id}/")
        assert resp.status_code == 200
        assert resp.data["slug"] == template.slug

    def test_404_for_inactive(self, client, inactive_template):
        resp = client.get(f"/api/v1/templates/{inactive_template.id}/")
        assert resp.status_code == 404

    def test_404_for_unknown(self, client, db):
        resp = client.get(f"/api/v1/templates/{uuid.uuid4()}/")
        assert resp.status_code == 404


@pytest.mark.django_db
class TestUserDocumentListCreateView:
    @resp_mock.activate
    def test_create_document_returns_201(self, client, template, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/documents/",
            data={"template_id": str(template.id), "form_data": {"employee_name": "Paul"}},
            HTTP_AUTHORIZATION="Bearer token",
            format="json",
        )
        assert resp.status_code == 201
        assert resp.data["status"] == "awaiting_payment"

    @resp_mock.activate
    def test_list_returns_own_documents(self, client, document, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/documents/", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert len(resp.data) == 1

    @resp_mock.activate
    def test_other_user_sees_empty_list(self, client, document):
        other_id = str(uuid.uuid4())
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": other_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/documents/", HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert len(resp.data) == 0

    def test_unauthenticated_returns_403(self, client, template):
        resp = client.post(
            "/api/v1/documents/",
            data={"template_id": str(template.id), "form_data": {}},
            format="json",
        )
        assert resp.status_code in [401, 403]


@pytest.mark.django_db
class TestUserDocumentDetailView:
    @resp_mock.activate
    def test_owner_can_view(self, client, document, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get(f"/api/v1/documents/{document.id}/",
                          HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200

    @resp_mock.activate
    def test_other_user_gets_403(self, client, document):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": str(uuid.uuid4()), "role": "user"}, status=200)
        resp = client.get(f"/api/v1/documents/{document.id}/",
                          HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 403


@pytest.mark.django_db
class TestUserDocumentDownloadView:
    @resp_mock.activate
    def test_returns_403_when_not_ready(self, client, document, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get(f"/api/v1/documents/{document.id}/download/",
                          HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 403

    @resp_mock.activate
    def test_returns_file_url_when_ready(self, client, document, user_id):
        document.status = UserDocument.STATUS_READY
        document.file_url = "http://minio/lexcam-documents/doc.pdf"
        document.save()
        resp_mock.add(resp_mock.POST, USER_MGMT_URL,
                      json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get(f"/api/v1/documents/{document.id}/download/",
                          HTTP_AUTHORIZATION="Bearer token")
        assert resp.status_code == 200
        assert "file_url" in resp.data


@pytest.mark.django_db
class TestInternalMarkReadyView:
    def test_marks_document_ready(self, client, document):
        resp = client.post(
            f"/internal/documents/{document.id}/mark-ready/",
            data={"file_url": "http://minio/doc.pdf"},
            HTTP_X_INTERNAL_KEY=INTERNAL_KEY,
            format="json",
        )
        assert resp.status_code == 200
        document.refresh_from_db()
        assert document.status == UserDocument.STATUS_READY
        assert document.file_url == "http://minio/doc.pdf"

    def test_wrong_key_returns_403(self, client, document):
        resp = client.post(
            f"/internal/documents/{document.id}/mark-ready/",
            data={"file_url": "http://minio/doc.pdf"},
            HTTP_X_INTERNAL_KEY="wrong-key",
            format="json",
        )
        assert resp.status_code == 403

    def test_missing_key_returns_403(self, client, document):
        resp = client.post(
            f"/internal/documents/{document.id}/mark-ready/",
            data={"file_url": "http://minio/doc.pdf"},
            format="json",
        )
        assert resp.status_code == 403
