"""Exercise an actual upgrade on separate disposable databases, not production."""
import copy
import json
import tempfile
import unittest
import uuid
from datetime import timedelta
from pathlib import Path

from django.db import connections
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone
from django.test import override_settings
from django.conf import settings

from ai_assistant.audit_payloads import canonical, cipher, read_blob
from ai_assistant.models import AuditBlob, AuditEvent, Conversation, Message, TurnAudit

BEFORE = [("ai_assistant", "0004_auditaccess_actor_identifier"), ("business_analyst", "0001_initial")]
AFTER = [("ai_assistant", "0005_unified_agent_storage"), ("business_analyst", "0002_unify_persistence")]


class MigrationRouter:
    def __init__(self, alias):
        self.alias = alias

    def db_for_read(self, model, **hints):
        return self.alias

    db_for_write = db_for_read


class UnifiedMigrationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ai-storage-migration-")
        self.alias = "ai_upgrade_" + uuid.uuid4().hex[:10]
        config = copy.deepcopy(connections.databases["default"])
        external = getattr(settings, "AI_MIGRATION_TEST_DATABASE", None)
        self.bootstrap_alias = None
        if external:
            config.update(external)
            config["NAME"] = "unified_upgrade_" + uuid.uuid4().hex
            self.bootstrap_alias = self.alias + "_setup"
            connections.databases[self.bootstrap_alias] = {**config, "NAME": "postgres"}
            bootstrap = connections[self.bootstrap_alias]
            with bootstrap.cursor() as cursor:
                cursor.execute("CREATE DATABASE " + bootstrap.ops.quote_name(config["NAME"]))
            self.pg_name = config["NAME"]
        else:
            config.update(ENGINE="django.db.backends.sqlite3", NAME=str(Path(self.directory.name)/"upgrade.sqlite3"))
        connections.databases[self.alias] = config
        self.connection = connections[self.alias]
        # Some older application migrations omit .using(schema_editor.alias).
        # Route those historical ORM calls into this disposable database too.
        self.routing = override_settings(DATABASE_ROUTERS=[MigrationRouter(self.alias)])
        self.routing.enable()
        self.addCleanup(self.routing.disable)
        executor = MigrationExecutor(self.connection)
        executor.migrate(BEFORE)
        self.old = executor.loader.project_state(BEFORE).apps
        User = self.old.get_model("auth", "User")
        Restaurant = self.old.get_model("restaurants", "Restaurant")
        Branch = self.old.get_model("restaurants", "Branch")
        self.user = User.objects.using(self.alias).create(username="migration-synthetic-user")
        restaurant = Restaurant.objects.using(self.alias).create(name="Migration fixture", email="migration@example.invalid", phone="migration", address="Synthetic")
        self.branch = Branch.objects.using(self.alias).create(restaurant_id=restaurant.pk, name="Fixture", code="MIG-1")
        self.restaurant = restaurant
        self.conversation_id, self.turn_id = uuid.uuid4(), uuid.uuid4()
        self.started = timezone.now() - timedelta(days=30)

    def tearDown(self):
        self.connection.close()
        del connections[self.alias]
        connections.databases.pop(self.alias, None)
        if self.bootstrap_alias:
            bootstrap = connections[self.bootstrap_alias]
            assert self.pg_name.startswith("unified_upgrade_")
            with bootstrap.cursor() as cursor:
                cursor.execute("DROP DATABASE " + bootstrap.ops.quote_name(self.pg_name))
            bootstrap.close()
            del connections[self.bootstrap_alias]
            connections.databases.pop(self.bootstrap_alias, None)
        self.directory.cleanup()

    def seed(self, *, collision=False, active=False):
        BConversation = self.old.get_model("business_analyst", "Conversation")
        BMessage = self.old.get_model("business_analyst", "Message")
        BTurn = self.old.get_model("business_analyst", "TurnAudit")
        BEvent = self.old.get_model("business_analyst", "AuditEvent")
        MentorConversation = self.old.get_model("ai_assistant", "Conversation")
        MentorMessage = self.old.get_model("ai_assistant", "Message")
        MentorBlob = self.old.get_model("ai_assistant", "AuditBlob")
        MentorTurn = self.old.get_model("ai_assistant", "TurnAudit")
        MentorEvent = self.old.get_model("ai_assistant", "AuditEvent")
        mentor = MentorConversation.objects.using(self.alias).create(pk=self.conversation_id if collision else uuid.uuid4(),
            user_id=self.user.pk, restaurant_id=None, branch_id=None, authorization_binding="mentor-binding", title="Mentor legacy")
        MentorMessage.objects.using(self.alias).create(pk=1, conversation=mentor, request_id=uuid.uuid4(), role="user", content="Mentor original")
        raw = canonical({"content": "Mentor encrypted original"}).encode()
        import hashlib
        blob = MentorBlob.objects.using(self.alias).create(pk=hashlib.sha256(b"json\0"+raw).hexdigest(),kind="json",
            ciphertext=cipher().encrypt(raw).decode(),byte_count=len(raw),children=[])
        mentor_turn = MentorTurn.objects.using(self.alias).create(request_id=uuid.uuid4(),conversation=mentor,
            conversation_identifier=mentor.pk, question_payload=blob, user_id=self.user.pk,
            provider="deepseek", model="deepseek-flash", started_at=self.started, status="completed")
        MentorEvent.objects.using(self.alias).create(pk=1,turn=mentor_turn,sequence=1,event_type="user_message",
            started_at=self.started,payload=blob)
        self.mentor_id, self.mentor_turn_id = mentor.pk, mentor_turn.pk
        self.original_ciphertext = blob.ciphertext
        conversation = BConversation.objects.using(self.alias).create(pk=self.conversation_id, user_id=self.user.pk,
            restaurant_id=self.restaurant.pk, branch_id=self.branch.pk, authorization_binding="b"*90, title="Business legacy",
            active_request=uuid.uuid4() if active else None, active_until=timezone.now()+timedelta(minutes=5) if active else None)
        BConversation.objects.using(self.alias).filter(pk=conversation.pk).update(created_at=self.started,updated_at=self.started)
        self.original_sources = [{"kind":"tool","tool_id":"get_expense_summary","evidence_id":"b1:0","executed_at":self.started.isoformat()}]
        for pk, role, content in [(1,"user","Recorded business question"),(2,"assistant","Recorded answer AFN 1850.00")]:
            BMessage.objects.using(self.alias).create(pk=pk, conversation=conversation,request_id=self.turn_id,
                role=role,kind="question" if role=="user" else "answer",content=content,sources=self.original_sources if role=="assistant" else [])
            BMessage.objects.using(self.alias).filter(pk=pk).update(created_at=self.started)
        config={"model":"deepseek-flash","reasoning_effort":"none","thinking":{"type":"disabled"}}
        BTurn.objects.using(self.alias).create(request_id=self.turn_id,conversation=conversation,status="complete",
            model_configuration=config,model_calls=2,batches=1,operations=2)
        BTurn.objects.using(self.alias).filter(pk=self.turn_id).update(started_at=self.started,finished_at=self.started+timedelta(seconds=3))
        self.original_metadata = [
            {"number":1,"usage":{"prompt_tokens":10,"completion_tokens":2,"total_tokens":12}},
            {"number":2,"usage":{"prompt_tokens":20}},
            {"kind":"tool","id":"get_expense_summary","ok":True,"duration_ms":15,
             "literal":{"__audit_text_blob__":"literal-not-a-reference"},"password":"must-redact"},
        ]
        for pk,(event,data) in enumerate(zip(["model_finished","model_finished","operation_finished"],self.original_metadata),1):
            BEvent.objects.using(self.alias).create(pk=pk,turn_id=self.turn_id,sequence=pk,event=event,metadata=data)
            BEvent.objects.using(self.alias).filter(pk=pk).update(created_at=self.started+timedelta(seconds=pk))

    def upgrade(self):
        MigrationExecutor(self.connection).migrate(AFTER)

    def test_full_upgrade_preserves_ids_timestamps_messages_metadata_and_encryption(self):
        self.seed()
        self.upgrade()
        mentor = Conversation.objects.using(self.alias).get(pk=self.mentor_id)
        business = Conversation.objects.using(self.alias).get(pk=self.conversation_id)
        self.assertEqual((mentor.agent_type,business.agent_type),("operator_mentor","business_analyst"))
        self.assertIsNone(mentor.restaurant_id)
        self.assertEqual((business.authorization_binding,business.created_at,business.updated_at),("b"*90,self.started,self.started))
        messages = list(Message.objects.using(self.alias).filter(conversation=business))
        self.assertEqual([m.public_id for m in messages],[1,2])
        self.assertEqual([m.created_at for m in messages],[self.started,self.started])
        self.assertEqual(messages[1].sources,self.original_sources)
        self.assertGreater(messages[0].pk,2)
        self.assertEqual(Message.objects.using(self.alias).get(pk=1).content,"Mentor original")
        turn = TurnAudit.objects.using(self.alias).get(pk=self.turn_id)
        self.assertEqual((turn.agent_type,turn.conversation_identifier,turn.user_message_id,turn.assistant_message_id),
            ("business_analyst",self.conversation_id,messages[0].pk,messages[1].pk))
        self.assertEqual((turn.model_calls,turn.completed_model_calls,turn.batches,turn.operations),(2,2,1,2))
        self.assertEqual(turn.usage,{"prompt_tokens":30,"completion_tokens":2,"total_tokens":12})
        self.assertFalse(turn.usage_complete)
        self.assertEqual(turn.duration_ms,3000)
        self.assertEqual((turn.language,turn.provider),("",""))
        events = list(AuditEvent.objects.using(self.alias).filter(turn=turn).select_related("payload"))
        self.assertEqual([e.legacy_id for e in events],[1,2,3])
        self.assertEqual([e.sequence for e in events],[1,2,3])
        self.assertEqual(read_blob(events[2].payload)["literal"],{"__audit_text_blob__":"literal-not-a-reference"})
        self.assertEqual(read_blob(events[2].payload)["password"],"[REDACTED]")
        original = AuditBlob.objects.using(self.alias).get(pk=TurnAudit.objects.using(self.alias).get(pk=self.mentor_turn_id).question_payload_id)
        self.assertEqual(original.ciphertext,self.original_ciphertext)
        self.assertEqual(read_blob(original)["content"],"Mentor encrypted original")
        self.assertFalse(any(name.startswith("business_analyst_") for name in self.connection.introspection.table_names()))
        new = Message.objects.using(self.alias).create(conversation=business,request_id=uuid.uuid4(),role="user",content="New after upgrade")
        self.assertGreater(new.pk,messages[-1].pk)

    def test_uuid_collision_aborts_without_copying_or_removing_sources(self):
        self.seed(collision=True)
        with self.assertRaisesRegex(RuntimeError,"collision"):
            self.upgrade()
        self.assertEqual(self.old.get_model("business_analyst","Message").objects.using(self.alias).count(),2)
        self.assertEqual(Conversation.objects.using(self.alias).filter(agent_type="business_analyst").count(),0)
        self.assertIn("business_analyst_auditevent",self.connection.introspection.table_names())

    def test_clock_skew_and_extra_legacy_configuration_are_not_fabricated_or_exposed_as_metadata(self):
        self.seed()
        OldTurn = self.old.get_model("business_analyst", "TurnAudit")
        turn = OldTurn.objects.using(self.alias).get(pk=self.turn_id)
        config = {**turn.model_configuration, "private_prompt": "PRIVATE_LEGACY_CONTENT"}
        OldTurn.objects.using(self.alias).filter(pk=self.turn_id).update(
            finished_at=self.started-timedelta(seconds=1),model_configuration=config)
        self.upgrade()
        current = TurnAudit.objects.using(self.alias).select_related("question_payload").get(pk=self.turn_id)
        self.assertIsNone(current.duration_ms)
        self.assertNotIn("private_prompt",current.model_configuration)
        snapshot = read_blob(current.question_payload)
        self.assertEqual(snapshot["model_configuration"]["private_prompt"],"PRIVATE_LEGACY_CONTENT")
        self.assertEqual(snapshot["legacy_capture"]["duration_basis"],"unavailable")

    def test_active_turn_aborts_with_all_legacy_history_retained(self):
        self.seed(active=True)
        with self.assertRaisesRegex(RuntimeError,"active turns"):
            self.upgrade()
        self.assertEqual(self.old.get_model("business_analyst","TurnAudit").objects.using(self.alias).get().pk,self.turn_id)
        self.assertEqual(self.old.get_model("business_analyst","AuditEvent").objects.using(self.alias).count(),3)
