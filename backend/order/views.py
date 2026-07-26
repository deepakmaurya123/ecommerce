from django.shortcuts import render
from requests import Response
from .models import Order, OrderItem

from backend.cart.models import Cart

# Create your views here.

class OrderCreateView:
    def post(self, request):
        try:
            data = request.data
            name = data.get('name')
            address = data.get('address')
            phone = data.get('phone')
            payment_method = data.get('payment_method','COD')

            #validate Phone Number
            if not phone.isdigit() or len(phone) < 10:
                return Response({'error': 'Invalid phone number'}, status=400)

            # Get user's cart
            cart , created = Cart.objects.get_or_create(user=request.user)
            if not cart.items.exists():
                return Response({'error': 'Cart is empty'}, status=400)

            total = sum([item.product.price * item.quantity for item in cart.items.all()])

            order = Order.objects.create(user = request.user, total_amount=total)

            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price
                )
            # Clear the cart
            cart.items.all().delete()
            return Response({'message': 'Order created successfully', 'order_id': order.id})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

