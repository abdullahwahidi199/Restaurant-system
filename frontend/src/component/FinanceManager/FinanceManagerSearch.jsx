import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Clock3,
  CornerDownLeft,
  Search,
  Star,
  Zap,
} from "lucide-react";
import {
  findActiveFinanceManagerNavigationItem,
  getFinanceManagerSearchableNavigationItems,
} from "./financeManangerNavigation";

const RECENT_STORAGE_KEY = "pakhlai-finance-search-recent";
const FREQUENCY_STORAGE_KEY = "pakhlai-finance-search-frequency";
const FAVORITES_STORAGE_KEY = "pakhlai-finance-search-favorites";

// Default frequent items relevant specifically to the Finance Manager role
const DEFAULT_FREQUENT_IDS = [
  "expenses",
  "expenses-history",
  "procurement-dashboard",
  "procurement-purchase-invoices",
  "payroll-dashboard",
  "contractors-dashboard",
];

const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const useDebouncedValue = (value, delay = 100) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
};

const scoreItem = (item, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return 0;

  const label = (item.displayLabel || item.label).toLowerCase();
  const moduleLabel = item.moduleLabel.toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;

  if (label === normalizedQuery) score += 150;
  if (label.startsWith(normalizedQuery)) score += 95;
  if (label.includes(normalizedQuery)) score += 60;
  if (moduleLabel.includes(normalizedQuery)) score += 40;
  if (item.searchText.includes(normalizedQuery)) score += 35;

  for (const token of tokens) {
    if (label.startsWith(token)) score += 18;
    if (item.searchText.includes(token)) score += 12;
  }

  return score;
};

const Highlight = ({ text, query }) => {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!tokens.length) return text;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  const parts = String(text).split(pattern);

  return parts.map((part, index) =>
    tokens.some((token) => token.toLowerCase() === part.toLowerCase()) ? (
      <mark key={`${part}-${index}`}>{part}</mark>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    ),
  );
};

