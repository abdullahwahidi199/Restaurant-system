import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function DiscountCardsMain() {
  const [discountCards, setDiscountCards] = useState([]);
  const navigate = useNavigate();

  const fetchDiscountCards = async () => {
    try {
      const response = await instance.get("/orders/discount-cards/");
      setDiscountCards(response.data);
    } catch (error) {
      console.error("Failed to fetch discount cards", error);
    }
  };

  useEffect(() => {
    fetchDiscountCards();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Discount Cards</h2>

        <button
          onClick={() => navigate("/admin/dashboard/create-discount-cards")}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          + Create Discount Card
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Card Name</th>
              <th className="p-3 text-left">Card Number</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Discount %</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Valid Until</th>
              <th className="p-3 text-left">Usage</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {discountCards.map((card) => (
              <tr key={card.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{card.card_name}</td>

                <td className="p-3">{card.card_number}</td>

                <td className="p-3">{card.customer_name}</td>

                <td className="p-3">
                  <span className="text-orange-600 font-semibold">
                    {card.discount_percentage}%
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      card.status === "active"
                        ? "bg-green-100 text-green-700"
                        : card.status === "expired"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {card.status}
                  </span>
                </td>

                <td className="p-3">{card.valid_until}</td>

                <td className="p-3">
                  {card.used_count}
                  {card.usage_limit ? ` / ${card.usage_limit}` : " / ∞"}
                </td>

                {/* Actions */}
                <td className="p-3 text-center">
                  <button
                    onClick={() =>
                      navigate(`/admin/dashboard/discount-cards/${card.id}`)
                    }
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {discountCards.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  No discount cards found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
