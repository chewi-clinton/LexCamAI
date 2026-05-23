from __future__ import annotations

from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY", default="dev-secret-key-change-in-production")

DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS", default="*", cast=lambda v: [s.strip() for s in v.split(",")]
)

INSTALLED_APPS = [
    "django_prometheus",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "rest_framework",
    "drf_spectacular",
    "apps.documents",
]

APPEND_SLASH = False

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.jinja2.Jinja2",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "environment": "apps.documents.jinja2.environment",
        },
    },
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="lexcam_documents"),
        "USER": config("DB_USER", default="postgres"),
        "PASSWORD": config("DB_PASSWORD", default="postgres"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.documents.authentication.RemoteJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "LexCam Document Service",
    "DESCRIPTION": "Document generation microservice for the LexCam platform.",
    "VERSION": "1.0.0",
}

# Internal service auth
USER_MANAGEMENT_URL = config("USER_MANAGEMENT_URL", default="http://localhost:8001")
INTERNAL_SERVICE_KEY = config("INTERNAL_SERVICE_KEY", default="dev-internal-key")

# RabbitMQ
RABBITMQ_URL = config("RABBITMQ_URL", default="amqp://guest:guest@localhost:5672/")

# MinIO
MINIO_ENDPOINT = config("MINIO_ENDPOINT", default="localhost:9000")
MINIO_PUBLIC_ENDPOINT = config("MINIO_PUBLIC_ENDPOINT", default="localhost:9000")
MINIO_ACCESS_KEY = config("MINIO_ACCESS_KEY", default="lexcam")
MINIO_SECRET_KEY = config("MINIO_SECRET_KEY", default="lexcam_dev123")
MINIO_DOCUMENTS_BUCKET = config("MINIO_DOCUMENTS_BUCKET", default="lexcam-documents")
MINIO_USE_SSL = config("MINIO_USE_SSL", default=False, cast=bool)