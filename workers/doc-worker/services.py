from __future__ import annotations

import io
import json
import logging
import os

import requests
from jinja2 import Environment, FileSystemLoader
from minio import Minio

import config

logger = logging.getLogger(__name__)

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
_jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

_minio = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=config.MINIO_SECURE,
)

_INTERNAL_HEADERS = {"X-Internal-Key": config.INTERNAL_SERVICE_KEY}


def get_document(document_id: str) -> dict:
    resp = requests.get(
        f"{config.DOCUMENT_SERVICE_URL}/internal/documents/{document_id}",
        headers=_INTERNAL_HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def get_user_email(user_id: str) -> str:
    resp = requests.get(
        f"{config.USER_MANAGEMENT_URL}/internal/users/{user_id}/",
        headers=_INTERNAL_HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["email"]


def render_pdf(template_slug: str, form_data: dict) -> bytes:
    from weasyprint import HTML
    from datetime import date as _date
    template = _jinja_env.get_template(f"{template_slug}.html")
    ctx = {"date": _date.today().strftime("%-d %B %Y"), **form_data}
    html = template.render(**ctx)
    return HTML(string=html).write_pdf()


def upload_to_minio(user_id: str, document_id: str, pdf_bytes: bytes) -> str:
    object_name = f"{user_id}/{document_id}.pdf"
    bucket = config.MINIO_DOCUMENTS_BUCKET
    if not _minio.bucket_exists(bucket):
        _minio.make_bucket(bucket)
    _minio.put_object(
        bucket,
        object_name,
        io.BytesIO(pdf_bytes),
        length=len(pdf_bytes),
        content_type="application/pdf",
    )
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
        _minio.set_bucket_policy(bucket, policy)
    except Exception:
        pass
    return f"https://{config.MINIO_PUBLIC_ENDPOINT}/{bucket}/{object_name}"


def mark_document_ready(document_id: str, file_url: str) -> None:
    resp = requests.post(
        f"{config.DOCUMENT_SERVICE_URL}/internal/documents/{document_id}/mark-ready",
        json={"file_url": file_url},
        headers=_INTERNAL_HEADERS,
        timeout=10,
    )
    resp.raise_for_status()


def process_payment_confirmed(user_id: str, document_id: str) -> tuple[str, str]:
    """Returns (file_url, user_email)."""
    doc = get_document(document_id)
    pdf_bytes = render_pdf(doc["template_slug"], doc["form_data"])
    file_url = upload_to_minio(user_id, document_id, pdf_bytes)
    mark_document_ready(document_id, file_url)
    user_email = get_user_email(user_id)
    return file_url, user_email
