# orders/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrdersConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer that joins a general 'orders' group and optionally joins table-specific groups.
    Clients can connect to:
        ws://.../ws/orders/            -> general orders feed
        ws://.../ws/orders/?table=3   -> also join table_3 group
    """

    async def connect(self):
        # default group
        self.group_name = "orders"  

        # optionally join per-table group if query param provided
        query_string = self.scope.get("query_string", b"").decode()
        params = {}
        if query_string:
            for part in query_string.split("&"):
                if "=" in part:
                    k, v = part.split("=", 1)
                    params[k] = v

        self.table_group = None
        table_id = params.get("table")
        if table_id:
            self.table_group = f"table_{table_id}"

        # join groups
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        if self.table_group:
            await self.channel_layer.group_add(self.table_group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        if self.table_group:
            await self.channel_layer.group_discard(self.table_group, self.channel_name)

    # receive message from group
    async def order_update(self, event):
        """
        event should contain: {'type': 'order_update', 'action': 'updated', 'order': {...serialized...}}
        """
        await self.send(text_data=json.dumps(event))

    # handler for messages with type 'order.created' etc (optional)
    async def order_created(self, event):
        await self.send(text_data=json.dumps(event))

    async def order_deleted(self, event):
        await self.send(text_data=json.dumps(event))
