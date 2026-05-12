from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings

from .services import ingest_scraped_lawyers, get_recommendations


def _check_internal_key(request):
    key = request.headers.get("X-Internal-Key", "")
    return key == settings.INTERNAL_SERVICE_KEY


class LawyerIngestView(APIView):
    """
    POST /internal/lawyers/ingest
    Called by Lawyer Ingest Worker. Accepts batch, deduplicates, inserts scraped records.
    Protected by X-Internal-Key header — not exposed via Kong.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if not _check_internal_key(request):
            return Response({"error": "Unauthorized."}, status=status.HTTP_401_UNAUTHORIZED)
        lawyers_data = request.data.get("lawyers", [])
        if not isinstance(lawyers_data, list):
            return Response({"error": "lawyers must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        inserted, skipped = ingest_scraped_lawyers(lawyers_data)
        return Response({"inserted": inserted, "skipped": skipped})


class LawyerRecommendView(APIView):
    """
    GET /internal/lawyers/recommend?domain=labor&city=Douala
    Called by RAG Service. Returns verified lawyers by domain + city.
    Checks Redis cache first (populated by matching.requested consumer).
    Protected by X-Internal-Key header.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not _check_internal_key(request):
            return Response({"error": "Unauthorized."}, status=status.HTTP_401_UNAUTHORIZED)
        domain = request.query_params.get("domain", "")
        city = request.query_params.get("city", "")
        lawyers = get_recommendations(domain, city)
        return Response({"lawyers": lawyers})
