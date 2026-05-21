import { useEffect, useState } from "react";
import { Plus, Printer, X } from "lucide-react";

import AddCategoryModal from "./AddCategoryModal";
import CategoriesList from "./Catagories";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [show_Add_Modal, set_show_add_modal] = useState(false);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // PRINT STATES
  const [printMode, setPrintMode] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await instance.get(`menu/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.log(
        "Could not get categories:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryAdded = () => {
    set_show_add_modal(false);
    fetchCategories();
  };

  const handlePrint = async () => {
    try {
      let url = `/menu/menu-print/?mode=${printMode}`;

      if (printMode === "category" && selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await instance.get(url, {
        responseType: "blob",
      });

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      const a = document.createElement("a");
      a.href = fileURL;
      a.download = "menu.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  if (loading) {
    return <div className="p-5 text-gray-600">...loading</div>;
  }

  return (
    <div
      className="min-h-screen py-5 px-4 bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-5">
          {t("menu_management")}
        </h1>

        {/* ACTION BAR */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
          {/* ADD CATEGORY BUTTON */}
          <button
            onClick={() => set_show_add_modal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {t("add_category")}
          </button>

          {/* PRINT CONTROLS */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="category">By Category</option>
            </select>

            {printMode === "category" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY LIST */}
      <CategoriesList
        categories={categories}
        onCategoryDelete={fetchCategories}
      />

      {/* STANDARD MODAL OVERLAY */}
      {show_Add_Modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            // Close when clicking the backdrop
            if (e.target === e.currentTarget) set_show_add_modal(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-5 relative">
            <button
              onClick={() => set_show_add_modal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <AddCategoryModal
              onClose={() => set_show_add_modal(false)}
              onCategoryAdded={handleCategoryAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
