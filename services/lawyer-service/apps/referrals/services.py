from apps.lawyers.models import Lawyer
from .models import Referral
from .events import publish_referral_created, publish_referral_accepted, publish_referral_resolved


def create_referral(lawyer_id, user_id, user_name, user_email, issue_summary, domain=""):
    """
    Creates a referral request from a citizen to a lawyer.
    Raises ValueError if the lawyer is not referrable (scraped, unverified, or at capacity).
    """
    lawyer = Lawyer.objects.get(id=lawyer_id)
    if not lawyer.is_referrable:
        raise ValueError("This lawyer is not available for referrals.")

    referral = Referral.objects.create(
        lawyer=lawyer,
        user_id=user_id,
        user_name=user_name,
        user_email=user_email,
        issue_summary=issue_summary,
        domain=domain,
        status=Referral.STATUS_PENDING,
    )
    publish_referral_created(referral)
    return referral


def accept_referral(referral_id, lawyer_user_id):
    """
    Lawyer accepts a pending referral.
    Sets contact_revealed=True and publishes referral.accepted with lawyer contact details.
    Raises ValueError if referral is not pending or doesn't belong to this lawyer.
    """
    referral = Referral.objects.select_related("lawyer").get(id=referral_id)
    if str(referral.lawyer.user_id) != str(lawyer_user_id):
        raise PermissionError("This referral does not belong to you.")
    if referral.status != Referral.STATUS_PENDING:
        raise ValueError(f"Cannot accept a referral with status '{referral.status}'.")

    referral.status = Referral.STATUS_ACCEPTED
    referral.contact_revealed = True
    referral.save(update_fields=["status", "contact_revealed", "updated_at"])
    publish_referral_accepted(referral)
    return referral


def decline_referral(referral_id, lawyer_user_id):
    """
    Lawyer declines a pending referral. No event published.
    Raises ValueError if referral is not pending or doesn't belong to this lawyer.
    """
    referral = Referral.objects.select_related("lawyer").get(id=referral_id)
    if str(referral.lawyer.user_id) != str(lawyer_user_id):
        raise PermissionError("This referral does not belong to you.")
    if referral.status != Referral.STATUS_PENDING:
        raise ValueError(f"Cannot decline a referral with status '{referral.status}'.")

    referral.status = Referral.STATUS_DECLINED
    referral.save(update_fields=["status", "updated_at"])
    return referral


def resolve_referral(referral_id, user_id):
    """
    Either the citizen or the lawyer can mark a referral resolved.
    Only accepted referrals can be resolved.
    """
    referral = Referral.objects.select_related("lawyer").get(id=referral_id)
    is_citizen = str(referral.user_id) == str(user_id)
    is_lawyer = str(referral.lawyer.user_id) == str(user_id)
    if not (is_citizen or is_lawyer):
        raise PermissionError("You are not a party to this referral.")
    if referral.status != Referral.STATUS_ACCEPTED:
        raise ValueError(f"Cannot resolve a referral with status '{referral.status}'.")

    referral.status = Referral.STATUS_RESOLVED
    referral.save(update_fields=["status", "updated_at"])
    publish_referral_resolved(referral)
    return referral
