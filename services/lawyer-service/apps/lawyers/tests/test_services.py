import pytest
from unittest.mock import patch, MagicMock
from apps.lawyers.models import Lawyer, Specialization
from apps.lawyers.services import (
    get_lawyers, register_lawyer, update_lawyer, verify_lawyer,
    ingest_scraped_lawyers, get_recommendations,
)


@pytest.fixture
def specialization(db):
    return Specialization.objects.create(name="labor", name_fr="Droit du travail")


@pytest.fixture
def verified_lawyer(db, specialization):
    lawyer = Lawyer.objects.create(
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
class TestGetLawyers:
    def test_returns_only_listed(self, verified_lawyer):
        unlisted = Lawyer.objects.create(
            full_name="Hidden", email="h@example.com", phone="000",
            city="Douala", is_listed=False,
        )
        result = get_lawyers()
        ids = [l.id for l in result]
        assert verified_lawyer.id in ids
        assert unlisted.id not in ids

    def test_filter_by_city(self, verified_lawyer):
        result = list(get_lawyers(city="Yaounde"))
        assert verified_lawyer in result

    def test_filter_by_specialization(self, verified_lawyer, specialization):
        result = list(get_lawyers(specialization="labor"))
        assert verified_lawyer in result

    def test_no_results_for_unknown_city(self, verified_lawyer):
        result = list(get_lawyers(city="UnknownCity"))
        assert len(result) == 0


@pytest.mark.django_db
class TestRegisterLawyer:
    def test_creates_lawyer(self, specialization):
        import uuid
        user_id = uuid.uuid4()
        data = {
            "full_name": "Paul Biya Jr",
            "email": "paul@example.com",
            "phone": "677111111",
            "city": "Douala",
            "specializations": ["labor"],
        }
        lawyer = register_lawyer(user_id, data)
        assert lawyer.user_id == user_id
        assert lawyer.type == Lawyer.TYPE_REGISTERED
        assert lawyer.verification_status == Lawyer.STATUS_PENDING

    def test_duplicate_user_raises_error(self, verified_lawyer):
        with pytest.raises(ValueError, match="already exists"):
            register_lawyer(verified_lawyer.user_id, {
                "full_name": "Dup", "email": "d@d.com", "phone": "000", "city": "X"
            })


@pytest.mark.django_db
class TestVerifyLawyer:
    @patch("apps.lawyers.services.publish_lawyer_verified")
    def test_verify_sets_listed(self, mock_publish, db):
        lawyer = Lawyer.objects.create(
            full_name="Test", email="t@t.com", phone="000", city="Douala",
        )
        result = verify_lawyer(lawyer.id, Lawyer.STATUS_VERIFIED)
        assert result.is_listed is True
        assert result.verification_status == Lawyer.STATUS_VERIFIED
        mock_publish.assert_called_once_with(result)

    @patch("apps.lawyers.services.publish_lawyer_verified")
    def test_reject_removes_listing(self, mock_publish, db):
        lawyer = Lawyer.objects.create(
            full_name="Test2", email="t2@t.com", phone="000", city="Douala",
            verification_status=Lawyer.STATUS_VERIFIED, is_listed=True,
        )
        result = verify_lawyer(lawyer.id, Lawyer.STATUS_REJECTED)
        assert result.is_listed is False


@pytest.mark.django_db
class TestIngestScrapedLawyers:
    def test_inserts_new_lawyers(self):
        data = [{"full_name": "Scraped One", "email": "s1@s.com", "phone": "111", "city": "Bafoussam"}]
        inserted, skipped = ingest_scraped_lawyers(data)
        assert inserted == 1
        assert skipped == 0

    def test_skips_duplicate_email(self, verified_lawyer):
        data = [{"full_name": "Other", "email": verified_lawyer.email, "phone": "222", "city": "X"}]
        inserted, skipped = ingest_scraped_lawyers(data)
        assert inserted == 0
        assert skipped == 1

    def test_skips_duplicate_name_city(self, verified_lawyer):
        data = [{"full_name": verified_lawyer.full_name, "email": "new@new.com",
                 "phone": "333", "city": verified_lawyer.city}]
        inserted, skipped = ingest_scraped_lawyers(data)
        assert inserted == 0
        assert skipped == 1

    def test_skips_missing_required_fields(self):
        data = [{"full_name": "No Phone"}]
        inserted, skipped = ingest_scraped_lawyers(data)
        assert inserted == 0
        assert skipped == 1

    def test_inserted_as_scraped_type(self):
        data = [{"full_name": "Scraped Two", "email": "s2@s.com", "phone": "444", "city": "Limbe"}]
        ingest_scraped_lawyers(data)
        lawyer = Lawyer.objects.get(email="s2@s.com")
        assert lawyer.type == Lawyer.TYPE_SCRAPED
