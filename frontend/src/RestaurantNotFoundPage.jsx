import { Link } from "react-router-dom";

export default function RestaurantNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-red-600">404</h1>
      <p className="mt-4 text-xl font-semibold">Restaurant Not Found</p>
      <p className="text-gray-500 mt-2">
        This restaurant is not registered or does not exist.
      </p>

      <Link
        to="/r"
        className="mt-6 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
      >
        Go Home
      </Link>
    </div>
  );
}
