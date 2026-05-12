import logging
import requests
from django.core.cache import cache
from django.conf import settings
from minio import Minio
from minio.error import S3Error

from .models import Lawyer, LawyerDocument, Specialization
from .events import publish_lawyer_verified

logger = logging.getLogger(__name__)

RECOMMEND_CACHE_TTL = 300  # 5 minutes


def get_minio_client():
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_USE_SSL,
    )


def get_lawyers(city=None, region=None, specialization=None, lawyer_type=None):
    """
    Returns public lawyer listing — only is_listed=True lawyers.
    Supports filtering by city, region, specialization name, and type.
    """
    qs = Lawyer.objects.filter(is_listed=True).prefetch_related("specializations")
    if city:
        qs = qs.filter(city__iexact=city)
    if region:
        qs = qs.filter(region__iexact=region)
    if specialization:
        qs = qs.filter(specializations__name__iexact=specialization)
    if lawyer_type:
        qs = qs.filter(type=lawyer_type)
    return qs.distinct()


def _update_user_role(user_id):
    """Notify User Management to flip the user's role to 'lawyer' after profile creation."""
    try:
        requests.patch(
            f"{settings.USER_MANAGEMENT_URL}/internal/users/{user_id}/role",
            json={"role": "lawyer"},
            headers={"X-Internal-Key": settings.INTERNAL_SERVICE_KEY},
            timeout=5,
        )
    except requests.RequestException as exc:
        logger.warning("Failed to update role for user %s: %s", user_id, exc)


def register_lawyer(user_id, data):
    """
    Creates a new registered lawyer profile linked to a user account.
    Calls User Management to set role=lawyer after profile creation.
    Raises ValueError if this user already has a lawyer profile.
    """
    if Lawyer.objects.filter(user_id=user_id).exists():
        raise ValueError("A lawyer profile already exists for this user.")
    specialization_names = data.pop("specializations", [])
    lawyer = Lawyer.objects.create(user_id=user_id, type=Lawyer.TYPE_REGISTERED, **data)
    if specialization_names:
        specs = Specialization.objects.filter(name__in=specialization_names)
        lawyer.specializations.set(specs)
    _update_user_role(user_id)
    return lawyer


def update_lawyer(lawyer, data):
    """Updates editable profile fields and specializations."""
    specialization_names = data.pop("specializations", None)
    for attr, value in data.items():
        setattr(lawyer, attr, value)
    lawyer.save()
    if specialization_names is not None:
        specs = Specialization.objects.filter(name__in=specialization_names)
        lawyer.specializations.set(specs)
    return lawyer


def verify_lawyer(lawyer_id, new_status):
    """
    Admin action — update verification_status and adjust is_listed accordingly.
    verified → is_listed=True. rejected/suspended → is_listed=False.
    Publishes lawyer.verified event after update.
    """
    lawyer = Lawyer.objects.get(id=lawyer_id)
    lawyer.verification_status = new_status
    lawyer.is_listed = new_status == Lawyer.STATUS_VERIFIED
    lawyer.save(update_fields=["verification_status", "is_listed"])
    publish_lawyer_verified(lawyer)
    return lawyer


def upload_document(lawyer, file_obj, document_type, filename):
    """
    Uploads a verification document to MinIO.
    Path: lawyers/{lawyer_id}/{document_type}/{filename}
    Returns the MinIO object URL.
    """
    client = get_minio_client()
    bucket = settings.MINIO_DOCUMENTS_BUCKET
    object_name = f"lawyers/{lawyer.id}/{document_type}/{filename}"
    try:
        client.put_object(
            bucket_name=bucket,
            object_name=object_name,
            data=file_obj,
            length=-1,
            part_size=10 * 1024 * 1024,
        )
    except S3Error as exc:
        logger.error("MinIO upload failed: %s", exc)
        raise
    file_url = f"http://{settings.MINIO_ENDPOINT}/{bucket}/{object_name}"
    return LawyerDocument.objects.create(
        lawyer=lawyer,
        document_type=document_type,
        file_url=file_url,
    )


def ingest_scraped_lawyers(lawyers_data):
    """
    Bulk insert scraped lawyers. Deduplicates by email OR (full_name + city).
    Never overwrites registered lawyers.
    Returns (inserted_count, skipped_count).
    """
    inserted = 0
    skipped = 0
    for data in lawyers_data:
        email = data.get("email", "").strip().lower()
        full_name = data.get("full_name", "").strip()
        city = data.get("city", "").strip()

        # Skip if email matches any existing lawyer (registered or scraped)
        if email and Lawyer.objects.filter(email__iexact=email).exists():
            skipped += 1
            continue
        # Skip if name + city match an existing lawyer
        if Lawyer.objects.filter(full_name__iexact=full_name, city__iexact=city).exists():
            skipped += 1
            continue

        required = ["full_name", "phone", "city"]
        if not all(data.get(f) for f in required):
            skipped += 1
            continue

        Lawyer.objects.create(
            full_name=full_name,
            email=email,
            phone=data.get("phone", ""),
            city=city,
            region=data.get("region", ""),
            source_url=data.get("source_url"),
            type=Lawyer.TYPE_SCRAPED,
            verification_status=Lawyer.STATUS_VERIFIED,
            is_listed=True,
        )
        inserted += 1

    return inserted, skipped


def get_recommendations(domain, city):
    """
    Returns lawyers filtered by specialization domain and city.
    Checks Redis cache first (populated by matching.requested consumer).
    Falls back to a fresh DB query on cache miss.
    """
    cache_key = f"recommend:{domain}:{city}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    qs = Lawyer.objects.filter(
        is_listed=True,
        is_accepting_cases=True,
        verification_status=Lawyer.STATUS_VERIFIED,
        city__iexact=city,
        specializations__name__iexact=domain,
    ).distinct().values("id", "full_name", "email", "phone", "city")

    result = list(qs)
    cache.set(cache_key, result, timeout=RECOMMEND_CACHE_TTL)
    return result
