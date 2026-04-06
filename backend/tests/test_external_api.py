import pytest
from django.urls import reverse
from rest_framework import status
from tasks.models import Task, Category

@pytest.mark.django_db
def test_external_stats_accuracy(api_client, user_factory, task_factory, category_factory):
    user = user_factory()
    cat1 = category_factory(owner=user, name="Category 1")
    cat2 = category_factory(owner=user, name="Category 2")
    
    # Create 3 tasks for cat1 (2 completed)
    task_factory(owner=user, category=cat1, is_completed=True)
    task_factory(owner=user, category=cat1, is_completed=True)
    task_factory(owner=user, category=cat1, is_completed=False)
    
    # Create 1 task for cat2 (0 completed)
    task_factory(owner=user, category=cat2, is_completed=False)
    
    url = reverse('external-stats')
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_tasks'] == 4
    assert response.data['completed_tasks'] == 2
    assert response.data['completion_rate'] == 50.0
    assert len(response.data['top_categories']) == 2
    assert response.data['top_categories'][0]['name'] == "Category 1"
    assert response.data['top_categories'][0]['task_count'] == 3
