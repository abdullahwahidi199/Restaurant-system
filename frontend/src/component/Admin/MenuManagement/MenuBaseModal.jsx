import { useEffect, useState } from "react";
import { Plus, Printer } from "lucide-react";

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

  // 🔥 PRINT HANDLER
  const handlePrint = async () => {
    try {
      let url = `/menu/menu-print/?mode=${printMode}`;

      if (printMode === "category" && selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await instance.get(url, {
        responseType: "blob",
      });

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

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
    return <div className="p-5">...loading</div>;
  }

  return (
    <div
      className="min-h-screen py-5 px-4 bg-gray-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-5">
          {t("menu_management")}
        </h1>

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center gap-4">
          {/* ADD CATEGORY */}
          {show_Add_Modal && (
            <div className="bg-white p-5 rounded-xl shadow-md w-80">
              <AddCategoryModal
                onClose={() => set_show_add_modal(false)}
                onCategoryAdded={handleCategoryAdded}
              />
            </div>
          )}

          <button
            onClick={() => set_show_add_modal(!show_Add_Modal)}
            className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <Plus className="w-5 h-5" /> {t("add_category")}
          </button>

          {/* PRINT CONTROLS */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
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
                className="px-3 py-2 border rounded-lg text-sm"
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
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
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
    </div>
  );
}
