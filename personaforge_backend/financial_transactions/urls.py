from django.urls import include, path
from rest_framework.routers import DefaultRouter

from financial_transactions.views import FinancialTransactionViewset

app_name = "financial_transactions"

router = DefaultRouter()
router.register(r"", FinancialTransactionViewset, basename="financial-transactions")

urlpatterns = [path("", include(router.urls))]