from django.urls import path

from .views import InitiatePaymentView, TransactionDetailView, TransactionHistoryView, WebhookView

urlpatterns = [
    path("payments/initiate", InitiatePaymentView.as_view(), name="payment-initiate"),
    path("payments/webhook", WebhookView.as_view(), name="payment-webhook"),
    path("payments/history", TransactionHistoryView.as_view(), name="payment-history"),
    path("payments/<str:reference>/status", TransactionDetailView.as_view(), name="payment-status"),
    path("payments/<str:reference>", TransactionDetailView.as_view(), name="payment-detail"),
]
