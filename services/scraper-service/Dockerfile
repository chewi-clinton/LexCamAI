FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

# Overwrite resolv.conf at startup to bypass Docker Desktop's flaky embedded DNS,
# then run migrations and start the server.
CMD ["sh", "-c", "printf 'nameserver 8.8.8.8\\nnameserver 8.8.4.4\\n' > /etc/resolv.conf && alembic -c /app/alembic.ini upgrade head && gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 2"]
