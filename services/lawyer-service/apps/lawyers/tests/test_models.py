import pytest
from apps.lawyers.models import Lawyer, Specialization


@pytest.mark.django_db
class TestLawyerModel:
    def test_create_registered_lawyer(self):
        lawyer = Lawyer.objects.create(
            full_name="Jean Dupont",
            email="jean@example.com",
            phone="677000001",
            city="Douala",
            type=Lawyer.TYPE_REGISTERED,
            verification_status=Lawyer.STATUS_PENDING,
        )
        assert lawyer.id is not None
        assert lawyer.is_listed is False
        assert lawyer.is_accepting_cases is True

    def test_is_referrable_true(self):
        lawyer = Lawyer(
            type=Lawyer.TYPE_REGISTERED,
            verification_status=Lawyer.STATUS_VERIFIED,
            is_accepting_cases=True,
        )
        assert lawyer.is_referrable is True

    def test_is_referrable_false_scraped(self):
        lawyer = Lawyer(
            type=Lawyer.TYPE_SCRAPED,
            verification_status=Lawyer.STATUS_VERIFIED,
            is_accepting_cases=True,
        )
        assert lawyer.is_referrable is False

    def test_is_referrable_false_pending(self):
        lawyer = Lawyer(
            type=Lawyer.TYPE_REGISTERED,
            verification_status=Lawyer.STATUS_PENDING,
            is_accepting_cases=True,
        )
        assert lawyer.is_referrable is False

    def test_is_referrable_false_not_accepting(self):
        lawyer = Lawyer(
            type=Lawyer.TYPE_REGISTERED,
            verification_status=Lawyer.STATUS_VERIFIED,
            is_accepting_cases=False,
        )
        assert lawyer.is_referrable is False

    def test_specialization_str(self):
        spec = Specialization(name="labor", name_fr="Droit du travail")
        assert str(spec) == "labor"
