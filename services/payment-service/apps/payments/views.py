import json
import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .events import publish_payment_confirmed
from .models import Transaction
from .serializers import InitiatePaymentSerializer, TransactionSerializer
from .services import handle_webhook, initiate_payment, validate_webhook_signature

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
        return Response(TransactionSerializer(transaction).data)


class TransactionHistoryView(APIView):
    def get(self, request):
        transactions = Transaction.objects.filter(
            user_id=request.user.user_id
        ).order_by("-created_at")
        return Response(TransactionSerializer(transactions, many=True).data)
