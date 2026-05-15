from django.urls import path
from .internal_views import InternalUserDetailView, ValidateTokenView

urlpatterns = [
    path("auth/validate", ValidateTokenView.as_view(), name="internal-validate-token"),
    path("users/<uuid:pk>/", InternalUserDetailView.as_view(), name="internal-user-detail"),
]
