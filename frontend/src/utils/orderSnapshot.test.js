import assert from "node:assert/strict";
import test from "node:test";

import {
  applyTableItemsSnapshot,
  freshestOrderSnapshot,
  isBlockedByFinalizedSnapshot,
  mergeOrderItemSnapshot,
  mergeTableSnapshot,
  reconcileOrderSnapshots,
  shouldApplyOrderSnapshot,
  upsertOrderSnapshot,
} from "./orderSnapshot.js";

const snapshot = (id, status, updatedAt, extra = {}) => ({
  id,
  status,
  updated_at: updatedAt,
  ...extra,
});

test("an older full snapshot cannot regress a newer order", () => {
  const paid = snapshot(7, "completed", "2026-09-15T10:00:02.000Z");
  const delayedReady = snapshot(7, "ready", "2026-09-15T10:00:01.000Z");

  assert.equal(shouldApplyOrderSnapshot(paid, delayedReady), false);
  assert.equal(freshestOrderSnapshot(paid, delayedReady), paid);
  assert.deepEqual(upsertOrderSnapshot([paid], delayedReady), [paid]);
});

test("a newer server snapshot still propagates normally", () => {
  const pending = snapshot(8, "pending", "2026-09-15T10:00:00.000Z");
  const inProgress = snapshot(
    8,
    "in_progress",
    "2026-09-15T10:00:01.000Z",
  );

  assert.equal(shouldApplyOrderSnapshot(pending, inProgress), true);
  assert.deepEqual(upsertOrderSnapshot([pending], inProgress), [inProgress]);
});

test("a finalized snapshot is a tombstone against delayed active payloads", () => {
  const paid = snapshot(9, "completed", "2026-09-15T10:00:02.000Z");
  const delayedReady = snapshot(9, "ready", "2026-09-15T10:00:01.000Z");
  const current = [
    snapshot(10, "pending", "2026-09-15T10:00:00.000Z"),
  ];

  assert.equal(isBlockedByFinalizedSnapshot(delayedReady, paid), true);
  assert.deepEqual(
    reconcileOrderSnapshots(current, [delayedReady, ...current], {
      finalizedSnapshots: new Map([["9", paid]]),
      excludeFinalized: true,
    }),
    current,
  );
});

test("delayed REST lists retain a newer matching WebSocket snapshot", () => {
  const socketOrder = snapshot(
    11,
    "in_progress",
    "2026-09-15T10:00:03.000Z",
    { source: "socket" },
  );
  const restOrder = snapshot(
    11,
    "pending",
    "2026-09-15T10:00:01.000Z",
    { source: "rest" },
  );

  assert.deepEqual(reconcileOrderSnapshots([socketOrder], [restOrder]), [
    socketOrder,
  ]);
});

test("a REST response preserves WS-created rows when an event intervened", () => {
  const socketOrder = snapshot(
    14,
    "pending",
    "2026-09-15T10:00:03.000Z",
  );

  assert.deepEqual(
    reconcileOrderSnapshots([socketOrder], [], { preserveMissing: true }),
    [socketOrder],
  );
  assert.deepEqual(reconcileOrderSnapshots([socketOrder], []), []);
});

test("timestamped state is not overwritten by an undated legacy payload", () => {
  const current = snapshot(12, "ready", "2026-09-15T10:00:01.000Z");
  assert.equal(shouldApplyOrderSnapshot(current, { id: 12, status: "pending" }), false);
  assert.equal(shouldApplyOrderSnapshot({ id: 12 }, { id: 12 }), true);
});

test("item-only merges use only the supplied server order watermark", () => {
  const current = snapshot(
    13,
    "in_progress",
    "2026-09-15T10:00:01.000Z",
    { items: [{ id: 1, status: "pending" }] },
  );

  const merged = mergeOrderItemSnapshot(
    current,
    { id: 1, status: "ready" },
    "2026-09-15T10:00:02.000Z",
  );
  assert.equal(merged.updated_at, "2026-09-15T10:00:02.000Z");
  assert.deepEqual(merged.items, [{ id: 1, status: "ready" }]);

  const stale = mergeOrderItemSnapshot(
    merged,
    { id: 1, status: "pending" },
    current.updated_at,
  );
  assert.equal(stale, merged);
});

test("a finalized table tombstone clears rather than preserves READY", () => {
  const ready = snapshot(15, "ready", "2026-09-15T10:00:01.000Z");
  const paid = snapshot(15, "completed", "2026-09-15T10:00:02.000Z");
  const currentTable = { id: 3, status: "occupied", current_order: ready };
  const delayedTable = { ...currentTable, name: "Table 3" };

  assert.deepEqual(
    mergeTableSnapshot(currentTable, delayedTable, {
      finalizedSnapshots: new Map([["15", paid]]),
    }),
    { ...delayedTable, current_order: null },
  );
});

test("table item summaries reject an older per-order watermark", () => {
  const currentOrder = snapshot(
    16,
    "ready",
    "2026-09-15T10:00:02.000Z",
    { item_count: 3, total: "90.00" },
  );
  const table = { id: 4, current_order: currentOrder };

  assert.equal(
    applyTableItemsSnapshot(table, {
      order_id: 16,
      item_count: 1,
      order_total: "30.00",
      order_status: "in_progress",
      order_updated_at: "2026-09-15T10:00:01.000Z",
    }),
    table,
  );
});
