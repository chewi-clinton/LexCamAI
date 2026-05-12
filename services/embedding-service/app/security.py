from __future__ import annotations

from fastapi import Header, HTTPException

from app.config import settings


def verify_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> None:
    if not settings.require_api_key:
        return

    if not settings.api_key:
        raise HTTPException(
            status_code=500,
            detail="API key auth enabled but API_KEY not set",
        )

    if x_api_key == settings.api_key:
        return

    if authorization and authorization.startswith("Bearer "):
        if authorization.removeprefix("Bearer ") == settings.api_key:
            return

    raise HTTPException(status_code=401, detail="Unauthorized")
