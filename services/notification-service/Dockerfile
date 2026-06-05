FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

CMD ["sh", "-c", "alembic -c /app/alembic.ini upgrade head && gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 2"]

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
