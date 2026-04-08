from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework import generics, permissions, status, filters as drf_filters
from rest_framework.response import Response
from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer, ShareTaskSerializer
from .permissions import IsOwner, IsTaskOwner

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            Q(owner=self.request.user) | Q(tasks__shared_with=self.request.user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Category.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return Category.objects.filter(
            Q(owner=self.request.user) | Q(tasks__shared_with=self.request.user)
        ).distinct()

class TaskFilter(filters.FilterSet):
    # Using DateFilter instead of DateTimeFilter handles the "same day" filtering 
    # correctly by treating input as a full day range.
    due_date_before = filters.DateFilter(field_name="due_date", lookup_expr='lte')
    due_date_after = filters.DateFilter(field_name="due_date", lookup_expr='gte')
    category = filters.CharFilter(method='filter_category')

    class Meta:
        model = Task
        fields = ['is_completed', 'priority', 'category']

    def filter_category(self, queryset, name, value):
        if value == 'null':
            return queryset.filter(category__isnull=True)
        return queryset.filter(category=value)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    ordering_fields = ['due_date', 'priority', 'created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(Q(owner=self.request.user) | Q(shared_with=self.request.user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return Task.objects.filter(Q(owner=self.request.user) | Q(shared_with=self.request.user)).distinct()

class TaskToggleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTaskOwner]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return Task.objects.filter(Q(owner=self.request.user) | Q(shared_with=self.request.user)).distinct()

    def post(self, request, *args, **kwargs):
        task = self.get_object()
        task.is_completed = not task.is_completed
        task.save()
        return Response({"is_completed": task.is_completed}, status=status.HTTP_200_OK)

class TaskShareView(generics.GenericAPIView):
    serializer_class = ShareTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsTaskOwner]
    queryset = Task.objects.all()
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        task = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_to_share = serializer.validated_data['email']
        
        if user_to_share == request.user:
            return Response({"error": "You cannot share a task with yourself."}, status=status.HTTP_400_BAD_REQUEST)
            
        task.shared_with.add(user_to_share)
        return Response({"status": "Task shared successfully"}, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        task = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_to_unshare = serializer.validated_data['email']
        
        task.shared_with.remove(user_to_unshare)
        return Response({"status": "Task unshared successfully"}, status=status.HTTP_200_OK)
