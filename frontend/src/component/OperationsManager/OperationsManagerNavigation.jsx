import {
  Boxes,
  ClipboardList,
  Clock,
  CreditCard,
  FilePlus2,
  Grid2X2,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  Package,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Soup,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  Warehouse,
  AlertTriangle,
  BarChart3,
  Layers3,
} from "lucide-react";
import i18n from "../../i18n";

// Base route matches React Router: "/operations-manager"
const operationsManagerBase = "/operations-manager";

export function getOperationsManagerNavigationGroups(t, role) {
  const tree = [
    {
      id: "operations",
      label: i18n.t("legacy.operations_a1fdaa6b"),
      icon: LayoutDashboard,
      children: [
        {
          id: "operations-shifts",
          to: `${operationsManagerBase}/shifts`,
          label: t?.("nav.shifts") || "Shifts",
          icon: Clock,
          end: true,
        },
        {
          id: "operations-attendance",
          to: `${operationsManagerBase}/attendance`,
          label: t?.("nav.attendance") || "Attendance",
          icon: ClipboardList,
          end: true,
        },
        {
          id: "operations-tables",
          to: `${operationsManagerBase}/tables`,
          label: t?.("nav.tables") || "Tables",
          icon: Grid2X2,
          end: true,
        },
        {
          id: "operations-stations",
          to: `${operationsManagerBase}/stations`,
          label: t?.("nav.stations") || "Stations",
          icon: ListChecks,
          end: true,
        },
        {
          id: "operations-daily-production",
          to: `${operationsManagerBase}/daily_production`,
          label: t?.("nav.dailyProduction") || "Daily Production",
          icon: Soup,
          end: true,
        },
      ],
    },
    {
      id: "menu",
      label: i18n.t("nav.menu"),
      icon: UtensilsCrossed,
      children: [
        {
          id: "menu-items",
          to: `${operationsManagerBase}/menu`,
          label: t?.("nav.menu") || "Menu Items",
          icon: UtensilsCrossed,
          end: true,
          matches: [`${operationsManagerBase}/menu/item`],
        },
      ],
    },
    {
      id: "expenses",
      label: i18n.t("nav.expenses"),
      icon: Wallet,
      children: [
        {
          id: "expenses-dashboard",
          to: `${operationsManagerBase}/expenses`,
          label: t?.("nav.expenses") || "Expenses",
          icon: Wallet,
          end: true,
          matches: [`${operationsManagerBase}/expenses/`],
        },
        {
          id: "expenses-history",
          to: `${operationsManagerBase}/expenses/history`,
          label: t?.("nav.expensesHistory") || "Expense History",
          icon: ReceiptText,
          end: true,
        },
      ],
    },
    {
      id: "procurement",
      label: i18n.t("landing.features.groups.inventory.items.procurement"),
      icon: ShoppingCart,
      children: [
        {
          id: "procurement-dashboard",
          to: `${operationsManagerBase}/procurement`,
          label: i18n.t("nav.dashboard"),
          icon: LayoutDashboard,
          end: true,
        },
        {
          id: "procurement-purchase-invoices",
          to: `${operationsManagerBase}/procurement/purchase-invoices`,
          label: i18n.t("landing.features.groups.inventory.items.invoices"),
          icon: ReceiptText,
          end: false,
        },
        {
          id: "procurement-create-purchase-invoice",
          to: `${operationsManagerBase}/procurement/purchase-invoices/new`,
          label: i18n.t("inventory_manager.low_stock.create_purchase_invoice"),
          icon: FilePlus2,
        },
        {
          id: "procurement-suppliers",
          to: `${operationsManagerBase}/procurement/suppliers`,
          label: i18n.t("landing.features.groups.inventory.items.suppliers"),
          icon: Users,
          end: false,
        },
        {
          id: "procurement-supplier-payments",
          to: `${operationsManagerBase}/procurement/supplier-payments`,
          label: i18n.t("legacy.supplier_payments_6ef8f5d6"),
          icon: HandCoins,
        },
        {
          id: "procurement-payables",
          to: `${operationsManagerBase}/procurement/payables`,
          label: i18n.t("legacy.outstanding_payables_f6045147"),
          icon: CreditCard,
        },
      ],
    },
    {
      id: "audit",
      label: i18n.t("legacy.audit_fa1703dd"),
      icon: ShieldCheck,
      children: [
        {
          id: "audit-logs",
          to: `${operationsManagerBase}/audit-logs`,
          label: i18n.t("legacy.audit_logs_344c7ffc"),
          icon: ShieldCheck,
          end: true,
        },
      ],
    },
    {
      id: "inventory",
      label: i18n.t("nav.inventory"),
      icon: Warehouse,
      children: [
        {
          id: "inventory-overview",
          to: `${operationsManagerBase}/inventory`,
          label: i18n.t("legacy.overview_0efc2e6b"),
          icon: LayoutDashboard,
          end: true,
        },
        {
          id: "inventory-ingredients",
          to: `${operationsManagerBase}/inventory/ingredients`,
          label: i18n.t("menuDetails.ingredients"),
          icon: Boxes,
        },
        {
          id: "inventory-stock-levels",
          to: `${operationsManagerBase}/inventory/stock-levels`,
          label: i18n.t("inventory_manager.nav.stock_levels"),
          icon: PackageSearch,
        },
        {
          id: "inventory-stock-movements",
          to: `${operationsManagerBase}/inventory/stock-movements`,
          label: i18n.t("inventory_manager.nav.stock_movements"),
          icon: TrendingUp,
        },
        {
          id: "inventory-stock-adjustments",
          to: `${operationsManagerBase}/inventory/stock-adjustments`,
          label: i18n.t("inventory_manager.nav.stock_adjustments"),
          icon: ClipboardList,
        },
        {
          id: "inventory-low-stock",
          to: `${operationsManagerBase}/inventory/low-stock`,
          label: i18n.t("inventory_manager.nav.low_stock_alerts"),
          icon: AlertTriangle,
        },
        {
          id: "inventory-reports",
          to: `${operationsManagerBase}/inventory/reports`,
          label: i18n.t("inventory_manager.nav.inventory_reports"),
          icon: BarChart3,
        },
      ],
    },
  ];

  return filterOperationsManagerNavigationTree(tree, role);
}

