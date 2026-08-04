from django.urls import path
from .views import VendorLoginView

urlpatterns = [
    path('login/', VendorLoginView.as_view(), name='vendor-login'),
]