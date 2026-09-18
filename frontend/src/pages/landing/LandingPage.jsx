import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CakeSlice,
  Check,
  ChevronDown,
  Clock3,
  CookingPot,
  Crosshair,
  CupSoda,
  Drumstick,
  Globe2,
  Hamburger,
  Heart,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  MessageCircleMore,
  Pizza,
  RotateCcw,
  Sandwich,
  Search,
  SearchX,
  ShoppingBag,
  Soup,
  Sparkles,
  Star,
  Store,
  Truck,
  UserRound,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/landing.css";
import i18n from "../../i18n";
import { API_BASE_URL } from "../../config/runtimeConfig";

const CUSTOMER_SESSION_EVENT = "pakhlai:customer-session";
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

function getMediaUrl(mediaPath) {
  if (!mediaPath) return "";
  if (
    mediaPath.startsWith("http") ||
    mediaPath.startsWith("data:") ||
    mediaPath.startsWith("blob:")
  ) {
    return mediaPath;
  }
  return `${MEDIA_URL}${mediaPath}`;
}

function readCustomerSession() {
  try {
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    const accessToken = localStorage.getItem("access_token");
    return customer && accessToken ? customer : null;
  } catch {
    return null;
  }
}

function notifyCustomerSessionChanged() {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_EVENT));
}

function useCustomerSession() {
  const [customer, setCustomer] = useState(readCustomerSession);

  useEffect(() => {
    const syncSession = () => setCustomer(readCustomerSession());
    window.addEventListener("storage", syncSession);
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(CUSTOMER_SESSION_EVENT, syncSession);
    };
  }, []);

  return customer;
}

