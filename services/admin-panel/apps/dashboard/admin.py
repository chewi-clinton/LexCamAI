from django.contrib import admin
from django.utils import timezone
from .models import AuditLog, PlatformStats, FlaggedFeedback
from .services import log_audit


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "admin_user_id", "target_type", "target_id", "created_at"]
    list_filter = ["action"]
    search_fields = ["admin_user_id", "target_id"]
    readonly_fields = ["id", "admin_user_id", "action", "target_type", "target_id", "details", "created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PlatformStats)
class PlatformStatsAdmin(admin.ModelAdmin):
    list_display = ["stat_date", "total_users", "total_verified_lawyers", "total_documents_generated", "total_revenue_xaf", "recorded_at"]
    readonly_fields = ["id", "stat_date", "total_users", "total_verified_lawyers", "total_documents_generated", "total_revenue_xaf", "recorded_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(FlaggedFeedback)
class FlaggedFeedbackAdmin(admin.ModelAdmin):
    list_display = ["feedback_id", "session_id", "message_index", "reviewed", "reviewed_by", "created_at"]
    list_filter = ["reviewed"]
    readonly_fields = ["id", "feedback_id", "session_id", "message_index", "created_at"]
    actions = ["mark_reviewed"]

    def has_add_permission(self, request):
        return False

    @admin.action(description="Mark selected feedback as reviewed")
    def mark_reviewed(self, request, queryset):
        now = timezone.now()
        admin_user_id = None
        # Django Admin users don't have a UUID user_id — use pk as a string fallback
        try:
            admin_user_id = request.user.pk
        except Exception:
            pass

        updated = queryset.filter(reviewed=False).update(
            reviewed=True,
            reviewed_by=None,
            reviewed_at=now,
        )
        for obj in queryset:
            log_audit(
                admin_user_id=admin_user_id or "00000000-0000-0000-0000-000000000000",
                action=AuditLog.ACTION_REVIEW_FEEDBACK,
                target_type="feedback",
                target_id=obj.feedback_id,
            )
        self.message_user(request, f"{updated} feedback record(s) marked as reviewed.")
