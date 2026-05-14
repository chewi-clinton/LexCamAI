import requests
from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class RemoteUser:
    def __init__(self, user_id, role):
        self.user_id = user_id
        self.role = role
        self.is_authenticated = True

    def __str__(self):
        return f"RemoteUser({self.user_id}, {self.role})"


class RemoteJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]

        try:
            response = requests.post(
                f"{settings.USER_MANAGEMENT_URL}/internal/auth/validate",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,
            )
        except requests.RequestException:
            raise AuthenticationFailed("User Management Service unavailable.")

        if response.status_code != 200:
            raise AuthenticationFailed("Invalid or expired token.")

        data = response.json()
        return (RemoteUser(user_id=data["user_id"], role=data["role"]), token)


class RemoteJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = RemoteJWTAuthentication
    name = "BearerAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "http", "scheme": "bearer"}