function logoutCustomer() {
  localStorage.removeItem("customer");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

const marketplaceLinks = {
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

const marketplaceNavItems = [
  {
    labelKey: "landing.marketplace.nav.restaurants",
    href: marketplaceLinks.restaurants,
  },
  {
    labelKey: "landing.marketplace.nav.explore",
    href: marketplaceLinks.cuisines,
  },
  { labelKey: "landing.marketplace.nav.about", href: marketplaceLinks.about },
];

const cuisineItems = [
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

const ownerCapabilities = [
  "orders",
  "menus",
  "branches",
  "tables",
  "kitchen",
  "payments",
  "staff",
  "reports",
];

const footerGroups = [
  {
    key: "customer",
    links: [
      { key: "findRestaurants", href: marketplaceLinks.restaurants },
      { key: "browseFood", href: marketplaceLinks.cuisines },
      { key: "orders", href: marketplaceLinks.orders },
      {
        key: "help",
        href: "mailto:contact@pakhlai.com?subject=Pakhlai%20customer%20help",
      },
    ],
  },
  {
    key: "restaurants",
    links: [
      { key: "restaurantSolutions", href: marketplaceLinks.forRestaurants },
      { key: "features", href: "#owner-features" },
      {
        key: "pricing",
        href: "mailto:contact@pakhlai.com?subject=Pakhlai%20restaurant%20pricing",
      },
      {
        key: "getStarted",
        href: "mailto:contact@pakhlai.com?subject=Start%20with%20Pakhlai",
      },
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

function CustomerAccountMenu({
  className = "",
  compact = false,
  onNavigate,
  showGuestActions = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customer = useCustomerSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!customer) {
    if (!showGuestActions) return null;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          to="/login"
          className="marketplace-login-link"
          onClick={onNavigate}
        >
          {t("landing.marketplace.nav.login")}
        </Link>
        <Link
          to="/signup"
          className="marketplace-signup-link"
          onClick={onNavigate}
        >
          {t("landing.marketplace.nav.register")}
        </Link>
      </div>
    );
  }

  const username = customer.username || "Customer";
  const initial = username.trim().charAt(0).toUpperCase() || "C";

  const handleLogout = () => {
    logoutCustomer();
    notifyCustomerSessionChanged();
    setOpen(false);
    onNavigate?.();
    navigate("/", { replace: true });
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-1.5 text-stone-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        aria-label={`${t("landing.actions.profile", "Profile")}: ${username}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-sm font-black text-white">
          {initial}
        </span>
        {!compact ? (
          <span className="max-w-28 truncate text-sm font-bold">
            {username}
          </span>
        ) : null}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-[90] mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white p-2 text-left shadow-2xl shadow-stone-950/15 rtl:left-0 rtl:right-auto rtl:text-right"
        >
          <div className="border-b border-stone-100 px-3 py-2.5">
            <p className="truncate text-sm font-black text-stone-950">
              {username}
            </p>
            {customer.email ? (
              <p className="mt-0.5 truncate text-xs text-stone-500">
                {customer.email}
              </p>
            ) : null}
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-stone-700 transition hover:bg-orange-50 hover:text-orange-800"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("landing.actions.profile", "View profile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t("auth.logout", "Logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const languages = [
  { code: "en", label: i18n.t("legacy.en_734a78cd") },
  { code: "fa", label: "دری" },
  { code: "ps", label: "پښتو" },
];

function NavigationLink({ children, className, href, onClick }) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

function MarketplaceNavbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const customer = useCustomerSession();

  useEffect(() => {
    const landingPage = document.querySelector(".landing-page");
    const scrollContainer = landingPage?.closest("main") || window;
    const updateScrolled = () => {
      const top =
        scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      setScrolled(top > 12);
    };
    updateScrolled();
    scrollContainer.addEventListener("scroll", updateScrolled, {
      passive: true,
    });
    return () => scrollContainer.removeEventListener("scroll", updateScrolled);
  }, []);

  const focusSearch = (event) => {
    event.preventDefault();
    setOpen(false);
    const searchSection = document.getElementById("restaurant-search");
    const searchInput = document.getElementById(
      "marketplace-restaurant-search",
    );
    searchSection?.scrollIntoView({ block: "center", behavior: "smooth" });
    searchInput?.focus({ preventScroll: true });
  };

  return (
    <header className={`marketplace-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <nav
        className="marketplace-navbar-inner"
        aria-label={t("landing.marketplace.nav.primary")}
      >
        <a href="#top" className="marketplace-brand">
          <img
            src="/rmsFavicon.png"
            alt=""
            className="h-10 w-10 object-contain"
            width="40"
            height="40"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-[-0.04em] text-stone-950">
              {t("landing.marketplace.brand.name")}
            </p>
            <p className="truncate text-[0.64rem] font-bold uppercase tracking-[0.14em] text-stone-400">
              {t("landing.marketplace.brand.tagline")}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {marketplaceNavItems.map((item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              className="marketplace-nav-link"
            >
              {t(item.labelKey)}
            </NavigationLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#restaurant-search"
            onClick={focusSearch}
            className="marketplace-nav-icon"
            aria-label={t("landing.marketplace.nav.search")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </a>
          <label className="marketplace-language-select">
            <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">
              {t("landing.marketplace.nav.language")}
            </span>
            <select
              value={i18n.language?.split("-")[0] || "en"}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              className="max-w-24 bg-transparent text-base font-extrabold outline-none"
              aria-label={t("landing.marketplace.nav.language")}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <CustomerAccountMenu />
          <a
            href={marketplaceLinks.forRestaurants}
            className="marketplace-restaurant-link"
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            {t("landing.marketplace.nav.forRestaurants")}
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {customer ? (
            <CustomerAccountMenu compact showGuestActions={false} />
          ) : null}
          <a
            href="#restaurant-search"
            onClick={focusSearch}
            className="marketplace-nav-icon"
            aria-label={t("landing.marketplace.nav.search")}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="marketplace-nav-icon"
            aria-label={
              open
                ? t("landing.marketplace.nav.closeMenu")
                : t("landing.marketplace.nav.openMenu")
            }
            aria-expanded={open}
            aria-controls="marketplace-mobile-navigation"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="marketplace-mobile-navigation"
          className="marketplace-mobile-menu lg:hidden"
        >
          <div className="grid gap-1">
            {marketplaceNavItems.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="marketplace-mobile-link"
              >
                {t(item.labelKey)}
              </NavigationLink>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-stone-100 pt-3 sm:grid-cols-2">
            <label className="marketplace-mobile-link border border-stone-200">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">
                {t("landing.marketplace.nav.language")}
              </span>
              <select
                value={i18n.language?.split("-")[0] || "en"}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                className="w-full bg-transparent text-base font-semibold outline-none"
                aria-label={t("landing.marketplace.nav.language")}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            {!customer ? (
              <>
                <Link
                  to={marketplaceLinks.login}
                  onClick={() => setOpen(false)}
                  className="marketplace-mobile-link justify-center border border-stone-200"
                >
                  {t("landing.marketplace.nav.login")}
                </Link>
                <Link
                  to={marketplaceLinks.signup}
                  onClick={() => setOpen(false)}
                  className="marketplace-mobile-link justify-center border border-orange-200 bg-orange-50 text-orange-800"
                >
                  {t("landing.marketplace.nav.register")}
                </Link>
              </>
            ) : null}
            <a
              href={marketplaceLinks.forRestaurants}
              onClick={() => setOpen(false)}
              className="marketplace-mobile-owner-link"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.nav.forRestaurants")}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

const RECENT_SEARCHES_KEY = "pakhlai_recent_restaurant_searches";
const MAX_RECENT_SEARCHES = 5;

function normalize(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function isValidRecentSearch(item) {
  return Boolean(
    item &&
    typeof item === "object" &&
    typeof item.label === "string" &&
    item.label.trim() &&
    ["query", "restaurant", "cuisine", "dish"].includes(item.type),
  );
}

function localizedName(item, language) {
  const languageCode = language?.split("-")[0];
  if (languageCode === "fa") return item?.name_dari || item?.name;
  if (languageCode === "ps") return item?.name_pashto || item?.name;
  return item?.name;
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getRestaurantHaystack(restaurant) {
  return [
    restaurant.name,
    restaurant.slug,
    restaurant.slogan,
    restaurant.address,
    ...(restaurant.cuisines || []),
    ...(restaurant.cuisine_details || []).flatMap((cuisine) => [
      cuisine.name,
      cuisine.name_dari,
      cuisine.name_pashto,
    ]),
    ...(restaurant.dishes || []).flatMap((dish) => [
      dish.name,
      dish.name_dari,
      dish.name_pashto,
      dish.category,
      dish.category_dari,
      dish.category_pashto,
    ]),
    ...(restaurant.branches || []).flatMap((branch) => [
      branch.name,
      branch.address,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function suggestionIcon(type) {
  if (type === "restaurant") return Store;
  if (type === "recent") return Clock3;
  return UtensilsCrossed;
}

function SuggestionMenu({
  activeIndex,
  groupedSuggestions,
  loading,
  menuId,
  onChoose,
  popoverRef,
  style,
  t,
}) {
  let optionIndex = -1;
  const hasSuggestions = groupedSuggestions.some((group) => group.items.length);

  return createPortal(
    <div
      ref={popoverRef}
      id={menuId}
      role="listbox"
      className="marketplace-search-popover"
      style={style}
    >
      {loading ? (
        <div
          className="flex min-h-28 items-center justify-center gap-3 px-5 py-8 text-sm font-semibold text-stone-600"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-orange-600"
            aria-hidden="true"
          />
          {t("landing.marketplace.search.loading")}
        </div>
      ) : hasSuggestions ? (
        <div className="marketplace-search-results">
          {groupedSuggestions.map((group) =>
            group.items.length ? (
              <section
                key={group.key}
                role="group"
                aria-labelledby={`${menuId}-${group.key}`}
              >
                <p
                  id={`${menuId}-${group.key}`}
                  className="px-4 pb-1 pt-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-stone-400 first:pt-2"
                >
                  {group.label}
                </p>
                <div className="px-1.5 pb-1">
                  {group.items.map((item) => {
                    optionIndex += 1;
                    const currentIndex = optionIndex;
                    const Icon = suggestionIcon(item.type);
                    return (
                      <button
                        key={item.id}
                        id={`${menuId}-option-${currentIndex}`}
                        type="button"
                        role="option"
                        tabIndex={-1}
                        aria-selected={activeIndex === currentIndex}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onChoose(item)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition ${
                          activeIndex === currentIndex
                            ? "bg-orange-50 text-stone-950"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {item.label}
                          </span>
                          {item.subtitle ? (
                            <span className="mt-0.5 block truncate text-xs text-stone-500">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-stone-400 rtl:rotate-180"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div className="px-6 py-8 text-center" role="status" aria-live="polite">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-bold text-stone-900">
            {t("landing.marketplace.search.noResultsTitle")}
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {t("landing.marketplace.search.noResultsDescription")}
          </p>
        </div>
      )}
    </div>,
    document.body,
  );
}

function LocationPanel({
  id,
  location,
  onLocationChange,
  restaurants,
  onClose,
}) {
  const { t } = useTranslation();
  const [manualLocation, setManualLocation] = useState(
    location?.mode === "manual" ? location.label : "",
  );
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");

  const knownLocations = useMemo(
    () =>
      uniqueBy(
        restaurants
          .flatMap((restaurant) => [
            restaurant.address,
            ...(restaurant.branches || []).map((branch) => branch.address),
          ])
          .filter(Boolean)
          .map((label) => ({ label: label.trim() })),
        (item) => normalize(item.label),
      ).slice(0, 6),
    [restaurants],
  );

  const visibleLocations = knownLocations.filter((item) =>
    normalize(item.label).includes(normalize(manualLocation)),
  );

  const useCurrentLocation = () => {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage(t("landing.marketplace.location.unsupported"));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          label: t("landing.marketplace.location.current"),
          mode: "coordinates",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        setLocating(false);
        onClose();
      },
      () => {
        setLocating(false);
        setMessage(t("landing.marketplace.location.permissionError"));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const chooseManualLocation = (label) => {
    onLocationChange({ label, mode: "manual", coordinates: null });
    setManualLocation(label);
    onClose();
  };

  const submitManualLocation = (event) => {
    event.preventDefault();
    const label = manualLocation.trim();
    if (label) chooseManualLocation(label);
  };

  const clearLocation = () => {
    onLocationChange(null);
    setManualLocation("");
    setMessage("");
    onClose();
  };

  return (
    <div
      id={id}
      className="marketplace-location-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id={`${id}-title`} className="font-extrabold text-stone-950">
            {t("landing.marketplace.location.title")}
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {t("landing.marketplace.location.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
          aria-label={t("landing.marketplace.location.close")}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-xl bg-stone-950 px-4 py-3 text-start text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70"
      >
        {locating ? (
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <Crosshair className="h-5 w-5" aria-hidden="true" />
        )}
        {t("landing.marketplace.location.useCurrent")}
      </button>

      <form onSubmit={submitManualLocation} className="mt-3">
        <label htmlFor="marketplace-location-input" className="sr-only">
          {t("landing.marketplace.location.manualLabel")}
        </label>
        <div className="flex min-h-12 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
          <MapPin
            className="h-5 w-5 shrink-0 text-orange-600"
            aria-hidden="true"
          />
          <input
            id="marketplace-location-input"
            value={manualLocation}
            onChange={(event) => setManualLocation(event.target.value)}
            placeholder={t("landing.marketplace.location.placeholder")}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-stone-900 outline-none placeholder:font-medium placeholder:text-stone-400 sm:text-sm"
          />
          <button
            type="submit"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-orange-600 px-3 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            {t("landing.marketplace.location.apply")}
          </button>
        </div>
      </form>

      {message ? (
        <p
          className="mt-3 text-xs font-semibold text-red-600"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      {location ? (
        <button
          type="button"
          onClick={clearLocation}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
        >
          {t("landing.marketplace.location.clearSelection")}
        </button>
      ) : null}

      {visibleLocations.length ? (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <p className="px-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-stone-400">
            {t("landing.marketplace.location.availableAreas")}
          </p>
          <div className="mt-1 grid gap-1">
            {visibleLocations.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => chooseManualLocation(item.label)}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-start text-sm font-semibold text-stone-700 transition hover:bg-orange-50 hover:text-orange-800"
              >
                <MapPin
                  className="h-4 w-4 shrink-0 text-orange-500"
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MarketplaceSearch({
  cuisines = [],
  dishes = [],
  location,
  onExplore,
  onLocationChange,
  onValueChange,
  restaurants = [],
  searchResults = null,
  searchStatus = "idle",
  status = "success",
  value = "",
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popoverStyle, setPopoverStyle] = useState({});
  const shellRef = useRef(null);
  const anchorRef = useRef(null);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const menuId = "marketplace-search-suggestions";
  const locationPanelId = "marketplace-location-panel";

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(RECENT_SEARCHES_KEY) || "[]",
      );
      setRecentSearches(
        Array.isArray(saved)
          ? saved.filter(isValidRecentSearch).slice(0, MAX_RECENT_SEARCHES)
          : [],
      );
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const query = normalize(value);

  const suggestionGroups = useMemo(() => {
    const restaurantPool = uniqueBy(
      [...(searchResults?.restaurants || []), ...restaurants],
      (restaurant) => restaurant.id || restaurant.slug,
    );
    const locationQuery =
      location?.mode === "manual" ? normalize(location.label) : "";
    const matchingRestaurants = restaurantPool
      .filter((restaurant) => {
        if (!locationQuery) return true;
        return normalize(
          [
            restaurant.address,
            ...(restaurant.branches || []).map((branch) => branch.address),
          ]
            .filter(Boolean)
            .join(" "),
        ).includes(locationQuery);
      })
      .filter(
        (restaurant) =>
          !query || getRestaurantHaystack(restaurant).includes(query),
      )
      .slice(0, 5)
      .map((restaurant) => ({
        id: `restaurant-${restaurant.id || restaurant.slug}`,
        type: "restaurant",
        label: restaurant.name,
        subtitle:
          [restaurant.cuisines?.slice(0, 2).join(" · "), restaurant.address]
            .filter(Boolean)
            .join(" — ") ||
          t("landing.marketplace.search.restaurantSuggestion"),
        slug: restaurant.slug,
        query: restaurant.name,
      }));

    const cuisinePool = uniqueBy(
      [
        ...(searchResults?.cuisines || []),
        ...cuisines.map((item) =>
          typeof item === "string" ? { name: item } : item,
        ),
        ...restaurantPool.flatMap((restaurant) =>
          restaurant.cuisine_details?.length
            ? restaurant.cuisine_details
            : (restaurant.cuisines || []).map((name) => ({ name })),
        ),
      ],
      (item) => normalize(item.name),
    );

    const matchingCuisines = cuisinePool
      .filter(
        (item) =>
          !query ||
          normalize(
            [item.name, item.name_dari, item.name_pashto]
              .filter(Boolean)
              .join(" "),
          ).includes(query),
      )
      .slice(0, 5)
      .map((item) => {
        const label = localizedName(item, i18n.language);
        return {
          id: `cuisine-${normalize(item.name)}`,
          type: "cuisine",
          label,
          subtitle: t("landing.marketplace.search.cuisineSuggestion"),
          query: label,
        };
      });

    const dishPool = uniqueBy(
      [
        ...(searchResults?.dishes || []),
        ...dishes,
        ...restaurantPool.flatMap((restaurant) =>
          (restaurant.dishes || []).map((dish) => ({
            ...dish,
            restaurant_name: restaurant.name,
            restaurant_slug: restaurant.slug,
          })),
        ),
      ].map((item) => (typeof item === "string" ? { name: item } : item)),
      (item) => `${normalize(item.name)}-${item.restaurant_slug || "all"}`,
    );

    const matchingDishes = dishPool
      .filter(
        (item) =>
          !query ||
          normalize(
            [
              item.name,
              item.name_dari,
              item.name_pashto,
              item.category,
              item.category_dari,
              item.category_pashto,
            ]
              .filter(Boolean)
              .join(" "),
          ).includes(query),
      )
      .slice(0, 5)
      .map((item) => {
        const label = localizedName(item, i18n.language);
        return {
          id: `dish-${normalize(item.name)}-${item.restaurant_slug || "all"}`,
          type: "dish",
          label,
          subtitle:
            item.restaurant_name ||
            localizedName(
              {
                name: item.category,
                name_dari: item.category_dari,
                name_pashto: item.category_pashto,
              },
              i18n.language,
            ) ||
            t("landing.marketplace.search.dishSuggestion"),
          slug: item.restaurant_slug,
          query: label,
        };
      });

    const recent = query
      ? []
      : recentSearches.slice(0, MAX_RECENT_SEARCHES).map((item, index) => ({
          ...item,
          id: `recent-${item.type || "query"}-${index}-${normalize(item.label)}`,
          type: "recent",
          originalType: item.type,
        }));

    return [
      {
        key: "recent",
        label: t("landing.marketplace.search.recent"),
        items: recent,
      },
      {
        key: "restaurants",
        label: location?.label
          ? t("landing.marketplace.search.restaurantsNear", {
              location: location.label,
            })
          : t("landing.marketplace.search.restaurants"),
        items: matchingRestaurants,
      },
      {
        key: "cuisines",
        label: t("landing.marketplace.search.cuisines"),
        items: matchingCuisines,
      },
      {
        key: "dishes",
        label: t("landing.marketplace.search.dishes"),
        items: matchingDishes,
      },
    ];
  }, [
    cuisines,
    dishes,
    i18n.language,
    location?.label,
    location?.mode,
    query,
    recentSearches,
    restaurants,
    searchResults,
    t,
  ]);

  const flatSuggestions = suggestionGroups.flatMap((group) => group.items);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(`${menuId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, menuId, open]);

  useEffect(() => {
    if (activeIndex >= flatSuggestions.length) setActiveIndex(-1);
  }, [activeIndex, flatSuggestions.length]);

  const remember = (item) => {
    if (!item) return;
    const recentItem = {
      label: item.label,
      query: item.query || item.label,
      slug: item.slug || "",
      type: item.originalType || item.type || "query",
      subtitle: item.subtitle || "",
    };
    const next = uniqueBy(
      [recentItem, ...recentSearches],
      (entry) => `${entry.type}-${entry.slug || normalize(entry.query)}`,
    ).slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(next);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // Recent searches are optional when browser storage is unavailable.
    }
  };

  const chooseSuggestion = (item) => {
    if (!item) return;
    remember(item);
    setOpen(false);
    setActiveIndex(-1);

    if (
      item.slug &&
      ["restaurant", "dish"].includes(item.originalType || item.type)
    ) {
      navigate(`/${item.slug}`);
      return;
    }

    const nextQuery = item.query || item.label;
    onValueChange(nextQuery);
    onExplore(nextQuery);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const exactRestaurant = [
      ...(searchResults?.restaurants || []),
      ...restaurants,
    ].find(
      (restaurant) =>
        normalize(restaurant.name) === query ||
        normalize(restaurant.slug) === query,
    );

    if (exactRestaurant && query) {
      chooseSuggestion({
        id: `restaurant-${exactRestaurant.id || exactRestaurant.slug}`,
        type: "restaurant",
        label: exactRestaurant.name,
        slug: exactRestaurant.slug,
        query: exactRestaurant.name,
      });
      return;
    }

    if (value.trim()) {
      remember({ label: value.trim(), query: value.trim(), type: "query" });
    }
    setOpen(false);
    onExplore(value.trim());
  };

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return undefined;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportHeight = viewport?.height || window.innerHeight;
      const viewportBottom = viewportTop + viewportHeight;
      const gutter = window.innerWidth < 640 ? 12 : 8;
      const left = Math.max(gutter, rect.left);
      const width = Math.min(rect.width, window.innerWidth - left - gutter);
      const roomBelow = viewportBottom - rect.bottom - gutter;
      const roomAbove = rect.top - viewportTop - gutter;
      const openAbove = roomBelow < 210 && roomAbove > roomBelow;
      const availableRoom = Math.max(0, openAbove ? roomAbove : roomBelow);
      const maxHeight = Math.min(380, availableRoom);
      const top = openAbove
        ? Math.max(viewportTop + gutter, rect.top - maxHeight - gutter)
        : Math.max(viewportTop + gutter, rect.bottom + gutter);

      setPopoverStyle({ left, top, width, maxHeight });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [open, value]);

  useEffect(() => {
    if (!open && !locationOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (
        !shellRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setLocationOpen(false);
      }
    };
    const closeOnFocusExit = (event) => {
      if (
        !shellRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setLocationOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setLocationOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("focusin", closeOnFocusExit);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("focusin", closeOnFocusExit);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [locationOpen, open]);

  const onInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!flatSuggestions.length) return;
      setOpen(true);
      setActiveIndex((index) =>
        Math.min(index + 1, flatSuggestions.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!flatSuggestions.length) return;
      setActiveIndex((index) =>
        index <= 0 ? flatSuggestions.length - 1 : index - 1,
      );
    } else if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = flatSuggestions[activeIndex];
      if (suggestion) chooseSuggestion(suggestion);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Tab") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={shellRef} className="marketplace-search-shell">
      <form
        onSubmit={submitSearch}
        className="marketplace-search-card"
        role="search"
      >
        <div className="marketplace-search-fields">
          <div ref={anchorRef} className="marketplace-query-field">
            <Search
              className="h-5 w-5 shrink-0 text-orange-600 sm:h-6 sm:w-6"
              aria-hidden="true"
            />
            <label htmlFor="marketplace-restaurant-search" className="sr-only">
              {t("landing.marketplace.search.label")}
            </label>
            <input
              ref={inputRef}
              id="marketplace-restaurant-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={value}
              onChange={(event) => {
                onValueChange(event.target.value);
                setActiveIndex(-1);
                setOpen(true);
              }}
              onFocus={() => {
                setLocationOpen(false);
                setOpen(true);
                if (window.innerWidth < 640) {
                  window.setTimeout(
                    () => inputRef.current?.scrollIntoView({ block: "center" }),
                    120,
                  );
                }
              }}
              onKeyDown={onInputKeyDown}
              placeholder={t("landing.marketplace.search.placeholder")}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={menuId}
              aria-activedescendant={
                activeIndex >= 0 ? `${menuId}-option-${activeIndex}` : undefined
              }
              className="min-h-11 min-w-0 flex-1 bg-transparent text-base font-bold text-stone-950 outline-none placeholder:font-semibold placeholder:text-stone-400 sm:text-lg"
            />
            {value ? (
              <button
                type="button"
                onClick={() => {
                  onValueChange("");
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label={t("landing.marketplace.search.clear")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setLocationOpen((current) => !current);
            }}
            onFocus={() => setOpen(false)}
            className={`marketplace-location-trigger ${locationOpen ? "is-active" : ""}`}
            aria-expanded={locationOpen}
            aria-haspopup="dialog"
            aria-controls={locationPanelId}
          >
            <MapPin
              className="h-5 w-5 shrink-0 text-orange-600"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 text-start">
              <span className="block text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                {t("landing.marketplace.location.label")}
              </span>
              <span className="block truncate text-sm font-bold text-stone-800">
                {location?.label ||
                  t("landing.marketplace.location.placeholder")}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-stone-400 transition ${locationOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <button type="submit" className="marketplace-explore-button">
            <span>{t("landing.marketplace.search.action")}</span>
            <ArrowRight
              className="h-5 w-5 shrink-0 rtl:rotate-180"
              aria-hidden="true"
            />
          </button>
        </div>

        {locationOpen ? (
          <LocationPanel
            id={locationPanelId}
            location={location}
            onLocationChange={onLocationChange}
            restaurants={restaurants}
            onClose={() => setLocationOpen(false)}
          />
        ) : null}
      </form>

      {open && typeof document !== "undefined" ? (
        <SuggestionMenu
          activeIndex={activeIndex}
          groupedSuggestions={suggestionGroups}
          loading={
            searchStatus === "loading" ||
            (searchStatus === "idle" && status === "loading")
          }
          menuId={menuId}
          onChoose={chooseSuggestion}
          popoverRef={popoverRef}
          style={popoverStyle}
          t={t}
        />
      ) : null}
    </div>
  );
}

const trustKeys = ["menus", "ordering", "location"];

function HeroSection({
  cuisines,
  dishes,
  location,
  onExplore,
  onLocationChange,
  onSearchValueChange,
  restaurants,
  searchResults,
  searchValue,
  searchStatus,
  status,
}) {
  const { t } = useTranslation();

  return (
    <section id="top" className="marketplace-hero">
      <div className="marketplace-hero-texture" aria-hidden="true" />
      <div className="marketplace-container relative">
        <div className="marketplace-hero-layout">
          <div className="marketplace-hero-copy marketplace-enter">
            <span className="marketplace-hero-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.hero.eyebrow")}
            </span>
            <h1>{t("landing.marketplace.hero.title")}</h1>
            <p>{t("landing.marketplace.hero.description")}</p>

            <div
              className="marketplace-hero-trust"
              aria-label={t("landing.marketplace.hero.trustLabel")}
            >
              {trustKeys.map((key) => (
                <span key={key}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {t(`landing.marketplace.hero.trust.${key}`)}
                </span>
              ))}
            </div>
          </div>

          <figure
            className="marketplace-hero-visual marketplace-enter"
            aria-label={t("landing.marketplace.hero.imageLabel")}
          >
            <img
              src="/images/pakhlai-hero-feast.webp"
              alt={t("landing.marketplace.hero.imageAlt")}
              className="h-full w-full object-cover"
              width="1535"
              height="1025"
              loading="eager"
              fetchPriority="high"
            />
            <div className="marketplace-hero-image-shade" aria-hidden="true" />
            <figcaption className="marketplace-hero-caption">
              <span className="marketplace-hero-caption-icon">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <strong>{t("landing.marketplace.hero.captionTitle")}</strong>
                <small>
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("landing.marketplace.hero.captionDescription")}
                </small>
              </span>
            </figcaption>
          </figure>

          <div
            id="restaurant-search"
            className="marketplace-hero-search marketplace-enter"
          >
            <MarketplaceSearch
              cuisines={cuisines}
              dishes={dishes}
              location={location}
              onExplore={onExplore}
              onLocationChange={onLocationChange}
              onValueChange={onSearchValueChange}
              restaurants={restaurants}
              searchResults={searchResults}
              searchStatus={searchStatus}
              status={status}
              value={searchValue}
            />
            <p className="marketplace-search-hint">
              {t("landing.marketplace.search.hint")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function RestaurantImage({ restaurant, eager = false }) {
  const source = getMediaUrl(restaurant.cover_image || restaurant.logo);

  if (!source) {
    return (
      <div className="marketplace-card-image marketplace-card-image-fallback">
        <span className="marketplace-card-orb marketplace-card-orb-one" />
        <span className="marketplace-card-orb marketplace-card-orb-two" />
        <Utensils
          className="relative h-10 w-10 text-orange-700"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="marketplace-card-image">
      <img
        src={source}
        alt={restaurant.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
    </div>
  );
}

function RestaurantCard({
  compact = false,
  eager = false,
  favorite = false,
  onToggleFavorite,
  restaurant,
}) {
  const { t } = useTranslation();
  const minOrder = formatAmount(restaurant.min_order_amount);
  const rating = Number(restaurant.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const hasDistanceValue =
    restaurant.distance_km !== null &&
    restaurant.distance_km !== undefined &&
    restaurant.distance_km !== "";
  const distance = Number(restaurant.distance_km);
  const hasDistance = hasDistanceValue && Number.isFinite(distance);
  const deliveryMinutes = restaurant.estimated_delivery_minutes;
  const hasOpenStatus = typeof restaurant.is_open === "boolean";

  const deliveryLabel = (() => {
    if (restaurant.delivers_to_location === true) {
      return t("landing.marketplace.card.deliversToYou");
    }
    if (restaurant.delivers_to_location === false) {
      return t("landing.marketplace.card.outsideArea");
    }
    if (restaurant.delivery_available) {
      return t("landing.marketplace.card.deliveryAvailable");
    }
    return t("landing.marketplace.card.pickupOnly");
  })();

  return (
    <article
      className={`marketplace-restaurant-card group ${compact ? "is-compact" : ""}`}
    >
      <div className="relative">
        <RestaurantImage restaurant={restaurant} eager={eager} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          <span
            className={`marketplace-status-pill ${
              hasOpenStatus
                ? restaurant.is_open
                  ? "is-open"
                  : "is-closed"
                : "is-unknown"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasOpenStatus
              ? restaurant.is_open
                ? t("landing.marketplace.card.open")
                : t("landing.marketplace.card.closed")
              : t("landing.marketplace.card.hoursUnavailable")}
          </span>
          <button
            type="button"
            onClick={() => onToggleFavorite?.(restaurant.slug)}
            className={`marketplace-favorite-button ${favorite ? "is-favorite" : ""}`}
            aria-label={
              favorite
                ? t("landing.marketplace.card.removeFavorite", {
                    name: restaurant.name,
                  })
                : t("landing.marketplace.card.addFavorite", {
                    name: restaurant.name,
                  })
            }
            aria-pressed={favorite}
          >
            <Heart
              className="h-5 w-5"
              fill={favorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-[-0.02em] text-stone-950 sm:text-xl">
              {restaurant.name}
            </h3>
            <p className="mt-1 truncate text-sm font-medium text-stone-500">
              {(restaurant.cuisines || []).slice(0, 3).join(" · ") ||
                restaurant.slogan ||
                t("landing.marketplace.card.localRestaurant")}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-800">
            {hasRating ? (
              <>
                <Star
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                  aria-hidden="true"
                />
                {rating.toFixed(1)}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t("landing.marketplace.card.new")}
              </>
            )}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-xs font-semibold text-stone-600 sm:grid-cols-2">
          <span className="flex min-h-7 items-center gap-2">
            <Truck
              className="h-4 w-4 shrink-0 text-orange-600"
              aria-hidden="true"
            />
            <span className="truncate">{deliveryLabel}</span>
          </span>
          {deliveryMinutes ? (
            <span className="flex min-h-7 items-center gap-2">
              <Clock3
                className="h-4 w-4 shrink-0 text-orange-600"
                aria-hidden="true"
              />
              {t("landing.marketplace.card.minutes", {
                count: deliveryMinutes,
              })}
            </span>
          ) : hasDistance ? (
            <span className="flex min-h-7 items-center gap-2">
              <MapPin
                className="h-4 w-4 shrink-0 text-orange-600"
                aria-hidden="true"
              />
              {t("landing.marketplace.card.distance", {
                distance: distance.toFixed(1),
              })}
            </span>
          ) : restaurant.address ? (
            <span className="flex min-h-7 items-center gap-2">
              <MapPin
                className="h-4 w-4 shrink-0 text-orange-600"
                aria-hidden="true"
              />
              <span className="truncate">{restaurant.address}</span>
            </span>
          ) : null}
          {minOrder && Number(restaurant.min_order_amount) > 0 ? (
            <span className="flex min-h-7 items-center gap-2 sm:col-span-2">
              <Store
                className="h-4 w-4 shrink-0 text-orange-600"
                aria-hidden="true"
              />
              {t("landing.marketplace.card.minimumOrder", { amount: minOrder })}
            </span>
          ) : null}
        </div>

        <Link
          to={`/${restaurant.slug}`}
          className="marketplace-view-menu mt-5"
          aria-label={t("landing.marketplace.card.viewMenuFor", {
            name: restaurant.name,
          })}
        >
          {t("landing.marketplace.card.viewMenu")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function normalized(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function restaurantMatches(restaurant, terms) {
  if (!terms.length) return true;
  const haystack = [
    restaurant.name,
    restaurant.slogan,
    restaurant.address,
    ...(restaurant.cuisines || []),
    ...(restaurant.cuisine_details || []).flatMap((cuisine) => [
      cuisine.name,
      cuisine.name_dari,
      cuisine.name_pashto,
    ]),
    ...(restaurant.dishes || []).flatMap((dish) => [
      dish.name,
      dish.name_dari,
      dish.name_pashto,
      dish.category,
      dish.category_dari,
      dish.category_pashto,
    ]),
    ...(restaurant.branches || []).flatMap((branch) => [
      branch.name,
      branch.address,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return terms.some((term) => haystack.includes(normalized(term)));
}

function restaurantMatchesLocation(restaurant, location) {
  if (location?.mode !== "manual" || !normalized(location.label)) return true;
  const places = [
    restaurant.address,
    ...(restaurant.branches || []).flatMap((branch) => [
      branch.name,
      branch.address,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return places.includes(normalized(location.label));
}

function RestaurantSkeleton() {
  return (
    <div
      className="marketplace-restaurant-card animate-pulse"
      aria-hidden="true"
    >
      <div className="h-48 bg-stone-200" />
      <div className="p-5">
        <div className="h-5 w-2/3 rounded-full bg-stone-200" />
        <div className="mt-3 h-4 w-1/2 rounded-full bg-stone-100" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-4 rounded-full bg-stone-100" />
          <div className="h-4 rounded-full bg-stone-100" />
        </div>
        <div className="mt-5 h-11 rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}

function RestaurantDiscoverySection({
  favorites = [],
  filterAliases = [],
  filterQuery = "",
  location,
  onClearFilter,
  onRetry,
  onToggleFavorite,
  restaurants = [],
  serverFiltered = false,
  status,
}) {
  const { t } = useTranslation();
  const terms = useMemo(
    () => [filterQuery, ...filterAliases].filter(Boolean),
    [filterAliases, filterQuery],
  );

  const visibleRestaurants = useMemo(() => {
    const filtered = restaurants.filter(
      (restaurant) =>
        (serverFiltered || restaurantMatches(restaurant, terms)) &&
        restaurantMatchesLocation(restaurant, location),
    );
    if (location?.coordinates) return filtered;
    return [...filtered].sort((a, b) => {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
  }, [location, restaurants, serverFiltered, terms]);

  return (
    <section
      id="restaurants"
      className="marketplace-section bg-[#fbfaf6]"
      aria-labelledby="restaurants-title"
    >
      <div className="marketplace-container">
        <div className="marketplace-section-heading">
          <div>
            <span className="marketplace-eyebrow">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {location?.label || t("landing.marketplace.discovery.eyebrow")}
            </span>
            <h2 id="restaurants-title" className="marketplace-section-title">
              {t("landing.marketplace.discovery.title")}
            </h2>
            <p className="marketplace-section-description">
              {location?.coordinates
                ? t("landing.marketplace.discovery.locationDescription")
                : t("landing.marketplace.discovery.description")}
            </p>
          </div>
          {filterQuery ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="marketplace-filter-chip"
              aria-label={t("landing.marketplace.discovery.clearFilterLabel", {
                query: filterQuery,
              })}
            >
              <span>
                {t("landing.marketplace.discovery.showing", {
                  query: filterQuery,
                })}
              </span>
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>

        {status === "loading" ? (
          <div className="marketplace-restaurant-rail" role="status">
            <span className="sr-only">
              {t("landing.marketplace.discovery.loading")}
            </span>
            {[1, 2, 3].map((item) => (
              <RestaurantSkeleton key={item} />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="marketplace-state-card" role="alert">
            <span className="marketplace-state-icon is-error">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.errorTitle")}</h3>
            <p>{t("landing.marketplace.discovery.errorDescription")}</p>
            <button
              type="button"
              onClick={onRetry}
              className="marketplace-state-action"
            >
              <LoaderCircle className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.discovery.retry")}
            </button>
          </div>
        ) : visibleRestaurants.length ? (
          <div className="marketplace-restaurant-rail">
            {visibleRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id || restaurant.slug}
                restaurant={restaurant}
                favorite={favorites.includes(restaurant.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : restaurants.length ? (
          <div className="marketplace-state-card">
            <span className="marketplace-state-icon">
              <SearchX className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.noResultsTitle")}</h3>
            <p>{t("landing.marketplace.discovery.noResultsDescription")}</p>
            <button
              type="button"
              onClick={onClearFilter}
              className="marketplace-state-action"
            >
              {t("landing.marketplace.discovery.clearSearch")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : (
          <div className="marketplace-state-card">
            <span className="marketplace-state-icon">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.emptyTitle")}</h3>
            <p>{t("landing.marketplace.discovery.emptyDescription")}</p>
            <a href="#for-restaurants" className="marketplace-state-action">
              {t("landing.marketplace.discovery.joinPakhlai")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function CuisineSection({ onSelect }) {
  const { t } = useTranslation();

  return (
    <section
      id="cuisines"
      className="marketplace-section marketplace-cuisine-section"
      aria-labelledby="cuisine-title"
    >
      <div className="marketplace-container">
        <div className="marketplace-section-heading is-compact">
          <div>
            <span className="marketplace-eyebrow">
              {t("landing.marketplace.cuisines.eyebrow")}
            </span>
            <h2 id="cuisine-title" className="marketplace-section-title">
              {t("landing.marketplace.cuisines.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelect("", [])}
            className="marketplace-text-link"
          >
            {t("landing.marketplace.cuisines.viewAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>

        <div className="marketplace-cuisine-rail">
          {cuisineItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.query, item.aliases || [])}
                className={`marketplace-cuisine-card tone-${item.tone}`}
              >
                <span className="marketplace-cuisine-icon">
                  <Icon
                    className="h-7 w-7"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-4 text-sm font-black tracking-[-0.01em] text-stone-950">
                  {t(`landing.marketplace.cuisines.items.${item.key}`)}
                </span>
                <span className="mt-1 text-xs font-semibold text-stone-500">
                  {t("landing.marketplace.cuisines.explore")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PopularRestaurantsSection({
  favorites = [],
  onToggleFavorite,
  restaurants = [],
  status,
}) {
  const { t } = useTranslation();
  const popular = useMemo(
    () =>
      restaurants
        .filter(
          (restaurant) =>
            Number(restaurant.review_count) > 0 &&
            Number(restaurant.rating) > 0,
        )
        .sort((a, b) => {
          const scoreA =
            Number(a.rating) * Math.log2(Number(a.review_count) + 2);
          const scoreB =
            Number(b.rating) * Math.log2(Number(b.review_count) + 2);
          return scoreB - scoreA;
        })
        .slice(0, 3),
    [restaurants],
  );

  if (status === "loading" || status === "error") return null;

  return (
    <section
      className="marketplace-section bg-white"
      aria-labelledby="popular-title"
    >
      <div className="marketplace-container">
        <div className="marketplace-section-heading is-compact">
          <div>
            <span className="marketplace-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.popular.eyebrow")}
            </span>
            <h2 id="popular-title" className="marketplace-section-title">
              {t("landing.marketplace.popular.title")}
            </h2>
            <p className="marketplace-section-description">
              {t("landing.marketplace.popular.description")}
            </p>
          </div>
        </div>

        {popular.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id || restaurant.slug}
                compact
                restaurant={restaurant}
                favorite={favorites.includes(restaurant.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="marketplace-popular-empty">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <MessageCircleMore className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-black text-stone-950">
                {t("landing.marketplace.popular.emptyTitle")}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                {t("landing.marketplace.popular.emptyDescription")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const steps = [
  { key: "find", icon: Search },
  { key: "choose", icon: UtensilsCrossed },
  { key: "order", icon: ShoppingBag },
];

const conveniences = [
  { key: "favorites", icon: Heart },
  { key: "orders", icon: RotateCcw, href: "/orders" },
  { key: "locations", icon: MapPinned },
];

function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className="marketplace-section marketplace-how-section"
      aria-labelledby="how-title"
    >
      <div className="marketplace-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="marketplace-eyebrow justify-center">
            {t("landing.marketplace.how.eyebrow")}
          </span>
          <h2 id="how-title" className="marketplace-section-title">
            {t("landing.marketplace.how.title")}
          </h2>
          <p className="marketplace-section-description mx-auto">
            {t("landing.marketplace.how.description")}
          </p>
        </div>

        <ol className="marketplace-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.key} className="marketplace-step">
                <div className="flex items-center gap-4">
                  <span className="marketplace-step-icon">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-stone-950">
                  {t(`landing.marketplace.how.steps.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {t(`landing.marketplace.how.steps.${step.key}.description`)}
                </p>
              </li>
            );
          })}
        </ol>

        <div
          className="marketplace-convenience-strip"
          aria-label={t("landing.marketplace.convenience.label")}
        >
          <p className="text-sm font-black text-stone-950">
            {t("landing.marketplace.convenience.title")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {conveniences.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon
                    className="h-4 w-4 text-orange-600"
                    aria-hidden="true"
                  />
                  {t(`landing.marketplace.convenience.items.${item.key}`)}
                  {item.href ? (
                    <ArrowRight
                      className="h-3.5 w-3.5 text-stone-400 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              );
              return item.href?.startsWith("/") ? (
                <Link
                  key={item.key}
                  to={item.href}
                  className="marketplace-convenience-link"
                >
                  {content}
                </Link>
              ) : item.href ? (
                <a
                  key={item.key}
                  href={item.href}
                  className="marketplace-convenience-link"
                >
                  {content}
                </a>
              ) : (
                <span key={item.key} className="marketplace-convenience-link">
                  {content}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function RestaurantOwnerSection() {
  const { t } = useTranslation();

  return (
    <section
      id="for-restaurants"
      className="marketplace-owner-section"
      aria-labelledby="owner-title"
    >
      <div className="marketplace-owner-glow" aria-hidden="true" />
      <div className="marketplace-container relative">
        <div className="marketplace-owner-grid">
          <div>
            <span className="marketplace-owner-eyebrow">
              <Store className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.owner.eyebrow")}
            </span>
            <h2 id="owner-title" className="marketplace-owner-title">
              {t("landing.marketplace.owner.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
              {t("landing.marketplace.owner.description")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:contact@pakhlai.com?subject=Start%20with%20Pakhlai"
                className="marketplace-owner-primary"
              >
                {t("landing.marketplace.owner.start")}
                <ArrowRight
                  className="h-4 w-4 rtl:rotate-180"
                  aria-hidden="true"
                />
              </a>
              <Link to="/about" className="marketplace-owner-secondary">
                {t("landing.marketplace.owner.learnMore")}
              </Link>
            </div>
          </div>

          <div id="owner-features" className="marketplace-owner-capabilities">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              {t("landing.marketplace.owner.manage")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {ownerCapabilities.map((item) => (
                <span key={item} className="marketplace-owner-capability">
                  <Check
                    className="h-4 w-4 shrink-0 text-orange-300"
                    aria-hidden="true"
                  />
                  {t(`landing.marketplace.owner.items.${item}`)}
                </span>
              ))}
            </div>
            <Link
              to="/staff-login"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-stone-300 transition hover:text-white"
            >
              {t("landing.marketplace.owner.existingRestaurant")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterLink({ children, href }) {
  const className = "marketplace-footer-link";
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function MarketplaceFooter() {
  const { t } = useTranslation();

  return (
    <footer className="marketplace-footer">
      <div className="marketplace-container">
        <div className="marketplace-footer-grid">
          <div className="max-w-sm">
            <a
              href="#top"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
            >
              <img
                src="/rmsFavicon.png"
                alt=""
                className="h-10 w-10 object-contain"
                width="40"
                height="40"
                loading="lazy"
              />
              <span>
                <strong className="block text-lg font-black tracking-[-0.03em] text-white">
                  {t("landing.marketplace.brand.name")}
                </strong>
                <small className="block text-xs font-semibold text-stone-500">
                  {t("landing.marketplace.brand.byCompany")}
                </small>
              </span>
            </a>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {t("landing.marketplace.footer.description")}
            </p>
            <a
              href="mailto:contact@pakhlai.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-300 transition hover:text-orange-200"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("legacy.contact_pakhlai_com_18a17676")}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.key}>
                <h2 className="text-sm font-black text-white">
                  {t(`landing.marketplace.footer.groups.${group.key}.title`)}
                </h2>
                <ul className="mt-4 grid gap-3">
                  {group.links.map((link) => (
                    <li key={link.key}>
                      <FooterLink href={link.href}>
                        {t(`landing.marketplace.footer.links.${link.key}`)}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="marketplace-footer-bottom">
          <p>
            {t("landing.marketplace.footer.copyright", {
              year: new Date().getFullYear(),
            })}
          </p>
          <a
            href="#top"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-stone-400 transition hover:text-white"
          >
            {t("landing.marketplace.footer.backToTop")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

const publicClient = axios.create({
  baseURL: API_BASE_URL,
});

const EMPTY_DISCOVERY = {
  restaurants: [],
  cuisines: [],
  dishes: [],
};

function normalizePayload(payload) {
  return {
    restaurants: Array.isArray(payload?.restaurants) ? payload.restaurants : [],
    cuisines: Array.isArray(payload?.cuisines) ? payload.cuisines : [],
    dishes: Array.isArray(payload?.dishes) ? payload.dishes : [],
  };
}

function discoveryParams(latitude, longitude, extra = {}) {
  const params = { ...extra };
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    params.lat = latitude;
    params.lng = longitude;
  }
  return params;
}

function useRestaurantDiscovery(coordinates = null, query = "") {
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  const [data, setData] = useState(EMPTY_DISCOVERY);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRestaurants() {
      setStatus("loading");
      setError(null);

      try {
        const response = await publicClient.get("/restaurant/discovery/", {
          params: discoveryParams(latitude, longitude, { limit: 36 }),
          signal: controller.signal,
        });

        setData(normalizePayload(response.data));
        setStatus("success");
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED") return;
        setError(requestError);
        setStatus("error");
      }
    }

    loadRestaurants();
    return () => controller.abort();
  }, [latitude, longitude, reloadKey]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setSearchResults(null);
      setSearchStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    setSearchStatus("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await publicClient.get("/restaurant/discovery/", {
          params: discoveryParams(latitude, longitude, {
            limit: 18,
            q: normalizedQuery,
          }),
          signal: controller.signal,
        });
        setSearchResults(normalizePayload(response.data));
        setSearchStatus("success");
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED") return;
        setSearchResults(null);
        setSearchStatus("error");
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [latitude, longitude, query, reloadKey]);

  return { ...data, status, error, reload, searchResults, searchStatus };
}

const FAVORITES_KEY = "pakhlai_favorite_restaurants";
const LOCATION_KEY = "pakhlai_delivery_location";

function readStoredValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function readFavorites() {
  const stored = readStoredValue(FAVORITES_KEY, []);
  return Array.isArray(stored)
    ? stored.filter((item) => typeof item === "string" && item.trim())
    : [];
}

function readLocation() {
  const stored = readStoredValue(LOCATION_KEY, null);
  if (!stored || typeof stored !== "object" || typeof stored.label !== "string")
    return null;
  if (!["manual", "coordinates"].includes(stored.mode)) return null;
  return stored;
}

function LandingPage() {
  const { i18n } = useTranslation();
  const direction = i18n.dir(i18n.language);
  const [favorites, setFavorites] = useState(readFavorites);
  const [location, setLocation] = useState(readLocation);
  const [searchValue, setSearchValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [filterQuery, setFilterQuery] = useState(searchValue);
  const [filterAliases, setFilterAliases] = useState([]);
  const discovery = useRestaurantDiscovery(location?.coordinates, searchValue);
  const normalizedFilterQuery = filterQuery.trim();
  const usesServerSearch =
    normalizedFilterQuery.length >= 2 &&
    searchValue.trim() === normalizedFilterQuery;
  const displayedRestaurants = usesServerSearch
    ? discovery.searchResults?.restaurants || []
    : discovery.restaurants;
  const displayedStatus = usesServerSearch
    ? discovery.searchStatus === "idle"
      ? "loading"
      : discovery.searchStatus
    : discovery.status;

  useEffect(() => {
    document.documentElement.lang = i18n.language?.split("-")[0] || "en";
    document.documentElement.dir = direction;
  }, [direction, i18n.language]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // The page remains usable when storage is disabled or full.
    }
  }, [favorites]);

  const changeLocation = (nextLocation) => {
    setLocation(nextLocation);
    try {
      if (nextLocation) {
        localStorage.setItem(LOCATION_KEY, JSON.stringify(nextLocation));
      } else {
        localStorage.removeItem(LOCATION_KEY);
      }
    } catch {
      // Keep the in-memory selection even when storage is unavailable.
    }
  };

  const scrollToRestaurants = () => {
    requestAnimationFrame(() => {
      document
        .getElementById("restaurants")
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const explore = (query = "", aliases = []) => {
    setFilterQuery(query);
    setFilterAliases(aliases);
    scrollToRestaurants();
  };

  const changeSearchValue = (value) => {
    setSearchValue(value);
    if (filterQuery && value.trim() !== filterQuery.trim()) {
      setFilterQuery("");
      setFilterAliases([]);
    }
  };

  const selectCuisine = (query, aliases) => {
    setSearchValue(query);
    explore(query, aliases);
  };

  const clearFilter = () => {
    setSearchValue("");
    setFilterQuery("");
    setFilterAliases([]);
  };

  const toggleFavorite = (slug) => {
    setFavorites((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  return (
    <div
      className="landing-page min-h-screen w-full bg-white text-stone-950"
      dir={direction}
    >
      <MarketplaceNavbar />
      <main>
        <HeroSection
          cuisines={discovery.cuisines}
          dishes={discovery.dishes}
          location={location}
          onExplore={explore}
          onLocationChange={changeLocation}
          onSearchValueChange={changeSearchValue}
          restaurants={discovery.restaurants}
          searchResults={discovery.searchResults}
          searchValue={searchValue}
          searchStatus={discovery.searchStatus}
          status={discovery.status}
        />
        <RestaurantDiscoverySection
          favorites={favorites}
          filterAliases={filterAliases}
          filterQuery={filterQuery}
          location={location}
          onClearFilter={clearFilter}
          onRetry={discovery.reload}
          onToggleFavorite={toggleFavorite}
          restaurants={displayedRestaurants}
          serverFiltered={usesServerSearch}
          status={displayedStatus}
        />
        <CuisineSection onSelect={selectCuisine} />
        <PopularRestaurantsSection
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          restaurants={discovery.restaurants}
          status={discovery.status}
        />
        <HowItWorksSection />
        <RestaurantOwnerSection />
      </main>
      <MarketplaceFooter />
    </div>
  );
}

export default LandingPage;
