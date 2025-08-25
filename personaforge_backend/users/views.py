from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from shared.generic_viewset import GenericViewset
from .models import CustomUser
from .serializers import CustomUserSerializer
from shared.utils import role_required

class UserViewset(GenericViewset):
    protected_views = ["create", "update", "partial_update", "retrieve", "destroy"]
    permissions = [IsAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer