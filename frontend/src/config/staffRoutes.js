export const STAFF_HOME_ROUTES = Object.freeze({
  SuperAdmin: "/super-admin",
  Admin: "/admin/dashboard",
  BranchAdmin: "/admin/dashboard",
  Manager: "/manager",
  Cashier: "/cashier",
  InventoryManager: "/inventory-manager",
  FinanceManager: "/finance-manager",
  OperationsManager: "/operations-manager",
  Call_operator: "/call-operator",
  Waiter: "/waiter",
  Kitchen_manager: "/kitchen",
});

const STAFF_ROUTE_PREFIXES = Object.freeze([
  ...new Set(Object.values(STAFF_HOME_ROUTES)),
  "/select-branch",
  "/subscription-inactive",
]);

export function getStaffHomePath(role, fallback = "/") {
  return STAFF_HOME_ROUTES[role] || fallback;
}

export function isStaffManagementPath(pathname) {
  const normalizedPath = `/${String(pathname || "")
    .replace(/^\/+|\/+$/g, "")}`;

  return STAFF_ROUTE_PREFIXES.some(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}
