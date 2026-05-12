from __future__ import annotations

from django.urls import path

from .views import (
    TemplateDetailView,
    TemplateListView,
    UserDocumentDetailView,
    UserDocumentDownloadView,
    UserDocumentListCreateView,
)

urlpatterns = [
    path("templates/", TemplateListView.as_view(), name="template-list"),
    path("templates/<uuid:pk>/", TemplateDetailView.as_view(), name="template-detail"),
    path("documents/", UserDocumentListCreateView.as_view(), name="document-list-create"),
    path("documents/<uuid:pk>/", UserDocumentDetailView.as_view(), name="document-detail"),
    path("documents/<uuid:pk>/download/", UserDocumentDownloadView.as_view(), name="document-download"),
]