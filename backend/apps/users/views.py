from rest_framework import generics, permissions, filters, status, views
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer, UpdateUsernameSerializer, ChangePasswordSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'name']
    pagination_class = None

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)

class UpdateUsernameView(generics.UpdateAPIView):
    serializer_class = UpdateUsernameSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

class CheckUsernameView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        username = request.query_params.get('username')
        exclude_id = request.query_params.get('exclude_id')
        
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = User.objects.filter(username__iexact=username)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
            
        exists = queryset.exists()
        return Response({'exists': exists})

class CheckEmailView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        email = request.query_params.get('email')
        exclude_id = request.query_params.get('exclude_id')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = User.objects.filter(email__iexact=email)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
            
        exists = queryset.exists()
        return Response({'exists': exists})

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
