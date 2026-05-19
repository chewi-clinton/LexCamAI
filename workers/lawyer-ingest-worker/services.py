from __future__ import annotations

import logging
import requests
from typing import Iterable, List

import config

logger = logging.getLogger(__name__)


def normalize_key(name: str | None, city: str | None) -> str:
    n = (name or "").strip().lower()
    c = (city or "").strip().lower()
    return f"{n}||{c}"


def dedupe_lawyers(lawyers: Iterable[dict]) -> List[dict]:
    seen_emails: set[str] = set()
    seen_names: set[str] = set()
    out: list[dict] = []

    for lw in lawyers:
        email = (lw.get("email") or "").strip().lower()
        if email:
            if email in seen_emails:
                logger.debug("Dropping duplicate by email: %s", email)
                continue
            seen_emails.add(email)
            out.append(lw)
            continue

        key = normalize_key(lw.get("full_name"), lw.get("city"))
        if key in seen_names:
            logger.debug("Dropping duplicate by name+city: %s", key)
            continue
        seen_names.add(key)
        out.append(lw)

    return out


def validate_lawyer_record(record: dict) -> bool:
    # Minimal validation: require name and city and at least one contact (email or phone)
    name = record.get("full_name")
    city = record.get("city")
    email = record.get("email")
    phone = record.get("phone")
    if not name or not city:
        return False
    if not (email or phone):
        return False
    return True


def post_to_lawyer_service(lawyers: List[dict]) -> dict:
    """POST a list of lawyer objects to the internal ingest endpoint.

    Returns the JSON response or raises for HTTP errors.
    """
    url = f"{config.LAWYER_SERVICE_URL}/internal/lawyers/ingest"
    headers = {"X-Internal-Key": config.INTERNAL_SERVICE_KEY, "Content-Type": "application/json"}
    resp = requests.post(url, json={"lawyers": lawyers}, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def prepare_and_send(batch: List[dict]) -> dict:
    valid = [r for r in batch if validate_lawyer_record(r)]
    if not valid:
        logger.info("No valid lawyer records in batch")
        return {"inserted": 0, "skipped": len(batch)}

    deduped = dedupe_lawyers(valid)
    if not deduped:
        return {"inserted": 0, "skipped": len(batch)}

    logger.info("Sending %d lawyer records to Lawyer Service", len(deduped))
    resp = post_to_lawyer_service(deduped)
    return resp
