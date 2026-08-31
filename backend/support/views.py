from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from order.models import Order

from .langchain_agents import run_support_langchain
from .models import Conversation, Message

# Create your views here.


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    user_message = request.data.get('message', '').strip()

    conversation, created = Conversation.objects.get_or_create(user=request.user, order=order)
    Message.objects.create(conversation=conversation, role="user", content=user_message)

    # if not user_message:
    #     return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

    reply = run_support_langchain(user_message, conversation.id, order.id, request.user.id)

    Message.objects.create(conversation=conversation, role="agent", content=reply)

    return Response({'reply': reply}, status=status.HTTP_200_OK)
