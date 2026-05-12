from __future__ import annotations

import uuid

from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from .models import DocumentTemplate, UserDocument


def create_document_request(
    user_id: str,
    template: DocumentTemplate,
    form_data: dict,
) -> UserDocument:
    """Create a new document request with awaiting_payment status."""
    doc = UserDocument.objects.create(
        user_id=uuid.UUID(str(user_id)),
        template=template,
        form_data=form_data,
        status=UserDocument.STATUS_AWAITING,
    )
    return doc


def get_user_document(doc_id: str, user_id: str) -> UserDocument:
    """Fetch a document, raising 404 if not found and 403 if not owner."""
    try:
        doc = UserDocument.objects.get(id=doc_id)
    except UserDocument.DoesNotExist:
        raise NotFound("Document not found.")

    if str(doc.user_id) != str(user_id):
        raise PermissionDenied("You do not have permission to access this document.")

    return doc


def mark_document_ready(doc_id: str, file_url: str) -> UserDocument:
    """Set document status to ready and save the file URL."""
    try:
        doc = UserDocument.objects.get(id=doc_id)
    except UserDocument.DoesNotExist:
        raise NotFound("Document not found.")

    doc.status = UserDocument.STATUS_READY
    doc.file_url = file_url
    doc.save(update_fields=["status", "file_url", "updated_at"])
    return doc


def mark_document_failed(doc_id: str) -> UserDocument:
    """Set document status to failed."""
    try:
        doc = UserDocument.objects.get(id=doc_id)
    except UserDocument.DoesNotExist:
        raise NotFound("Document not found.")

    doc.status = UserDocument.STATUS_FAILED
    doc.save(update_fields=["status", "updated_at"])
    return doc


def get_download_url(doc: UserDocument) -> str:
    """Return the file URL if ready, otherwise raise 403."""
    if doc.status != UserDocument.STATUS_READY:
        raise PermissionDenied("Document is not ready for download.")
    return doc.file_url