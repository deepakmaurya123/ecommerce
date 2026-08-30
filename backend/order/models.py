from django.db import models
from django.contrib.auth.models import User
from product.models import Product

# Create your models here.

class Order(models.Model):

    STATUS_CHOICES = [
        ('pending', "Pending"),
        ("dispatched", "Dispatched"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
]
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=100, blank=True)
    delivery = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Order {self.id}"

class OrderItem(models.Model):


    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class RefundRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    order_item = models.ForeignKey(OrderItem, related_name='refund_requests', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund Request for {self.order_item.product.name} - {self.status}"
