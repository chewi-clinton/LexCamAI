import json
import logging

from django.db.models import Sum
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .events import publish_payment_confirmed, publish_payment_failed
from .models import Transaction
from .serializers import InitiatePaymentSerializer, TransactionSerializer
from .services import get_campay_payment_status, handle_webhook, initiate_payment, validate_webhook_signature

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data
        try:
            result = initiate_payment(
                user_id=request.user.user_id,
                document_id=d["document_id"],
                amount=d["amount"],
                phone_number=d["phone_number"],
                operator=d["operator"],
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logger.error("Payment initiation failed: %s", exc)
            return Response({"error": "Payment initiation failed."}, status=status.HTTP_502_BAD_GATEWAY)


class WebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        signature = request.headers.get("X-Campay-Signature", "")
        raw_body = request.body

        if not validate_webhook_signature(raw_body, signature):
            return Response({"error": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON."}, status=status.HTTP_400_BAD_REQUEST)

        campay_reference = payload.get("reference")
        campay_status = payload.get("status")

        if not campay_reference or not campay_status:
            return Response({"error": "Missing fields."}, status=status.HTTP_400_BAD_REQUEST)

        transaction = handle_webhook(campay_reference, campay_status, payload)

        if transaction is None:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        if transaction.status == Transaction.STATUS_CONFIRMED and not transaction.event_published:
            published = publish_payment_confirmed(transaction)
            if published:
                transaction.event_published = True
                transaction.save(update_fields=["event_published"])

        return Response({"status": "ok"})


class TransactionDetailView(APIView):
    def get(self, request, reference):
        try:
            transaction = Transaction.objects.get(
                internal_reference=reference,
                user_id=request.user.user_id,
            )
        except Transaction.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # If still pending, poll Campay directly so webhook is not required
        if transaction.status == Transaction.STATUS_PENDING and transaction.campay_reference:
            try:
                campay_status = get_campay_payment_status(transaction.campay_reference)
                if campay_status == "SUCCESSFUL":
                    transaction.status = Transaction.STATUS_CONFIRMED
                    transaction.save(update_fields=["status", "updated_at"])
                    if not transaction.event_published:
                        published = publish_payment_confirmed(transaction)
                        if published:
                            transaction.event_published = True
                            transaction.save(update_fields=["event_published"])
                elif campay_status in ("FAILED", "EXPIRED"):
                    transaction.status = Transaction.STATUS_FAILED
                    transaction.save(update_fields=["status", "updated_at"])
                    if not transaction.event_published:
                        published = publish_payment_failed(transaction)
                        if published:
                            transaction.event_published = True
                            transaction.save(update_fields=["event_published"])
            except Exception as exc:
                logger.warning("Campay status poll failed for %s: %s", reference, exc)

        return Response(TransactionSerializer(transaction).data)


class TransactionHistoryView(APIView):
    def get(self, request):
        transactions = Transaction.objects.filter(
            user_id=request.user.user_id
        ).order_by("-created_at")
        return Response(TransactionSerializer(transactions, many=True).data)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        result = Transaction.objects.filter(
            status=Transaction.STATUS_CONFIRMED
        ).aggregate(total=Sum("amount"))
        return Response({
            "total_revenue_xaf": result["total"] or 0,
        })
