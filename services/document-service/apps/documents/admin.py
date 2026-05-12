from django.contrib import admin
from .models import DocumentTemplate, DocumentField, UserDocument


class DocumentFieldInline(admin.TabularInline):
    model = DocumentField
    extra = 0


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ["slug", "name_fr", "price_xaf", "is_active"]
    inlines = [DocumentFieldInline]


@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ["id", "user_id", "template", "status", "created_at"]
    list_filter = ["status"]
