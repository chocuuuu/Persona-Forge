from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from shared.generic_viewset import GenericViewset
from .models import FinancialTransaction
from .serializers import FinancialTransactionSerializer


class FinancialTransactionViewset(GenericViewset, viewsets.ModelViewSet):
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer
    permission_classes = [IsAuthenticated]

    protected_views = ["create", "update", "partial_update", "retrieve", "destroy"]