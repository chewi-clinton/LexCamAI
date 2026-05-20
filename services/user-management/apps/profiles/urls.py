from django.urls import path
from .views import MeView, AdminStatsView, AdminUserListView

urlpatterns = [
    path("me", MeView.as_view(), name="profile-me"),
    path("admin/stats", AdminStatsView.as_view(), name="admin-user-stats"),
    path("admin/list", AdminUserListView.as_view(), name="admin-user-list"),
]
