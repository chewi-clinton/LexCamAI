import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .events import publish_scrape_requested
from .models import AuditLog, PlatformStats
from .serializers import AuditLogSerializer, PlatformStatsSerializer
from .services import log_audit

logger = logging.getLogger(__name__)


class TriggerScraperView(APIView):
    def post(self, request):
        published = publish_scrape_requested(request.user.user_id)
        if not published:
            return Response({"error": "Failed to publish event."}, status=status.HTTP_502_BAD_GATEWAY)
        log_audit(
            admin_user_id=request.user.user_id,
            action=AuditLog.ACTION_TRIGGER_SCRAPER,
            target_type="scraper",
        )
        return Response({"status": "triggered"})


class StatsView(APIView):
    def get(self, request):
        stats = PlatformStats.objects.order_by("-stat_date").first()
        if not stats:
            return Response({})
        return Response(PlatformStatsSerializer(stats).data)


class AuditLogListView(APIView):
    def get(self, request):
        logs = AuditLog.objects.order_by("-created_at")[:100]
        return Response(AuditLogSerializer(logs, many=True).data)
