from django.urls import path
from .views import (
    CreateReferralView, LawyerReferralListView, LawyerReferralActionView,
    ReferralDetailView, ReferralResolveView,
)

urlpatterns = [
    path("lawyers/<uuid:lawyer_id>/referrals", CreateReferralView.as_view(), name="referral-create"),
    path("lawyers/me/referrals", LawyerReferralListView.as_view(), name="lawyer-referral-list"),
    path("lawyers/me/referrals/<uuid:referral_id>", LawyerReferralActionView.as_view(), name="lawyer-referral-action"),
    path("referrals/<uuid:referral_id>", ReferralDetailView.as_view(), name="referral-detail"),
    path("referrals/<uuid:referral_id>/resolve", ReferralResolveView.as_view(), name="referral-resolve"),
]
