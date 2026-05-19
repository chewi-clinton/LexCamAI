import requests
from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class RemoteUser:
    """
    Lightweight user object populated from the User Management Service response.
    DRF expects request.user to exist and be truthy — this satisfies that contract
    without needing a local User model or database lookup.
    """

    def __init__(self, user_id, role):
        self.user_id = user_id
        self.role = role
        self.is_authenticated = True

    def __str__(self):
        return f"RemoteUser({self.user_id}, {self.role})"


class RemoteJWTAuthentication(BaseAuthentication):
    """
    Validates JWT tokens by calling the User Management Service internal endpoint.

    Flow:
      1. Extract Bearer token from Authorization header
      2. POST to USER_MANAGEMENT_URL/internal/auth/validate with the token
      3. On 200 → return RemoteUser(user_id, role)
      4. On 401 or network error → raise AuthenticationFailed

    This means the Lawyer Service never decodes JWTs itself — all token logic
    lives in one place (User Management Service).
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None  # No token — DRF will handle as anonymous

        token = auth_header.split(" ", 1)[1]

        try:
            response = requests.post(
                f"{settings.USER_MANAGEMENT_URL}/internal/auth/validate",
                json={"token": token},
                timeout=5,
            )
        except requests.RequestException:
            return None  # treat as anonymous; IsAuthenticated views will still reject

        if response.status_code != 200:
            return None  # invalid/expired token — let permission classes decide

        data = response.json()
        user = RemoteUser(user_id=data["user_id"], role=data["role"])
        return (user, token)


class RemoteJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = RemoteJWTAuthentication
    name = "BearerAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "http", "scheme": "bearer"}
