import Header from "./Header";
import MenuPage from "./MenuPage";

export default function CustomerHomepage({ restaurantInfo }) {
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
