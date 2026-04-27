from channels.generic.websocket import AsyncWebsocketConsumer
import json

class OrdersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔥 CONNECT HIT")

        try:
            print("SCOPE:", self.scope)

            self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
            print("Restaurant ID:", self.restaurant_id)

            self.group_name = f"orders_{self.restaurant_id}"

            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            await self.accept()
            print("✅ WS ACCEPTED")

        except Exception as e:
            print("❌ WS ERROR:", e)
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "order_message",
                "message": data,
            }
        )

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