function SearchResult({ item, query, active, onSelect, id }) {
  const Icon = item.icon;

  return (
    <button
      id={id}
      type="button"
      className={`admin-search-result ${
        active ? "admin-search-result-active" : ""
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(item)}
      role="option"
      aria-selected={active}
    >
      <span className="admin-search-result-icon">
        <Icon className="h-4 w-4" />
      </span>
      <span className="admin-search-result-copy">
        <span className="admin-search-result-module">{item.moduleLabel}</span>
        <span className="admin-search-result-title">
          <Highlight text={item.displayLabel || item.label} query={query} />
        </span>
        <span className="admin-search-result-description">
          {item.description}
        </span>
      </span>
      <CornerDownLeft className="admin-search-enter-icon" />
    </button>
  );
}

function ResultGroup({ label, icon: Icon, children }) {
  return (
    <section className="admin-search-group">
      <div className="admin-search-group-label">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="admin-search-group-items">{children}</div>
    </section>
  );
}

export default function FinanceGlobalSearch({ navigationGroups }) {
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [recentIds, setRecentIds] = useState(() =>
    typeof window === "undefined" ? [] : readJson(RECENT_STORAGE_KEY, []),
  );
  const [frequency, setFrequency] = useState(() =>
    typeof window === "undefined" ? {} : readJson(FREQUENCY_STORAGE_KEY, {}),
  );
  const [favoriteIds] = useState(() =>
    typeof window === "undefined" ? [] : readJson(FAVORITES_STORAGE_KEY, []),
  );

  const debouncedQuery = useDebouncedValue(query, 100);

  const items = useMemo(
    () => getFinanceManagerSearchableNavigationItems(navigationGroups),
    [navigationGroups],
  );

  const itemById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const recordVisit = useCallback((item) => {
    if (!item?.id) return;

    setRecentIds((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(
        0,
        8,
      );
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setFrequency((current) => {
      const next = {
        ...current,
        [item.id]: (current[item.id] || 0) + 1,
      };
      window.localStorage.setItem(FREQUENCY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const activeItem = findActiveFinanceManagerNavigationItem(
      navigationGroups,
      location.pathname,
    );
    if (activeItem?.to) recordVisit(activeItem);
  }, [location.pathname, navigationGroups, recordVisit]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return items
      .map((item) => ({
        item,
        score: scoreItem(item, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort(
        (a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label),
      )
      .slice(0, 12)
      .map((entry) => entry.item);
  }, [debouncedQuery, items]);

  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => itemById.get(id))
        .filter(Boolean)
        .slice(0, 5),
    [itemById, recentIds],
  );

  const frequentItems = useMemo(() => {
    const counted = Object.entries(frequency)
      .map(([id, count]) => ({
        item: itemById.get(id),
        count,
      }))
      .filter((entry) => entry.item)
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.item);

    const source = counted.length
      ? counted
      : DEFAULT_FREQUENT_IDS.map((id) => itemById.get(id)).filter(Boolean);

    return source
      .filter((item) => !recentItems.some((recent) => recent.id === item.id))
      .slice(0, 5);
  }, [frequency, itemById, recentItems]);

  const favoriteItems = useMemo(
    () =>
      favoriteIds
        .map((id) => itemById.get(id))
        .filter(Boolean)
        .slice(0, 5),
    [favoriteIds, itemById],
  );

  const groupedItems = useMemo(() => {
    if (debouncedQuery.trim()) {
      return [
        {
          label: "Results",
          icon: Search,
          items: filteredResults,
        },
      ];
    }

    return [
      { label: "Recent", icon: Clock3, items: recentItems },
      { label: "Frequently Used", icon: Zap, items: frequentItems },
      { label: "Favorites", icon: Star, items: favoriteItems },
    ].filter((group) => group.items.length > 0);
  }, [
    debouncedQuery,
    favoriteItems,
    filteredResults,
    frequentItems,
    recentItems,
  ]);

  const flatResults = useMemo(
    () => groupedItems.flatMap((group) => group.items),
    [groupedItems],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, open]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const selectItem = (item) => {
    if (!item?.to) return;
    recordVisit(item);
    navigate(item.to);
    closeSearch();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (!open && event.key !== "Tab") {
      setOpen(true);
    }

    if (!flatResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + flatResults.length) % flatResults.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectItem(flatResults[activeIndex]);
    }
  };

  let resultIndex = 0;

  return (
    <div className="admin-global-search" ref={wrapperRef}>
      <div
        className={`admin-search-input-shell ${
          open ? "admin-search-input-shell-open" : ""
        }`}
      >
        <Search className="admin-search-input-icon" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search finance pages..."
          aria-label="Search finance pages"
          aria-expanded={open}
          aria-controls="admin-global-search-results"
          aria-activedescendant={
            open && flatResults[activeIndex]
              ? `admin-search-result-${flatResults[activeIndex].id}`
              : undefined
          }
          role="combobox"
          autoComplete="off"
        />
        <kbd>Ctrl K</kbd>
      </div>

      {open && (
        <div
          id="admin-global-search-results"
          className="admin-search-panel"
          role="listbox"
        >
          {groupedItems.length > 0 ? (
            groupedItems.map((group) => (
              <ResultGroup
                key={group.label}
                label={group.label}
                icon={group.icon}
              >
                {group.items.map((item) => {
                  const currentIndex = resultIndex;
                  resultIndex += 1;
                  return (
                    <SearchResult
                      key={item.id}
                      id={`admin-search-result-${item.id}`}
                      item={item}
                      query={debouncedQuery}
                      active={currentIndex === activeIndex}
                      onSelect={selectItem}
                    />
                  );
                })}
              </ResultGroup>
            ))
          ) : (
            <div className="admin-search-empty">
              <Search className="h-5 w-5" />
              <span>No finance pages found</span>
            </div>
          )}

          <div className="admin-search-footer">
            <span>
              <ArrowUpDown className="h-3.5 w-3.5" />
              Navigate
            </span>
            <span>
              <CornerDownLeft className="h-3.5 w-3.5" />
              Open
            </span>
            <span>Esc Close</span>
          </div>
        </div>
      )}
    </div>
  );
}
