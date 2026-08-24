export function getMenuEntryKey(item) {
  const type = item.itemType || item.type || "menu_item";
  return `${type}:${item.id}`;
}

export function compareMenuEntries(a, b) {
  const orderA = Number.isFinite(Number(a.display_order))
    ? Number(a.display_order)
    : Number.MAX_SAFE_INTEGER;
  const orderB = Number.isFinite(Number(b.display_order))
    ? Number(b.display_order)
    : Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) return orderA - orderB;
  return String(getMenuEntryKey(a)).localeCompare(String(getMenuEntryKey(b)));
}

export function compareMenuCategories(a, b) {
  const rankA = Number.isFinite(Number(a?.rank))
    ? Number(a.rank)
    : Number.MAX_SAFE_INTEGER;
  const rankB = Number.isFinite(Number(b?.rank))
    ? Number(b.rank)
    : Number.MAX_SAFE_INTEGER;

  if (rankA !== rankB) return rankA - rankB;

  const idA = Number(a?.id);
  const idB = Number(b?.id);
  if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
    return idA - idB;
  }

  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

export function sortMenuCategories(categories) {
  return [...(categories || [])].sort(compareMenuCategories);
}

export function mergeCategoryEntries(category, mapEntry = (item) => item) {
  const categoryName = category?.name || "Uncategorized";
  const categoryId = category?.id || null;

  return [
    ...(category?.menu_items || []).map((item) =>
      mapEntry({
        ...item,
        type: "menu_item",
        itemType: "menu_item",
        stableKey: `menu-${item.id}`,
        categoryId,
        categoryName,
      }),
    ),
    ...(category?.platters || []).map((item) =>
      mapEntry({
        ...item,
        type: "platter",
        itemType: "platter",
        stableKey: `platter-${item.id}`,
        categoryId,
        categoryName,
      }),
    ),
  ].sort(compareMenuEntries);
}

export function flattenMenuCategories(categories, mapEntry = (item) => item) {
  return sortMenuCategories(categories).flatMap((category) =>
    mergeCategoryEntries(category, mapEntry),
  );
}

export function canonicalReorderPayload(items) {
  return items.map((item, index) => ({
    id: item.id,
    type: item.itemType || item.type || "menu_item",
    order: index,
  }));
}
