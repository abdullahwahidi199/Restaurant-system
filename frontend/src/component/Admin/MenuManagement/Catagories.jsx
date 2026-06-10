import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCategoryItems from "./useCategoryItems";
import CategoryDeleteModal from "./CategoryDeleteModal";
import EditCategoryModal from "./EditCategoryModal"; // Import new modal
import MenuList from "./MenuList";
import { Pencil } from "lucide-react";

export default function CategoriesList({
  categories,
  setCategories,
  onCategoryDelete,
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  // State for Edit Modal
  const [editingCategory, setEditingCategory] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const {
    data: categoryItems = {},
    isFetching,
    isError,
    refetch,
  } = useCategoryItems(selectedCategoryId);

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
  };

  const handleRefetch = () => {
    refetch();
  };

  const handleDeleted = () => {
    setShowDeleteCategoryModal(false);
    onCategoryDelete();
    queryClient.removeQueries(["categoryItems", selectedCategoryId]);
    const remaining = categories.filter((c) => c.id !== selectedCategoryId);
    setSelectedCategoryId(remaining.length > 0 ? remaining[0].id : null);
  };

  // Called when Edit Modal successfully saves
  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
    );
  };

  return (
    <div className="p-5">
      <div className="flex gap-3 overflow-x-auto border-b pb-3 mb-6 scrollbar-hide">
        {categories.map((c) => {
          const isSelected = selectedCategoryId === c.id;

          return (
            <div key={c.id} className="relative group">
              <button
                onClick={() => handleCategoryClick(c.id)}
                onDoubleClick={() => setEditingCategory(c)} // Open modal on double click
                className={`px-5 py-2 cursor-pointer rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                title="Double click to edit"
              >
                {c.name}
              </button>

              {/* Pencil icon to open edit modal */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCategory(c);
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-blue-600"
              >
                <Pencil size={14} />
              </span>
            </div>
          );
        })}
      </div>

      {isFetching ? (
        <div className="grid place-items-center text-gray-600 mt-10">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-10">
          Failed to load category items.
        </div>
      ) : selectedCategoryId ? (
        <div>
          <MenuList
            categoryItems={categoryItems}
            selectedCategoryid={selectedCategoryId}
            fetchCategoryAgain={handleRefetch}
            onDeleteCategory={() => setShowDeleteCategoryModal(true)}
          />

          {showDeleteCategoryModal && (
            <CategoryDeleteModal
              categoryId={selectedCategoryId}
              onClose={() => setShowDeleteCategoryModal(false)}
              onDelete={handleDeleted}
            />
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-10">
          Select a category to view its items.
        </div>
      )}

      {/* Render Edit Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}
    </div>
  );
}
