from django.contrib import admin

from .models import Order, OrderItem, RefundRequest

# Register your models here.

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(RefundRequest)