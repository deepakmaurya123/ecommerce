from django.urls import path
from . import views

urlpatterns = [
    path('order/create/', views.OrderCreateView.as_view(), name='order-create'),
    path('order/list/', views.get_order_list, name='order-list'),
    path('order/detail/<int:order_id>/', views.get_order_detail, name='order-detail'),
    path('chat/<int:order_id>/', views.chat, name="chat")
]