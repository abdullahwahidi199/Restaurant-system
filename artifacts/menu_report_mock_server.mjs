import http from "node:http";

const items = [
  [1, "Chicken Burger", "Burgers", 42, 31, 12600, 630, 11970],
  [2, "Beef Pizza", "Pizza", 31, 24, 13950, 500, 13450],
  [3, "French Fries", "Sides", 29, 22, 4350, 150, 4200],
  [4, "Coke", "Drinks", 26, 20, 2600, 100, 2500],
  [5, "Chicken Pizza", "Pizza", 20, 18, 8000, 400, 7600],
  [6, "Green Tea", "Drinks", 18, 15, 1800, 0, 1800],
  [7, "Family Platter", "Burgers", 12, 10, 9600, 480, 9120],
  [8, "Chocolate Cake", "Desserts", 11, 9, 2750, 0, 2750],
].map(([id, name, category, units, orders, gross, discount, net], index) => ({
  product_type: id === 7 ? "platter" : "menu_item",
  product_id: id,
  name,
  name_dari: "",
  name_pashto: "",
  category_id: ["Burgers", "Pizza", "Sides", "Drinks", "Desserts"].indexOf(category) + 1,
  category_name: category,
  category_name_dari: "",
  category_name_pashto: "",
  units_sold: units,
  order_count: orders,
  cancelled_quantity: id === 3 ? 2 : 0,
  gross_sales: gross,
  discount,
  net_sales: net,
  average_price: net / units,
  sales_percentage: [24.64, 27.68, 8.65, 5.15, 15.65, 3.71, 18.78, 5.66][index],
  rank: index + 1,
}));

const categorySummary = [
  [1, "Burgers", 2, 54, 21090],
  [2, "Pizza", 2, 51, 21050],
  [3, "Sides", 1, 29, 4200],
  [4, "Drinks", 2, 44, 4300],
  [5, "Desserts", 1, 11, 2750],
].map(([category_id, category_name, items_sold, units_sold, net_sales]) => ({
  category_id,
  category_name,
  category_name_dari: "",
  category_name_pashto: "",
  items_sold,
  units_sold,
  gross_sales: net_sales * 1.05,
  discount: net_sales * 0.05,
  net_sales,
  sales_percentage: (net_sales / 53390) * 100,
  average_item_revenue: net_sales / items_sold,
}));

const reportData = {
  range: { start: "2026-08-01", end: "2026-08-28" },
  currency: "AFN",
  summary: {
    distinct_items_sold: 8,
    total_units_sold: 189,
    gross_sales: 55650,
    total_discount: 2260,
    total_revenue: 53390,
    average_revenue_per_item: 6673.75,
    average_selling_price: 282.49,
    top_selling_item: { ...items[0], revenue: items[0].net_sales },
    lowest_selling_item: { ...items[7], revenue: items[7].net_sales },
  },
  items,
  top_items: items,
  category_summary: categorySummary,
  categories: categorySummary.map((row) => ({
    id: row.category_id,
    name: row.category_name,
    name_dari: "",
    name_pashto: "",
  })),
  trend: {
    granularity: "daily",
    points: Array.from({ length: 12 }, (_, index) => ({
      period: `2026-08-${String(index + 1).padStart(2, "0")}`,
      units_sold: 8 + ((index * 7) % 13),
      revenue: 2200 + ((index * 1370) % 4100),
    })),
  },
  insights: [
    { type: "top_performer", item: "Beef Pizza", value: 13450 },
    { type: "most_sold", item: "Chicken Burger", value: 42 },
    { type: "category_leader", category: "Burgers", value: 21090 },
    { type: "low_performer", item: "Chocolate Cake", value: 11 },
  ],
  pagination: { page: 1, page_size: 25, count: 8, total_pages: 1, has_next: false, has_previous: false },
  filters: { search: "", category: null, ranking: "all", rank_by: "quantity", limit: 10, include_zero_sales: false, sales_status: "all", sort_by: "quantity", sort_order: "desc" },
  scope: { qualifying_sales_items_before_status_filter: 8, selected_items: 8 },
};

const ordersData = {
  range: { start: "2026-08-01", end: "2026-08-28" },
  totals: { total_orders: 20, completed_orders: 20, cancelled_orders: 0, food_revenue: 50000, delivery_revenue: 0, reservation_revenue: 0, total_revenue: 50000, lost_revenue: 0, average_order_value: 2500, average_preparation_minutes: 12 },
  by_type: [], by_status: [], top_items: [], daily_breakdown: [], peak_hours: [], waiter_performance: [], delivery_performance: [],
};

const server = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Branch-ID");
  response.setHeader("Content-Type", "application/json");
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  const url = new URL(request.url, "http://127.0.0.1:8001");
  let payload = {};
  if (url.pathname === "/api/restaurant/me/") {
    payload = {
      name: "Saffron House",
      logo: "",
      phone: "0700000000",
      address: "Kabul",
      is_active: true,
      subscription: { is_valid: true },
      active_branch: { id: 1, name: "Central Branch" },
      branches: [{ id: 1, name: "Central Branch" }],
    };
  } else if (url.pathname === "/api/reports/generate_report/") {
    const isMenu = url.searchParams.get("type") === "menu_items";
    payload = {
      type: isMenu ? "menu_items" : "orders",
      branch: { id: 1, name: "Central Branch", scope: "current" },
      data: isMenu ? reportData : ordersData,
    };
  } else if (url.pathname.includes("notifications")) {
    payload = [];
  }
  response.end(JSON.stringify(payload));
});

server.listen(8001, "127.0.0.1", () => process.stdout.write("mock-ready\n"));
