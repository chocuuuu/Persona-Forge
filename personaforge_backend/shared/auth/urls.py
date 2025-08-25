from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from shared.auth.views import (
    LoginView,
)
urlpatterns = [
    path("login/", LoginView.as_view(), name="global-login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="global-refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="token-blacklist"),
]
