from datetime import datetime

from order.models import Order, RefundRequest
from django.utils import timezone
from .tracking_data import DELIVERY_DATA
from .rag import search_knowledge_base as rag_search


def get_order_details(order_id):
    try:
        order = Order.objects.get(id=order_id)                          # fetch order details from database
        print(order)
        return {
            "order_id": order.id,
            "amount": str(order.total_amount),
            "status": order.status,
            "tracking_number": order.tracking_number,
            "delivery_address": order.delivery,
            "ordered_on": order.created_at.strftime("%d %b %Y"), # 25 May 2026
            "days_since_order": (timezone.now() - order.created_at).days, # 20
        }
    except Order.DoesNotExist:
        return {"error": f"Order #{order_id} not found."}


def get_refund_history(user_id):
    refunds = RefundRequest.objects.filter(user_id=user_id).order_by("-created_at")   # fetch refund history for the user from database

    history = []
    for refund in refunds:
        history.append({
            "order_id": refund.order_item.id,
            "reason": refund.reason,
            "status": refund.status,
            "requested_on": refund.created_at.strftime("%d %b %Y"), # 25 May 2026
        })
    print(history)
    return {
        "total_refund_requests": len(history),
        "history": history,
    }


def check_delivery_status(tracking_number, carrier):
    default_response = {                                               # If tracking number not found in our mock data, return this default response
        "status": "Unknown",
        "last_location": "Tracking info unavailable",
        "last_update": "N/A",
        "estimated_delivery": "Contact carrier directly",
        "delay_reason": "No updates from carrier",
    }
    result = DELIVERY_DATA.get(tracking_number, default_response)
    result["tracking_number"] = tracking_number
    result["carrier"] = carrier
    return result

def search_knowledge_base(query):
    result = rag_search(query)
    return {"result": result}