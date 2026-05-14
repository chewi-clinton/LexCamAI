import logging
import requests
from django.conf import settings
from django.utils import timezone

from .models import AuditLog, PlatformStats

logger = logging.getLogger(__name__)

_INTERNAL_HEADERS = {"X-Internal-Key": settings.INTERNAL_SERVICE_KEY}


def log_audit(admin_user_id, action, target_type="", target_id=None, details=None):
    return AuditLog.objects.create(
        admin_user_id=admin_user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details or {},
    )


def _fetch_count(url):
    """Call an internal stats endpoint and return the count, or 0 on failure."""
    try:
        resp = requests.get(url, headers=_INTERNAL_HEADERS, timeout=5)
        resp.raise_for_status()
        return resp.json().get("count", 0)
    except Exception as exc:
        logger.warning("Could not fetch stats from %s: %s", url, exc)
        return None


def collect_platform_stats():
    """Query each service for live counts and upsert today's PlatformStats record."""
    today = timezone.now().date()

    total_users = _fetch_count(f"{settings.USER_MANAGEMENT_URL}/internal/stats/users")
    total_lawyers = _fetch_count(f"{settings.LAWYER_SERVICE_URL}/internal/stats/lawyers")
    total_docs = _fetch_count(f"{settings.DOCUMENT_SERVICE_URL}/internal/stats/documents")
    total_revenue = _fetch_count(f"{settings.PAYMENT_SERVICE_URL}/internal/stats/revenue")

    existing = PlatformStats.objects.filter(stat_date=today).first()
    defaults = {}
    if total_users is not None:
        defaults["total_users"] = total_users
    if total_lawyers is not None:
        defaults["total_verified_lawyers"] = total_lawyers
    if total_docs is not None:
        defaults["total_documents_generated"] = total_docs
    if total_revenue is not None:
        defaults["total_revenue_xaf"] = total_revenue

    if existing:
        for field, value in defaults.items():
            setattr(existing, field, value)
        existing.save()
        return existing
    else:
        return PlatformStats.objects.create(stat_date=today, **defaults)
