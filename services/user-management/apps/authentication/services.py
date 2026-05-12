from __future__ import annotations

import hashlib
import random
import string
import uuid
from datetime import timedelta

import bcrypt
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken as SimpleJWTRefreshToken

from .models import RefreshToken, User


# ---------------------------------------------------------------------------
# OTP helpers (Redis-only)
# ---------------------------------------------------------------------------

OTP_TTL = settings.OTP_EXPIRE_MINUTES * 60  # seconds


def _otp_cache_key(user_id: str, otp_type: str) -> str:
    return f"otp:{user_id}:{otp_type}"


def generate_otp(user_id: str, otp_type: str) -> str:
    """Generate a 6-digit OTP, store in Redis and return the code."""
    code = "".join(random.choices(string.digits, k=6))
    key = _otp_cache_key(str(user_id), otp_type)
    cache.set(key, code, timeout=OTP_TTL)
    return code


def verify_otp(user_id: str, otp_type: str, code: str) -> bool:
    """Check the OTP. Deletes on success (single-use). Returns True if valid."""
    key = _otp_cache_key(str(user_id), otp_type)
    stored = cache.get(key)
    if stored is None:
        return False  # expired or already used
    if stored != code:
        return False
    cache.delete(key)
    return True


def delete_otp(user_id: str, otp_type: str) -> None:
    key = _otp_cache_key(str(user_id), otp_type)
    cache.delete(key)


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plain-text password."""
    hashed = bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def generate_access_token(user: User) -> str:
    token = AccessToken.for_user(user)
    token["role"] = user.role
    return str(token)


def generate_refresh_token_pair(user: User) -> tuple[str, "RefreshToken"]:
    """
    Generate a raw refresh token string, hash it, persist to DB and return
    (raw_token, RefreshToken model instance).
    """
    raw_token = str(uuid.uuid4())
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = timezone.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_token = RefreshToken.objects.create(
        user=user,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    return raw_token, db_token


def validate_refresh_token(raw_token: str) -> "RefreshToken | None":
    """Return the DB RefreshToken if valid, else None."""
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    try:
        db_token = RefreshToken.objects.select_related("user").get(
            token_hash=token_hash,
            revoked=False,
        )
    except RefreshToken.DoesNotExist:
        return None
    if db_token.expires_at < timezone.now():
        return None
    return db_token


def revoke_refresh_token(raw_token: str) -> bool:
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    updated = RefreshToken.objects.filter(token_hash=token_hash, revoked=False).update(revoked=True)
    return updated > 0


# ---------------------------------------------------------------------------
# JWT validation (for internal endpoint)
# ---------------------------------------------------------------------------

def validate_access_token(raw_token: str) -> dict | None:
    """
    Validate a JWT access token.
    Returns {"user_id": str, "role": str} or None if invalid/expired.
    """
    try:
        token = AccessToken(raw_token)
        return {
            "user_id": str(token["user_id"]),
            "role": token.get("role", "user"),
        }
    except Exception:
        return None
