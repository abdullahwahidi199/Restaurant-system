import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import AddItemModal from "./AddItemModal";
import { Link } from "react-router-dom";

export default function MenuList({ categoryItems, selectedCategoryid, fetchCategoryAgain, onDeleteCategory }) {
  const [itemAdd_Modal, setItemAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = categoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log(filteredItems)

  const handleItemAdded = () => {
    setItemAddModal(false);
    fetchCategoryAgain();

  }
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text"
            placeholder="Search Menu items..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDeleteCategory}
            className="flex items-center cursor-pointer  gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" /> Delete Category
          </button>

          <button
            onClick={() => setItemAddModal(true)

            }
            className="flex items-center gap-2 cursor-pointer bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Link to={`/admin/dashboard/menu/item/${item.id}`}>
              <div
                key={item.id}
                className="bg-white rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
              >
                <div
                  className={`aspect-[4/3] bg-gray-100 relative overflow-hidden ${!item.is_available ? "opacity-70 brightness-75" : ""
                    }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!item.is_available ? "blur-[1px]" : ""
                        }`}
                      onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x200?text=No+Image")
                      }
                    />
                  ) : <p>No image</p>}
                </div>

                <div className="p-4 flex flex-col justify-between">
                  <h3 className={`${item.is_available === true ? "text-black" : "text-gray-400"} font-semibold text-base sm:text-lg truncate`}>
                    {item.name}
                  </h3>
                  <p className={`${item.is_available === true ? "text-lime-600" : "text-gray-400"} font-semibold mt-1`}>
                    Afs{item.price ? item.price : "N/A"}
                  </p>
                </div>
              </div></Link>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-10">
          No items found for this category.
        </div>
      )}


      {itemAdd_Modal && (
        <AddItemModal
          onClose={() => setItemAddModal(false)}
          onItemAdded={handleItemAdded}

          selectedcategoryid={selectedCategoryid}
        />
      )}
    </div>
  );
}
