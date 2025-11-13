import { useState } from "react";
import instance from "../../../api/axiosInstance";

export default function AddCategoryModal({ onClose, onCategoryAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await instance.post("/menu/categories/",{
        name,description
      });

     
      onCategoryAdded();
    } catch (error) {
      console.error("Failed to add new Category",error.response?.data||error.message);
      
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl  w-80">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Category</h2>
      <form onSubmit={handleAddCategory} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Category name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
        />
        <div className="flex justify-between items-center mt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
