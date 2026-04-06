from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/auth/', include('apps.users.urls')),
    # path('api/', include('apps.tasks.urls')),
    # path('api/external/', include('apps.external_api.urls')),
]
