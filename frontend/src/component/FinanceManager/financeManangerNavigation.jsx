import {
  ClipboardList,
  Clock,
  CreditCard,
  FilePlus2,
  HandCoins,
  HardHat,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import i18n from "../../i18n";

// Fixed base route to match React Router: "/finance-manager"
const financeManagerBase = "/finance-manager";

export function getFinanceManagerNavigationGroups(t, role) {
  const tree = [
    {
      id: "expenses",
      label: i18n.t("nav.expenses"),
      icon: Wallet,
      children: [
        {
          id: "expenses-dashboard",
          to: `${financeManagerBase}/expenses`,
          label: t("nav.expenses") || "Expenses",
          icon: Wallet,
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
          to: `${financeManagerBase}/procurement`,
          label: i18n.t("nav.dashboard"),
          icon: LayoutDashboard,
          end: true,
        },
        {
          id: "procurement-purchase-invoices",
          to: `${financeManagerBase}/procurement/purchase-invoices`,
          label: i18n.t("landing.features.groups.inventory.items.invoices"),
          icon: ReceiptText,
          end: false,
        },
        {
          id: "procurement-create-purchase-invoice",
          to: `${financeManagerBase}/procurement/purchase-invoices/new`,
          label: i18n.t("inventory_manager.low_stock.create_purchase_invoice"),
          icon: FilePlus2,
        },
        {
          id: "procurement-suppliers",
          to: `${financeManagerBase}/procurement/suppliers`,
          label: i18n.t("landing.features.groups.inventory.items.suppliers"),
          icon: Users,
          end: false,
        },
        {
          id: "procurement-supplier-payments",
          to: `${financeManagerBase}/procurement/supplier-payments`,
          label: i18n.t("legacy.supplier_payments_6ef8f5d6"),
          icon: HandCoins,
        },
        {
          id: "procurement-payables",
          to: `${financeManagerBase}/procurement/payables`,
          label: i18n.t("legacy.outstanding_payables_f6045147"),
          icon: CreditCard,
        },
      ],
    },
    {
      id: "payroll",
      label: i18n.t("landing.features.groups.staff.items.payroll"),
      icon: Wallet,
      children: [
        {
          id: "payroll-dashboard",
          to: `${financeManagerBase}/payroll`,
          label: i18n.t("nav.dashboard"),
          icon: LayoutDashboard,
          end: true,
          matches: [`${financeManagerBase}/payroll/employees`],
        },
        {
          id: "payroll-run",
          to: `${financeManagerBase}/payroll/run`,
          label: i18n.t("legacy.payroll_wizard_107ea6bd"),
          icon: FilePlus2,
        },
        {
          id: "payroll-records",
          to: `${financeManagerBase}/payroll/records`,
          label: i18n.t("legacy.payroll_records_ebec138d"),
          icon: ReceiptText,
          end: false,
        },
        {
          id: "payroll-advances",
          to: `${financeManagerBase}/payroll/advances`,
          label: i18n.t("legacy.salary_advances_e8cda02b"),
          icon: HandCoins,
        },
        {
          id: "payroll-payments",
          to: `${financeManagerBase}/payroll/payments`,
          label: i18n.t("legacy.payroll_payments_bc2648b7"),
          icon: CreditCard,
        },
      ],
    },
    {
      id: "contractors",
      label: i18n.t("landing.features.groups.finance.items.contractors"),
      icon: HardHat,
      children: [
        {
          id: "contractors-dashboard",
          to: `${financeManagerBase}/contractors`,
          label: i18n.t("nav.dashboard"),
          icon: LayoutDashboard,
          end: true,
        },
        {
          id: "contractors-list",
          to: `${financeManagerBase}/contractors/contractors`,
          label: i18n.t("landing.features.groups.finance.items.contractors"),
          icon: HardHat,
          end: false,
        },
        {
          id: "contractors-contracts",
          to: `${financeManagerBase}/contractors/contracts`,
          label: i18n.t("legacy.service_contracts_d376d778"),
          icon: ClipboardList,
        },
        {
          id: "contractors-invoices",
          to: `${financeManagerBase}/contractors/invoices`,
          label: i18n.t("legacy.service_invoices_7d0409f3"),
          icon: ReceiptText,
          end: false,
        },
        {
          id: "contractors-create-invoice",
          to: `${financeManagerBase}/contractors/invoices/new`,
          label: i18n.t("legacy.create_invoice_32815b0b"),
          icon: FilePlus2,
        },
        {
          id: "contractors-payments",
          to: `${financeManagerBase}/contractors/payments`,
          label: i18n.t("landing.marketplace.owner.items.payments"),
          icon: HandCoins,
        },
        {
          id: "contractors-payables",
          to: `${financeManagerBase}/contractors/payables`,
          label: i18n.t("legacy.payables_a4fb9796"),
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
          to: `${financeManagerBase}/audit-logs`,
          label: i18n.t("legacy.audit_logs_344c7ffc"),
          icon: ShieldCheck,
          end: true,
        },
      ],
    },
  ];

  return filterFinanceManagerNavigationTree(tree, role);
}

const filterFinanceManagerNavigationTree = (items, role) =>
  items
    .filter((item) => !(item.adminOnly && role !== "FinanceManager"))
    .map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: filterFinanceManagerNavigationTree(item.children, role),
      };
    })
    .filter((item) => item.to || item.children?.length);

export function flattenFinanceManagerNavigationGroups(
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

const financeManagerNavigationSearchKeywords = {
  "expenses-dashboard": ["expense", "voucher", "payment", "finance"],
  "expenses-history": ["expense", "history", "records", "transactions"],
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
};

export function getFinanceManagerSearchableNavigationItems(groups) {
  return flattenFinanceManagerNavigationGroups(groups, true).map((item) => {
    const keywords = financeManagerNavigationSearchKeywords[item.id] || [];
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

export function isFinanceManagerNavigationItemActive(pathname, item) {
  if (pathMatches(pathname, item)) return true;
  return item.children?.some((child) =>
    isFinanceManagerNavigationItemActive(pathname, child),
  );
}

export function findActiveFinanceManagerNavigationItem(groups, pathname) {
  const items = flattenFinanceManagerNavigationGroups(groups, true).sort(
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

export function getExpandedIdsForFinanceManagerPath(groups, pathname) {
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
