import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  ImagePlus,
  Languages,
  Layers3,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

const textAreaClass =
  "min-h-24 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function Panel({ icon: Icon, title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      </div>
      {children}
    </section>
  );
}

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

  useEffect(() => {
    const fetchTakenRanks = async () => {
      try {
        const res = await instance.get("/menu/categories/");
        const ranks = res.data
          .map((category) => category.rank)
          .filter((value) => value !== null && value !== undefined);
        setTakenRanks(ranks);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchTakenRanks();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleRankChange = (event) => {
    const value = event.target.value;
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();

    if (isDemo) {
      setShowRestriction(true);
      return;
    }

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-gray-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Category
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              {t("add_category")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Organize menu records with images, translations and display order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            aria-label="Close add category modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleAddCategory} className="overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <Panel icon={Layers3} title="General">
                <div className="space-y-4">
                  <Field label={`${t("category_name")} (English)`}>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      placeholder="e.g. Fast Food"
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t("description")}>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Short description for this category"
                      rows={3}
                      className={textAreaClass}
                    />
                  </Field>
                </div>
              </Panel>

              <Panel icon={Languages} title="Translations">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Dari name">
                    <input
                      value={nameDari}
                      onChange={(event) => setNameDari(event.target.value)}
                      placeholder="Category name in Dari"
                      dir="rtl"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Pashto name">
                    <input
                      value={namePashto}
                      onChange={(event) => setNamePashto(event.target.value)}
                      placeholder="Category name in Pashto"
                      dir="rtl"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Panel>
            </div>

            <div className="space-y-4">
              <Panel icon={Hash} title="Display">
                <Field
                  label="Display rank"
                  hint={
                    takenRanks.length
                      ? `Taken ranks: ${[...takenRanks].sort((a, b) => a - b).join(", ")}`
                      : "Optional order for menu category sorting."
                  }
                >
                  <input
                    type="number"
                    min="1"
                    value={rank}
                    onChange={handleRankChange}
                    placeholder="e.g. 1"
                    className={`${inputClass} ${
                      rankError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : ""
                    }`}
                  />
                </Field>
                {rankError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {rankError}
                  </p>
                )}
              </Panel>

              <Panel icon={ImagePlus} title="Image">
                <div className="overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center px-4 text-center transition hover:bg-white">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="mt-3 text-sm font-semibold text-gray-700">
                        Upload image
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        Square images work best
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
                {imagePreview && (
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </Panel>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 mt-5 flex flex-col gap-3 border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || !!rankError}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Layers3 className="h-4 w-4" />
              )}
              {loading ? "Adding..." : t("add")}
            </button>
          </div>
        </form>

        {showRestriction && (
          <RestrictedToast
            actionType="Add"
            onClose={() => setShowRestriction(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
