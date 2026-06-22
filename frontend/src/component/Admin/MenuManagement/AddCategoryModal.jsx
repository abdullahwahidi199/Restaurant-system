import { useContext, useState, useEffect } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";
import { useTranslation } from "react-i18next";

export default function AddCategoryModal({ onClose, onCategoryAdded }) {
  const [name, setName] = useState("");
  const [nameDari, setNameDari] = useState("");
  const [namePashto, setNamePashto] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rank, setRank] = useState("");
  const [takenRanks, setTakenRanks] = useState([]);
  const [rankError, setRankError] = useState("");
  const [showRestriction, setShowRestriction] = useState(false);
  const [loading, setLoading] = useState(false);

  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const { t } = useTranslation();

  // Fetch existing ranks on mount
  useEffect(() => {
    const fetchTakenRanks = async () => {
      try {
        const res = await instance.get("/menu/categories/");
        const ranks = res.data
          .map((c) => c.rank)
          .filter((r) => r !== null && r !== undefined);
        setTakenRanks(ranks);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchTakenRanks();
  }, []);

  const handleRankChange = (e) => {
    const value = e.target.value;
    setRank(value);

    if (value === "") {
      setRankError("");
      return;
    }

    const parsed = parseInt(value, 10);
    if (takenRanks.includes(parsed)) {
      setRankError(`Rank ${parsed} is already taken. Please choose another.`);
    } else {
      setRankError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    // Final guard before submit
    if (rank !== "" && takenRanks.includes(parseInt(rank, 10))) {
      setRankError(`Rank ${rank} is already taken. Please choose another.`);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("name_dari", nameDari);
      formData.append("name_pashto", namePashto);
      formData.append("description", description);
      if (rank !== "") formData.append("rank", rank);
      if (image) formData.append("image", image);

      await instance.post("/menu/categories/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error(
        "Failed to add new Category",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {t("add_category")}
        </h2>

        <form onSubmit={handleAddCategory} className="space-y-4">
          {/* English Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("category_name")} (English)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("category_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
          </div>

          {/* Dari Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام کتگوری (دری)
            </label>
            <input
              value={nameDari}
              onChange={(e) => setNameDari(e.target.value)}
              placeholder="نام کتگوری به دری"
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
          </div>

          {/* Pashto Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              د کتگورۍ نوم (پښتو)
            </label>
            <input
              value={namePashto}
              onChange={(e) => setNamePashto(e.target.value)}
              placeholder="د کتگورۍ نوم په پښتو"
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Rank{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={rank}
              onChange={handleRankChange}
              placeholder="e.g. 1, 2, 3 …"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400 ${
                rankError
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {rankError && (
              <p className="text-red-500 text-xs mt-1">{rankError}</p>
            )}
            {/* Taken ranks hint */}
            {takenRanks.length > 0 && (
              <p className="text-gray-400 text-xs mt-1">
                Taken ranks:{" "}
                <span className="font-medium text-gray-500">
                  {[...takenRanks].sort((a, b) => a - b).join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Image
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="w-24 h-24 object-cover rounded-lg border mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <button
              type="submit"
              disabled={loading || !!rankError}
              className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
            >
              {loading ? "Adding..." : t("add")}
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
            actionType="Add"
            onClose={() => setShowRestriction(false)}
          />
        )}
      </div>
    </div>
  );
}
