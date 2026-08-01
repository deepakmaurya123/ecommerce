from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from rest_framework.views import APIView

from cart.models import Cart

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_list(request):
    try:
        orders = Order.objects.filter(user=request.user)
        order_list = []
        for order in orders:
            items = OrderItem.objects.filter(order=order)
            item_list = []
            for item in items:
                item_list.append({
                    'product': item.product.name,
                    'quantity': item.quantity,
                    'price': item.price
                })
            order_list.append({
                'id': order.id,
                'total_amount': order.total_amount,
                'created_at': order.created_at,
                'items': item_list
            })
        return Response({'orders': order_list}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderCreateView(APIView):
    def post(self, request):
        try:
            data = request.data
            name = data.get('name')
            address = data.get('address')
            phone = data.get('phone')
            payment_method = data.get('payment_method','COD')

            # validate phone number
            if not isinstance(phone, str) or not phone.isdigit() or len(phone) < 10:
                return Response({'error': 'Invalid phone number'}, status=status.HTTP_400_BAD_REQUEST)

            # Get user's cart
            cart , created = Cart.objects.get_or_create(user=request.user)
            if not cart.items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({'message': 'Order created successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

