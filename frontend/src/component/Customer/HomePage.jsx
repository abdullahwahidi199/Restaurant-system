import { useEffect, useState } from "react";
import Header from "./Header";
import MenuPage from "./MenuPage";
import { useParams } from "react-router-dom";
import RestaurantNotFound from "../../RestaurantNotFoundPage";

export default function CustomerHomepage() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { slug } = useParams();

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/system/restaurant-info/slug/${slug}/`,
        );

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          }
          return;
        }

        const data = await res.json();
        console.log(data);
        setRestaurantInfo(data);
      } catch (error) {
        console.log(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, [slug]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (notFound) {
    return <RestaurantNotFound />;
  }
  const orderingClosed = !restaurantInfo?.delivery_available;

  return (
    <div>
      <Header restaurantInfo={restaurantInfo} />

      {!restaurantInfo?.delivery_available && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <span className="text-lg">🚫</span>
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800">
                Delivery unavailable
              </p>
              <p className="text-sm text-amber-700">
                Delivery is currently unavailable for this restaurant. Please
                check back later.
              </p>
            </div>
          </div>
        </div>
      )}

      <MenuPage orderingClosed={orderingClosed} />
    </div>
  );
}
