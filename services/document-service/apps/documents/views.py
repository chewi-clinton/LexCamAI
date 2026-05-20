from __future__ import annotations

from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DocumentTemplate, UserDocument
from .serializers import (
    AdminTemplateCreateSerializer,
    AdminTemplateSerializer,
    AdminTemplateUpdateSerializer,
    CreateDocumentSerializer,
    DocumentTemplateDetailSerializer,
    DocumentTemplateListSerializer,
    MarkReadySerializer,
    UserDocumentSerializer,
)
from .services import (
    create_document_request,
    get_download_url,
    get_user_document,
    mark_document_ready,
)


# ---------------------------------------------------------------------------
# Templates (public)
# ---------------------------------------------------------------------------


class TemplateListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request: Request) -> Response:
        templates = DocumentTemplate.objects.filter(is_active=True)
        serializer = DocumentTemplateListSerializer(templates, many=True)
        return Response(serializer.data)


class TemplateDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request: Request, pk: str) -> Response:
        try:
            template = DocumentTemplate.objects.get(id=pk, is_active=True)
        except DocumentTemplate.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DocumentTemplateDetailSerializer(template)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# User documents (JWT required)
# ---------------------------------------------------------------------------


class UserDocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        docs = UserDocument.objects.filter(user_id=request.user.user_id)
        serializer = UserDocumentSerializer(docs, many=True)
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        serializer = CreateDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template = serializer.validated_data["template_id"]
        form_data = serializer.validated_data["form_data"]

        doc = create_document_request(
            user_id=request.user.user_id,
            template=template,
            form_data=form_data,
        )
        return Response(
            UserDocumentSerializer(doc).data, status=status.HTTP_201_CREATED
        )


class UserDocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk: str) -> Response:
        doc = get_user_document(pk, request.user.user_id)
        serializer = UserDocumentSerializer(doc)
        return Response(serializer.data)


class UserDocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk: str) -> Response:
        doc = get_user_document(pk, request.user.user_id)
        file_url = get_download_url(doc)
        return Response({"file_url": file_url}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Internal endpoints (X-Internal-Key protected)
# ---------------------------------------------------------------------------


# Maps frontend slugs to DB slugs
_SLUG_ALIASES = {
    "unpaid-wages": "mise-en-demeure-salaire",
    "housing-dispute": "mise-en-demeure-logement",
}


class DocumentGenerateBySlugView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, slug: str) -> Response:
        db_slug = _SLUG_ALIASES.get(slug, slug)
        try:
            template = DocumentTemplate.objects.get(slug=db_slug, is_active=True)
        except DocumentTemplate.DoesNotExist:
            return Response({"detail": f"Template '{slug}' not found."}, status=status.HTTP_404_NOT_FOUND)

        form_data = request.data.get("form_data", request.data)
        doc = create_document_request(
            user_id=request.user.user_id,
            template=template,
            form_data=form_data,
        )
        data = UserDocumentSerializer(doc).data
        data["title"] = template.name_en
        data["price"] = template.price_xaf
        data["currency"] = "XAF"
        return Response(data, status=status.HTTP_201_CREATED)


class InternalDocumentDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: str) -> Response:
        key = request.headers.get("X-Internal-Key", "")
        if key != settings.INTERNAL_SERVICE_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        try:
            doc = UserDocument.objects.select_related("template").get(id=pk)
        except UserDocument.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "document_id": str(doc.id),
            "user_id": str(doc.user_id),
            "template_slug": doc.template.slug,
            "form_data": doc.form_data,
            "status": doc.status,
        })


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response({
            "total_documents": UserDocument.objects.count(),
        })


class AdminTemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        templates = DocumentTemplate.objects.all().order_by("name_en")
        return Response(AdminTemplateSerializer(templates, many=True).data)

    def post(self, request: Request) -> Response:
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdminTemplateCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        template = serializer.save()
        return Response(AdminTemplateSerializer(template).data, status=status.HTTP_201_CREATED)


class AdminTemplateToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, pk: str) -> Response:
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        try:
            template = DocumentTemplate.objects.get(id=pk)
        except DocumentTemplate.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        template.is_active = not template.is_active
        template.save(update_fields=["is_active"])
        return Response(AdminTemplateSerializer(template).data)


class AdminTemplateEditView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, pk: str) -> Response:
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        try:
            template = DocumentTemplate.objects.get(id=pk)
        except DocumentTemplate.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminTemplateUpdateSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminTemplateSerializer(template).data)


class InternalMarkReadyView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: str) -> Response:
        key = request.headers.get("X-Internal-Key", "")
        if key != settings.INTERNAL_SERVICE_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MarkReadySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        doc = mark_document_ready(pk, serializer.validated_data["file_url"])
        return Response(UserDocumentSerializer(doc).data, status=status.HTTP_200_OK)