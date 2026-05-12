import uuid
import pytest
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.documents.models import DocumentTemplate, UserDocument
from apps.documents.services import (
    create_document_request,
    get_download_url,
    get_user_document,
    mark_document_failed,
    mark_document_ready,
)


@pytest.fixture
def template(db):
    return DocumentTemplate.objects.create(
        slug="test-notice-wages",
        name_fr="Test Notice Salaire",
        name_en="Test Notice Wages",
        description_fr="Desc", description_en="Desc",
        template_file="documents/mise-en-demeure-salaire.html",
        price_xaf=2000,
    )


@pytest.fixture
def user_id():
    return uuid.uuid4()


@pytest.fixture
def document(db, template, user_id):
    return UserDocument.objects.create(
        user_id=user_id,
        template=template,
        form_data={"employee_name": "Paul"},
    )


@pytest.mark.django_db
class TestCreateDocumentRequest:
    def test_creates_with_awaiting_payment(self, template, user_id):
        doc = create_document_request(user_id, template, {"employee_name": "Paul"})
        assert doc.status == UserDocument.STATUS_AWAITING
        assert doc.file_url is None
        assert str(doc.user_id) == str(user_id)

    def test_form_data_saved(self, template, user_id):
        data = {"employee_name": "Marie", "amount_owed": 75000}
        doc = create_document_request(user_id, template, data)
        assert doc.form_data["employee_name"] == "Marie"


@pytest.mark.django_db
class TestGetUserDocument:
    def test_owner_can_fetch(self, document, user_id):
        fetched = get_user_document(str(document.id), str(user_id))
        assert fetched.id == document.id

    def test_wrong_user_gets_403(self, document):
        with pytest.raises(PermissionDenied):
            get_user_document(str(document.id), str(uuid.uuid4()))

    def test_nonexistent_gets_404(self, user_id):
        with pytest.raises(NotFound):
            get_user_document(str(uuid.uuid4()), str(user_id))


@pytest.mark.django_db
class TestMarkDocumentReady:
    def test_sets_status_and_file_url(self, document):
        url = "http://minio/lexcam-documents/user/doc.pdf"
        doc = mark_document_ready(str(document.id), url)
        assert doc.status == UserDocument.STATUS_READY
        assert doc.file_url == url

    def test_nonexistent_raises_404(self):
        with pytest.raises(NotFound):
            mark_document_ready(str(uuid.uuid4()), "http://x.com/x.pdf")


@pytest.mark.django_db
class TestMarkDocumentFailed:
    def test_sets_failed_status(self, document):
        doc = mark_document_failed(str(document.id))
        assert doc.status == UserDocument.STATUS_FAILED

    def test_nonexistent_raises_404(self):
        with pytest.raises(NotFound):
            mark_document_failed(str(uuid.uuid4()))


@pytest.mark.django_db
class TestGetDownloadUrl:
    def test_returns_url_when_ready(self, document):
        document.status = UserDocument.STATUS_READY
        document.file_url = "http://minio/doc.pdf"
        document.save()
        url = get_download_url(document)
        assert url == "http://minio/doc.pdf"

    def test_raises_403_when_not_ready(self, document):
        with pytest.raises(PermissionDenied):
            get_download_url(document)

    def test_raises_403_when_generating(self, document):
        document.status = UserDocument.STATUS_GENERATING
        document.save()
        with pytest.raises(PermissionDenied):
            get_download_url(document)
