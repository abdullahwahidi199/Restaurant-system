import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core import signing


class ActivityDashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query = self.scope.get("query_string", b"").decode("utf-8")
        from urllib.parse import parse_qs

        ticket = (parse_qs(query).get("ticket") or [None])[0]
        if not ticket:
            await self.close(code=4401)
            return
        try:
            payload = signing.loads(ticket, salt="activity-dashboard-socket", max_age=60)
        except signing.BadSignature:
            await self.close(code=4401)
            return
        scope = await self._authorized_scope(payload)
        if not scope:
            await self.close(code=4403)
            return
        restaurant_id, branch_id = scope
        self.group_name = (
            f"activity_restaurant_{restaurant_id}_branch_{branch_id}"
            if branch_id
            else f"activity_restaurant_{restaurant_id}"
        )
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({"type": "connected"}))

    async def disconnect(self, close_code):
        if getattr(self, "group_name", None):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            return
        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))

    async def presence_changed(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def _authorized_scope(self, payload):
        if not isinstance(payload, dict):
            return None
        user = get_user_model().objects.filter(pk=payload.get("user_id"), is_active=True).select_related("staff_profile__restaurant", "staff_profile__active_branch").first()
        if not user:
            return None
        restaurant_id = payload.get("restaurant_id")
        branch_id = payload.get("branch_id")
        if user.is_superuser:
            return restaurant_id, branch_id
        staff = getattr(user, "staff_profile", None)
        if not staff or staff.restaurant_id != restaurant_id:
            return None
        if staff.role not in {"Admin", "BranchAdmin"} and not user.has_perm("users.monitor_user_activity"):
            return None
        if staff.role == "BranchAdmin":
            assigned = staff.get_assigned_branch()
            if not assigned or branch_id != assigned.id:
                return None
        elif branch_id:
            branch = staff.get_available_branches().filter(pk=branch_id).first()
            if not branch:
                return None
        return restaurant_id, branch_id
