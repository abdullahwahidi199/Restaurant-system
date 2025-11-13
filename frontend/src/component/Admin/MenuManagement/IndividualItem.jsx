import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemDelete from "./ItemDeleteModal";
import instance from "../../../api/axiosInstance";

export default function IndividualItem() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showItemDeleteModal,setShowItemDeleteModal]=useState(false)
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchItem = async () => {
    try {
      const response = await instance.get(`/menu/menu-items/${id}/`);
      
      const data = response.data;
      setItem(data);
      setPreview(data.image);
    } catch (error) {
      setError("Failed to get item:",error.response?.data||error.message);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setItem({ ...item, image: file });
      setPreview(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      setItem({ ...item, [name]: checked });
    } else {
      setItem({ ...item, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", item.name);
    formData.append("description", item.description);
    formData.append("price", item.price);
    formData.append("is_available", item.is_available);
    if (item.image instanceof File) formData.append("image", item.image);

    try {
      console.log(formData)
      const response = await instance.put(`/menu/menu-items/${id}/`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

      
      const updated = response.data;
      setItem(updated);
      alert("Item updated successfully!");
      
      window.location.reload();
      navigate('/admin/dashboard/menu')
    } catch (error) {
      alert(" Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <p className="text-red-500 text-center text-lg">{error}</p>;
  }

  if (!item) {
    return <p className="text-center text-gray-600 mt-10">Loading item...</p>;
  }

  const averageRating =
    item.reviews && item.reviews.length > 0
      ? (
          item.reviews.reduce((sum, r) => sum + r.rating, 0) /
          item.reviews.length
        ).toFixed(1)
      : null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Edit Menu Item</h2>
          <button
            onClick={()=>setShowItemDeleteModal(true)}
            className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
        {showItemDeleteModal && (
                        <ItemDelete itemID={item.id}  onClose={()=>setShowItemDeleteModal(false)}
                        onDelete={()=>setShowItemDeleteModal(false)}
                        />
                    )}

        <div className="flex flex-col items-center">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-36 h-36 object-cover rounded-md border mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
            className="text-sm text-gray-700"
          />
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={item.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Afs)
            </label>
            <input
              type="number"
              name="price"
              value={item.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_available"
              checked={item.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Available</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {loading ? "Updating..." : "Update Item"}
          </button>
        </form>

        <div className="border-t pt-5">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Reviews</h3>

          {averageRating ? (
            <div className="flex items-center gap-2 mb-4">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-500">
                ({item.reviews.length} review
                {item.reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No ratings yet.</p>
          )}

          {item.reviews && item.reviews.length > 0 ? (
            <div className="space-y-3">
              {item.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {review.customer}
                    </span>
                    <div>{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
