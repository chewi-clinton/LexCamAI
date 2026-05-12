# Profiles app doesn't define a separate model — the User model in
# apps.authentication already contains all profile fields.
# This module exists as a placeholder for future profile-only models
# (e.g. lawyer profiles, document uploads).

from apps.authentication.models import User  # noqa: F401
