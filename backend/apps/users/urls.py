from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import RegisterView, ProfileView, UserSearchView, UpdateUsernameView, LoginView, CheckUsernameView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', ProfileView.as_view(), name='profile'),
    path('me/username/', UpdateUsernameView.as_view(), name='update-username'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),
]
