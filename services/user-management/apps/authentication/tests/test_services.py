import pytest
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

from apps.authentication.services import (
    generate_otp,
    verify_otp,
    delete_otp,
    hash_password,
    check_password,
    generate_access_token,
    generate_refresh_token_pair,
    validate_refresh_token,
    revoke_refresh_token,
    validate_access_token,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# OTP tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestOTP:
    def test_generate_otp_returns_6_digits(self):
        code = generate_otp("user-123", "email_verify")
        assert len(code) == 6
        assert code.isdigit()

    def test_verify_otp_success(self):
        code = generate_otp("user-abc", "email_verify")
        assert verify_otp("user-abc", "email_verify", code) is True

    def test_verify_otp_wrong_code(self):
        generate_otp("user-xyz", "email_verify")
        assert verify_otp("user-xyz", "email_verify", "000000") is False

    def test_verify_otp_single_use(self):
        code = generate_otp("user-once", "email_verify")
        assert verify_otp("user-once", "email_verify", code) is True
        # Second attempt should fail (key deleted)
        assert verify_otp("user-once", "email_verify", code) is False

    def test_verify_otp_missing_key(self):
        assert verify_otp("nonexistent", "email_verify", "123456") is False

    def test_delete_otp(self):
        code = generate_otp("user-del", "password_reset")
        delete_otp("user-del", "password_reset")
        assert verify_otp("user-del", "password_reset", code) is False


# ---------------------------------------------------------------------------
# Password tests
# ---------------------------------------------------------------------------

class TestPassword:
    def test_hash_password_is_not_plain(self):
        hashed = hash_password("mysecret")
        assert hashed != "mysecret"

    def test_hash_starts_with_bcrypt_prefix(self):
        hashed = hash_password("mysecret")
        assert hashed.startswith("$2b$")

    def test_check_password_correct(self):
        hashed = hash_password("correct")
        assert check_password("correct", hashed) is True

    def test_check_password_wrong(self):
        hashed = hash_password("correct")
        assert check_password("wrong", hashed) is False

    def test_same_password_different_hashes(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2  # bcrypt salt


# ---------------------------------------------------------------------------
# JWT tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestJWT:
    @pytest.fixture
    def user(self, db):
        return User.objects.create_user(
            email="jwt@example.com",
            full_name="JWT User",
            password="pass1234",
        )

    def test_generate_access_token(self, user):
        token = generate_access_token(user)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_validate_access_token(self, user):
        token = generate_access_token(user)
        result = validate_access_token(token)
        assert result is not None
        assert result["user_id"] == str(user.id)
        assert result["role"] == user.role

    def test_validate_invalid_token(self):
        result = validate_access_token("not.a.valid.token")
        assert result is None

    def test_generate_refresh_token_pair(self, user):
        raw, db_token = generate_refresh_token_pair(user)
        assert isinstance(raw, str)
        assert db_token.user == user
        assert db_token.revoked is False

    def test_validate_refresh_token(self, user):
        raw, _ = generate_refresh_token_pair(user)
        db_token = validate_refresh_token(raw)
        assert db_token is not None
        assert db_token.user == user

    def test_validate_wrong_refresh_token(self):
        result = validate_refresh_token("fake-token-xyz")
        assert result is None

    def test_revoke_refresh_token(self, user):
        raw, _ = generate_refresh_token_pair(user)
        assert revoke_refresh_token(raw) is True
        assert validate_refresh_token(raw) is None

    def test_revoke_nonexistent_token(self):
        assert revoke_refresh_token("does-not-exist") is False
