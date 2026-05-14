from django.urls import path
from .views import TriggerScraperView, StatsView, AuditLogListView

urlpatterns = [
    path("admin/scraper/trigger", TriggerScraperView.as_view(), name="trigger-scraper"),
    path("admin/stats", StatsView.as_view(), name="admin-stats"),
    path("admin/audit-logs", AuditLogListView.as_view(), name="audit-logs"),
]
