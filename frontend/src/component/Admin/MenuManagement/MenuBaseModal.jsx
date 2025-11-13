import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import AddCategoryModal from "./AddCategoryModal";
import CategoriesList from "./Catagories";
import instance from "../../../api/axiosInstance";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [show_Add_Modal, set_show_add_modal] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await instance.get(`menu/categories/`);
      const data = response.data;
      setCategories(data);
    } catch (error) {
      console.log("Could not get categories:",error.response?.data||error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryAdded = () => {
    set_show_add_modal(false);
    fetchCategories();
  };

  return (
    <div className="min-h-screen py-5 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-5">Menu Management</h1>

        
        <div className="flex items-start gap-4">
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
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </div>
      </div>

      <CategoriesList categories={categories} onCategoryDelete={fetchCategories}/>
    </div>
  );
}
