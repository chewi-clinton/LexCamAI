FROM mcr.microsoft.com/devcontainers/python:1-3.11-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/cache \
    HF_HOME=/cache

ARG MODEL_NAME=intfloat/multilingual-e5-small
ENV MODEL_NAME=${MODEL_NAME}
ARG MODEL_URL
ARG MODEL_SHA256=

WORKDIR /app

RUN useradd --create-home appuser \
    && mkdir -p /cache \
    && chown -R appuser:appuser /cache

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python3 - <<'PY'
import hashlib
import os
import pathlib
import urllib.request

model_url = os.environ.get("MODEL_URL", "").strip()
if not model_url:
    raise SystemExit(
        "MODEL_URL build arg is required. Point it at the externally stored model artifact."
    )

expected_sha256 = os.environ.get("MODEL_SHA256", "").strip().lower()
target = pathlib.Path("/cache/model.onnx")
target.parent.mkdir(parents=True, exist_ok=True)

hasher = hashlib.sha256() if expected_sha256 else None
with urllib.request.urlopen(model_url) as response, target.open("wb") as output_file:
    while True:
        chunk = response.read(1024 * 1024)
        if not chunk:
            break
        output_file.write(chunk)
        if hasher:
            hasher.update(chunk)

if hasher and hasher.hexdigest().lower() != expected_sha256:
    target.unlink(missing_ok=True)
    raise SystemExit(
        f"MODEL_SHA256 mismatch for {target}: expected {expected_sha256}, got {hasher.hexdigest().lower()}"
    )

print(f"Downloaded external model artifact to {target}")
PY

COPY app ./app

EXPOSE 8000

USER appuser

ENV WEB_CONCURRENCY=1

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000", "--workers", "1", "--timeout", "120"]
