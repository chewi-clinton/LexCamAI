import uuid
from django.db import models


class Specialization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    name_fr = models.CharField(max_length=100)

    class Meta:
        db_table = "specializations"

    def __str__(self):
        return self.name


class Lawyer(models.Model):
    TYPE_REGISTERED = "registered"
    TYPE_SCRAPED = "scraped"
    TYPE_CHOICES = [(TYPE_REGISTERED, "Registered"), (TYPE_SCRAPED, "Scraped")]

    STATUS_PENDING = "pending"
    STATUS_VERIFIED = "verified"
    STATUS_REJECTED = "rejected"
    STATUS_SUSPENDED = "suspended"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_VERIFIED, "Verified"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_SUSPENDED, "Suspended"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # user_id is null for scraped lawyers — they have no account on the platform
    user_id = models.UUIDField(null=True, blank=True, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True, default="")
    bio = models.TextField(blank=True, null=True)
    profile_photo_url = models.URLField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_REGISTERED)
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    # is_listed is false until admin verifies — controls public visibility
    is_listed = models.BooleanField(default=False)
    # is_accepting_cases is the lawyer's own availability toggle
    is_accepting_cases = models.BooleanField(default=True)
    source_url = models.URLField(blank=True, null=True)
    specializations = models.ManyToManyField(
        Specialization,
        through="LawyerSpecialization",
        related_name="lawyers",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lawyers"

    def __str__(self):
        return f"{self.full_name} ({self.type}, {self.verification_status})"

    @property
    def is_referrable(self):
        """True only when registered, verified, and accepting cases."""
        return (
            self.type == self.TYPE_REGISTERED
            and self.verification_status == self.STATUS_VERIFIED
            and self.is_accepting_cases
        )


class LawyerSpecialization(models.Model):
    lawyer = models.ForeignKey(Lawyer, on_delete=models.CASCADE)
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)

    class Meta:
        db_table = "lawyer_specializations"
        unique_together = ("lawyer", "specialization")


class LawyerDocument(models.Model):
    TYPE_BAR = "bar_certificate"
    TYPE_ID = "national_id"
    TYPE_DIPLOMA = "diploma"
    TYPE_CHOICES = [
        (TYPE_BAR, "Bar Certificate"),
        (TYPE_ID, "National ID"),
        (TYPE_DIPLOMA, "Diploma"),
    ]

    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lawyer = models.ForeignKey(Lawyer, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    file_url = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    class Meta:
        db_table = "lawyer_documents"
