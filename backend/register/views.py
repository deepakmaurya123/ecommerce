from django.shortcuts import render
from requests import Response
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.views import APIView

# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully', "user": UserSerializer(user).data})
        return Response(serializer.errors, status=400)
