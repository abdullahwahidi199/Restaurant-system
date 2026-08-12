import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  CalendarCheck,
  ChefHat,
  ClipboardList,
  Clock3,
  FileText,
  Gauge,
  HandCoins,
  Layers3,
  LineChart,
  ListChecks,
  MapPin,
  Package,
  PackageCheck,
  PackageSearch,
  QrCode,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Soup,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
  Warehouse,
  Workflow,
} from "lucide-react";

export const landingLinks = {
  demo: "#contact",
  explore: "#features",
  login: "/staff-login",
};

export const navItems = [
  { labelKey: "landing.nav.features", href: "#features" },
  { labelKey: "landing.nav.solutions", href: "#solutions" },
  { labelKey: "landing.nav.howItWorks", href: "#how-it-works" },
  { labelKey: "landing.nav.pricing", href: "#pricing" },
  { labelKey: "landing.nav.faq", href: "#faq" },
  { labelKey: "landing.nav.contact", href: "#contact" },
];

export const trustItems = [
  {
    icon: UtensilsCrossed,
    titleKey: "landing.trust.allInOne.title",
    descriptionKey: "landing.trust.allInOne.description",
  },
  {
    icon: Building2,
    titleKey: "landing.trust.multiBranch.title",
    descriptionKey: "landing.trust.multiBranch.description",
  },
  {
    icon: Gauge,
    titleKey: "landing.trust.realTime.title",
    descriptionKey: "landing.trust.realTime.description",
  },
  {
    icon: Warehouse,
    titleKey: "landing.trust.inventory.title",
    descriptionKey: "landing.trust.inventory.description",
  },
  {
    icon: ChefHat,
    titleKey: "landing.trust.kitchen.title",
    descriptionKey: "landing.trust.kitchen.description",
  },
  {
    icon: Users,
    titleKey: "landing.trust.staff.title",
    descriptionKey: "landing.trust.staff.description",
  },
];

export const problemItems = [
  { icon: ClipboardList, key: "landing.problem.items.scatteredOrders" },
  { icon: ChefHat, key: "landing.problem.items.kitchenCommunication" },
  { icon: PackageSearch, key: "landing.problem.items.inventoryUncertainty" },
  { icon: Building2, key: "landing.problem.items.branchManagement" },
  { icon: Users, key: "landing.problem.items.manualStaff" },
  { icon: AlertTriangle, key: "landing.problem.items.visibility" },
  { icon: FileText, key: "landing.problem.items.reporting" },
];

export const solutionItems = [
  { icon: Workflow, key: "landing.problem.solution.connected" },
  { icon: Clock3, key: "landing.problem.solution.realtime" },
  { icon: ShieldCheck, key: "landing.problem.solution.access" },
];

export const featureGroups = [
  {
    icon: Store,
    titleKey: "landing.features.groups.operations.title",
    descriptionKey: "landing.features.groups.operations.description",
    itemKeys: [
      "landing.features.groups.operations.items.table",
      "landing.features.groups.operations.items.menu",
      "landing.features.groups.operations.items.orders",
      "landing.features.groups.operations.items.dineIn",
      "landing.features.groups.operations.items.takeaway",
      "landing.features.groups.operations.items.delivery",
      "landing.features.groups.operations.items.reservations",
    ],
  },
  {
    icon: ChefHat,
    titleKey: "landing.features.groups.kitchen.title",
    descriptionKey: "landing.features.groups.kitchen.description",
    itemKeys: [
      "landing.features.groups.kitchen.items.orders",
      "landing.features.groups.kitchen.items.stations",
      "landing.features.groups.kitchen.items.tracking",
      "landing.features.groups.kitchen.items.routing",
      "landing.features.groups.kitchen.items.workflow",
      "landing.features.groups.kitchen.items.production",
    ],
  },
  {
    icon: Boxes,
    titleKey: "landing.features.groups.inventory.title",
    descriptionKey: "landing.features.groups.inventory.description",
    itemKeys: [
      "landing.features.groups.inventory.items.inventory",
      "landing.features.groups.inventory.items.ingredients",
      "landing.features.groups.inventory.items.recipes",
      "landing.features.groups.inventory.items.stock",
      "landing.features.groups.inventory.items.procurement",
      "landing.features.groups.inventory.items.invoices",
      "landing.features.groups.inventory.items.suppliers",
      "landing.features.groups.inventory.items.transfers",
    ],
  },
  {
    icon: Users,
    titleKey: "landing.features.groups.staff.title",
    descriptionKey: "landing.features.groups.staff.description",
    itemKeys: [
      "landing.features.groups.staff.items.staff",
      "landing.features.groups.staff.items.roles",
      "landing.features.groups.staff.items.attendance",
      "landing.features.groups.staff.items.stations",
      "landing.features.groups.staff.items.performance",
      "landing.features.groups.staff.items.payroll",
    ],
  },
  {
    icon: Wallet,
    titleKey: "landing.features.groups.finance.title",
    descriptionKey: "landing.features.groups.finance.description",
    itemKeys: [
      "landing.features.groups.finance.items.expenses",
      "landing.features.groups.finance.items.contractors",
      "landing.features.groups.finance.items.suppliers",
      "landing.features.groups.finance.items.payroll",
      "landing.features.groups.finance.items.reports",
    ],
  },
  {
    icon: Building2,
    titleKey: "landing.features.groups.branch.title",
    descriptionKey: "landing.features.groups.branch.description",
    itemKeys: [
      "landing.features.groups.branch.items.management",
      "landing.features.groups.branch.items.operations",
      "landing.features.groups.branch.items.centralized",
      "landing.features.groups.branch.items.permissions",
      "landing.features.groups.branch.items.migration",
    ],
  },
];

