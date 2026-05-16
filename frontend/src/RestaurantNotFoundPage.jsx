import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const path = location.pathname;

  // Detect restaurant routes
  const isRestaurantRoute =
    /^\/[^/]+/.test(path) &&
    !path.startsWith("/admin") &&
    !path.startsWith("/manager");

  const isAdminRoute = path.startsWith("/admin");
  const isCashierRoute = path.startsWith("/cashier");
  const isKitchenRoute = path.startsWith("/kitchen");

  let title = "Page Not Found";
  let subtitle = "The page you are looking for does not exist.";

  if (isRestaurantRoute) {
    title = "Restaurant Not Found";
    subtitle = "This restaurant or menu page does not exist.";
  } else if (isAdminRoute) {
    title = "Admin Page Not Found";
    subtitle = "This admin section does not exist or you don't have access.";
  } else if (isKitchenRoute) {
    title = "Kitchen Page Not Found";
    subtitle = "This kitchen screen does not exist.";
  } else if (isCashierRoute) {
    title = "Cashier Page Not Found";
    subtitle = "This cashier route does not exist.";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-600">404</h1>

      <p className="mt-4 text-2xl font-semibold">{title}</p>

      <p className="text-gray-500 mt-2">{subtitle}</p>

      <p className="text-xs text-gray-400 mt-3">{path}</p>

      <Link
        to="/"
        className="mt-6 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
      >
        Go Home
      </Link>
    </div>
  );
}
