from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404

from .models import Lawyer, LawyerDocument, Specialization
from .serializers import (
    LawyerPublicSerializer, LawyerRegisterSerializer, LawyerUpdateSerializer,
    LawyerMeSerializer, LawyerDocumentSerializer, AdminVerifySerializer,
    AdminLawyerSerializer,
)
from .services import get_lawyers, register_lawyer, update_lawyer, verify_lawyer, upload_document, upload_profile_photo


class LawyerListView(APIView):
    """
    GET /api/v1/lawyers
    Public endpoint — no auth required.
    Returns only is_listed=True lawyers.
    Supports query params: city, region, specialization, type.
    """
    permission_classes = [AllowAny]

    @extend_schema(responses={200: LawyerPublicSerializer(many=True)})
    def get(self, request):
        lawyers = get_lawyers(
            city=request.query_params.get("city"),
            region=request.query_params.get("region"),
            specialization=request.query_params.get("specialization"),
            lawyer_type=request.query_params.get("type"),
        )
        return Response(LawyerPublicSerializer(lawyers, many=True).data)


class LawyerDetailView(APIView):
    """
    GET /api/v1/lawyers/{id}
    Public — returns full public profile + specializations.
    Only returns is_listed=True lawyers (404 otherwise).
    """
    permission_classes = [AllowAny]

    @extend_schema(responses={200: LawyerPublicSerializer})
    def get(self, request, lawyer_id):
        lawyer = get_object_or_404(Lawyer, id=lawyer_id, is_listed=True)
        return Response(LawyerPublicSerializer(lawyer).data)


class LawyerRegisterView(APIView):
    """
    POST /api/v1/lawyers/register
    JWT required (any authenticated user).
    Creates a lawyer profile linked to the authenticated user's user_id.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(request=LawyerRegisterSerializer, responses={201: LawyerMeSerializer})
    def post(self, request):
        serializer = LawyerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            lawyer = register_lawyer(request.user.user_id, serializer.validated_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(LawyerMeSerializer(lawyer).data, status=status.HTTP_201_CREATED)


class LawyerMeView(APIView):
    """
    GET  /api/v1/lawyers/me — lawyer views their full profile
    PATCH /api/v1/lawyers/me — lawyer updates profile + availability toggle
    """
    permission_classes = [IsAuthenticated]

    def _get_lawyer(self, user_id):
        return get_object_or_404(Lawyer, user_id=user_id)

    @extend_schema(responses={200: LawyerMeSerializer})
    def get(self, request):
        lawyer = self._get_lawyer(request.user.user_id)
        return Response(LawyerMeSerializer(lawyer).data)

    @extend_schema(request=LawyerUpdateSerializer, responses={200: LawyerMeSerializer})
    def patch(self, request):
        lawyer = self._get_lawyer(request.user.user_id)
        serializer = LawyerUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        lawyer = update_lawyer(lawyer, serializer.validated_data)
        return Response(LawyerMeSerializer(lawyer).data)


class LawyerDocumentUploadView(APIView):
    """
    POST /api/v1/lawyers/me/documents
    Multipart upload — sends file to MinIO, creates LawyerDocument record.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        lawyer = get_object_or_404(Lawyer, user_id=request.user.user_id)
        file_obj = request.FILES.get("file")
        document_type = request.data.get("document_type")
        if not file_obj or not document_type:
            return Response(
                {"error": "file and document_type are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        valid_types = [c[0] for c in LawyerDocumentUploadView._get_type_choices()]
        if document_type not in valid_types:
            return Response({"error": "Invalid document_type."}, status=status.HTTP_400_BAD_REQUEST)
        doc = upload_document(lawyer, file_obj, document_type, file_obj.name)
        return Response(LawyerDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _get_type_choices():
        from .models import LawyerDocument
        return LawyerDocument.TYPE_CHOICES


class LawyerDocumentListView(APIView):
    """GET /api/v1/lawyers/me/documents — lists own submitted documents."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lawyer = get_object_or_404(Lawyer, user_id=request.user.user_id)
        docs = lawyer.documents.all().order_by("-uploaded_at")
        return Response(LawyerDocumentSerializer(docs, many=True).data)


class AdminLawyerListView(APIView):
    """GET /api/v1/admin/lawyers — admin sees all lawyers including pending."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        qs = Lawyer.objects.all().prefetch_related("specializations")
        v_status = request.query_params.get("verification_status")
        if v_status:
            qs = qs.filter(verification_status=v_status)
        return Response(AdminLawyerSerializer(qs, many=True).data)


class AdminLawyerVerifyView(APIView):
    """
    PATCH /api/v1/admin/lawyers/{id}/verify
    Admin sets verification_status. Updates is_listed automatically.
    Publishes lawyer.verified event.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AdminVerifySerializer)
    def patch(self, request, lawyer_id):
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdminVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lawyer = verify_lawyer(lawyer_id, serializer.validated_data["status"])
        return Response(AdminLawyerSerializer(lawyer).data)


class AdminLawyerDocumentsView(APIView):
    """GET /api/v1/admin/lawyers/{id}/documents — admin views a lawyer's uploaded docs."""
    permission_classes = [IsAuthenticated]

    def get(self, request, lawyer_id):
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        lawyer = get_object_or_404(Lawyer, id=lawyer_id)
        docs = LawyerDocument.objects.filter(lawyer=lawyer).order_by("uploaded_at")
        return Response(LawyerDocumentSerializer(docs, many=True).data)


class SpecializationListView(APIView):
    """GET /api/v1/specializations — public list of all available specializations."""
    permission_classes = [AllowAny]

    def get(self, request):
        specs = Specialization.objects.all().order_by("name")
        return Response([{"id": str(s.id), "name": s.name, "name_fr": s.name_fr} for s in specs])


class LawyerPhotoView(APIView):
    """POST /api/v1/lawyers/me/photo — upload or replace profile photo."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        lawyer = get_object_or_404(Lawyer, user_id=request.user.user_id)
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"error": "file is required."}, status=status.HTTP_400_BAD_REQUEST)
        url = upload_profile_photo(lawyer, file_obj, file_obj.name)
        return Response({"profile_photo_url": url})
