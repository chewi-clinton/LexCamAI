import uuid
import pytest
from django.db import IntegrityError
from apps.documents.models import DocumentTemplate, DocumentField, UserDocument


@pytest.fixture
def template(db):
    return DocumentTemplate.objects.create(
        slug="test-template",
        name_fr="Modèle Test",
        name_en="Test Template",
        description_fr="Description",
        description_en="Description",
        template_file="documents/test.html",
        price_xaf=1000,
        is_active=True,
    )


@pytest.mark.django_db
class TestDocumentTemplateModel:
    def test_create_template(self, template):
        assert template.slug == "test-template"
        assert template.is_active is True
        assert template.price_xaf == 1000

    def test_str(self, template):
        assert str(template) == "Modèle Test"

    def test_slug_is_unique(self, template):
        with pytest.raises(IntegrityError):
            DocumentTemplate.objects.create(
                slug="test-template",
                name_fr="Autre", name_en="Other",
                description_fr="", description_en="",
                template_file="x.html", price_xaf=500,
            )


@pytest.mark.django_db
class TestDocumentFieldModel:
    def test_create_field(self, template):
        field = DocumentField.objects.create(
            template=template,
            field_key="employee_name",
            field_type="text",
            label_fr="Nom",
            label_en="Name",
            required=True,
            order=1,
        )
        assert field.template == template
        assert field.field_type == "text"

    def test_str(self, template):
        field = DocumentField(template=template, field_key="amount")
        assert "amount" in str(field)

    def test_fields_ordered_by_order(self, template):
        DocumentField.objects.create(template=template, field_key="b", field_type="text",
                                     label_fr="B", label_en="B", order=2)
        DocumentField.objects.create(template=template, field_key="a", field_type="text",
                                     label_fr="A", label_en="A", order=1)
        keys = list(template.fields.values_list("field_key", flat=True))
        assert keys == ["a", "b"]


@pytest.mark.django_db
class TestUserDocumentModel:
    def test_default_status_is_awaiting(self, template):
        doc = UserDocument.objects.create(
            user_id=uuid.uuid4(),
            template=template,
            form_data={"name": "Test"},
        )
        assert doc.status == UserDocument.STATUS_AWAITING
        assert doc.file_url is None

    def test_str(self, template):
        doc = UserDocument(
            user_id=uuid.uuid4(),
            template=template,
            status=UserDocument.STATUS_AWAITING,
        )
        assert "awaiting_payment" in str(doc)

    def test_form_data_stored_as_json(self, template):
        data = {"employee_name": "John", "amount_owed": 50000}
        doc = UserDocument.objects.create(
            user_id=uuid.uuid4(), template=template, form_data=data
        )
        doc.refresh_from_db()
        assert doc.form_data["employee_name"] == "John"
        assert doc.form_data["amount_owed"] == 50000
