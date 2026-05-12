from .base import *  # noqa

DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["*"]

# Use console email backend in dev if SMTP not configured
if not config("SMTP_USER", default=""):
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
