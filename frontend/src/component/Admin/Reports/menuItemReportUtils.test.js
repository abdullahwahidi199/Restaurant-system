import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildMenuItemPdfParams,
  buildMenuItemReportParams,
  hasActiveMenuItemFilters,
  localizedValue,
  nextSort,
  parseRanking,
  REPORT_OPTIONS,
  todayLocalISO,
} from "./menuItemReportUtils.js";


test("menu item sales is a first-class report option", () => {
  assert.ok(REPORT_OPTIONS.some((option) => option.value === "menu_items"));
});

test("ranking and API params preserve report filters", () => {
  assert.deepEqual(parseRanking("bottom_20"), { ranking: "bottom", limit: 20 });
  const params = buildMenuItemReportParams({
    startDate: "2026-08-01",
    endDate: "2026-08-28",
    filters: {
      search: " burger ",
      category: "4",
      ranking: "top_10",
      rankBy: "revenue",
      includeZeroSales: false,
      salesStatus: "selling",
      sortBy: "revenue",
      sortOrder: "desc",
    },
    page: 2,
    pageSize: 25,
  });

  assert.deepEqual(params, {
    type: "menu_items",
    start: "2026-08-01",
    end: "2026-08-28",
    search: "burger",
    category: "4",
    ranking: "top",
    rank_by: "revenue",
    limit: 10,
    include_zero_sales: false,
    sales_status: "selling",
    sort_by: "revenue",
    sort_order: "desc",
    page: 2,
    page_size: 25,
  });
});

test("PDF params include selected ranking and sections", () => {
  const params = buildMenuItemPdfParams({
    startDate: "2026-08-01",
    endDate: "2026-08-28",
    config: {
      reportType: "bottom",
      category: "3",
      rankBy: "quantity",
      limit: "5",
      includeZeroSales: true,
      sortBy: "quantity",
      sortOrder: "asc",
      sections: {
        summary: true,
        kpis: true,
        details: true,
        categories: false,
        charts: false,
        trend: true,
        insights: true,
      },
    },
  });

  assert.equal(params.report_type, "bottom");
  assert.equal(params.category, "3");
  assert.equal(params.limit, 5);
  assert.equal(params.include_zero_sales, true);
  assert.equal(params.include_categories, false);
  assert.equal(params.include_trend, true);
});

test("localized names and sortable headers follow locale and direction", () => {
  const item = { name: "Burger", name_dari: "برگر", name_pashto: "برګر" };
  assert.equal(localizedValue(item, "name", "fa"), "برگر");
  assert.equal(localizedValue(item, "name", "ps"), "برګر");
  assert.equal(localizedValue(item, "name", "en"), "Burger");
  assert.deepEqual(nextSort("quantity", "desc", "quantity"), {
    sortBy: "quantity",
    sortOrder: "asc",
  });
});

test("local report dates do not use UTC date truncation", () => {
  const localDate = new Date(2026, 7, 28, 23, 30, 0);
  assert.equal(todayLocalISO(localDate), "2026-08-28");
});

test("empty-state filtering distinguishes no sales from no filter matches", () => {
  const defaults = {
    search: "",
    category: "all",
    ranking: "all",
    salesStatus: "all",
    includeZeroSales: false,
  };
  assert.equal(hasActiveMenuItemFilters(defaults), false);
  assert.equal(hasActiveMenuItemFilters({ ...defaults, category: "8" }), true);
  assert.equal(hasActiveMenuItemFilters({ ...defaults, search: "tea" }), true);
});

test("all supported locales contain menu item sales keys", () => {
  for (const locale of ["en", "fa", "ps"]) {
    const translations = JSON.parse(
      readFileSync(new URL(`../../../locals/${locale}.json`, import.meta.url), "utf8"),
    );
    assert.equal(typeof translations.menu_item_sales.title, "string");
    assert.equal(typeof translations.menu_item_sales.generate_pdf, "string");
    assert.equal(typeof translations.menu_item_sales.include_zero_sales, "string");
    assert.equal(typeof translations.menu_item_sales.no_sales, "string");
  }
});
