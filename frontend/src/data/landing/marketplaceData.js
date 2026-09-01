import {
  CakeSlice,
  CookingPot,
  CupSoda,
  Drumstick,
  Hamburger,
  Pizza,
  Sandwich,
  Soup,
} from "lucide-react";

export const marketplaceLinks = {
  restaurants: "#restaurants",
  cuisines: "#cuisines",
  howItWorks: "#how-it-works",
  forRestaurants: "#for-restaurants",
  about: "/about",
  login: "/login",
  signup: "/signup",
  orders: "/orders",
  staffLogin: "/staff-login",
  contact: "mailto:contact@pakhlai.com",
};

export const marketplaceNavItems = [
  { labelKey: "landing.marketplace.nav.restaurants", href: marketplaceLinks.restaurants },
  { labelKey: "landing.marketplace.nav.explore", href: marketplaceLinks.cuisines },
  { labelKey: "landing.marketplace.nav.about", href: marketplaceLinks.about },
];

export const cuisineItems = [
  {
    key: "burgers",
    query: "Burger",
    icon: Hamburger,
    tone: "apricot",
  },
  {
    key: "pizza",
    query: "Pizza",
    icon: Pizza,
    tone: "tomato",
  },
  {
    key: "afghan",
    query: "Afghan",
    aliases: ["Qabuli", "Kabuli", "Kebab", "Kabab", "Palaw"],
    icon: CookingPot,
    tone: "saffron",
  },
  {
    key: "fastFood",
    query: "Fast Food",
    aliases: ["Burger", "Sandwich", "Fries"],
    icon: Sandwich,
    tone: "sage",
  },
  {
    key: "chicken",
    query: "Chicken",
    icon: Drumstick,
    tone: "pepper",
  },
  {
    key: "rice",
    query: "Rice",
    aliases: ["Qabuli", "Kabuli", "Palaw"],
    icon: Soup,
    tone: "olive",
  },
  {
    key: "desserts",
    query: "Dessert",
    aliases: ["Sweet", "Cake", "Ice cream"],
    icon: CakeSlice,
    tone: "rose",
  },
  {
    key: "drinks",
    query: "Drinks",
    aliases: ["Tea", "Juice", "Coffee"],
    icon: CupSoda,
    tone: "mint",
  },
];

export const ownerCapabilities = [
  "orders",
  "menus",
  "branches",
  "tables",
  "kitchen",
  "payments",
  "staff",
  "reports",
];

export const footerGroups = [
  {
    key: "customer",
    links: [
      { key: "findRestaurants", href: marketplaceLinks.restaurants },
      { key: "browseFood", href: marketplaceLinks.cuisines },
      { key: "orders", href: marketplaceLinks.orders },
      { key: "help", href: "mailto:contact@pakhlai.com?subject=Pakhlai%20customer%20help" },
    ],
  },
  {
    key: "restaurants",
    links: [
      { key: "restaurantSolutions", href: marketplaceLinks.forRestaurants },
      { key: "features", href: "#owner-features" },
      { key: "pricing", href: "mailto:contact@pakhlai.com?subject=Pakhlai%20restaurant%20pricing" },
      { key: "getStarted", href: "mailto:contact@pakhlai.com?subject=Start%20with%20Pakhlai" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "about", href: marketplaceLinks.about },
      { key: "contact", href: marketplaceLinks.contact },
      { key: "privacy", href: "/privacy" },
      { key: "terms", href: "/terms" },
    ],
  },
];
