from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.CartCRUD.as_view(), name='get_cart'),
    path('cart/add/', views.CartCRUD.as_view(), name='add_to_cart'),
    path('cart/update/', views.CartCRUD.as_view(), name='update_cart_quantity'),
    path('cart/delete/<int:item_id>/', views.CartCRUD.as_view(), name='delete_cart_item'),
]