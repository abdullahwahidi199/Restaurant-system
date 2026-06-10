import { useContext, useState, useEffect } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";
import { useTranslation } from "react-i18next";

export default function EditCategoryModal({
  category,
  onClose,
  onCategoryUpdated,
}) {
  const [name, setName] = useState("");
  const [nameDari, setNameDari] = useState("");
  const [namePashto, setNamePashto] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [showRestriction, setShowRestriction] = useState(false);
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const { t } = useTranslation();
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setNameDari(category.name_dari || "");
      setNamePashto(category.name_pashto || "");
      setDescription(category.description || "");
      setPreview(category.image ? `${BASE_URL}${category.image}` : null);
    }
  }, [category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("name_dari", nameDari);
      formData.append("name_pashto", namePashto);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await instance.patch(
        `/menu/categories/${category.id}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      onCategoryUpdated(res.data);
      onClose();
    } catch (error) {
      console.error(
        "Failed to update Category",
        error.response?.data || error.message,
      );
    }
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {t("edit_category")}
        </h2>

        <form onSubmit={handleUpdateCategory} className="space-y-4">
          {/* English */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t("category_name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("description")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Dari */}
          <input
            value={nameDari}
            onChange={(e) => setNameDari(e.target.value)}
            placeholder="نام دسته بندی (دری)"
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Pashto */}
          <input
            value={namePashto}
            onChange={(e) => setNamePashto(e.target.value)}
            placeholder="د کټګورۍ نوم (پښتو)"
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Image
            </label>
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-24 h-24 object-cover rounded-lg mb-2 border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              {t("update")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              {t("cancel")}
            </button>
          </div>
        </form>

        {showRestriction && (
          <RestrictedToast
            actionType="Update"
            onClose={() => setShowRestriction(false)}
          />
        )}
      </div>
    </div>
  );
}
