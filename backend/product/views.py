from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import CategorySerializer, ProductSerializer
from .models import Category, Product


class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class ProductList(APIView):
    def get(self, request):
        category = request.query_params.get('category')
        if category and category != 'all':
            if category.isdigit():
                products = Product.objects.filter(category__id=category)
            else:
                products = Product.objects.filter(category__slug=category)
        else:
            products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetails(APIView):
    def get(self, request, pk):
        try:
            product = Product.objects.get(id=pk)
            serializer = ProductSerializer(product, context = {'request': request})
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
