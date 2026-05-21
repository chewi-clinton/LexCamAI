from __future__ import annotations

from django.urls import path

from .views import (
    AdminStatsView,
    AdminTemplateEditView,
    AdminTemplateListView,
    AdminTemplateToggleView,
    DocumentGenerateBySlugView,
    TemplateDetailView,
    TemplateListView,
    UserDocumentDetailView,
    UserDocumentDownloadView,
    UserDocumentListCreateView,
)

urlpatterns = [
    path("documents/admin/stats/", AdminStatsView.as_view(), name="admin-document-stats"),
    path("documents/admin/templates/", AdminTemplateListView.as_view(), name="admin-template-list"),
    path("documents/admin/templates/<uuid:pk>/toggle/", AdminTemplateToggleView.as_view(), name="admin-template-toggle"),
    path("documents/admin/templates/<uuid:pk>/edit/", AdminTemplateEditView.as_view(), name="admin-template-edit"),
    path("templates/", TemplateListView.as_view(), name="template-list"),
    path("templates/<uuid:pk>/", TemplateDetailView.as_view(), name="template-detail"),
    path("documents/", UserDocumentListCreateView.as_view(), name="document-list-create"),
    path("documents/generate/<str:slug>/", DocumentGenerateBySlugView.as_view(), name="document-generate-slug"),
    path("documents/<uuid:pk>/", UserDocumentDetailView.as_view(), name="document-detail"),
    path("documents/<uuid:pk>/download/", UserDocumentDownloadView.as_view(), name="document-download"),
]