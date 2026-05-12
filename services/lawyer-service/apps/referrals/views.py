from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.lawyers.models import Lawyer
from .models import Referral
from .serializers import ReferralCreateSerializer, ReferralSerializer, ReferralActionSerializer
from .services import create_referral, accept_referral, decline_referral, resolve_referral


class CreateReferralView(APIView):
    """
    POST /api/v1/lawyers/{id}/referrals
    Citizen submits a referral request to a specific lawyer.
    JWT required. Fails with 403 if lawyer is not referrable.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, lawyer_id):
        serializer = ReferralCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            referral = create_referral(
                lawyer_id=lawyer_id,
                user_id=request.user.user_id,
                user_name=getattr(request.user, "full_name", "Unknown"),
                user_email=request.data.get("user_email", ""),
                issue_summary=serializer.validated_data["issue_summary"],
                domain=serializer.validated_data.get("domain", ""),
            )
        except Lawyer.DoesNotExist:
            return Response({"error": "Lawyer not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        return Response(ReferralSerializer(referral).data, status=status.HTTP_201_CREATED)


class LawyerReferralListView(APIView):
    """
    GET /api/v1/lawyers/me/referrals
    Lawyer sees all their referral requests. Optional filter: ?status=pending
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lawyer = get_object_or_404(Lawyer, user_id=request.user.user_id)
        qs = Referral.objects.filter(lawyer=lawyer).order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(ReferralSerializer(qs, many=True).data)


class LawyerReferralActionView(APIView):
    """
    PATCH /api/v1/lawyers/me/referrals/{id}
    Lawyer accepts or declines a pending referral.
    action=accept → contact_revealed=True, publishes referral.accepted
    action=decline → status=declined, no event
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, referral_id):
        serializer = ReferralActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        try:
            if action == "accept":
                referral = accept_referral(referral_id, request.user.user_id)
            else:
                referral = decline_referral(referral_id, request.user.user_id)
        except Referral.DoesNotExist:
            return Response({"error": "Referral not found."}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, PermissionError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ReferralSerializer(referral).data)


class ReferralDetailView(APIView):
    """
    GET /api/v1/referrals/{id}
    Returns referral status. Only the citizen or the lawyer can view it.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, referral_id):
        referral = get_object_or_404(Referral, id=referral_id)
        is_citizen = str(referral.user_id) == str(request.user.user_id)
        lawyer = Lawyer.objects.filter(user_id=request.user.user_id).first()
        is_lawyer = lawyer and referral.lawyer_id == lawyer.id
        if not (is_citizen or is_lawyer):
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        return Response(ReferralSerializer(referral).data)


class ReferralResolveView(APIView):
    """
    PATCH /api/v1/referrals/{id}/resolve
    Either party marks the referral resolved. Only accepted referrals can be resolved.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, referral_id):
        try:
            referral = resolve_referral(referral_id, request.user.user_id)
        except Referral.DoesNotExist:
            return Response({"error": "Referral not found."}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, PermissionError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ReferralSerializer(referral).data)
