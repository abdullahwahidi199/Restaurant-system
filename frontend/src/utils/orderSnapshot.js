export const FINALIZED_ORDER_STATUSES = Object.freeze([
  "completed",
  "delivered",
  "cancelled",
]);

const FINALIZED_STATUS_SET = new Set(FINALIZED_ORDER_STATUSES);

export function orderSnapshotId(order) {
  if (order?.id === undefined || order?.id === null) return null;
  return String(order.id);
}

export function orderSnapshotTimestamp(order) {
  if (!order?.updated_at) return null;

  const timestamp = Date.parse(order.updated_at);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isFinalizedOrder(order) {
  return FINALIZED_STATUS_SET.has(String(order?.status || "").toLowerCase());
}

/**
 * Full order snapshots are ordered by the server-owned updated_at value.
 * Undated payloads remain compatible with legacy events, but they cannot
 * replace a snapshot that already has a valid server timestamp.
 */
export function shouldApplyOrderSnapshot(current, incoming) {
  if (!incoming) return false;
  if (!current) return true;

  // A finalized order is terminal in the backend state machine.
  if (isFinalizedOrder(current) && !isFinalizedOrder(incoming)) return false;

  const currentTimestamp = orderSnapshotTimestamp(current);
  const incomingTimestamp = orderSnapshotTimestamp(incoming);

  if (currentTimestamp !== null && incomingTimestamp === null) return false;
  if (currentTimestamp === null || incomingTimestamp === null) return true;

  return incomingTimestamp >= currentTimestamp;
}

export function freshestOrderSnapshot(current, incoming) {
  return shouldApplyOrderSnapshot(current, incoming) ? incoming : current;
}

export function upsertOrderSnapshot(orders, incoming) {
  const incomingId = orderSnapshotId(incoming);
  if (incomingId === null) return orders;

  const index = orders.findIndex(
    (order) => orderSnapshotId(order) === incomingId,
  );

  if (index === -1) return [incoming, ...orders];

  const next = freshestOrderSnapshot(orders[index], incoming);
  if (next === orders[index]) return orders;

  const updated = [...orders];
  updated[index] = next;
  return updated;
}

export function isBlockedByFinalizedSnapshot(incoming, finalizedSnapshot) {
  const incomingId = orderSnapshotId(incoming);
  return Boolean(
    incomingId !== null &&
      incomingId === orderSnapshotId(finalizedSnapshot) &&
      isFinalizedOrder(finalizedSnapshot) &&
      !isFinalizedOrder(incoming),
  );
}

function finalizedSnapshotFor(finalizedSnapshots, id) {
  if (!finalizedSnapshots || id === null) return null;
  if (finalizedSnapshots instanceof Map) return finalizedSnapshots.get(id);
  return finalizedSnapshots[id];
}

export function rememberFinalizedOrderSnapshot(finalizedSnapshots, incoming) {
  if (!finalizedSnapshots || !isFinalizedOrder(incoming)) return false;

  const id = orderSnapshotId(incoming);
  const previous = finalizedSnapshots.get(id);
  finalizedSnapshots.set(id, freshestOrderSnapshot(previous, incoming));
  return true;
}

/**
 * Reconcile an authoritative list without allowing an older representation of
 * the same order (or a pre-finalization response) to win at response time.
 */
export function reconcileOrderSnapshots(
  currentOrders,
  incomingOrders,
  {
    finalizedSnapshots = null,
    excludeFinalized = false,
    preserveMissing = false,
  } = {},
) {
  const currentById = new Map(
    currentOrders.map((order) => [orderSnapshotId(order), order]),
  );

  const incomingIds = new Set();
  const result = incomingOrders.reduce((result, incoming) => {
    const id = orderSnapshotId(incoming);
    if (id === null) return result;
    incomingIds.add(id);

    const finalizedSnapshot = finalizedSnapshotFor(finalizedSnapshots, id);
    if (isBlockedByFinalizedSnapshot(incoming, finalizedSnapshot)) {
      return result;
    }

    const next = freshestOrderSnapshot(currentById.get(id), incoming);
    if (excludeFinalized && isFinalizedOrder(next)) return result;

    result.push(next);
    return result;
  }, []);

  if (!preserveMissing) return result;

  for (const current of currentOrders) {
    const id = orderSnapshotId(current);
    if (id === null || incomingIds.has(id)) continue;

    const finalizedSnapshot = finalizedSnapshotFor(finalizedSnapshots, id);
    if (
      isBlockedByFinalizedSnapshot(current, finalizedSnapshot) ||
      (excludeFinalized && isFinalizedOrder(current))
    ) {
      continue;
    }
    result.push(current);
  }

  return result;
}

/** Merge a lightweight item event without inventing a client-side order time. */
export function mergeOrderItemSnapshot(
  order,
  incomingItem,
  orderUpdatedAt = null,
) {
  if (!order || !incomingItem?.id) return order;

  const eventOrder = orderUpdatedAt
    ? { ...order, updated_at: orderUpdatedAt }
    : order;
  if (
    orderUpdatedAt &&
    !shouldApplyOrderSnapshot(order, eventOrder)
  ) {
    return order;
  }

  const items = order.items || [];
  const itemExists = items.some((item) => item.id === incomingItem.id);
  const nextItems = itemExists
    ? items.map((item) => (item.id === incomingItem.id ? incomingItem : item))
    : [...items, incomingItem];

  return {
    ...order,
    items: nextItems,
    ...(orderUpdatedAt ? { updated_at: orderUpdatedAt } : {}),
  };
}

export function removeOrderItemSnapshot(
  order,
  itemId,
  orderUpdatedAt = null,
) {
  if (!order) return order;

  const eventOrder = orderUpdatedAt
    ? { ...order, updated_at: orderUpdatedAt }
    : order;
  if (orderUpdatedAt && !shouldApplyOrderSnapshot(order, eventOrder)) {
    return order;
  }

  return {
    ...order,
    items: (order.items || []).filter((item) => item.id !== itemId),
    ...(orderUpdatedAt ? { updated_at: orderUpdatedAt } : {}),
  };
}

export function mergeTableSnapshot(
  current,
  incoming,
  { finalizedSnapshots = null } = {},
) {
  if (!incoming) return current;

  const incomingOrder = incoming.current_order;
  if (!incomingOrder) return incoming;

  const incomingOrderId = orderSnapshotId(incomingOrder);
  const finalizedSnapshot = finalizedSnapshotFor(
    finalizedSnapshots,
    incomingOrderId,
  );
  if (isBlockedByFinalizedSnapshot(incomingOrder, finalizedSnapshot)) {
    return { ...(current || {}), ...incoming, current_order: null };
  }

  const currentOrder = current?.current_order;
  if (orderSnapshotId(currentOrder) !== incomingOrderId) return incoming;

  return {
    ...incoming,
    current_order: freshestOrderSnapshot(currentOrder, incomingOrder),
  };
}

export function reconcileTableSnapshots(
  currentTables,
  incomingTables,
  { preserveMissing = false, ...options } = {},
) {
  const currentById = new Map(
    currentTables.map((table) => [String(table.id), table]),
  );

  const incomingIds = new Set(incomingTables.map((table) => String(table.id)));
  const result = incomingTables.map((incoming) =>
    mergeTableSnapshot(currentById.get(String(incoming.id)), incoming, options),
  );

  if (preserveMissing) {
    result.push(
      ...currentTables.filter((table) => !incomingIds.has(String(table.id))),
    );
  }

  return result;
}

export function applyTableItemsSnapshot(
  table,
  {
    order_id: orderId,
    item_count: itemCount,
    order_total: orderTotal,
    order_status: orderStatus,
    order_updated_at: orderUpdatedAt,
  },
  { finalizedSnapshots = null } = {},
) {
  const currentOrder = table?.current_order;
  if (orderSnapshotId(currentOrder) !== String(orderId)) return table;

  const incomingOrder = {
    ...currentOrder,
    item_count: itemCount,
    total: orderTotal,
    status: orderStatus,
    ...(orderUpdatedAt ? { updated_at: orderUpdatedAt } : {}),
  };
  const finalizedSnapshot = finalizedSnapshotFor(
    finalizedSnapshots,
    orderSnapshotId(incomingOrder),
  );

  if (
    isBlockedByFinalizedSnapshot(incomingOrder, finalizedSnapshot) ||
    !shouldApplyOrderSnapshot(currentOrder, incomingOrder)
  ) {
    return table;
  }

  if (isFinalizedOrder(incomingOrder)) {
    rememberFinalizedOrderSnapshot(finalizedSnapshots, incomingOrder);
    return { ...table, current_order: null };
  }

  return { ...table, current_order: incomingOrder };
}

export function applyOrderSnapshotToTable(table, incomingOrder) {
  if (!table || !incomingOrder?.id) return table;

  const currentOrder = table.current_order;
  if (isFinalizedOrder(incomingOrder)) {
    return orderSnapshotId(currentOrder) === orderSnapshotId(incomingOrder)
      ? { ...table, current_order: null }
      : table;
  }

  if (orderSnapshotId(currentOrder) !== orderSnapshotId(incomingOrder)) {
    return table;
  }

  return {
    ...table,
    current_order: freshestOrderSnapshot(currentOrder, incomingOrder),
  };
}
