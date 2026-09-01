import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

export default function useRestaurantDiscovery(coordinates = null, query = "") {
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
