from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from shared.generic_viewset import GenericViewset
from .models import Persona
from .serializers import PersonaSerializer


class PersonaViewset(GenericViewset, viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]

    protected_views = ["create", "update", "partial_update", "retrieve", "destroy"]