import assert from "node:assert/strict";
import test from "node:test";
import {
  getStaffHomePath,
  isStaffManagementPath,
} from "./staffRoutes.js";

test("staff roles resolve to their existing dashboard routes", () => {
  assert.equal(getStaffHomePath("Admin"), "/admin/dashboard");
  assert.equal(getStaffHomePath("InventoryManager"), "/inventory-manager");
  assert.equal(getStaffHomePath("OperationsManager"), "/operations-manager");
});

test("staff route detection accepts nested management routes", () => {
  assert.equal(isStaffManagementPath("/admin/dashboard/orders"), true);
  assert.equal(isStaffManagementPath("/cashier/takeaway"), true);
  assert.equal(isStaffManagementPath("/select-branch"), true);
  assert.equal(isStaffManagementPath("/menu/restaurant"), false);
  assert.equal(isStaffManagementPath("/profile"), false);
});
