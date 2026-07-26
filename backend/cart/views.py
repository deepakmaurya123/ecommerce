from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CartSerializer, CartItemSerializer
from .models import Cart, CartItem
from product.models import Product

# Create your views here.

class CartCRUD(APIView):
    def get(self, request):                             # create cart for with user id connected
        cart = Cart.objects.get(user=request.user)
        print(cart)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):                             # create cartItem in cart with product_id
        product_id = request.data.get('product_id')
        product = Product.objects.get(id=product_id)
        cart = Cart.objects.get(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += 1
            item.save()
        return Response({'message': 'Product added to cart',})

    def put(self, request):                        # update quantity of cartItem in cart
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
