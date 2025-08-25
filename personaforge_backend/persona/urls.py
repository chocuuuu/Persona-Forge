from django.urls import include, path
from rest_framework.routers import DefaultRouter

from persona.views import PersonaViewset

app_name = "persona"

router = DefaultRouter()
router.register(r"", PersonaViewset, basename="persona")

urlpatterns = [path("", include(router.urls))]