export const productShowcases = [
  {
    id: "orders",
    icon: ReceiptText,
    eyebrowKey: "landing.showcase.orders.eyebrow",
    titleKey: "landing.showcase.orders.title",
    descriptionKey: "landing.showcase.orders.description",
    itemKeys: [
      "landing.showcase.orders.items.dineIn",
      "landing.showcase.orders.items.takeaway",
      "landing.showcase.orders.items.delivery",
      "landing.showcase.orders.items.status",
      "landing.showcase.orders.items.kitchen",
      "landing.showcase.orders.items.billing",
    ],
  },
  {
    id: "kitchen",
    icon: Soup,
    eyebrowKey: "landing.showcase.kitchen.eyebrow",
    titleKey: "landing.showcase.kitchen.title",
    descriptionKey: "landing.showcase.kitchen.description",
    itemKeys: [
      "landing.showcase.kitchen.items.mainKitchen",
      "landing.showcase.kitchen.items.juiceBar",
      "landing.showcase.kitchen.items.routing",
      "landing.showcase.kitchen.items.workflow",
    ],
  },
  {
    id: "inventory",
    icon: PackageCheck,
    eyebrowKey: "landing.showcase.inventory.eyebrow",
    titleKey: "landing.showcase.inventory.title",
    descriptionKey: "landing.showcase.inventory.description",
    itemKeys: [
      "landing.showcase.inventory.items.ingredients",
      "landing.showcase.inventory.items.recipes",
      "landing.showcase.inventory.items.stock",
      "landing.showcase.inventory.items.procurement",
      "landing.showcase.inventory.items.suppliers",
      "landing.showcase.inventory.items.invoices",
    ],
  },
  {
    id: "branches",
    icon: MapPin,
    eyebrowKey: "landing.showcase.branches.eyebrow",
    titleKey: "landing.showcase.branches.title",
    descriptionKey: "landing.showcase.branches.description",
    itemKeys: [
      "landing.showcase.branches.items.locations",
      "landing.showcase.branches.items.central",
      "landing.showcase.branches.items.permissions",
      "landing.showcase.branches.items.reporting",
    ],
  },
  {
    id: "staff",
    icon: Users,
    eyebrowKey: "landing.showcase.staff.eyebrow",
    titleKey: "landing.showcase.staff.title",
    descriptionKey: "landing.showcase.staff.description",
    itemKeys: [
      "landing.showcase.staff.items.roles",
      "landing.showcase.staff.items.permissions",
      "landing.showcase.staff.items.attendance",
      "landing.showcase.staff.items.stations",
      "landing.showcase.staff.items.payroll",
    ],
  },
];

export const qrItems = [
  { icon: QrCode, key: "landing.qr.items.digitalMenu" },
  { icon: Store, key: "landing.qr.items.restaurantPages" },
  { icon: Building2, key: "landing.qr.items.branchAware" },
  { icon: ShoppingBag, key: "landing.qr.items.easyAccess" },
];

export const howItWorksSteps = [
  {
    number: "01",
    titleKey: "landing.how.steps.setup.title",
    descriptionKey: "landing.how.steps.setup.description",
  },
  {
    number: "02",
    titleKey: "landing.how.steps.connect.title",
    descriptionKey: "landing.how.steps.connect.description",
  },
  {
    number: "03",
    titleKey: "landing.how.steps.run.title",
    descriptionKey: "landing.how.steps.run.description",
  },
  {
    number: "04",
    titleKey: "landing.how.steps.grow.title",
    descriptionKey: "landing.how.steps.grow.description",
  },
];

