import {
  BadgePercent,
  BarChart,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Clock,
  CreditCard,
  FilePlus2,
  HandCoins,
  HardHat,
  LayoutDashboard,
  Package,
  PackageSearch,
  Receipt,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Table2,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

const adminBase = "/admin/dashboard";

const dashboardItem = (t) => ({
  id: "dashboard",
  to: adminBase,
  label: t("nav.dashboard"),
  icon: LayoutDashboard,
  end: true,
});

export function getAdminNavigationGroups(t, role) {
  const tree = [
    dashboardItem(t),
    {
      id: "operations",
      label: "Operations",
      icon: ShoppingCart,
      children: [
        {
          id: "orders",
          to: `${adminBase}/orders`,
          label: t("nav.orders"),
          icon: Receipt,
        },
        {
          id: "tables",
          to: `${adminBase}/tables`,
          label: t("nav.tables"),
          icon: Table2,
        },
        {
          id: "reservations",
          to: `${adminBase}/reservations`,
          label: "Reservations",
          icon: CalendarDays,
        },
        {
          id: "daily-production",
          to: `${adminBase}/daily_production`,
          label: "Daily Productions",
          icon: Utensils,
        },
        {
          id: "discount-requests",
          to: `${adminBase}/pending-discount-requests`,
          label: "Discount Requests",
          icon: BadgePercent,
        },
        {
          id: "all-discount-requests",
          to: `${adminBase}/all-discount-requests`,
          label: "All Discount Requests",
          icon: BadgePercent,
          hiddenInSidebar: true,
        },
        {
          id: "discount-cards",
          to: `${adminBase}/discount-cards`,
          label: "Discount Cards",
          icon: CreditCard,
        },
      ],
    },
    {
      id: "restaurant",
      label: "Restaurant",
      icon: Utensils,
      children: [
        {
          id: "menu",
          to: `${adminBase}/menu`,
          label: t("nav.menu"),
          icon: Utensils,
          end: false,
        },
        {
          id: "stations",
          to: `${adminBase}/stations`,
          label: "Kitchen Stations",
          icon: Utensils,
          end: false,
        },
        {
          id: "inventory",
          label: "Inventory",
          icon: Package,
          children: [
            {
              id: "inventory-dashboard",
              to: `${adminBase}/inventory`,
              label: "Dashboard",
              icon: LayoutDashboard,
              end: true,
            },
            {
              id: "inventory-ingredients",
              to: `${adminBase}/inventory/ingredients`,
              label: "Ingredients",
              icon: ClipboardList,
            },
            {
              id: "inventory-stock-levels",
              to: `${adminBase}/inventory/stock-levels`,
              label: "Stock Levels",
              icon: PackageSearch,
            },
            {
              id: "inventory-stock-movements",
              to: `${adminBase}/inventory/stock-movements`,
              label: "Stock Movements",
              icon: ClipboardList,
            },
            {
              id: "inventory-stock-adjustments",
              to: `${adminBase}/inventory/stock-adjustments`,
              label: "Stock Adjustments",
              icon: PackageSearch,
            },
            {
              id: "inventory-low-stock",
              to: `${adminBase}/inventory/low-stock`,
              label: "Low Stock Alerts",
              icon: Package,
            },
            {
              id: "inventory-reports",
              to: `${adminBase}/inventory/reports`,
              label: "Reports",
              icon: BarChart,
            },
          ],
        },
        {
          id: "procurement",
          label: "Procurement",
          icon: ShoppingCart,
          children: [
            {
              id: "procurement-dashboard",
              to: `${adminBase}/procurement`,
              label: "Dashboard",
              icon: LayoutDashboard,
              end: true,
            },
            {
              id: "procurement-purchase-invoices",
              to: `${adminBase}/procurement/purchase-invoices`,
              label: "Purchase Invoices",
              icon: ReceiptText,
              end: false,
            },
            {
              id: "procurement-create-purchase-invoice",
              to: `${adminBase}/procurement/purchase-invoices/new`,
              label: "Create Purchase Invoice",
              icon: FilePlus2,
            },
            {
              id: "procurement-suppliers",
              to: `${adminBase}/procurement/suppliers`,
              label: "Suppliers",
              icon: Users,
              end: false,
            },
            {
              id: "procurement-supplier-payments",
              to: `${adminBase}/procurement/supplier-payments`,
              label: "Supplier Payments",
              icon: HandCoins,
            },
            {
              id: "procurement-payables",
              to: `${adminBase}/procurement/payables`,
              label: "Outstanding Payables",
              icon: CreditCard,
            },
          ],
        },
        {
          id: "audit-logs",
          to: `${adminBase}/audit-logs`,
          label: "Audit Logs",
          icon: ShieldCheck,
        },
      ],
    },
    {
      id: "hr",
      label: "HR",
      icon: Users,
      children: [
        {
          id: "staff",
          to: `${adminBase}/staff`,
          label: t("nav.staff"),
          icon: Users,
        },
        {
          id: "attendance",
          to: `${adminBase}/attendance`,
          label: t("nav.attendance"),
          icon: CalendarCheck,
        },
        {
          id: "shifts",
          to: `${adminBase}/shifts`,
          label: t("nav.shifts"),
          icon: Clock,
        },
        {
          id: "payroll",
          label: "Payroll",
          icon: Wallet,
          children: [
            {
              id: "payroll-dashboard",
              to: `${adminBase}/payroll`,
              label: "Dashboard",
              icon: LayoutDashboard,
              end: true,
              matches: [`${adminBase}/payroll/employees`],
            },
            {
              id: "payroll-run",
              to: `${adminBase}/payroll/run`,
              label: "Payroll Wizard",
              icon: FilePlus2,
            },
            {
              id: "payroll-records",
              to: `${adminBase}/payroll/records`,
              label: "Payroll Records",
              icon: ReceiptText,
              end: false,
            },
            {
              id: "payroll-advances",
              to: `${adminBase}/payroll/advances`,
              label: "Salary Advances",
              icon: HandCoins,
            },
            {
              id: "payroll-payments",
              to: `${adminBase}/payroll/payments`,
              label: "Payroll Payments",
              icon: CreditCard,
            },
          ],
        },
      ],
    },
    {
      id: "contractors",
      label: "Contractors",
      icon: HardHat,
      children: [
        {
          id: "contractors-dashboard",
          to: `${adminBase}/contractors`,
          label: "Dashboard",
          icon: LayoutDashboard,
          end: true,
        },
        {
          id: "contractors-list",
          to: `${adminBase}/contractors/contractors`,
          label: "Contractors",
          icon: HardHat,
          end: false,
        },
        {
          id: "contractors-contracts",
          to: `${adminBase}/contractors/contracts`,
          label: "Service Contracts",
          icon: ClipboardList,
        },
        {
          id: "contractors-invoices",
          to: `${adminBase}/contractors/invoices`,
          label: "Service Invoices",
          icon: ReceiptText,
          end: false,
        },
        {
          id: "contractors-create-invoice",
          to: `${adminBase}/contractors/invoices/new`,
          label: "Create Invoice",
          icon: FilePlus2,
        },
        {
          id: "contractors-payments",
          to: `${adminBase}/contractors/payments`,
          label: "Payments",
          icon: HandCoins,
        },
        {
          id: "contractors-payables",
          to: `${adminBase}/contractors/payables`,
          label: "Payables",
          icon: CreditCard,
        },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      icon: Wallet,
      children: [
        {
          id: "expenses",
          to: `${adminBase}/expenses`,
          label: t("nav.expenses"),
          icon: Wallet,
          end: false,
        },
        {
          id: "reports",
          to: `${adminBase}/reports`,
          label: t("nav.reports"),
          icon: BarChart,
        },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      icon: Settings,
      children: [
        {
          id: "branches",
          to: `${adminBase}/branches`,
          label: "Branches",
          icon: Building2,
          adminOnly: true,
        },
        {
          id: "feedbacks",
          to: `${adminBase}/feedbacks`,
          label: t("nav.feedbacks"),
          icon: Star,
        },
        {
          id: "settings",
          to: `${adminBase}/settings`,
          label: t("nav.settings"),
          icon: Settings,
          end: false,
          hiddenInSidebar: true,
        },
      ],
    },
  ];

  return filterNavigationTree(tree, role);
}

const filterNavigationTree = (items, role) =>
  items
    .filter((item) => !(item.adminOnly && role !== "Admin"))
    .map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: filterNavigationTree(item.children, role),
      };
    })
    .filter((item) => item.to || item.children?.length);

