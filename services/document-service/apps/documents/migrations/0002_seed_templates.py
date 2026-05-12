import uuid
from django.db import migrations


TEMPLATES = [
    {
        "slug": "mise-en-demeure-salaire",
        "name_fr": "Mise en Demeure — Salaire Impayé",
        "name_en": "Formal Notice — Unpaid Wages",
        "description_fr": "Lettre formelle exigeant le paiement de salaires impayés.",
        "description_en": "Formal letter demanding payment of unpaid wages.",
        "template_file": "documents/mise-en-demeure-salaire.html",
        "price_xaf": 2000,
        "fields": [
            ("employee_name", "text", "Nom de l'employé", "Employee Name", True, 1),
            ("employer_name", "text", "Nom de l'employeur", "Employer Name", True, 2),
            ("amount_owed", "number", "Montant dû (FCFA)", "Amount Owed (XAF)", True, 3),
            ("work_period", "text", "Période de travail", "Work Period", True, 4),
            ("city", "text", "Ville", "City", True, 5),
        ],
    },
    {
        "slug": "mise-en-demeure-logement",
        "name_fr": "Mise en Demeure — Logement",
        "name_en": "Formal Notice — Housing",
        "description_fr": "Lettre formelle adressée au bailleur pour un problème de logement.",
        "description_en": "Formal letter to landlord regarding a housing issue.",
        "template_file": "documents/mise-en-demeure-logement.html",
        "price_xaf": 2000,
        "fields": [
            ("tenant_name", "text", "Nom du locataire", "Tenant Name", True, 1),
            ("landlord_name", "text", "Nom du bailleur", "Landlord Name", True, 2),
            ("issue_description", "textarea", "Description du problème", "Issue Description", True, 3),
            ("property_address", "text", "Adresse du bien", "Property Address", True, 4),
            ("city", "text", "Ville", "City", True, 5),
        ],
    },
    {
        "slug": "lettre-reclamation",
        "name_fr": "Lettre de Réclamation",
        "name_en": "Complaint Letter",
        "description_fr": "Lettre officielle pour formuler une réclamation.",
        "description_en": "Official letter to file a complaint or claim.",
        "template_file": "documents/lettre-reclamation.html",
        "price_xaf": 1500,
        "fields": [
            ("sender_name", "text", "Votre nom", "Your Name", True, 1),
            ("recipient_name", "text", "Destinataire", "Recipient", True, 2),
            ("claim_description", "textarea", "Description de la réclamation", "Claim Description", True, 3),
            ("amount", "number", "Montant (FCFA) — optionnel", "Amount (XAF) — optional", False, 4),
            ("city", "text", "Ville", "City", True, 5),
        ],
    },
    {
        "slug": "denonciation-conge",
        "name_fr": "Dénonciation de Congé",
        "name_en": "Notice to Vacate",
        "description_fr": "Lettre de préavis de départ adressée au bailleur.",
        "description_en": "Notice to vacate letter addressed to the landlord.",
        "template_file": "documents/denonciation-conge.html",
        "price_xaf": 1500,
        "fields": [
            ("tenant_name", "text", "Nom du locataire", "Tenant Name", True, 1),
            ("landlord_name", "text", "Nom du bailleur", "Landlord Name", True, 2),
            ("notice_date", "date", "Date du préavis", "Notice Date", True, 3),
            ("vacate_date", "date", "Date de départ", "Vacate Date", True, 4),
            ("property_address", "text", "Adresse du bien", "Property Address", True, 5),
        ],
    },
    {
        "slug": "declaration-faits",
        "name_fr": "Déclaration de Faits",
        "name_en": "Declaration of Facts",
        "description_fr": "Déclaration sur l'honneur attestant des faits.",
        "description_en": "Sworn declaration attesting to facts.",
        "template_file": "documents/declaration-faits.html",
        "price_xaf": 1000,
        "fields": [
            ("declarant_name", "text", "Nom du déclarant", "Declarant Name", True, 1),
            ("national_id", "text", "Numéro CNI", "National ID Number", True, 2),
            ("facts_description", "textarea", "Description des faits", "Description of Facts", True, 3),
            ("declaration_date", "date", "Date de la déclaration", "Declaration Date", True, 4),
            ("city", "text", "Ville", "City", True, 5),
        ],
    },
]


def seed_templates(apps, schema_editor):
    DocumentTemplate = apps.get_model("documents", "DocumentTemplate")
    DocumentField = apps.get_model("documents", "DocumentField")

    for tpl in TEMPLATES:
        fields = tpl.pop("fields")
        template = DocumentTemplate.objects.create(id=uuid.uuid4(), **tpl)
        for field_key, field_type, label_fr, label_en, required, order in fields:
            DocumentField.objects.create(
                id=uuid.uuid4(),
                template=template,
                field_key=field_key,
                field_type=field_type,
                label_fr=label_fr,
                label_en=label_en,
                required=required,
                order=order,
            )


def unseed_templates(apps, schema_editor):
    DocumentTemplate = apps.get_model("documents", "DocumentTemplate")
    slugs = [t["slug"] for t in TEMPLATES]
    DocumentTemplate.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_templates, reverse_code=unseed_templates),
    ]
