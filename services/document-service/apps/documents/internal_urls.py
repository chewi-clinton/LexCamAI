from __future__ import annotations

from django.urls import path

from .views import InternalMarkReadyView

urlpatterns = [
    path(
        "documents/<uuid:pk>/mark-ready/",
        InternalMarkReadyView.as_view(),
        name="internal-mark-ready",
    ),
]