export const analyticsItems = [
  { icon: LineChart, key: "landing.analytics.items.sales" },
  { icon: ReceiptText, key: "landing.analytics.items.orders" },
  { icon: Package, key: "landing.analytics.items.inventory" },
  { icon: HandCoins, key: "landing.analytics.items.expenses" },
  { icon: Users, key: "landing.analytics.items.staff" },
  { icon: Building2, key: "landing.analytics.items.branches" },
];

export const whyItems = [
  {
    icon: UtensilsCrossed,
    titleKey: "landing.why.items.restaurant.title",
    descriptionKey: "landing.why.items.restaurant.description",
  },
  {
    icon: Layers3,
    titleKey: "landing.why.items.connected.title",
    descriptionKey: "landing.why.items.connected.description",
  },
  {
    icon: Building2,
    titleKey: "landing.why.items.multiBranch.title",
    descriptionKey: "landing.why.items.multiBranch.description",
  },
  {
    icon: BarChart3,
    titleKey: "landing.why.items.visibility.title",
    descriptionKey: "landing.why.items.visibility.description",
  },
  {
    icon: ShieldCheck,
    titleKey: "landing.why.items.permissions.title",
    descriptionKey: "landing.why.items.permissions.description",
  },
  {
    icon: ListChecks,
    titleKey: "landing.why.items.realWork.title",
    descriptionKey: "landing.why.items.realWork.description",
  },
];

export const solutionCards = [
  {
    icon: Store,
    titleKey: "landing.solutions.cards.restaurants.title",
    descriptionKey: "landing.solutions.cards.restaurants.description",
  },
  {
    icon: Soup,
    titleKey: "landing.solutions.cards.cafes.title",
    descriptionKey: "landing.solutions.cards.cafes.description",
  },
  {
    icon: Truck,
    titleKey: "landing.solutions.cards.fastFood.title",
    descriptionKey: "landing.solutions.cards.fastFood.description",
  },
  {
    icon: Building2,
    titleKey: "landing.solutions.cards.multiBranch.title",
    descriptionKey: "landing.solutions.cards.multiBranch.description",
  },
  {
    icon: Layers3,
    titleKey: "landing.solutions.cards.groups.title",
    descriptionKey: "landing.solutions.cards.groups.description",
  },
  {
    icon: Gauge,
    titleKey: "landing.solutions.cards.growing.title",
    descriptionKey: "landing.solutions.cards.growing.description",
  },
];

export const faqItems = [
  {
    questionKey: "landing.faq.items.what.question",
    answerKey: "landing.faq.items.what.answer",
  },
  {
    questionKey: "landing.faq.items.who.question",
    answerKey: "landing.faq.items.who.answer",
  },
  {
    questionKey: "landing.faq.items.branches.question",
    answerKey: "landing.faq.items.branches.answer",
  },
  {
    questionKey: "landing.faq.items.kitchen.question",
    answerKey: "landing.faq.items.kitchen.answer",
  },
  {
    questionKey: "landing.faq.items.inventory.question",
    answerKey: "landing.faq.items.inventory.answer",
  },
  {
    questionKey: "landing.faq.items.staff.question",
    answerKey: "landing.faq.items.staff.answer",
  },
  {
    questionKey: "landing.faq.items.qr.question",
    answerKey: "landing.faq.items.qr.answer",
  },
  {
    questionKey: "landing.faq.items.demo.question",
    answerKey: "landing.faq.items.demo.answer",
  },
  {
    questionKey: "landing.faq.items.started.question",
    answerKey: "landing.faq.items.started.answer",
  },
  {
    questionKey: "landing.faq.items.custom.question",
    answerKey: "landing.faq.items.custom.answer",
  },
];

export const footerGroups = [
  {
    titleKey: "landing.footer.product",
    links: [
      { labelKey: "landing.nav.features", href: "#features" },
      { labelKey: "landing.nav.solutions", href: "#solutions" },
      { labelKey: "landing.nav.pricing", href: "#pricing" },
      { labelKey: "landing.nav.faq", href: "#faq" },
    ],
  },
  {
    titleKey: "landing.footer.company",
    links: [
      { labelKey: "landing.footer.aboutAsanlink", href: "/about" },
      { labelKey: "landing.nav.contact", href: "#contact" },
      { labelKey: "landing.actions.bookDemo", href: "#contact" },
    ],
  },
  {
    titleKey: "landing.footer.resources",
    links: [
      { labelKey: "landing.footer.documentation", href: null },
      { labelKey: "landing.footer.support", href: null },
    ],
  },
  {
    titleKey: "landing.footer.legal",
    links: [
      { labelKey: "landing.footer.privacy", href: null },
      { labelKey: "landing.footer.terms", href: null },
    ],
  },
];
