from django.urls import path
from .views import (
    LawyerListView, LawyerDetailView, LawyerRegisterView,
    LawyerMeView, LawyerDocumentUploadView, LawyerDocumentListView,
    AdminLawyerListView, AdminLawyerVerifyView, AdminLawyerDocumentsView,
)

urlpatterns = [
    path("lawyers", LawyerListView.as_view(), name="lawyer-list"),
    path("lawyers/register", LawyerRegisterView.as_view(), name="lawyer-register"),
    path("lawyers/me", LawyerMeView.as_view(), name="lawyer-me"),
    path("lawyers/me/documents", LawyerDocumentUploadView.as_view(), name="lawyer-doc-upload"),
    path("lawyers/me/documents/list", LawyerDocumentListView.as_view(), name="lawyer-doc-list"),
    path("lawyers/<uuid:lawyer_id>", LawyerDetailView.as_view(), name="lawyer-detail"),
    path("admin/lawyers", AdminLawyerListView.as_view(), name="admin-lawyer-list"),
    path("admin/lawyers/<uuid:lawyer_id>/verify", AdminLawyerVerifyView.as_view(), name="admin-lawyer-verify"),
    path("admin/lawyers/<uuid:lawyer_id>/documents", AdminLawyerDocumentsView.as_view(), name="admin-lawyer-documents"),
]
