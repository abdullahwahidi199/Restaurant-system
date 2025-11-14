import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import useCategoryItems from "./useCategoryItems";
import CategoryDeleteModal from "./CategoryDeleteModal";
import MenuList from "./MenuList";

export default function CategoriesList({ categories,onCategoryDelete }) {
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [showDeleteCategoryModal,setShowDeleteCategoryModal]=useState(false)

    const queryClient=useQueryClient();
    
    const {data:categoryItems=[],isFetching,isError,refetch}=
        useCategoryItems(selectedCategoryId);

        const handleCategoryClick=(id)=>{
            setSelectedCategoryId(id)
        }
        const handleRefetch = () => {
    
    refetch();
  };


    
    
    const handleDeleted=()=>{
        setShowDeleteCategoryModal(false)
        onCategoryDelete()
        queryClient.removeQueries(['categoryItems', selectedCategoryId]);
        setSelectedCategoryId(null);
    }
    return (
        <div className="p-5">

            <div className="flex gap-3 overflow-x-auto border-b pb-3 mb-6 scrollbar-hide">
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => {
                            handleCategoryClick(c.id);
                        }}
                        className={`px-5 py-2 cursor-pointer rounded-full text-sm font-medium transition-all ${selectedCategoryId === c.id
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                    >
                        {c.name}
                    </button>
                ))}
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
            onDeleteCategory={()=>setShowDeleteCategoryModal(true)}
            />

            

            {showDeleteCategoryModal && (
                <CategoryDeleteModal categoryId={selectedCategoryId}  onClose={()=>setShowDeleteCategoryModal(false)}
                    onDelete={handleDeleted}
                />
            )}
        </div>

        
      ) : (
        <div className="text-gray-400 text-center py-10">
          Select a category to view its items.
        </div>
      )}
        </div>
    );
}
