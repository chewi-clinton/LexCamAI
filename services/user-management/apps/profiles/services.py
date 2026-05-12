from django.contrib.auth import get_user_model

User = get_user_model()

ANONYMISED_EMAIL_TEMPLATE = "deleted_{id}@lexcam.invalid"
ANONYMISED_NAME = "Deleted User"
ANONYMISED_PHONE = None


def anonymise_user(user: "User") -> None:
    """
    Replace PII with placeholder values and deactivate the account.
    Does not hard-delete the row.
    """
    user.email = ANONYMISED_EMAIL_TEMPLATE.format(id=str(user.id))
    user.full_name = ANONYMISED_NAME
    user.phone = ANONYMISED_PHONE
    user.is_active = False
    user.save(update_fields=["email", "full_name", "phone", "is_active"])