const filterOperationsManagerNavigationTree = (items, role) =>
  items
    .filter((item) => !(item.adminOnly && role !== "OperationsManager"))
    .map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: filterOperationsManagerNavigationTree(item.children, role),
      };
    })
    .filter((item) => item.to || item.children?.length);

export function flattenOperationsManagerNavigationGroups(
  groups,
  includeHidden = true,
) {
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

const operationsManagerNavigationSearchKeywords = {
  "operations-shifts": ["shift", "roster", "schedule", "staff", "timing"],
  "operations-tables": ["table", "floor", "seating", "dining"],
  "operations-stations": ["station", "kitchen", "prep", "counter"],
  "operations-daily-production": [
    "production",
    "daily",
    "batch",
    "prep",
    "kitchen",
  ],
  "menu-items": ["menu", "item", "dish", "food", "price"],
  "menu-platters": ["platter", "combo", "deal", "menu", "bundle"],
  "expenses-dashboard": ["expense", "voucher", "payment", "cost"],
  "expenses-history": ["expense", "history", "records", "transactions"],
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
  "inventory-overview": ["inventory", "stock", "overview", "warehouse"],
  "inventory-ingredients": ["ingredient", "raw", "material", "item"],
  "inventory-stock-levels": ["stock", "level", "quantity", "balance"],
  "inventory-stock-movements": ["stock", "movement", "transfer", "in", "out"],
  "inventory-stock-adjustments": [
    "stock",
    "adjustment",
    "correction",
    "wastage",
  ],
  "inventory-low-stock": ["low", "stock", "alert", "reorder", "shortage"],
  "inventory-reports": ["inventory", "report", "analytics", "consumption"],
};

export function getOperationsManagerSearchableNavigationItems(groups) {
  return flattenOperationsManagerNavigationGroups(groups, true).map((item) => {
    const keywords = operationsManagerNavigationSearchKeywords[item.id] || [];
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

export function isOperationsManagerNavigationItemActive(pathname, item) {
  if (pathMatches(pathname, item)) return true;
  return item.children?.some((child) =>
    isOperationsManagerNavigationItemActive(pathname, child),
  );
}

export function findActiveOperationsManagerNavigationItem(groups, pathname) {
  const items = flattenOperationsManagerNavigationGroups(groups, true).sort(
    (a, b) => {
      const aLength = Math.max(
        a.to.length,
        ...(a.matches || []).map((match) => match.length),
      );
      const bLength = Math.max(
        b.to.length,
        ...(b.matches || []).map((match) => match.length),
      );
      return bLength - aLength;
    },
  );

  return items.find((item) => pathMatches(pathname, item)) || items[0];
}

export function getExpandedIdsForOperationsManagerPath(groups, pathname) {
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
