import { FolderMinusIcon,X } from "lucide-react";
import { motion } from "framer-motion";

import { useState } from "react"
import instance from "../../../api/axiosInstance";

export default function AddItemModal({onClose,onItemAdded,selectedcategoryid}){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleAddItem=async (e)=>{
        e.preventDefault()
        setLoading(true)

        const formData = new FormData();
        formData.append("name",name)
        formData.append("description",description)
        formData.append("price",price)    
        formData.append("category",selectedcategoryid)
        formData.append("is_available",'True')
        if (image){
            formData.append("image",image)
        }
        try{
            const response=await instance.post(`/menu/menu-items/`,
               formData
            )
            
            onClose();
            onItemAdded();
            setName("");
            setDescription("");
            setPrice("");
            setImage(null);
        }
        catch(error){
            console.log("Could not add new item:",error.response?.data||error.message)
        }
        finally{
            setLoading(false)
        }
    }

    return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Add New item
        </h2>

        <form onSubmit={handleAddItem} className="space-y-4">
          

          <input
          type="text"
          placeholder="Name"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          className="w-full mb-3 cursor-pointer"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border px-3 py-2 mb-4 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}