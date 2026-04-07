from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Category, Task
from apps.users.serializers import UserSerializer

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    is_shared = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'color', 'owner', 'is_shared', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'is_shared', 'created_at', 'updated_at')

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner != request.user
        return False

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class SharedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'username')

class TaskSerializer(serializers.ModelSerializer):
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    shared_with = SharedUserSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'is_completed', 'due_date', 'has_time',
            'priority', 'category', 'category_id', 'owner', 'shared_with',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'owner', 'shared_with', 'created_at', 'updated_at')
        depth = 1

    def validate_category_id(self, value):
        if value:
            try:
                # Allow selecting categories the user owns OR categories of tasks shared with them
                # Actually, when CREATING/UPDATING a task, they should probably only use their own categories?
                # The prompt says "show categories that belong to tasks shared with me".
                # If they are editing a task shared WITH them, they might want to change its category?
                # Usually, only the owner can change category, but let's see.
                category = Category.objects.filter(
                    Q(owner=self.context['request'].user) | 
                    Q(tasks__shared_with=self.context['request'].user)
                ).filter(id=value).distinct().get()
                return category
            except Category.DoesNotExist:
                raise serializers.ValidationError("Category does not exist or does not belong to the user.")
        return None

    def create(self, validated_data):
        category = validated_data.pop('category_id', None)
        validated_data['owner'] = self.context['request'].user
        if category:
            validated_data['category'] = category
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category = validated_data.pop('category_id', None)
        if category is not None:
            instance.category = category
        return super().update(instance, validated_data)

class ShareTaskSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
