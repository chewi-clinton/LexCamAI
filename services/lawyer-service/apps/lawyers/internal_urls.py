from django.urls import path
from .internal_views import LawyerIngestView, LawyerRecommendView

urlpatterns = [
    path("lawyers/ingest", LawyerIngestView.as_view(), name="internal-lawyer-ingest"),
    path("lawyers/recommend", LawyerRecommendView.as_view(), name="internal-lawyer-recommend"),
]
