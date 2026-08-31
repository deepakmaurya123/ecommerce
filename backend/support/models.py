from django.contrib.auth.models import User
from django.db import models
from order.models import Order

# Create your models here.

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation for order {self.order.id} - {self.user.username}"


class Message(models.Model):

    ROLE_CHOICES = [
        ('user', "User"),
        ("agent", "Agent"),
    ]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} - {self.content[:20]}..."  # Agent: We are checking your request.


class AgentLog(models.Model):

    EVENT_CHOICES = [
        ("Support", "Support Agent"),
        ("tool_call", "Tool Call"),
        ("tool_result", "Tool Result"),
        ("manager", "Manager Agent"),
        ("risk", "Risk Agent"),
        ("final", "Final Agent"),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='agent_logs')
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.message[:20]}..."  # Support: We are checking your request.
