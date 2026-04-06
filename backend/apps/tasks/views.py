from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer, ShareTaskSerializer
from .permissions import IsOwner

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Category.objects.all()
    lookup_field = 'id'

class TaskFilter(filters.FilterSet):
    due_date_before = filters.DateTimeFilter(field_name="due_date", lookup_expr='lte')
    due_date_after = filters.DateTimeFilter(field_name="due_date", lookup_expr='gte')

    class Meta:
        model = Task
        fields = ['is_completed', 'priority', 'category']

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

class TaskShareView(generics.GenericAPIView):
    serializer_class = ShareTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        task = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_to_share_with = serializer.validated_data['email']

        if user_to_share_with == request.user:
            return Response({"error": "You cannot share a task with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        task.shared_with.add(user_to_share_with)
        return Response({"status": f"Task shared with {user_to_share_with.email}"}, status=status.HTTP_200_OK)

class TaskToggleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        task = self.get_object()
        # Non-owners can also toggle if it's shared with them
        user = request.user
        if task.owner != user and not task.shared_with.filter(id=user.id).exists():
             return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
             
        task.is_completed = not task.is_completed
        task.save()
        return Response({"is_completed": task.is_completed}, status=status.HTTP_200_OK)
