from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging


logger = logging.getLogger(__name__)

class OrdersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
            self.group_name = f"orders_{self.restaurant_id}"

            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(
                "orders_websocket_connected restaurant_id=%s channel=%s",
                self.restaurant_id,
                self.channel_name,
            )

        except Exception:
            logger.exception("orders_websocket_connection_failed")
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        logger.info(
            "orders_websocket_disconnected restaurant_id=%s code=%s",
            getattr(self, "restaurant_id", None),
            close_code,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        # 💓 Handle ping → reply pong
        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))
            return

        # Normal message → broadcast
        # Order events are server-push only. Accepting arbitrary client payloads
        # here allowed one browser to inject a stale/fake order into every UI in
        # the restaurant group.
        await self.send(text_data=json.dumps({
            "type": "error",
            "code": "client_order_events_not_allowed",
        }))

    async def order_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def table_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            "status": "CONNECTED",
            "message": "WebSocket is working"
        }))

    async def receive(self, text_data):
        await self.send(text_data=json.dumps({
            "echo": text_data
        }))


from channels.generic.websocket import AsyncWebsocketConsumer
import json



class DiscountConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
        self.group_name = f"discounts_{self.restaurant_id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection",
            "message": "Discount WS Connected"
        }))
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    async def discount_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))
