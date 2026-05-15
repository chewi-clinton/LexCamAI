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