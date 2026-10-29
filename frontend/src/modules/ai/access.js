// Mirrors knowledge.access.LOGIN_ROLES for navigation only. Django rechecks the
// account, subscription, branch and role on every request and tool operation.
export const AI_CHAT_ROLES = Object.freeze(["Admin", "BranchAdmin", "Manager", "Cashier", "Waiter", "Kitchen_manager",
  "InventoryManager", "FinanceManager", "OperationsManager", "Call_operator"]);
export const AI_CHAT_PATH = "/assistant";

export function assistantContextKey(auth, activeBranch) {
  const user = auth?.user || {};
  return JSON.stringify([user.staff_id, user.username, user.session_id, user.role, user.restaurant_id,
    activeBranch?.id ?? user.active_branch?.id ?? user.active_branch_id,
    user.can_monitor_activity, user.can_revoke_sessions]);
}
