from django.db import models
from django.contrib.auth.models import User
from product.models import Product

# Create your models here.

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart {self.id} for {self.user}"

    @property                                                         # To do calculation of total price of the cart
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property                                                    # To calculate the subtotal for each cart item (price * quantity)
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.product.name} * {self.quantity}"