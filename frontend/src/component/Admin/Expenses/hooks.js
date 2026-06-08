// src/pages/expenses/hooks.js
import { useEffect, useRef, useState } from "react";

/** Debounce a value — useful for search inputs. */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Track latest request to avoid race conditions on rapid filter changes. */
export function useLatestRequest() {
  const ref = useRef(0);
  const next = () => ++ref.current;
  const isLatest = (id) => id === ref.current;
  return { next, isLatest };
}
