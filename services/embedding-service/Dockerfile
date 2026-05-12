FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/cache \
    HF_HOME=/cache

WORKDIR /app

RUN useradd --create-home appuser \
    && mkdir -p /cache \
    && chown -R appuser:appuser /cache

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

USER appuser

ENV WEB_CONCURRENCY=1

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000", "--workers", "1", "--timeout", "120"]
