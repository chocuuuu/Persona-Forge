from django.urls import include, path
from rest_framework.routers import DefaultRouter

from conversations.views import ConversationMessageViewset

app_name = "conversations"

router = DefaultRouter()
router.register(r"", ConversationMessageViewset, basename="conversations")

urlpatterns = [path("", include(router.urls))]