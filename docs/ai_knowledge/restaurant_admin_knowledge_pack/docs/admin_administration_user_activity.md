---
id: admin_administration_user_activity
title: Administration > User Activity
module: administration
namespace: admin
status: current_observed_behavior
summary: Monitors authenticated staff accounts and sign-in sessions, not attendance, hours worked, sales productivity
  or a record of every user action. Admin defaults to All Branches, independentl...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- account
- active
- activity
- administration
- idle
- online
- presence
- sessions
- staff
- user
- valid
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_558-568
tool_hints:
- audit.list
- records.list
metric_ids: []
---

### Administration > User Activity

- **Purpose / scope:** Monitors authenticated staff accounts and sign-in sessions, not attendance, hours worked, sales productivity or a record of every user action. Admin defaults to All Branches, independently of the working branch; Branch Admin is restricted to the assigned branch. Monitoring permission and session-revocation authority are separate; Branch Admin can monitor but does not automatically have revocation authority.
- **Active Users:** Distinct accounts with at least one currently Active session in scope. Multiple active devices/sign-ins for the same account count as one user; not the number of employees whose employment status is Active.
- **Live Sessions:** Number of valid sessions currently Active or Idle. Counts sign-ins, not unique people or necessarily distinct physical devices; an account can have several sessions. Offline but valid sessions are excluded from this card even though they remain in the Live Sessions table.
- **Idle Users:** Distinct accounts with an Idle session and no Active session in scope. An account active on one session and idle on another counts as Active, not Idle. Active Users + Idle Users measures distinct online accounts, not Live Sessions.
- **Valid Accounts:** Distinct accounts with at least one session not logged out, revoked or past its authentication expiry, including Offline sessions. Not all registered accounts, a licence quota, enabled employee count or evidence that anyone is currently working. It can exceed the combined Active/Idle user counts.
- **Online by Role:** For each recorded session role, Users counts distinct accounts with Active/Idle sessions; Sessions counts those online sessions. Includes Idle users, unlike Active Users alone. Role is recorded on the session, not necessarily the employee's latest role after a later profile change; an account with different recorded roles can appear in multiple role groups.
- **Presence statuses:** Defaults: Active means a connection update within 90 seconds and interaction within five minutes; Idle means a recent connection but interaction more than five minutes ago; Offline means no recent connection or no available observation. Thresholds are configurable. Passive reading can be Idle; hidden/closed browsers, connection loss or observation failures can look Offline without logout or session expiry. These statuses are not attendance judgments.
- **Filters / coverage:** Search matches staff name/username; role and status filters narrow table rows/counts, not headline cards or role summaries. Branch selection changes both. Newest sign-in first; all matching sessions are paginated, normally 20 per page, without a 100-record total cap. There is no date-range selector or default current-month restriction.