export function flattenNavigationGroups(groups, includeHidden = true) {
  const flattened = [];

  const walk = (items, ancestors = []) => {
    items.forEach((item) => {
      const nextAncestors = [...ancestors, item];
      if (item.to && (includeHidden || !item.hiddenInSidebar)) {
        flattened.push({
          ...item,
          parentIds: ancestors.map((ancestor) => ancestor.id),
          groupId: ancestors[0]?.id || item.id,
          groupLabel: ancestors[0]?.label || item.label,
          moduleId: ancestors.at(-1)?.id || ancestors[0]?.id || item.id,
          moduleLabel:
            ancestors.at(-1)?.label || ancestors[0]?.label || item.label,
          parentLabels: ancestors.map((ancestor) => ancestor.label),
        });
      }
      if (item.children?.length) walk(item.children, nextAncestors);
    });
  };

  walk(groups);
  return flattened;
}

const navigationSearchKeywords = {
  dashboard: ["home", "overview", "workspace"],
  orders: ["order", "sale", "checkout", "bill", "receipt"],
  tables: ["table", "floor", "dining"],
  reservations: ["booking", "reservation", "calendar"],
  "daily-production": ["production", "kitchen", "prep"],
  "discount-requests": ["discount", "approval", "request"],
  "discount-cards": ["discount", "cards", "loyalty"],
  menu: ["menu", "items", "platter", "restaurant", "catalog"],
  stations: ["station", "kitchen", "juice", "bar", "routing", "prep"],
  "inventory-dashboard": ["stock", "inventory", "warehouse", "materials"],
  "inventory-ingredients": ["ingredients", "materials", "stock"],
  "inventory-stock-levels": ["stock", "levels", "inventory", "quantity"],
  "inventory-stock-movements": ["stock", "movements", "transfer", "history"],
  "inventory-stock-adjustments": [
    "stock",
    "adjustments",
    "waste",
    "correction",
  ],
  "inventory-low-stock": ["stock", "low", "alerts", "reorder"],
  "inventory-reports": ["reports", "inventory", "stock", "analytics"],
  "procurement-dashboard": ["purchase", "supplier", "vendor", "procurement"],
  "procurement-purchase-invoices": ["purchase", "invoice", "supplier", "bill"],
  "procurement-create-purchase-invoice": [
    "purchase",
    "invoice",
    "create",
    "new",
    "supplier",
  ],
  "procurement-suppliers": ["supplier", "vendor", "procurement"],
  "procurement-supplier-payments": [
    "supplier",
    "payment",
    "vendor",
    "procurement",
  ],
  "procurement-payables": ["payable", "outstanding", "supplier", "debt"],
  staff: ["employee", "staff", "people", "hr"],
  attendance: ["attendance", "check in", "check out", "presence"],
  shifts: ["shift", "schedule", "roster"],
  "payroll-dashboard": ["pay", "payroll", "salary", "wage", "employee"],
  "payroll-run": ["pay", "payroll", "wizard", "generate", "salary"],
  "payroll-records": ["pay", "payroll", "records", "history", "salary"],
  "payroll-advances": ["pay", "salary", "advance", "loan"],
  "payroll-payments": ["pay", "payment", "payroll", "salary", "wage"],
  "contractors-dashboard": ["contractor", "service", "vendor"],
  "contractors-list": ["contractor", "service provider", "vendor"],
  "contractors-contracts": ["contract", "service", "agreement"],
  "contractors-invoices": ["invoice", "contractor", "service"],
  "contractors-create-invoice": ["invoice", "create", "contractor", "service"],
  "contractors-payments": ["payment", "contractor", "service"],
  "contractors-payables": ["payable", "contractor", "outstanding"],
  expenses: ["expense", "voucher", "payment", "finance"],
  reports: ["report", "reports", "analytics", "finance", "summary"],
  branches: ["branch", "location", "administration"],
  feedbacks: ["feedback", "reviews", "ratings"],
  settings: ["settings", "preferences", "theme", "language", "restaurant"],
};

