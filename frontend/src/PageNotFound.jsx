import { useTranslation as useAutoTranslation } from "react-i18next";export default function NotFound() {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>

      <p className="text-lg text-gray-500 mt-2">{autoT("legacy.page_not_found_bc3023b3")}</p>

      <a
        href="/"
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        {autoT("legacy.go_home_19445d72")}
      </a>
    </div>
  );
}
