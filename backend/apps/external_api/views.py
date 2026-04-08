from django.db.models import Count
from rest_framework import views, permissions
from rest_framework.response import Response
from tasks.models import Task, Category


class ExternalStatsView(views.APIView):
    """
    Publicly accessible endpoint returning global aggregate statistics.
    No authentication required.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(is_completed=True).count()

        completion_rate = 0
        if total_tasks > 0:
            completion_rate = (completed_tasks / total_tasks) * 100

        top_categories = (
            Category.objects.annotate(task_count=Count("tasks"))
            .order_by("-task_count")[:5]
            .values("id", "name", "task_count")
        )

        stats = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 2),
            "top_categories": list(top_categories),
        }

        return Response(stats)
