from django.core.management.base import BaseCommand

from apps.dashboard.services import collect_platform_stats


class Command(BaseCommand):
    help = "Collect live platform statistics from each service and record them"

    def handle(self, *args, **options):
        stats = collect_platform_stats()
        self.stdout.write(
            f"Recorded stats for {stats.stat_date}: "
            f"users={stats.total_users} lawyers={stats.total_verified_lawyers} "
            f"docs={stats.total_documents_generated} revenue={stats.total_revenue_xaf} XAF"
        )
