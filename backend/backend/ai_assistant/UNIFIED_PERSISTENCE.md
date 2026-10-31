# Shared AI conversations and execution audits

`ai_assistant` owns the single set of `Conversation`, `Message`, `TurnAudit`,
`AuditEvent`, `AuditBlob`, `AuditBlobReference` and `AuditAccess` models. Both
existing agents use them. `business_analyst.models` and `.auditing` contain
compatibility imports, not Django model definitions or a second trace engine.

`Conversation.agent_type` and `TurnAudit.agent_type` are stable server-selected
identities: `operator_mentor` and `business_analyst`. They are bounded strings,
allowing future agents without new conversation/audit tables or choice migrations.
`AgentStore` validates its server configuration and centralizes owner/context
filters, leases, message persistence, audit creation, failures and release.
The Mentor and Business Analyst instantiate separate stores; Business Analyst
retains its existing authorization-policy suffix. The request body and model
output cannot choose the store/agent.

Prompts, engines, knowledge, capabilities, business tools, permissions and chat
API endpoints remain agent-specific. Neither chat component nor its DTO format
needs a replacement. Shared state does not authorize cross-agent history access,
even when user, restaurant, branch and authorization binding are identical.

## Data upgrade

Two migrations implement the upgrade:

1. `ai_assistant.0005_unified_agent_storage` backfills the Mentor discriminator,
   widens bindings to 128 characters and tool names to 100, adds legacy message/
   event ID fields, public model configuration and Business Analyst batch/operation
   counters, and adds indexes for agent-scoped lists.
2. `business_analyst.0002_unify_persistence` checks for active turns and UUID
   collisions, copies all four old tables, verifies copied values/relationships,
   and only then removes the old tables. Copy, verification and removal are one
   atomic transaction. PostgreSQL locks the source and destination tables during
   that transaction. No database is reset.

Conversation/turn UUIDs, message request IDs, ordering, timestamps, content,
sources, states, errors and available audit metadata are retained. Existing
Mentor numeric IDs remain unchanged. Overlapping Business Analyst numeric IDs are
preserved as `legacy_id`; distinct internal IDs are allocated above both old ID
ranges, and serializers return `Message.public_id`. Database sequences are reset
to the copied maximum. Original event IDs remain available through `legacy_id`;
event sequence and turn relationships are preserved.

Imported Business Analyst event metadata is redacted/encrypted in the existing
blob format. Legacy `complete` becomes canonical `completed`; its original value
is retained in the encrypted capture notes. Existing model-finished events supply
only their actually reported usage. Missing usage, provider/language details,
HTTP payloads or tool-start events are not reconstructed. Nonnegative elapsed
turn duration can be derived from the recorded timestamps and is explicitly
identified as such; inconsistent timestamps produce unavailable duration.
Extra legacy configuration remains inside encrypted snapshots, while summary
configuration contains only model-selection fields.

### Deployment

Take and verify a database backup, retain the existing audit encryption keys/
SECRET_KEY fallbacks, and stop all application writers before upgrading. Inspect
the plan and apply the complete dependency chain before starting the new code:

```text
python manage.py migrate --plan
python manage.py migrate
python manage.py check
```

An active turn, UUID collision, integrity mismatch or unsupported oversized legacy
payload aborts the data migration and retains its source tables. Resolve the cause
while writers remain stopped. Do not edit IDs or fake migration state to bypass
the safeguards. Successful consolidation is intentionally irreversible through
`migrate`: a rollback restores the verified pre-upgrade database backup and matching
application version. This avoids discarding richer shared audits or new turns.
No production/configured application database is automatically upgraded by tests.

## Auditing and administration

Both engines use the same `Trace` and provider capture scope. Full prompts,
observable provider payloads, tool arguments/results and generated answers are
redacted/encrypted; private reasoning and credentials are excluded. Lightweight
event DTOs expose only timing, names, IDs, outcomes and byte counts. Token totals
are aggregated from reported provider responses exactly once. Business Analyst
additionally retains batch and individual-operation counts and outcomes.

The existing `/api/assistant/audit/` SuperAdmin API covers every agent. Its new
`agents/` options endpoint discovers recorded agent/tool names. Turn and
conversation lists accept `agent_type` alongside supported owner, restaurant,
branch, date, status, model, tool and failure filters. Conversation date filters
use last activity; execution filters select matching turns. The existing
SuperAdmin page shows agent labels, common metrics, timelines and conversation
messages, including links to recorded execution traces. Imported incomplete
captures are labeled as such. Nothing is exposed through a second dashboard.

Every sensitive audit read remains SuperAdmin-only, freshly authorized, access
logged and non-cacheable. Deleting a conversation deletes its live messages but
preserves audit turns/events, original conversation UUID and encrypted snapshots.
Deleting a restaurant/branch nulls shared scope FKs; the Business Analyst still
requires a valid trusted restaurant/branch for live execution. The existing audit
maintenance command remains opt-in with `--execute`; configured audit retention
now applies to both agents and does not delete conversation messages.

Future agents instantiate an `AgentStore` with a new trusted identifier and use
the existing `Trace`/audit scope. They supply their own authorization resolver and
orchestration. No additional Conversation/Message/audit model set is needed.
