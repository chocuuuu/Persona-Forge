from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static


api_prefix = "api/v1/"

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path(f"{api_prefix}auth/", include("shared.auth.urls")),
    # Apps
    path(f"{api_prefix}user/", include("users.urls")),
    path(f"{api_prefix}persona/", include("persona.urls")),
    path(f"{api_prefix}financial-transactions/", include("financial_transactions.urls")),
    path(f"{api_prefix}conversations/", include("conversations.urls")),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
