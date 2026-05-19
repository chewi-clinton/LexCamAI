from __future__ import annotations

import io
import json
import logging
from datetime import datetime, timezone

from django.conf import settings
from django.template.loader import render_to_string
from minio import Minio
from weasyprint import HTML

from .models import UserDocument

logger = logging.getLogger(__name__)


def _minio_client(public: bool = False) -> Minio:
    endpoint = settings.MINIO_PUBLIC_ENDPOINT if public else settings.MINIO_ENDPOINT
    return Minio(
        endpoint,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_USE_SSL,
    )


def _ensure_bucket(client: Minio) -> None:
    bucket = settings.MINIO_DOCUMENTS_BUCKET
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


def _normalize(form_data: dict) -> dict:
    """Add snake_case aliases so templates can use either naming convention."""
    d = dict(form_data)
    d.setdefault("employee_name", d.get("yourFullName", ""))
    d.setdefault("employer_name", d.get("employerName", ""))
    d.setdefault("amount_owed", d.get("amountOwed", ""))
    d.setdefault("city", d.get("yourAddress", ""))
    d.setdefault("work_period", d.get("lastDayWorked", ""))
    d.setdefault("date", datetime.now(timezone.utc).strftime("%d/%m/%Y"))
    d.setdefault("employer_address", d.get("employerAddress", ""))
    d.setdefault("contract_type", d.get("contractType", ""))
    d.setdefault("additional_context", d.get("additionalContext", ""))
    # housing / other templates
    d.setdefault("landlord_name", d.get("landlordName", ""))
    d.setdefault("landlord_address", d.get("landlordAddress", ""))
    d.setdefault("rent_amount", d.get("rentAmount", ""))
    d.setdefault("tenant_name", d.get("tenantName", d.get("yourFullName", "")))
    d.setdefault("property_address", d.get("propertyAddress", ""))
    return d


def generate_and_upload(doc: UserDocument) -> str:
    """Render template → PDF → MinIO. Returns a presigned download URL."""
    context = {"form_data": _normalize(doc.form_data)}
    html_string = render_to_string(doc.template.template_file, context)
    pdf_bytes = HTML(string=html_string).write_pdf()

    object_name = f"{doc.user_id}/{doc.id}.pdf"
    bucket = settings.MINIO_DOCUMENTS_BUCKET

    # Upload using internal endpoint
    internal = _minio_client(public=False)
    _ensure_bucket(internal)
    internal.put_object(
        bucket,
        object_name,
        io.BytesIO(pdf_bytes),
        length=len(pdf_bytes),
        content_type="application/pdf",
    )

    # Set public-read policy so browsers can fetch without signed URLs
    policy = json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"AWS": ["*"]},
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{bucket}/*"],
        }],
    })
    try:
        internal.set_bucket_policy(bucket, policy)
    except Exception:
        pass

    url = f"http://{settings.MINIO_PUBLIC_ENDPOINT}/{bucket}/{object_name}"
    logger.info("Uploaded document %s → %s", doc.id, object_name)
    return url
