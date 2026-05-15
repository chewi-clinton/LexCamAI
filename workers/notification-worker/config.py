import os

RABBITMQ_URL = os.environ["RABBITMQ_URL"]
USER_MANAGEMENT_URL = os.environ["USER_MANAGEMENT_URL"]
INTERNAL_SERVICE_KEY = os.environ["INTERNAL_SERVICE_KEY"]
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
FROM_EMAIL = os.environ.get("FROM_EMAIL", os.environ["SMTP_USER"])
