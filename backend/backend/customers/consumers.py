import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core import signing

from orders.models import Order


class CustomerOrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = int(self.scope["url_route"]["kwargs"]["order_id"])
        query = parse_qs(self.scope.get("query_string", b"").decode("utf-8"))
        ticket = (query.get("ticket") or [None])[0]
        if not ticket:
            await self.close(code=4401)
            return
        try:
            payload = signing.loads(
                ticket,
                salt="customer-order-socket",
                max_age=60,
            )
        except signing.BadSignature:
            await self.close(code=4401)
            return
        if not isinstance(payload, dict) or payload.get("order_id") != self.order_id:
            await self.close(code=4403)
            return
        if not await self._customer_can_access(payload.get("user_id")):
            await self.close(code=4403)
            return

        self.group_name = f"customer_order_{self.order_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({"type": "CONNECTED", "order_id": self.order_id}))

    async def disconnect(self, close_code):
        group_name = getattr(self, "group_name", None)
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            return
        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))

    async def customer_order_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def _customer_can_access(self, user_id):
        return Order.objects.filter(
            pk=self.order_id,
            customer__user_id=user_id,
            customer__user__is_active=True,
        ).exists()