export function getSearchableNavigationItems(groups) {
  return flattenNavigationGroups(groups, true).map((item) => {
    const keywords = navigationSearchKeywords[item.id] || [];
    const moduleLabel = item.moduleLabel || item.groupLabel || "Workspace";
    const displayLabel =
      item.label === "Dashboard" && moduleLabel !== item.label
        ? `${moduleLabel} Dashboard`
        : item.label;
    const description = item.description || `${moduleLabel} Module`;

    return {
      ...item,
      displayLabel,
      keywords,
      moduleLabel,
      description,
      searchText: [
        displayLabel,
        item.label,
        moduleLabel,
        item.groupLabel,
        ...(item.parentLabels || []),
        ...keywords,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
}

const pathMatches = (pathname, item) => {
  if (!item.to && !item.matches?.length) return false;
  const targets = [item.to, ...(item.matches || [])].filter(Boolean);

  return targets.some((target, index) => {
    const exactOnly = index === 0 ? (item.end ?? true) : false;
    if (exactOnly) return pathname === target;
    return pathname === target || pathname.startsWith(`${target}/`);
  });
};

export function isAdminNavigationItemActive(pathname, item) {
  if (pathMatches(pathname, item)) return true;
  return item.children?.some((child) =>
    isAdminNavigationItemActive(pathname, child),
  );
}

export function findActiveNavigationItem(groups, pathname) {
  const items = flattenNavigationGroups(groups, true).sort((a, b) => {
    const aLength = Math.max(
      a.to.length,
      ...(a.matches || []).map((match) => match.length),
    );
    const bLength = Math.max(
      b.to.length,
      ...(b.matches || []).map((match) => match.length),
    );
    return bLength - aLength;
  });

  return items.find((item) => pathMatches(pathname, item)) || items[0];
}

export function getExpandedIdsForPath(groups, pathname) {
  const ids = new Set();

  const walk = (items, ancestors = []) => {
    for (const item of items) {
      const active = pathMatches(pathname, item);
      if (active) {
        ancestors.forEach((ancestor) => ids.add(ancestor.id));
        return true;
      }

      if (item.children?.length && walk(item.children, [...ancestors, item])) {
        return true;
      }
    }

    return false;
  };

  walk(groups);
  return ids;
}
