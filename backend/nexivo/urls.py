from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

admin.site.site_header = 'Nexivo'

swagger_url_patterns = []

if settings.DEBUG:
    schema_view = get_schema_view(
        openapi.Info(
            title="Nexivo APIs",
            default_version='v1.0.0',
            description="Nexivo API documentation",
        ),
        public=True,
        permission_classes=[permissions.AllowAny],
    )

    swagger_url_patterns = [
        path('docs/swagger<str:format>', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('docs/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('docs/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('account.urls')),
]

if settings.DEBUG and swagger_url_patterns:
    urlpatterns += swagger_url_patterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
