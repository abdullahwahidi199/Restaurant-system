import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import MenuPage from "./MenuPage";
import RestaurantNotFound from "../../RestaurantNotFoundPage";
import BranchSelectionPage, {
  BranchSelectionError,
  BranchSelectionSkeleton,
  BranchUnavailable,
} from "./BranchSelectionPage";
import {
  getPublicRestaurantEntryPath,
  persistPublicOrderingContext,
} from "../../api/publicOrdering";

export default function CustomerHomepage() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const params = useParams();
  const navigate = useNavigate();
  const restaurantSlug = params.restaurantSlug || params.slug;
  const branchSlug = params.branchSlug;

  const fetchPublicContext = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setError(false);

    try {
      const endpoint = branchSlug
        ? `${BASE_URL}/restaurant/public/${restaurantSlug}/${branchSlug}/`
        : `${BASE_URL}/restaurant/public/${restaurantSlug}/`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
        return;
      }

      const data = await res.json();
      setRestaurantInfo(data.restaurant);
      setBranchInfo(data.branch || null);
      setBranches(data.branches || []);
      setMode(data.mode || (data.branch ? "branch" : null));

      if (data.branch) {
        persistPublicOrderingContext({
          restaurant: data.restaurant,
          branch: data.branch,
        });
      }

      if (!branchSlug && data.mode === "single_branch") {
        navigate(getPublicRestaurantEntryPath(data, restaurantSlug), {
          replace: true,
        });
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, branchSlug, navigate, restaurantSlug]);

  useEffect(() => {
    if (!restaurantSlug) return;
    fetchPublicContext();
  }, [fetchPublicContext, restaurantSlug]);

  if (loading) {
    return <BranchSelectionSkeleton />;
  }

  if (notFound) {
    return <RestaurantNotFound />;
  }

  if (error) {
    return <BranchSelectionError onRetry={fetchPublicContext} />;
  }

  if (!branchSlug && mode === "unavailable") {
    return <BranchUnavailable restaurant={restaurantInfo} />;
  }

  if (!branchSlug && mode === "multi_branch") {
    return (
      <BranchSelectionPage restaurant={restaurantInfo} branches={branches} />
    );
  }

  const deliveryAvailable =
    branchInfo?.effective_delivery_available ?? restaurantInfo?.delivery_available;
  const orderingClosed = !deliveryAvailable;

  return (
    <div>
      <Header
        restaurantInfo={restaurantInfo}
        branchInfo={branchInfo}
        restaurantSlug={restaurantSlug}
        branchSlug={branchSlug}
      />

      {orderingClosed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <span className="text-lg">!</span>
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800">
                Delivery unavailable
              </p>
              <p className="text-sm text-amber-700">
                Delivery is currently unavailable for this branch. Please check
                back later.
              </p>
            </div>
          </div>
        </div>
      )}

      <MenuPage
        orderingClosed={orderingClosed}
        restaurantInfo={restaurantInfo}
        branchInfo={branchInfo}
        restaurantSlug={restaurantSlug}
        branchSlug={branchSlug}
      />
    </div>
  );
}
