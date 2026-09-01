import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Crosshair,
  LoaderCircle,
  MapPin,
  Search,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const RECENT_SEARCHES_KEY = "pakhlai_recent_restaurant_searches";
const MAX_RECENT_SEARCHES = 5;

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
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
    ...(restaurant.branches || []).flatMap((branch) => [branch.name, branch.address]),
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
          <LoaderCircle className="h-5 w-5 animate-spin text-orange-600" aria-hidden="true" />
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
                          <span className="block truncate text-sm font-bold">{item.label}</span>
                          {item.subtitle ? (
                            <span className="mt-0.5 block truncate text-xs text-stone-500">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 rtl:rotate-180" aria-hidden="true" />
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

function LocationPanel({ id, location, onLocationChange, restaurants, onClose }) {
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
          <MapPin className="h-5 w-5 shrink-0 text-orange-600" aria-hidden="true" />
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
        <p className="mt-3 text-xs font-semibold text-red-600" role="status" aria-live="polite">
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
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MarketplaceSearch({
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
      const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
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
    const locationQuery = location?.mode === "manual" ? normalize(location.label) : "";
    const matchingRestaurants = restaurantPool
      .filter((restaurant) => {
        if (!locationQuery) return true;
        return normalize(
          [restaurant.address, ...(restaurant.branches || []).map((branch) => branch.address)]
            .filter(Boolean)
            .join(" "),
        ).includes(locationQuery);
      })
      .filter((restaurant) => !query || getRestaurantHaystack(restaurant).includes(query))
      .slice(0, 5)
      .map((restaurant) => ({
        id: `restaurant-${restaurant.id || restaurant.slug}`,
        type: "restaurant",
        label: restaurant.name,
        subtitle:
          [restaurant.cuisines?.slice(0, 2).join(" · "), restaurant.address]
            .filter(Boolean)
            .join(" — ") || t("landing.marketplace.search.restaurantSuggestion"),
        slug: restaurant.slug,
        query: restaurant.name,
      }));

    const cuisinePool = uniqueBy(
      [
        ...(searchResults?.cuisines || []),
        ...cuisines.map((item) => (typeof item === "string" ? { name: item } : item)),
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
          normalize([item.name, item.name_dari, item.name_pashto].filter(Boolean).join(" ")).includes(
            query,
          ),
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
      { key: "recent", label: t("landing.marketplace.search.recent"), items: recent },
      {
        key: "restaurants",
        label: location?.label
          ? t("landing.marketplace.search.restaurantsNear", { location: location.label })
          : t("landing.marketplace.search.restaurants"),
        items: matchingRestaurants,
      },
      { key: "cuisines", label: t("landing.marketplace.search.cuisines"), items: matchingCuisines },
      { key: "dishes", label: t("landing.marketplace.search.dishes"), items: matchingDishes },
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

    if (item.slug && ["restaurant", "dish"].includes(item.originalType || item.type)) {
      navigate(`/${item.slug}`);
      return;
    }

    const nextQuery = item.query || item.label;
    onValueChange(nextQuery);
    onExplore(nextQuery);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const exactRestaurant = [...(searchResults?.restaurants || []), ...restaurants].find(
      (restaurant) =>
        normalize(restaurant.name) === query || normalize(restaurant.slug) === query,
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
      setActiveIndex((index) => Math.min(index + 1, flatSuggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!flatSuggestions.length) return;
      setActiveIndex((index) => (index <= 0 ? flatSuggestions.length - 1 : index - 1));
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
      <form onSubmit={submitSearch} className="marketplace-search-card" role="search">
        <div className="marketplace-search-fields">
          <div ref={anchorRef} className="marketplace-query-field">
            <Search className="h-5 w-5 shrink-0 text-orange-600 sm:h-6 sm:w-6" aria-hidden="true" />
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
                  window.setTimeout(() => inputRef.current?.scrollIntoView({ block: "center" }), 120);
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
            <MapPin className="h-5 w-5 shrink-0 text-orange-600" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-start">
              <span className="block text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                {t("landing.marketplace.location.label")}
              </span>
              <span className="block truncate text-sm font-bold text-stone-800">
                {location?.label || t("landing.marketplace.location.placeholder")}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-stone-400 transition ${locationOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <button type="submit" className="marketplace-explore-button">
            <span>{t("landing.marketplace.search.action")}</span>
            <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180" aria-hidden="true" />
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
          loading={searchStatus === "loading" || (searchStatus === "idle" && status === "loading")}
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
