export const REPORT_OPTIONS = [
  { value: "orders", key: "orders_report", fallback: "Orders Report" },
  {
    value: "finance",
    key: "finance_report",
    fallback: "Finance (Profit & Loss)",
  },
  {
    value: "inventory",
    key: "inventory_report",
    fallback: "Inventory Status",
  },
  {
    value: "staff_performance",
    key: "staff_performance",
    fallback: "Staff Performance",
  },
  {
    value: "menu_items",
    key: "menu_item_sales",
    fallback: "Menu Item Sales",
  },
];

export const RANKING_OPTIONS = [
  { value: "all", direction: "all", limit: null },
  ...[5, 10, 20, 50].map((limit) => ({
    value: `top_${limit}`,
    direction: "top",
    limit,
  })),
  ...[5, 10, 20, 50].map((limit) => ({
    value: `bottom_${limit}`,
    direction: "bottom",
    limit,
  })),
];

export function todayLocalISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseRanking(value) {
  if (!value || value === "all") {
    return { ranking: "all", limit: 10 };
  }
  const match = /^(top|bottom)_(\d+)$/.exec(value);
  if (!match) return { ranking: "all", limit: 10 };
  return {
    ranking: match[1],
    limit: Math.min(200, Math.max(1, Number(match[2]))),
  };
}

export function localizedValue(record, field, language) {
  if (!record) return "-";
  if (language?.startsWith("fa") && record[`${field}_dari`]) {
    return record[`${field}_dari`];
  }
  if (language?.startsWith("ps") && record[`${field}_pashto`]) {
    return record[`${field}_pashto`];
  }
  return record[field] || "-";
}

export function buildMenuItemReportParams({
  startDate,
  endDate,
  filters,
  page = 1,
  pageSize = 25,
}) {
  const ranking = parseRanking(filters.ranking);
  const params = {
    type: "menu_items",
    start: startDate,
    end: endDate,
    search: filters.search?.trim() || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    ranking: ranking.ranking,
    rank_by: filters.rankBy,
    limit: ranking.limit,
    include_zero_sales: filters.includeZeroSales,
    sales_status: filters.salesStatus,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder,
    page,
    page_size: pageSize,
  };
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );
}

export function buildMenuItemPdfParams({
  startDate,
  endDate,
  config,
}) {
  return {
    start: startDate,
    end: endDate,
    report_type: config.reportType,
    category: config.category !== "all" ? config.category : undefined,
    rank_by: config.rankBy,
    limit: Number(config.limit) || 10,
    include_zero_sales: config.includeZeroSales,
    sort_by: config.sortBy,
    sort_order: config.sortOrder,
    include_summary: config.sections.summary,
    include_kpis: config.sections.kpis,
    include_details: config.sections.details,
    include_categories: config.sections.categories,
    include_charts: config.sections.charts,
    include_trend: config.sections.trend,
    include_insights: config.sections.insights,
  };
}

export function nextSort(currentField, currentOrder, selectedField) {
  if (currentField !== selectedField) {
    return { sortBy: selectedField, sortOrder: "desc" };
  }
  return {
    sortBy: selectedField,
    sortOrder: currentOrder === "desc" ? "asc" : "desc",
  };
}

export function hasActiveMenuItemFilters(filters) {
  return Boolean(
    filters.search?.trim() ||
      filters.category !== "all" ||
      filters.ranking !== "all" ||
      filters.salesStatus !== "all" ||
      filters.includeZeroSales,
  );
}
