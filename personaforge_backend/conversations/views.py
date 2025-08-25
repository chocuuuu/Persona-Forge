from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from shared.generic_viewset import GenericViewset
from .models import ConversationMessage
from .serializers import ConversationMessageSerializer


class ConversationMessageViewset(GenericViewset, viewsets.ModelViewSet):
    queryset = ConversationMessage.objects.all()
    serializer_class = ConversationMessageSerializer
    permission_classes = [IsAuthenticated]

    protected_views = ["create", "update", "partial_update", "retrieve", "destroy"]