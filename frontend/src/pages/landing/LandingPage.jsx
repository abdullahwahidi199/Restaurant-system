import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CuisineSection from "../../component/landing/CuisineSection";
import HeroSection from "../../component/landing/HeroSection";
import HowItWorksSection from "../../component/landing/HowItWorksSection";
import MarketplaceFooter from "../../component/landing/MarketplaceFooter";
import MarketplaceNavbar from "../../component/landing/MarketplaceNavbar";
import PopularRestaurantsSection from "../../component/landing/PopularRestaurantsSection";
import RestaurantDiscoverySection from "../../component/landing/RestaurantDiscoverySection";
import RestaurantOwnerSection from "../../component/landing/RestaurantOwnerSection";
import useRestaurantDiscovery from "../../hooks/useRestaurantDiscovery";
import "../../styles/landing.css";

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
  if (!stored || typeof stored !== "object" || typeof stored.label !== "string") return null;
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
      document.getElementById("restaurants")?.scrollIntoView({ block: "start", behavior: "smooth" });
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
