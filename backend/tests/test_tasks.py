import pytest
from django.urls import reverse
from rest_framework import status

def get_models():
    from tasks.models import Task, Category
    return Task, Category

@pytest.mark.django_db
def test_category_crud(auth_client):
    Task, Category = get_models()
    client, user = auth_client
    url = reverse('category-list-create')
    
    # Create
    data = {'name': 'Work', 'color': '#FF0000'}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Category.objects.filter(owner=user).count() == 1
    
    category_id = response.data['id']
    
    # List
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    
    # Detail/Update
    detail_url = reverse('category-detail', kwargs={'id': category_id})
    response = client.patch(detail_url, {'name': 'Work Updated'})
    assert response.status_code == status.HTTP_200_OK
    assert Category.objects.get(id=category_id).name == 'Work Updated'
    
    # Delete
    response = client.delete(detail_url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Category.objects.filter(id=category_id).count() == 0

@pytest.mark.django_db
def test_category_scoping(auth_client, user_factory, category_factory):
    client, user_a = auth_client
    user_b = user_factory()
    category_b = category_factory(owner=user_b, name="User B's Category")
    
    # User A tries to list categories
    url = reverse('category-list-create')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 0
    
    # User A tries to access User B's category directly
    detail_url = reverse('category-detail', kwargs={'id': category_b.id})
    response = client.get(detail_url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_task_crud(auth_client, category_factory):
    Task, Category = get_models()
    client, user = auth_client
    category = category_factory(owner=user)
    url = reverse('task-list-create')
    
    # Create
    data = {
        'title': 'Test Task',
        'description': 'Test Description',
        'priority': 'high',
        'category_id': category.id
    }
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Task.objects.filter(owner=user).count() == 1
    
    task_id = response.data['id']
    
    # List
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    
    # Detail
    detail_url = reverse('task-detail', kwargs={'id': task_id})
    response = client.get(detail_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['title'] == 'Test Task'

@pytest.mark.django_db
def test_task_toggle(auth_client, task_factory):
    client, user = auth_client
    task = task_factory(owner=user, is_completed=False)
    url = reverse('task-toggle', kwargs={'id': task.id})
    
    response = client.post(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['is_completed'] is True
    
    task.refresh_from_db()
    assert task.is_completed is True

@pytest.mark.django_db
def test_task_sharing(auth_client, user_factory, task_factory):
    client_a, user_a = auth_client
    user_b = user_factory()
    task_a = task_factory(owner=user_a)
    
    # Share Task A with User B
    url = reverse('task-share', kwargs={'id': task_a.id})
    response = client_a.post(url, {'email': user_b.email})
    assert response.status_code == status.HTTP_200_OK
    assert user_b in task_a.shared_with.all()
    
    # Check User B can see shared task
    client_b = client_a # reuse client but re-authenticate
    client_b.force_authenticate(user=user_b)
    
    list_url = reverse('task-list-create')
    response = client_b.get(list_url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['id'] == str(task_a.id)

@pytest.mark.django_db
def test_task_filtering_and_pagination(auth_client, task_factory):
    client, user = auth_client
    # Create 15 tasks
    for i in range(15):
        task_factory(owner=user, is_completed=(i < 5), priority=('low' if i < 10 else 'high'))
        
    url = reverse('task-list-create')
    
    # Test Pagination (PAGE_SIZE is 30 by default in base.py)
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 15
    assert response.data['count'] == 15
    
    # Test Filtering by is_completed=true
    response = client.get(url + '?is_completed=true')
    assert response.data['count'] == 5
    
    # Test Filtering by priority=high
    response = client.get(url + '?priority=high')
    assert response.data['count'] == 5
