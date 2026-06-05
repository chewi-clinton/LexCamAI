FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8010

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8010", "--workers", "3", "--timeout", "60"]

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
