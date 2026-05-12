from django.urls import path
from .internal_views import ValidateTokenView

urlpatterns = [
    path("auth/validate", ValidateTokenView.as_view(), name="internal-validate-token"),
]
