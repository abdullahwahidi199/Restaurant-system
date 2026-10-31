---
id: admin_administration_sessions_security
title: 'Administration > User Activity: Sessions and Security History'
module: administration
namespace: admin
status: current_observed_behavior
summary: Live lists valid sessions, including those currently Offline. Security History includes both valid and ended
  sessions, not only security incidents; Logout, Revoked and Expired identify di...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- activity
- administration
- and
- concurrent
- device
- history
- logins
- revoke
- security
- session
- sessions
- user
related_docs:
- admin_administration_user_activity
routes: []
source_refs:
- uploaded_admin_reference:lines_569-577
tool_hints:
- audit.list
- records.list
metric_ids: []
---

### Administration > User Activity: Sessions and Security History

- **Live Sessions / Security History:** Live lists valid sessions, including those currently Offline. Security History includes both valid and ended sessions, not only security incidents; Logout, Revoked and Expired identify different reasons a session ended. A row represents a sign-in session, not an audit event, failed-login attempt or every activity performed during it. History has the same search/role/branch/status filters and full pagination, but no headline cards.
- **Concurrent count:** Number of all valid sessions for that account within the authorized branch scope, including Offline sessions and records outside table search/role/status filters. Not just the visible page, online devices or distinct hardware. Ended history rows can show the account's current concurrent count rather than its count when that old session ended.
- **Role / branch / device / session:** Role and browser/operating-system descriptors identify the recorded sign-in; Session is a shortened session reference, not an employee ID. Branch is the session association, not every branch assigned to the employee; switching branches can update the same session's association. A missing association displays All Branches but does not establish unrestricted permissions.
- **Started / Last Seen:** Started is sign-in time; routine authentication renewal keeps the same session rather than starting another. Last Seen is the latest available connection observation, not the last business transaction; ended sessions can fall back to their ending time. Never Seen can mean the observation is no longer available, not that the account was never used. Relative times and older displayed timestamps use the device clock/timezone; this is not a permanent minute-by-minute presence history.
- **Live Updates / Polling Fallback:** Describes the monitoring page's connection, not an employee's presence or account validity. Updates can lag: the default periodic refresh is two minutes with live updates connected, otherwise one minute. Connection/observation failures can leave stale or understated online counts; zero online users does not prove no one is operating the restaurant.
- **Revocation meaning:** Ends eligible sign-in sessions and requires a new login; it does not delete staff, change employment/payroll status or reset the account password. Revoke All covers that account's valid sessions within the authorized restaurant/branch scope, not necessarily every branch/device globally; it can include the administrator's own session. It is not reversible session restoration.
