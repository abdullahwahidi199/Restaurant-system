import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, BadgeCheck, Bell, Building2, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, Crosshair, Download, Heart, Home,
  Languages, LifeBuoy, LoaderCircle, LocateFixed, MapPin, Menu,
  PackageCheck, ReceiptText, Search, Settings, ShieldCheck, ShoppingBag,
  ShoppingCart, SlidersHorizontal, Sparkles, Star, Store, Truck, WifiOff,
  UserRound, UsersRound, Utensils, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMediaUrl, getMenuItemPath, getPlatterPath } from "../../api/publicOrdering";
import { useCustomerSession } from "../../api/customerSession";
import CustomerAccountMenu from "../../component/Customer/CustomerAccountMenu";
import { useAndroidRelease } from "../../component/landing/useAndroidRelease";
import useRestaurantDiscovery from "../../hooks/useRestaurantDiscovery";
import "../../styles/marketplace-dashboard.css";

const FAVORITE_RESTAURANTS_KEY = "pakhlai_favorite_restaurants";
const FAVORITE_DISHES_KEY = "pakhlai_favorite_dishes";
const LOCATION_KEY = "pakhlai_delivery_location";
const RECENT_SEARCHES_KEY = "pakhlai_recent_searches";
const MARKETPLACE_FILTERS_KEY = "pakhlai_marketplace_filters";

function useLandingTranslation() {
  return useTranslation("translation", { keyPrefix: "landing" });
}

function languageCode(language) {
  return String(language || "en").split("-")[0];
}

function localizedField(record, language, field = "name") {
  if (!record) return "";
  const code = languageCode(language);
  const localizedKey = code === "fa" ? `${field}_dari` : code === "ps" ? `${field}_pashto` : field;
  return record[localizedKey] || record[field] || "";
}

function formatNumber(value, language, options = {}) {
  const locale = languageCode(language) === "fa" ? "fa-AF" : languageCode(language) === "ps" ? "ps-AF" : "en-AF";
  return new Intl.NumberFormat(locale, options).format(Number(value || 0));
}

function restaurantAvailability(restaurant, hasCoordinates, t) {
  if (hasCoordinates && restaurant.delivers_to_location === false) {
    return t("marketplace.card.outsideArea");
  }
  if (restaurant.delivery_available) return t("marketplace.card.deliveryAvailable");
  return t("marketplace.card.pickupOnly");
}

function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function readList(key) {
  const value = readStored(key, []);
  return Array.isArray(value) ? value : [];
}

function readLocation() {
  const value = readStored(LOCATION_KEY, null);
  return value && typeof value.label === "string" ? value : null;
}

function readMarketplaceCarts() {
  if (typeof window === "undefined") return [];
  const groups = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("online_cart_")) continue;
    try {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(items) || !items.length) continue;
      const usableItems = items.filter(
        (item) => item && Number(item.quantity) > 0 && item.restaurant_slug,
      );
      if (!usableItems.length) continue;
      const firstItem = usableItems[0];
      groups.push({
        key,
        items: usableItems,
        restaurantSlug: firstItem.restaurant_slug,
        branchSlug: firstItem.branch_slug || "",
        itemCount: usableItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        total: usableItems.reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0,
        ),
      });
    } catch {
      // Ignore stale cart entries without breaking the marketplace.
    }
  }
  return groups;
}

function cartPath(group) {
  const base = group.branchSlug
    ? `/${group.restaurantSlug}/${group.branchSlug}`
    : `/${group.restaurantSlug}`;
  return `${base}?cart=open`;
}

function resolveDishPath(dish, restaurants) {
  const restaurant = restaurants.find(
    (item) => String(item.id) === String(dish.restaurant_id) || item.slug === dish.restaurant_slug,
  );
  const branch = restaurant?.branches?.find(
    (item) => String(item.id) === String(dish.branch_id),
  );
  const context = { restaurantSlug: dish.restaurant_slug, branchSlug: branch?.slug || "" };
  return dish.type === "platter"
    ? getPlatterPath(context, dish.id)
    : getMenuItemPath(context, dish.id);
}

function getGreeting(name, t) {
  const hour = new Date().getHours();
  const key = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return name
    ? t(`marketplace.dashboard.greeting.${key}Name`, { name: name.split(" ")[0] })
    : t(`marketplace.dashboard.greeting.${key}`);
}

function EmptyArtwork({ icon: Icon = Utensils }) {
  return <span className="mp-empty-art" aria-hidden="true"><Icon /><i /><i /></span>;
}

function RestaurantImage({ restaurant }) {
  const source = getMediaUrl(restaurant.cover_image || restaurant.logo);
  if (!source) return <EmptyArtwork icon={Store} />;
  return <><img src={source} alt="" loading="lazy" onError={(event) => {
    event.currentTarget.hidden = true;
    event.currentTarget.nextElementSibling?.removeAttribute("hidden");
  }} /><span hidden><EmptyArtwork icon={Store} /></span></>;
}

function DishImage({ dish }) {
  const source = getMediaUrl(dish.image);
  if (!source) return <EmptyArtwork />;
  return <><img src={source} alt="" loading="lazy" onError={(event) => {
    event.currentTarget.hidden = true;
    event.currentTarget.nextElementSibling?.removeAttribute("hidden");
  }} /><span hidden><EmptyArtwork /></span></>;
}

