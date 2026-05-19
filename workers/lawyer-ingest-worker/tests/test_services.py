from __future__ import annotations

import pytest

import os
import importlib.util


# Load the services module directly from the worker package path (directory name has a dash)
HERE = os.path.dirname(__file__)
WORKER_DIR = os.path.abspath(os.path.join(HERE, ".."))
# Ensure the worker directory is on sys.path so its local `config` module can be imported
import sys
sys.path.insert(0, WORKER_DIR)

SERVICES_PY = os.path.join(WORKER_DIR, "services.py")
spec = importlib.util.spec_from_file_location("lawyer_ingest_services", SERVICES_PY)
services = importlib.util.module_from_spec(spec)
spec.loader.exec_module(services)


def test_validate_lawyer_record_requires_name_city_and_contact():
    assert not services.validate_lawyer_record({})
    assert not services.validate_lawyer_record({"full_name": "Alice"})
    assert not services.validate_lawyer_record({"full_name": "Alice", "city": "Douala"})
    assert services.validate_lawyer_record({"full_name": "Alice", "city": "Douala", "email": "a@x.com"})
    assert services.validate_lawyer_record({"full_name": "Alice", "city": "Douala", "phone": "+23760000000"})


def test_dedupe_lawyers_by_email_and_name_city():
    input_list = [
        {"full_name": "Bob", "city": "Yaounde", "email": "bob@example.com"},
        {"full_name": "Bob", "city": "Yaounde", "email": "bob@example.com"},
        {"full_name": "Claire", "city": "Bafoussam", "phone": "123"},
        {"full_name": "Claire", "city": "Bafoussam", "phone": "456"},
        {"full_name": "Dan", "city": "Buea"},
    ]

    out = services.dedupe_lawyers(input_list)
    # Expect duplicates removed; last record lacking contact should be kept by name dedupe rules only if unique
    emails = [r.get("email") for r in out if r.get("email")]
    assert emails.count("bob@example.com") == 1
    names = [services.normalize_key(r.get("full_name"), r.get("city")) for r in out]
    assert services.normalize_key("Claire", "Bafoussam") in names


def test_prepare_and_send_calls_post(monkeypatch):
    batch = [
        {"full_name": "Eve", "city": "Kribi", "email": "eve@example.com"},
        {"full_name": "Frank", "city": "Bamenda", "phone": "+2376"},
    ]

    called = {}

    def fake_post_to_lawyer_service(payload):
        called["payload"] = payload
        return {"inserted": len(payload), "skipped": 0}

    monkeypatch.setattr(services, "post_to_lawyer_service", fake_post_to_lawyer_service)

    resp = services.prepare_and_send(batch)
    assert resp.get("inserted") == 2
    assert "payload" in called
