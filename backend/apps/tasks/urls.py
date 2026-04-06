from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    TaskListCreateView, TaskDetailView, TaskShareView, TaskToggleView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<uuid:id>/', CategoryDetailView.as_view(), name='category-detail'),
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<uuid:id>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<uuid:id>/share/', TaskShareView.as_view(), name='task-share'),
    path('tasks/<uuid:id>/toggle/', TaskToggleView.as_view(), name='task-toggle'),
]