function MarketplaceCart({ carts, restaurants }) {
  const { t, i18n } = useLandingTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const itemCount = carts.reduce((sum, group) => sum + group.itemCount, 0);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="mp-cart" ref={containerRef}>
      <button
        type="button"
        className="mp-icon-button mp-cart__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("marketplace.dashboard.cart.ariaLabel", { count: itemCount })}
        aria-expanded={open}
      >
        <ShoppingBag aria-hidden="true" />
        {itemCount ? <span>{itemCount > 99 ? "99+" : itemCount}</span> : null}
      </button>

      {open ? (
          <div className="mp-cart__popover" role="dialog" aria-label={t("marketplace.dashboard.cart.title")}>
          <div className="mp-cart__head">
            <div>
              <small>{t("marketplace.dashboard.cart.title")}</small>
              <h2>{itemCount ? t("marketplace.dashboard.cart.itemCount", { count: itemCount }) : t("marketplace.dashboard.cart.ready")}</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("marketplace.dashboard.cart.close")}>
              <X aria-hidden="true" />
            </button>
          </div>

          {carts.length ? (
            <div className="mp-cart__groups">
              {carts.map((group) => {
                const restaurant = restaurants.find(
                  (item) => item.slug === group.restaurantSlug,
                );
                return (
                  <div className="mp-cart__group" key={group.key}>
                    <div className="mp-cart__restaurant">
                      <span>
                        {restaurant?.logo ? (
                          <img src={getMediaUrl(restaurant.logo)} alt="" />
                        ) : (
                          <Store aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <strong>{restaurant?.name || group.restaurantSlug}</strong>
                        <small>{t("marketplace.dashboard.cart.groupSummary", {
                          count: group.itemCount,
                          amount: formatNumber(group.total, i18n.language, { maximumFractionDigits: 0 }),
                        })}</small>
                      </div>
                    </div>
                    <ul>
                      {group.items.slice(0, 3).map((item) => (
                        <li key={`${item.type}-${item.id}`}>
                          <span>{item.quantity}×</span>
                          <p>{item.name}</p>
                           <strong>{t("marketplace.dashboard.common.price", {
                             amount: formatNumber(Number(item.price) * Number(item.quantity), i18n.language, { maximumFractionDigits: 0 }),
                           })}</strong>
                        </li>
                      ))}
                    </ul>
                    {group.items.length > 3 ? (
                      <p className="mp-cart__more">{t("marketplace.dashboard.cart.more", { count: group.items.length - 3 })}</p>
                    ) : null}
                    <Link to={cartPath(group)} onClick={() => setOpen(false)}>
                      {t("marketplace.dashboard.cart.review")}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mp-cart__empty">
              <span><ShoppingCart aria-hidden="true" /></span>
              <h3>{t("marketplace.dashboard.cart.emptyTitle")}</h3>
              <p>{t("marketplace.dashboard.cart.emptyDescription")}</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("marketplace.dashboard.cart.browse")}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SidebarLink({ active = false, badge, icon: Icon, label, onClick, to }) {
  const content = (
    <>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      {badge ? <small>{badge}</small> : null}
    </>
  );
  const className = `mp-side-link${active ? " is-active" : ""}`;
  if (to) return <Link to={to} className={className}>{content}</Link>;
  return <button type="button" className={className} onClick={onClick}>{content}</button>;
}

function MarketplaceSidebar({ customer, favoriteCount, onOpenPanel, onSearch }) {
  const { t } = useLandingTranslation();
  return (
    <aside className="mp-sidebar">
      <Link to="/" className="mp-brand" aria-label={t("marketplace.dashboard.nav.homeLabel")}>
        <span><img src="/rms-mark-96.png" alt="" width="90" height="96" /></span>
        <div>
          <strong>Pakhlai</strong>
          <small>{t("marketplace.brand.tagline")}</small>
        </div>
      </Link>

      <nav className="mp-side-nav" aria-label={t("marketplace.dashboard.nav.ariaLabel")}>
        <p>{t("marketplace.dashboard.nav.discover")}</p>
        <SidebarLink active icon={Home} label={t("marketplace.dashboard.nav.home")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <SidebarLink icon={Store} label={t("marketplace.nav.restaurants")} onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })} />
        <SidebarLink icon={Search} label={t("marketplace.footer.links.browseFood")} onClick={onSearch} />
        <SidebarLink icon={Heart} label={t("marketplace.dashboard.nav.saved")} badge={favoriteCount || undefined} onClick={() => onOpenPanel("saved")} />

        <p>{t("marketplace.dashboard.nav.yourSpace")}</p>
        <SidebarLink icon={UserRound} label={t("actions.profile")} to={customer ? "/profile" : "/login"} />
        <SidebarLink icon={ReceiptText} label={t("marketplace.footer.links.orders")} to={customer ? "/orders" : "/login"} />
        <SidebarLink icon={MapPin} label={t("marketplace.dashboard.nav.addresses")} onClick={() => onOpenPanel("addresses")} />
        <SidebarLink icon={Settings} label={t("marketplace.dashboard.nav.settings")} onClick={() => onOpenPanel("settings")} />
        <SidebarLink icon={LifeBuoy} label={t("marketplace.dashboard.nav.support")} onClick={() => onOpenPanel("support")} />
      </nav>

      <div className="mp-sidebar__trust">
        <span><ShieldCheck aria-hidden="true" /></span>
        <div>
          <strong>{t("marketplace.dashboard.trust.title")}</strong>
          <small>{t("marketplace.dashboard.trust.description")}</small>
        </div>
      </div>

      <a className="mp-sidebar__owner" href="#for-restaurants">
        <Building2 aria-hidden="true" />
        <span><small>{t("marketplace.owner.eyebrow")}</small><strong>{t("marketplace.dashboard.owner.grow")}</strong></span>
        <ChevronRight aria-hidden="true" />
      </a>
    </aside>
  );
}

function RestaurantCard({ favorite, hasCoordinates, onFavorite, onFeedback, restaurant }) {
  const { t, i18n } = useLandingTranslation();
  const rating = Number(restaurant.rating);
  const cuisines = (restaurant.cuisine_details || [])
    .slice(0, 2)
    .map((item) => localizedField(item, i18n.language))
    .filter(Boolean)
    .join(" · ") || (restaurant.cuisines || []).slice(0, 2).join(" · ");
  const distance = restaurant.distance_km == null ? null : Number(restaurant.distance_km);
  const minimum = Number(restaurant.min_order_amount);
  const deliveryFee = Number(restaurant.base_delivery_fee);
  const reviewCount = Number(restaurant.review_count || 0);
  const openLabel = restaurant.is_open === false
    ? t("marketplace.card.closed")
    : restaurant.is_open === true
      ? t("marketplace.card.open")
      : t("marketplace.card.hoursUnavailable");
  return (
    <article className="mp-restaurant-card">
      <Link to={`/${restaurant.slug}`} className="mp-restaurant-card__media">
        <RestaurantImage restaurant={restaurant} />
        <span className={`mp-open-badge${restaurant.is_open === false ? " is-closed" : ""}`}>
          <i />
          {openLabel}
        </span>
      </Link>
      <button
        type="button"
        className={`mp-save-button${favorite ? " is-saved" : ""}`}
        onClick={() => {
          onFavorite(restaurant.slug);
          onFeedback?.(favorite ? t("marketplace.dashboard.feedback.restaurantRemoved") : t("marketplace.dashboard.feedback.restaurantSaved"));
        }}
        aria-label={t(favorite ? "marketplace.card.removeFavorite" : "marketplace.card.addFavorite", { name: restaurant.name })}
        aria-pressed={favorite}
      >
        <Heart fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
      </button>
      <Link to={`/${restaurant.slug}`} className="mp-restaurant-card__body">
        <div>
          <h3>{restaurant.name}</h3>
          <span>
            <Star fill="currentColor" aria-hidden="true" />
            {Number.isFinite(rating) && rating > 0 ? formatNumber(rating, i18n.language, { maximumFractionDigits: 1 }) : t("marketplace.card.new")}
            {reviewCount > 0 ? <small>({formatNumber(reviewCount, i18n.language)})</small> : null}
          </span>
        </div>
        <p>{cuisines || restaurant.slogan || t("marketplace.card.localRestaurant")}</p>
        <footer>
          {hasCoordinates && Number.isFinite(distance) ? (
            <span><MapPin aria-hidden="true" /> {t("marketplace.card.distance", { distance: formatNumber(distance, i18n.language, { maximumFractionDigits: 1 }) })}</span>
          ) : (
            <span><Clock3 aria-hidden="true" /> {restaurant.opening_hours || t("marketplace.card.hoursUnavailable")}</span>
          )}
          {minimum > 0 ? <span><ReceiptText aria-hidden="true" /> {t("marketplace.card.minimumOrder", { amount: formatNumber(minimum, i18n.language, { maximumFractionDigits: 0 }) })}</span> : null}
          <span><Truck aria-hidden="true" /> {restaurantAvailability(restaurant, hasCoordinates, t)}</span>
          {restaurant.delivery_available && deliveryFee > 0 ? <span><ShoppingBag aria-hidden="true" /> {t("marketplace.dashboard.cards.deliveryFrom", { amount: formatNumber(deliveryFee, i18n.language, { maximumFractionDigits: 0 }) })}</span> : null}
        </footer>
        <span className="mp-card-cta">{t("marketplace.card.viewMenu")} <ArrowRight aria-hidden="true" /></span>
      </Link>
    </article>
  );
}

function DishCard({ compact = false, dish, favorite, onFavorite, onFeedback, path, rank }) {
  const { t, i18n } = useLandingTranslation();
  const orderCount = Number(dish.order_count || 0);
  const name = localizedField(dish, i18n.language);
  const description = localizedField(dish, i18n.language, "description");
  return (
    <article className={`mp-dish-card${compact ? " is-compact" : ""}`}>
      <Link to={path} className="mp-dish-card__media" aria-label={t("marketplace.dashboard.cards.viewDish", { name })}>
        <DishImage dish={dish} />
        {rank ? <span className="mp-rank"><b>#{rank}</b> {t("marketplace.dashboard.cards.popular")}</span> : null}
        {dish.type === "platter" ? <span className="mp-platter">{t("marketplace.dashboard.cards.platter")}</span> : null}
      </Link>
      <button
        type="button"
        className={`mp-save-button${favorite ? " is-saved" : ""}`}
        onClick={() => {
          onFavorite(`${dish.type}-${dish.id}`);
          onFeedback?.(favorite ? t("marketplace.dashboard.feedback.dishRemoved") : t("marketplace.dashboard.feedback.dishSaved"));
        }}
        aria-label={t(favorite ? "marketplace.dashboard.cards.removeDish" : "marketplace.dashboard.cards.saveDish", { name })}
        aria-pressed={favorite}
      >
        <Heart fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
      </button>
      <div className="mp-dish-card__body">
        <Link to={path}>
          <small>{dish.restaurant_name}</small>
          <h3>{name}</h3>
        </Link>
        <p>{description || localizedField({ name: dish.category, name_dari: dish.category_dari, name_pashto: dish.category_pashto }, i18n.language) || t("marketplace.dashboard.cards.fallbackDescription")}</p>
        <footer>
          <div>
            <strong>{t("marketplace.dashboard.common.price", { amount: formatNumber(dish.price, i18n.language, { maximumFractionDigits: 0 }) })}</strong>
            {rank && orderCount ? <small>{t("marketplace.dashboard.cards.ordered", { count: formatNumber(orderCount, i18n.language) })}</small> : null}
          </div>
          <Link to={path} aria-label={t("marketplace.dashboard.cards.viewDish", { name })}>
            <ArrowRight aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </article>
  );
}

function CardSkeletons({ dishes = false }) {
  const { t } = useLandingTranslation();
  return (
    <div className={dishes ? "mp-dish-grid" : "mp-restaurant-rail"} aria-label={t("marketplace.discovery.loading")}>
      {[0, 1, 2, 3].map((item) => <span className="mp-skeleton" key={item} />)}
    </div>
  );
}

function ScrollableRail({ children, className, label }) {
  const { t } = useLandingTranslation();
  const railRef = useRef(null);
  const scroll = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const rtlMultiplier = document.documentElement.dir === "rtl" ? -1 : 1;
    rail.scrollBy({ left: direction * rtlMultiplier * rail.clientWidth * 0.78, behavior: "smooth" });
  };
  return (
    <div className="mp-rail-shell" aria-label={label}>
      <button type="button" className="mp-rail-button mp-rail-button--previous" onClick={() => scroll(-1)} aria-label={t("marketplace.dashboard.rail.previous")}>
        <ChevronLeft aria-hidden="true" />
      </button>
      <div className={className} ref={railRef}>{children}</div>
      <button type="button" className="mp-rail-button mp-rail-button--next" onClick={() => scroll(1)} aria-label={t("marketplace.dashboard.rail.next")}>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}

function AppDownloadCard() {
  const { t } = useLandingTranslation();
  const { data: release, isPending, refetch } = useAndroidRelease();
  return (
    <section className="mp-app" id="download-app">
      <div className="mp-app__copy">
        <p className="mp-kicker mp-kicker--light"><Sparkles aria-hidden="true" /> {t("marketplace.dashboard.app.eyebrow")}</p>
        <h2>{t("marketplace.dashboard.app.title")}</h2>
        <p>{t("marketplace.dashboard.app.description")}</p>
        <div className="mp-app__benefits">
          <span><Check aria-hidden="true" /> {t("marketplace.dashboard.app.benefits.saved")}</span>
          <span><Check aria-hidden="true" /> {t("marketplace.dashboard.app.benefits.tracking")}</span>
          <span><Check aria-hidden="true" /> {t("marketplace.dashboard.app.benefits.local")}</span>
        </div>
        {release ? (
          <a className="mp-app__download" href={release.url} download={release.filename}>
            <Download aria-hidden="true" />
            <span><small>{t("marketplace.dashboard.app.downloadFor")}</small>Android</span>
          </a>
        ) : (
          <button className="mp-app__download" type="button" disabled={isPending} onClick={() => refetch()}>
            {isPending ? <LoaderCircle className="mp-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
            <span><small>{isPending ? t("marketplace.dashboard.app.checking") : t("marketplace.dashboard.app.android")}</small>{isPending ? t("marketplace.dashboard.app.oneMoment") : t("marketplace.appDownload.retry")}</span>
          </button>
        )}
      </div>

      <div className="mp-phone-stage" aria-hidden="true">
        <span className="mp-phone-orbit mp-phone-orbit--one" />
        <span className="mp-phone-orbit mp-phone-orbit--two" />
        <div className="mp-phone-note mp-phone-note--top">
          <span><Bell /></span>
          <div><strong>{t("marketplace.dashboard.app.preview.confirmed")}</strong><small>{t("marketplace.dashboard.app.preview.cooking")}</small></div>
        </div>
        <div className="mp-phone">
          <div className="mp-phone__speaker" />
          <div className="mp-phone__screen">
            <div className="mp-phone__top"><span>9:41</span><i /><i /><i /></div>
            <div className="mp-phone__greeting"><small>{t("marketplace.dashboard.greeting.evening")}</small><strong>{t("marketplace.dashboard.app.preview.craving")}</strong></div>
            <div className="mp-phone__search"><Search /><span>{t("marketplace.dashboard.app.preview.search")}</span></div>
            <div className="mp-phone__meal">
              <img src="/images/pakhlai-hero-feast.webp" alt="" />
              <span><small>{t("marketplace.dashboard.app.preview.popular")}</small><strong>{t("marketplace.dashboard.app.preview.feast")}</strong><b>{t("marketplace.dashboard.common.price", { amount: "890" })}</b></span>
            </div>
            <div className="mp-phone__track">
              <PackageCheck />
              <span><small>{t("marketplace.dashboard.app.preview.orderStatus")}</small><strong>{t("marketplace.dashboard.app.preview.onTheWay")}</strong></span>
            </div>
          </div>
        </div>
        <div className="mp-phone-note mp-phone-note--bottom">
          <span><Truck /></span>
          <div><strong>{t("marketplace.dashboard.app.preview.onTheWay")}</strong><small>{t("marketplace.dashboard.app.preview.liveUpdates")}</small></div>
        </div>
      </div>
    </section>
  );
}

function PreferencesPanel({
  dishes,
  favoriteDishes,
  favoriteRestaurants,
  location,
  onClose,
  onFeedback,
  onLocationChange,
  panel,
  restaurants,
}) {
  const { t, i18n } = useLandingTranslation();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [manualLocation, setManualLocation] = useState(location?.label || "");
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const manageKeyboard = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", manageKeyboard);
    return () => {
      document.removeEventListener("keydown", manageKeyboard);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  const submitAddress = (event) => {
    event.preventDefault();
    if (!manualLocation.trim()) return;
    onLocationChange({ label: manualLocation.trim(), mode: "manual", coordinates: null });
    const nextMessage = t("marketplace.dashboard.location.manualSaved");
    setMessage(nextMessage);
    onFeedback?.(nextMessage);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage(t("marketplace.location.unsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          label: t("marketplace.location.current"),
          mode: "coordinates",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        setLocating(false);
        const nextMessage = t("marketplace.dashboard.location.currentSaved");
        setMessage(nextMessage);
        onFeedback?.(nextMessage);
      },
      () => {
        setLocating(false);
        setMessage(t("marketplace.location.permissionError"));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const savedRestaurants = restaurants.filter(
    (restaurant) => favoriteRestaurants.includes(restaurant.slug),
  );
  const savedDishes = dishes.filter(
    (dish) => favoriteDishes.includes(`${dish.type}-${dish.id}`),
  );
  const title = {
    addresses: t("marketplace.dashboard.nav.addresses"),
    saved: t("marketplace.dashboard.panels.savedTitle"),
    settings: t("marketplace.dashboard.nav.settings"),
    support: t("marketplace.dashboard.nav.support"),
  }[panel];

  return (
    <div
      className="mp-panel-layer"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside ref={panelRef} className="mp-panel" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <div className="mp-panel__head">
          <div><small>Pakhlai</small><h2>{title}</h2></div>
          <button type="button" onClick={onClose} aria-label={t("marketplace.dashboard.panels.close")}><X aria-hidden="true" /></button>
        </div>

        {panel === "addresses" ? (
          <div className="mp-panel__body">
            <div className="mp-panel__location">
              <span><MapPin aria-hidden="true" /></span>
              <div><small>{t("marketplace.dashboard.location.default")}</small><strong>{location?.label || t("marketplace.dashboard.location.none")}</strong></div>
              {location ? <BadgeCheck aria-hidden="true" /> : null}
            </div>
            <button type="button" className="mp-panel__current" onClick={useCurrentLocation} disabled={locating}>
              {locating ? <LoaderCircle className="mp-spin" aria-hidden="true" /> : <Crosshair aria-hidden="true" />}
              {t("marketplace.location.useCurrent")}
            </button>
            <form className="mp-panel__form" onSubmit={submitAddress}>
              <label htmlFor="marketplace-address">{t("marketplace.location.manualLabel")}</label>
              <div><MapPin aria-hidden="true" /><input id="marketplace-address" value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder={t("marketplace.dashboard.location.placeholder")} required /></div>
              <button type="submit" disabled={!manualLocation.trim()}>{t("marketplace.dashboard.location.save")}</button>
            </form>
            {message ? <p className="mp-panel__message">{message}</p> : null}
          </div>
        ) : null}

        {panel === "saved" ? (
          <div className="mp-panel__body">
            <h3>{t("marketplace.search.restaurants")}</h3>
            {savedRestaurants.length ? savedRestaurants.map((restaurant) => (
              <Link className="mp-saved-row" to={`/${restaurant.slug}`} key={restaurant.slug} onClick={onClose}>
                <span>{restaurant.logo ? <img src={getMediaUrl(restaurant.logo)} alt="" /> : <Store />}</span>
                <div><strong>{restaurant.name}</strong><small>{(restaurant.cuisine_details || []).slice(0, 2).map((item) => localizedField(item, i18n.language)).join(" · ") || t("marketplace.card.localRestaurant")}</small></div>
                <ChevronRight />
              </Link>
            )) : <p className="mp-panel__empty">{t("marketplace.dashboard.panels.savedRestaurantsEmpty")}</p>}
            <h3>{t("marketplace.search.dishes")}</h3>
            {savedDishes.length ? savedDishes.map((dish) => (
              <Link className="mp-saved-row" to={resolveDishPath(dish, restaurants)} key={`${dish.type}-${dish.id}`} onClick={onClose}>
                <span>{dish.image ? <img src={getMediaUrl(dish.image)} alt="" /> : <Utensils />}</span>
                <div><strong>{localizedField(dish, i18n.language)}</strong><small>{dish.restaurant_name}</small></div>
                <ChevronRight />
              </Link>
            )) : <p className="mp-panel__empty">{t("marketplace.dashboard.panels.savedDishesEmpty")}</p>}
          </div>
        ) : null}

        {panel === "settings" ? (
          <div className="mp-panel__body">
            <div className="mp-setting-row">
              <span><Languages /></span>
              <div><strong>{t("marketplace.nav.language")}</strong><small>{t("marketplace.dashboard.panels.languageDescription")}</small></div>
              <select value={i18n.language?.split("-")[0] || "en"} onChange={(event) => i18n.changeLanguage(event.target.value)}>
                <option value="en">English</option>
                <option value="fa">دری</option>
                <option value="ps">پښتو</option>
              </select>
            </div>
            <Link className="mp-setting-row" to="/profile" onClick={onClose}>
              <span><UserRound /></span>
              <div><strong>{t("marketplace.dashboard.panels.account")}</strong><small>{t("marketplace.dashboard.panels.accountDescription")}</small></div>
              <ChevronRight />
            </Link>
            <Link className="mp-setting-row" to="/orders" onClick={onClose}>
              <span><Bell /></span>
              <div><strong>{t("marketplace.dashboard.panels.orderTracking")}</strong><small>{t("marketplace.dashboard.panels.orderTrackingDescription")}</small></div>
              <ChevronRight />
            </Link>
          </div>
        ) : null}

        {panel === "support" ? (
          <div className="mp-panel__body">
            <div className="mp-support-card">
              <span><CircleHelp /></span>
              <h3>{t("marketplace.dashboard.support.title")}</h3>
              <p>{t("marketplace.dashboard.support.description")}</p>
              <a href="mailto:contact@pakhlai.com">contact@pakhlai.com <ArrowRight /></a>
            </div>
            <Link className="mp-setting-row" to="/orders" onClick={onClose}>
              <span><ReceiptText /></span>
              <div><strong>{t("marketplace.dashboard.support.orderTitle")}</strong><small>{t("marketplace.dashboard.support.orderDescription")}</small></div>
              <ChevronRight />
            </Link>
            <a className="mp-setting-row" href="mailto:contact@pakhlai.com?subject=Restaurant support">
              <span><Building2 /></span>
              <div><strong>{t("marketplace.dashboard.support.restaurantTitle")}</strong><small>{t("marketplace.dashboard.support.restaurantDescription")}</small></div>
              <ChevronRight />
            </a>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function MobileNav({ customer, onOpenPanel, onSearch }) {
  const { t } = useLandingTranslation();
  return (
    <nav className="mp-mobile-nav" aria-label={t("marketplace.dashboard.nav.mobileLabel")}>
      <button type="button" className="is-active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Home /><span>{t("marketplace.dashboard.nav.home")}</span></button>
      <button type="button" onClick={onSearch}><Search /><span>{t("marketplace.nav.explore")}</span></button>
      <Link to={customer ? "/orders" : "/login"}><ReceiptText /><span>{t("marketplace.footer.links.orders")}</span></Link>
      <button type="button" onClick={() => onOpenPanel("saved")}><Heart /><span>{t("marketplace.dashboard.nav.saved")}</span></button>
      <Link to={customer ? "/profile" : "/login"}><UserRound /><span>{t("marketplace.dashboard.nav.account")}</span></Link>
    </nav>
  );
}

export default function SmoothMarketplace() {
  const { t, i18n } = useLandingTranslation();
  const customer = useCustomerSession();
  const direction = i18n.dir(i18n.language);
  const searchRef = useRef(null);
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || "",
  );
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [filters, setFilters] = useState(() => ({
    openOnly: false,
    deliveryOnly: false,
    price: "all",
    sort: "recommended",
    ...readStored(MARKETPLACE_FILTERS_KEY, {}),
  }));
  const [recentSearches, setRecentSearches] = useState(() => readList(RECENT_SEARCHES_KEY));
  const [searchFocused, setSearchFocused] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [favoriteRestaurants, setFavoriteRestaurants] = useState(
    () => readList(FAVORITE_RESTAURANTS_KEY),
  );
  const [favoriteDishes, setFavoriteDishes] = useState(
    () => readList(FAVORITE_DISHES_KEY),
  );
  const [location, setLocation] = useState(readLocation);
  const [panel, setPanel] = useState(null);
  const [carts, setCarts] = useState(readMarketplaceCarts);
  const discovery = useRestaurantDiscovery(location?.coordinates, query);
  const searching = query.trim().length >= 2;
  const visibleData = searching
    ? (discovery.searchResults || { restaurants: [], dishes: [], cuisines: [] })
    : discovery;
  const restaurants = visibleData?.restaurants || [];
  const dishes = visibleData?.dishes || [];
  const cuisines = visibleData?.cuisines || [];
  const searchFailed = searching && discovery.searchStatus === "error";
  const discoveryFailed = !searching && discovery.status === "error";
  const loading =
    discovery.status === "loading" ||
    (searching && discovery.searchStatus === "loading");

  useEffect(() => {
    document.documentElement.lang = i18n.language?.split("-")[0] || "en";
    document.documentElement.dir = direction;
  }, [direction, i18n.language]);

  useEffect(() => {
    localStorage.setItem(
      FAVORITE_RESTAURANTS_KEY,
      JSON.stringify(favoriteRestaurants),
    );
  }, [favoriteRestaurants]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_DISHES_KEY, JSON.stringify(favoriteDishes));
  }, [favoriteDishes]);

  useEffect(() => {
    localStorage.setItem(MARKETPLACE_FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const nextUrl = new URL(window.location.href);
    if (query.trim()) nextUrl.searchParams.set("q", query.trim());
    else nextUrl.searchParams.delete("q");
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [query]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const refresh = () => setCarts(readMarketplaceCarts());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const toggleRestaurantFavorite = (slug) => {
    setFavoriteRestaurants((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  const toggleDishFavorite = (id) => {
    setFavoriteDishes((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const saveLocation = (nextLocation) => {
    setLocation(nextLocation);
    if (nextLocation) {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(nextLocation));
    } else {
      localStorage.removeItem(LOCATION_KEY);
    }
  };

  const popularDishes = useMemo(
    () =>
      [...dishes]
        .sort(
          (a, b) =>
            Number(b.order_count || 0) - Number(a.order_count || 0),
        )
        .slice(0, 6),
    [dishes],
  );

  const restaurantBySlug = useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant])),
    [restaurants],
  );

  const filteredRestaurants = useMemo(() => {
    const next = restaurants.filter((restaurant) => {
      if (filters.openOnly && restaurant.is_open !== true) return false;
      if (filters.deliveryOnly) {
        if (location?.coordinates && restaurant.delivers_to_location !== true) return false;
        if (!location?.coordinates && !restaurant.delivery_available) return false;
      }
      return true;
    });
    return [...next].sort((a, b) => {
      if (filters.sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      if (filters.sort === "distance") {
        return Number(a.distance_km ?? Number.POSITIVE_INFINITY) - Number(b.distance_km ?? Number.POSITIVE_INFINITY);
      }
      return 0;
    });
  }, [filters.deliveryOnly, filters.openOnly, filters.sort, location?.coordinates, restaurants]);

  const filteredDishes = useMemo(() => {
    const selectedCuisine = cuisines.find((cuisine) => String(cuisine.id) === String(activeCuisine));
    const next = dishes.filter((dish) => {
      const restaurant = restaurantBySlug.get(dish.restaurant_slug);
      if (selectedCuisine && ![dish.category, dish.category_dari, dish.category_pashto]
        .some((category) => [selectedCuisine.name, selectedCuisine.name_dari, selectedCuisine.name_pashto].includes(category))) return false;
      if (filters.openOnly && restaurant?.is_open !== true) return false;
      if (filters.deliveryOnly) {
        if (location?.coordinates && restaurant?.delivers_to_location !== true) return false;
        if (!location?.coordinates && !restaurant?.delivery_available) return false;
      }
      const price = Number(dish.price || 0);
      if (filters.price === "under250" && price >= 250) return false;
      if (filters.price === "250to500" && (price < 250 || price > 500)) return false;
      if (filters.price === "over500" && price <= 500) return false;
      return true;
    });
    return [...next].sort((a, b) => {
      if (filters.sort === "priceLow") return Number(a.price || 0) - Number(b.price || 0);
      if (filters.sort === "priceHigh") return Number(b.price || 0) - Number(a.price || 0);
      if (filters.sort === "popular") return Number(b.order_count || 0) - Number(a.order_count || 0);
      if (filters.sort === "rating") return Number(restaurantBySlug.get(b.restaurant_slug)?.rating || 0) - Number(restaurantBySlug.get(a.restaurant_slug)?.rating || 0);
      if (filters.sort === "distance") return Number(restaurantBySlug.get(a.restaurant_slug)?.distance_km ?? Number.POSITIVE_INFINITY) - Number(restaurantBySlug.get(b.restaurant_slug)?.distance_km ?? Number.POSITIVE_INFINITY);
      return 0;
    });
  }, [activeCuisine, cuisines, dishes, filters.deliveryOnly, filters.openOnly, filters.price, filters.sort, location?.coordinates, restaurantBySlug]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    const source = discovery.searchResults || discovery;
    const restaurantSuggestions = (source.restaurants || []).slice(0, 3).map((item) => ({
      key: `restaurant-${item.id}`,
      label: item.name,
      meta: t("marketplace.search.restaurants"),
      path: `/${item.slug}`,
    }));
    const dishSuggestions = (source.dishes || []).slice(0, 3).map((item) => ({
      key: `${item.type}-${item.id}`,
      label: localizedField(item, i18n.language),
      meta: item.restaurant_name,
      path: resolveDishPath(item, source.restaurants || discovery.restaurants),
    }));
    return [...restaurantSuggestions, ...dishSuggestions].slice(0, 6);
  }, [discovery, i18n.language, query, t]);

  const hasActiveFilters = filters.openOnly || filters.deliveryOnly || filters.price !== "all" || filters.sort !== "recommended" || activeCuisine !== "all";

  const rememberSearch = () => {
    const normalized = query.trim();
    if (normalized.length < 2) return;
    const next = [normalized, ...recentSearches.filter((item) => item.toLocaleLowerCase() !== normalized.toLocaleLowerCase())].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  };

  const resetFilters = () => {
    setFilters({ openOnly: false, deliveryOnly: false, price: "all", sort: "recommended" });
    setActiveCuisine("all");
  };

  const favoriteCount = favoriteRestaurants.length + favoriteDishes.length;
  const focusSearch = () => {
    searchRef.current?.focus();
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="mp-marketplace" dir={direction}>
      <MarketplaceSidebar
        customer={customer}
        favoriteCount={favoriteCount}
        onOpenPanel={setPanel}
        onSearch={focusSearch}
      />

      <div className="mp-page">
        <header className="mp-topbar">
          <Link to="/" className="mp-brand mp-brand--mobile" aria-label={t("marketplace.dashboard.nav.homeLabel")}>
            <span><img src="/rms-mark-96.png" alt="" width="90" height="96" /></span>
            <div><strong>Pakhlai</strong></div>
          </Link>

          <form
            className="mp-top-search"
            onSubmit={(event) => {
              event.preventDefault();
              rememberSearch();
              setSearchFocused(false);
              document.getElementById("all-menu")?.scrollIntoView({ behavior: "smooth" });
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
          >
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="marketplace-search">
              {t("marketplace.search.label")}
            </label>
            <input
              id="marketplace-search"
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("marketplace.search.placeholder")}
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={t("marketplace.search.clear")}>
                <X />
              </button>
            ) : null}
            {searchFocused && (query.trim() || recentSearches.length) ? (
              <div className="mp-search-suggestions" role="listbox" aria-label={t("marketplace.dashboard.search.suggestions")}>
                {!query.trim() && recentSearches.length ? (
                  <>
                    <p>{t("marketplace.search.recent")}</p>
                    {recentSearches.map((item) => (
                      <button key={item} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery(item)}>
                        <Clock3 aria-hidden="true" /><span>{item}</span><ArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </>
                ) : suggestions.length ? suggestions.map((item) => (
                  <Link key={item.key} to={item.path} role="option">
                    <Search aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.meta}</small></span><ArrowRight aria-hidden="true" />
                  </Link>
                )) : query.trim().length >= 2 && !loading ? (
                  <span className="mp-search-suggestions__empty">{t("marketplace.search.noResultsDescription")}</span>
                ) : null}
              </div>
            ) : null}
          </form>

          <div className="mp-topbar__actions">
            <button type="button" className="mp-location-button" onClick={() => setPanel("addresses")}>
              <span><MapPin aria-hidden="true" /></span>
              <span><small>{t("marketplace.location.label")}</small><strong>{location?.label || t("marketplace.location.placeholder")}</strong></span>
              <ChevronDown aria-hidden="true" />
            </button>
            <MarketplaceCart carts={carts} restaurants={discovery.restaurants} />
            {customer ? (
              <CustomerAccountMenu compact className="mp-account-menu" />
            ) : (
              <Link className="mp-login-button" to="/login">
                <UserRound aria-hidden="true" /><span>{t("marketplace.nav.login")}</span>
              </Link>
            )}
          </div>
        </header>

        <main className="mp-main">
          <section className="mp-welcome">
            <div className="mp-welcome__copy">
              <p>{getGreeting(customer?.username, t)} <span aria-hidden="true">👋</span></p>
              <h1>{t("marketplace.dashboard.hero.titleStart")} <em>{t("marketplace.dashboard.hero.titleAccent")}</em></h1>
              <span>{t("marketplace.dashboard.hero.description")}</span>
              <div className="mp-welcome__actions">
                <button type="button" onClick={() => document.getElementById("all-menu")?.scrollIntoView({ behavior: "smooth" })}>
                  {t("marketplace.dashboard.hero.findMeal")} <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setPanel("addresses")}>
                  <LocateFixed aria-hidden="true" /> {location ? location.label : t("marketplace.dashboard.hero.setLocation")}
                </button>
              </div>
            </div>
            <div className="mp-welcome__visual" aria-hidden="true">
              <span className="mp-welcome__stamp"><Sparkles /> {t("marketplace.dashboard.hero.picks")}</span>
              <img src="/images/pakhlai-hero-feast.webp" alt="" fetchPriority="high" width="1536" height="1024" />
              <div className="mp-welcome__delivery">
                <span><Truck /></span>
                <div><small>{t("marketplace.dashboard.hero.delivery")}</small><strong>{t("marketplace.dashboard.hero.kitchens")}</strong></div>
              </div>
            </div>
          </section>

          <section className="mp-section" id="restaurants">
            <div className="mp-section__head">
              <div>
                <p className="mp-kicker"><Store aria-hidden="true" /> {location?.coordinates ? t("marketplace.discovery.eyebrow") : t("marketplace.dashboard.discovery.kabul")}</p>
                <h2>{location?.coordinates ? t("marketplace.discovery.title") : t("marketplace.dashboard.discovery.title")}</h2>
              </div>
              <a href="#all-menu">{t("marketplace.dashboard.discovery.allMenus")} <ArrowRight aria-hidden="true" /></a>
            </div>
            {loading ? (
              <CardSkeletons />
            ) : discoveryFailed || searchFailed ? (
              <div className="mp-state" role="alert">
                <EmptyArtwork icon={WifiOff} />
                <h3>{t("marketplace.discovery.errorTitle")}</h3>
                <p>{t("marketplace.discovery.errorDescription")}</p>
                <button type="button" onClick={discovery.reload}>{t("marketplace.discovery.retry")}</button>
              </div>
            ) : filteredRestaurants.length ? (
              <ScrollableRail className="mp-restaurant-rail" label={t("marketplace.dashboard.discovery.title")}>
                {filteredRestaurants.slice(0, 10).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.slug}
                    restaurant={restaurant}
                    favorite={favoriteRestaurants.includes(restaurant.slug)}
                    hasCoordinates={Boolean(location?.coordinates)}
                    onFavorite={toggleRestaurantFavorite}
                    onFeedback={setFeedback}
                  />
                ))}
              </ScrollableRail>
            ) : (
              <div className="mp-state">
                <EmptyArtwork icon={Store} />
                <h3>{searching || hasActiveFilters ? t("marketplace.discovery.noResultsTitle") : t("marketplace.discovery.emptyTitle")}</h3>
                <p>{searching || hasActiveFilters ? t("marketplace.discovery.noResultsDescription") : t("marketplace.discovery.emptyDescription")}</p>
                <button type="button" onClick={() => { setQuery(""); resetFilters(); }}>{t("marketplace.discovery.clearSearch")}</button>
              </div>
            )}
          </section>

          <section className="mp-section mp-section--popular" id="popular">
            <div className="mp-section__head">
              <div>
                <p className="mp-kicker"><Sparkles aria-hidden="true" /> {t("marketplace.popular.eyebrow")}</p>
                <h2>{t("marketplace.dashboard.popular.title")}</h2>
              </div>
              <span className="mp-section__note">
                <UsersRound aria-hidden="true" /> {t("marketplace.dashboard.popular.note")}
              </span>
            </div>
            {loading ? (
              <CardSkeletons dishes />
            ) : popularDishes.length ? (
              <ScrollableRail className="mp-popular-rail" label={t("marketplace.dashboard.popular.title")}>
                {popularDishes.map((dish, index) => (
                  <DishCard
                    compact
                    dish={dish}
                    favorite={favoriteDishes.includes(`${dish.type}-${dish.id}`)}
                    key={`${dish.type}-${dish.id}`}
                    onFavorite={toggleDishFavorite}
                    onFeedback={setFeedback}
                    path={resolveDishPath(dish, restaurants)}
                    rank={index + 1}
                  />
                ))}
              </ScrollableRail>
            ) : (
              <div className="mp-state mp-state--small">
                <EmptyArtwork />
                <h3>{t("marketplace.dashboard.popular.emptyTitle")}</h3>
                <p>{t("marketplace.dashboard.popular.emptyDescription")}</p>
              </div>
            )}
          </section>

          <section className="mp-section" id="all-menu">
            <div className="mp-section__head mp-section__head--menu">
              <div>
                <p className="mp-kicker"><Utensils aria-hidden="true" /> {t("marketplace.dashboard.menu.eyebrow")}</p>
                <h2>{query ? t("marketplace.dashboard.menu.results", { query }) : t("marketplace.dashboard.menu.title")}</h2>
              </div>
              <button type="button" className="mp-filter-button" onClick={focusSearch}>
                <SlidersHorizontal aria-hidden="true" /> {t("marketplace.dashboard.menu.searchFilter")}
              </button>
            </div>

            <div className="mp-cuisine-tabs" role="tablist" aria-label={t("marketplace.dashboard.filters.cuisineLabel")}>
              {[{ name: t("marketplace.dashboard.filters.allCuisines"), id: "all" }, ...cuisines].map((cuisine) => {
                const cuisineId = String(cuisine.id || "all");
                const cuisineLabel = cuisineId === "all" ? cuisine.name : localizedField(cuisine, i18n.language);
                return (
                <button
                  type="button"
                  role="tab"
                  key={cuisine.id || cuisine.name}
                  aria-controls="marketplace-menu-results"
                  aria-selected={activeCuisine === cuisineId}
                  tabIndex={activeCuisine === cuisineId ? 0 : -1}
                  className={activeCuisine === cuisineId ? "is-active" : ""}
                  onClick={() => setActiveCuisine(cuisineId)}
                  onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    const tabs = [...event.currentTarget.parentElement.querySelectorAll('[role="tab"]')];
                    const currentIndex = tabs.indexOf(event.currentTarget);
                    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                    tabs[nextIndex]?.focus();
                    tabs[nextIndex]?.click();
                  }}
                >
                  {cuisine.image ? (
                    <img src={getMediaUrl(cuisine.image)} alt="" />
                  ) : cuisineId === "all" ? (
                    <Menu aria-hidden="true" />
                  ) : (
                    <Utensils aria-hidden="true" />
                  )}
                  {cuisineLabel}
                  {cuisine.restaurant_count ? <small>{cuisine.restaurant_count}</small> : null}
                </button>
              );})}
            </div>

            <div className="mp-filter-bar" aria-label={t("marketplace.dashboard.filters.label")}>
              <button
                type="button"
                aria-pressed={filters.openOnly}
                className={filters.openOnly ? "is-active" : ""}
                onClick={() => setFilters((current) => ({ ...current, openOnly: !current.openOnly }))}
              >
                <Clock3 aria-hidden="true" /> {t("marketplace.dashboard.filters.openNow")}
              </button>
              <button
                type="button"
                aria-pressed={filters.deliveryOnly}
                className={filters.deliveryOnly ? "is-active" : ""}
                onClick={() => setFilters((current) => ({ ...current, deliveryOnly: !current.deliveryOnly }))}
              >
                <Truck aria-hidden="true" /> {location?.coordinates ? t("marketplace.dashboard.filters.deliversHere") : t("marketplace.dashboard.filters.delivery")}
              </button>
              <label>
                <span>{t("marketplace.dashboard.filters.price")}</span>
                <select value={filters.price} onChange={(event) => setFilters((current) => ({ ...current, price: event.target.value }))}>
                  <option value="all">{t("marketplace.dashboard.filters.anyPrice")}</option>
                  <option value="under250">{t("marketplace.dashboard.filters.under250")}</option>
                  <option value="250to500">{t("marketplace.dashboard.filters.from250to500")}</option>
                  <option value="over500">{t("marketplace.dashboard.filters.over500")}</option>
                </select>
              </label>
              <label>
                <span>{t("marketplace.dashboard.filters.sort")}</span>
                <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
                  <option value="recommended">{t("marketplace.dashboard.filters.recommended")}</option>
                  <option value="popular">{t("marketplace.dashboard.filters.mostOrdered")}</option>
                  <option value="rating">{t("marketplace.dashboard.filters.topRated")}</option>
                  {location?.coordinates ? <option value="distance">{t("marketplace.dashboard.filters.nearest")}</option> : null}
                  <option value="priceLow">{t("marketplace.dashboard.filters.priceLow")}</option>
                  <option value="priceHigh">{t("marketplace.dashboard.filters.priceHigh")}</option>
                </select>
              </label>
              {hasActiveFilters ? <button type="button" className="mp-filter-reset" onClick={resetFilters}><X aria-hidden="true" /> {t("marketplace.dashboard.filters.reset")}</button> : null}
            </div>

            {loading ? (
              <CardSkeletons dishes />
            ) : discoveryFailed || searchFailed ? (
              <div className="mp-state" role="alert">
                <EmptyArtwork icon={WifiOff} />
                <h3>{t("marketplace.discovery.errorTitle")}</h3>
                <p>{t("marketplace.discovery.errorDescription")}</p>
                <button type="button" onClick={discovery.reload}>{t("marketplace.discovery.retry")}</button>
              </div>
            ) : filteredDishes.length ? (
              <div className="mp-dish-grid" id="marketplace-menu-results" role="tabpanel">
                {filteredDishes.map((dish) => (
                  <DishCard
                    dish={dish}
                    favorite={favoriteDishes.includes(`${dish.type}-${dish.id}`)}
                    key={`${dish.type}-${dish.id}`}
                    onFavorite={toggleDishFavorite}
                    onFeedback={setFeedback}
                    path={resolveDishPath(dish, restaurants)}
                  />
                ))}
              </div>
            ) : (
              <div className="mp-state">
                <EmptyArtwork icon={Search} />
                <h3>{t("marketplace.dashboard.menu.emptyTitle")}</h3>
                <p>{t("marketplace.dashboard.menu.emptyDescription")}</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    resetFilters();
                  }}
                >
                  {t("marketplace.dashboard.menu.showAll")}
                </button>
              </div>
            )}
          </section>

          <AppDownloadCard />

          <section className="mp-about-cta" id="for-restaurants">
            <div className="mp-about-cta__copy">
              <p className="mp-kicker mp-kicker--light">
                <BadgeCheck aria-hidden="true" /> {t("marketplace.dashboard.about.eyebrow")}
              </p>
              <h2>{t("marketplace.dashboard.about.title")}</h2>
              <p>{t("marketplace.dashboard.about.description")}</p>
              <div>
                <Link to="/about">{t("marketplace.dashboard.about.aboutLink")} <ArrowRight /></Link>
                <a href="mailto:contact@pakhlai.com?subject=Join Pakhlai">{t("marketplace.dashboard.about.partner")}</a>
              </div>
            </div>
            <div className="mp-about-cta__stats">
              <div><strong>{discovery.restaurants.length ? formatNumber(discovery.restaurants.length, i18n.language) : "—"}</strong><span>{t("marketplace.dashboard.about.restaurants")}</span></div>
              <div><strong>{discovery.dishes.length ? formatNumber(discovery.dishes.length, i18n.language) : "—"}</strong><span>{t("marketplace.dashboard.about.menuItems")}</span></div>
              <div><strong>{formatNumber(3, i18n.language)}</strong><span>{t("marketplace.dashboard.about.languages")}</span></div>
              <div><strong><ShieldCheck aria-hidden="true" /></strong><span>{t("marketplace.dashboard.about.clearOrdering")}</span></div>
            </div>
          </section>
        </main>

        <footer className="mp-footer">
          <div>
            <Link to="/" className="mp-brand">
              <span><img src="/rms-mark-96.png" alt="" width="90" height="96" /></span>
              <div><strong>Pakhlai</strong><small>{t("marketplace.brand.tagline")}</small></div>
            </Link>
            <p>{t("marketplace.dashboard.footer.description")}</p>
          </div>
          <nav aria-label={t("marketplace.dashboard.footer.ariaLabel")}>
            <Link to="/about">{t("marketplace.footer.links.about")}</Link>
            <Link to="/founder">{t("marketplace.dashboard.footer.founder")}</Link>
            <Link to="/privacy">{t("marketplace.footer.links.privacy")}</Link>
            <Link to="/terms">{t("marketplace.footer.links.terms")}</Link>
            <a href="mailto:contact@pakhlai.com">{t("marketplace.footer.links.contact")}</a>
          </nav>
          <p>{t("marketplace.footer.copyright", { year: new Date().getFullYear() })}</p>
        </footer>
      </div>

      <MobileNav customer={customer} onOpenPanel={setPanel} onSearch={focusSearch} />

      <div className={`mp-toast${feedback ? " is-visible" : ""}`} role="status" aria-live="polite">
        <Check aria-hidden="true" /> {feedback}
      </div>

      {panel ? (
        <PreferencesPanel
          panel={panel}
          onClose={() => setPanel(null)}
          onFeedback={setFeedback}
          location={location}
          onLocationChange={saveLocation}
          restaurants={discovery.restaurants}
          dishes={discovery.dishes}
          favoriteRestaurants={favoriteRestaurants}
          favoriteDishes={favoriteDishes}
        />
      ) : null}
    </div>
  );
}
