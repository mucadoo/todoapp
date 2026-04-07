from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'name', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Use our model's USERNAME_FIELD
        self.fields[self.username_field] = serializers.CharField(required=False)
        self.fields['username'] = serializers.CharField(required=False)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        return token

    def validate(self, attrs):
        # Determine if we're logging in with email or username
        login_identifier = attrs.get(self.username_field) or attrs.get('username')
        password = attrs.get('password')

        if not login_identifier or not password:
            raise serializers.ValidationError("Must include 'email' or 'username' and 'password'")

        # Try to find the user by email or username
        user = User.objects.filter(email=login_identifier).first() or \
               User.objects.filter(username=login_identifier).first()

        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            
            # SimpleJWT uses self.user to generate tokens
            self.user = user
            
            refresh = self.get_token(self.user)
            
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        
        raise serializers.ValidationError("Incorrect authentication credentials")

class UpdateUsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
