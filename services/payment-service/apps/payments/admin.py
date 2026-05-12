from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["internal_reference", "user_id", "amount", "operator", "status", "created_at"]
    list_filter = ["status", "operator"]
    search_fields = ["internal_reference", "campay_reference"]
    readonly_fields = ["id", "created_at", "updated_at"]
