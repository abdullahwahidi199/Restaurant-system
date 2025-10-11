export default function SingleItem({ item, error }) {
  if (error) {
    return <p className="text-red-500 text-center text-lg">{error}</p>;
  }

  if (!item) {
    return <p className="text-gray-500 text-center text-lg">Loading item...</p>;
  }

  return (
    <div className="max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-72 object-cover"
      />

      <div className="p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">{item.name}</h2>
        <p className="text-gray-600 mb-4">{item.description}</p>

        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold text-lime-600">${item.price}</p>
          <p
            className={`text-sm font-medium ${
              item.is_available ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.is_available ? "Available" : "Out of stock"}
          </p>
        </div>

        {item.reviews && item.reviews.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Reviews</h3>
            <div className="space-y-3">
              {item.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800">{review.customer}</p>
                    <p className="text-yellow-500">⭐ {review.rating}/5</p>
                  </div>
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mt-4 italic">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
