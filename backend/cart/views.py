from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CartSerializer, CartItemSerializer
from .models import Cart, CartItem
from product.models import Product

class CartCRUD(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        cart, created = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += 1
            item.save()
        return Response({'message': 'Product added to cart'})

    def put(self, request):                     # update quantity of cartItem in cart
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        if item_id is None or quantity is None:
            return Response({'error': 'Item ID and quantity are required'}, status=400)

        try:
            item = CartItem.objects.get(id=item_id)  # create item tuple, check if quantity < 0, delete cartItem, otherwise update quantity
            if int(quantity) < 1:                        # delete cartItem from cart of quantity given < 0
                item.delete()
                return Response({'error': 'Quantity is given < 0, cartItem deleted from cart'}, status=400)

            item.quantity = quantity                                                      # Updating quantity
            item.save()
            serializer = CartItemSerializer(item)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=404)

    def delete(self, request, item_id):                   # delete cartItem from cart with item_id
        try:
            item = CartItem.objects.get(id=item_id)
            item.delete()
            return Response({'message': 'Cart item deleted successfully'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=404)
