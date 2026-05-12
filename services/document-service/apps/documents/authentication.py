from __future__ import annotations

import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class RemoteUser:
    """Lightweight user object populated from the User Management validate response."""

    def __init__(self, user_id: str, role: str) -> None:
        self.user_id = user_id
        self.role = role
        self.is_authenticated = True

    def __str__(self) -> str:
        return str(self.user_id)


class RemoteJWTAuthentication(BaseAuthentication):
    """
    Validates JWTs by calling the User Management internal endpoint.
    POST {USER_MANAGEMENT_URL}/internal/auth/validate
    Expects 200 with {"user_id": "...", "role": "..."}
    """

    def authenticate(self, request: Request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return None

        validate_url = f"{settings.USER_MANAGEMENT_URL}/internal/auth/validate"
        try:
            response = requests.post(
                validate_url,
                json={"token": token},
                timeout=5,
            )
        except requests.RequestException as exc:
            raise AuthenticationFailed("User Management service unavailable.") from exc

        if response.status_code != 200:
            raise AuthenticationFailed("Invalid or expired token.")

        data = response.json()
        user_id = data.get("user_id")
        role = data.get("role", "")

        if not user_id:
            raise AuthenticationFailed("Invalid token payload.")

        return (RemoteUser(user_id, role), token)

    def authenticate_header(self, request: Request) -> str:
        return "Bearer"


class RemoteJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "apps.documents.authentication.RemoteJWTAuthentication"
    name = "RemoteJWTAuthentication"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }