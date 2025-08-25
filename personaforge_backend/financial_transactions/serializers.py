from rest_framework import serializers
from .models import FinancialTransaction

class FinancialTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialTransaction
        fields = "__all__"