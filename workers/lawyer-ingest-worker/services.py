from __future__ import annotations

import logging

import requests

import config

logger = logging.getLogger(__name__)

_INTERNAL_HEADERS = {"X-Internal-Key": config.INTERNAL_SERVICE_KEY}


def _clean_text(value: str) -> str:
    return value.strip()


def _clean_email(value: str) -> str:
    return value.strip().lower()


def validate_lawyer_record(record: dict) -> tuple[bool, dict]:
    full_name = _clean_text(record.get("full_name") or record.get("name") or "")
    city = _clean_text(record.get("city") or "")
    email = _clean_email(record.get("email") or "")
    phone = _clean_text(record.get("phone") or "")

    if not full_name or not city or (not email and not phone):
        return False, {}

    normalized = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "city": city,
        "region": _clean_text(record.get("region") or ""),
        "source_url": record.get("source_url") or record.get("source"),
    }
    return True, normalized


def dedupe_lawyers_by_email_and_name_city(lawyers: list[dict]) -> tuple[list[dict], int]:
    seen_email = set()
    seen_name_city = set()
    deduped = []
    skipped = 0

    for lawyer in lawyers:
        email = _clean_email(lawyer.get("email") or "")
        name = _clean_text(lawyer.get("full_name") or "")
        city = _clean_text(lawyer.get("city") or "")
        name_city_key = f"{name.lower()}::{city.lower()}" if name and city else ""

        if email and email in seen_email:
            skipped += 1
            continue
        if name_city_key and name_city_key in seen_name_city:
            skipped += 1
            continue

        if email:
            seen_email.add(email)
        if name_city_key:
            seen_name_city.add(name_city_key)

        deduped.append(lawyer)

    return deduped, skipped


def prepare_lawyers_for_ingest(lawyers: list[dict]) -> tuple[list[dict], int, int]:
    valid = []
    invalid = 0

    for record in lawyers:
        ok, normalized = validate_lawyer_record(record)
        if not ok:
            invalid += 1
            continue
        valid.append(normalized)

    deduped, duplicates = dedupe_lawyers_by_email_and_name_city(valid)
    return deduped, invalid, duplicates


def send_ingest_request(lawyers: list[dict]) -> dict:
    resp = requests.post(
        f"{config.LAWYER_SERVICE_URL}/internal/lawyers/ingest",
        json={"lawyers": lawyers},
        headers=_INTERNAL_HEADERS,
        timeout=config.REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def prepare_and_send(lawyers: list[dict]) -> dict:
    prepared, invalid_count, duplicate_count = prepare_lawyers_for_ingest(lawyers)
    if not prepared:
        return {
            "inserted": 0,
            "skipped": 0,
            "invalid": invalid_count,
            "duplicates": duplicate_count,
        }

    result = send_ingest_request(prepared)
    return {
        "inserted": result.get("inserted", 0),
        "skipped": result.get("skipped", 0),
        "invalid": invalid_count,
        "duplicates": duplicate_count,
    }
