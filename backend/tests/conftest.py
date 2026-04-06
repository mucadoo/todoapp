import pytest
from rest_framework.test import APIClient
from model_bakery import baker
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_factory(db):
    def make_user(**kwargs):
        return baker.make(User, **kwargs)
    return make_user

@pytest.fixture
def auth_client(api_client, user_factory):
    user = user_factory()
    api_client.force_authenticate(user=user)
    return api_client, user

@pytest.fixture
def category_factory(db):
    def make_category(**kwargs):
        return baker.make('tasks.Category', **kwargs)
    return make_category

@pytest.fixture
def task_factory(db):
    def make_task(**kwargs):
        return baker.make('tasks.Task', **kwargs)
    return make_task
