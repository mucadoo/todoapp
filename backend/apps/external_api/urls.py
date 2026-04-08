from django.urls import path
from .views import ExternalStatsView

urlpatterns = [
    path("stats/", ExternalStatsView.as_view(), name="external-stats"),
]
