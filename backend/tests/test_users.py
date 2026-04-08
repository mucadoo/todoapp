import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_user_registration(api_client):
    url = reverse('register')
    data = {
        'email': 'test@example.com',
        'username': 'test_user',
        'name': 'Test User',
        'password': 'password123'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email='test@example.com').exists()

@pytest.mark.django_db
def test_user_login(api_client, user_factory):
    user = user_factory(email='test@example.com')
    user.set_password('password123')
    user.save()

    url = reverse('token_obtain_pair')
    data = {'email': 'test@example.com', 'password': 'password123'}
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_profile_view(auth_client):
    client, user = auth_client
    url = reverse('profile')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == user.email
