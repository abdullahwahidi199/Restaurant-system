import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function DiscountCardsMain() {
                 const { t: autoT } = useAutoTranslation();
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
        <h2 className="text-xl font-bold">{autoT("legacy.discount_cards_c143a249")}</h2>

        <button
          onClick={() => navigate("/admin/dashboard/create-discount-cards")}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          {autoT("legacy.create_discount_card_c29e4d2c")}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">{autoT("legacy.card_name_0f5975c9")}</th>
              <th className="p-3 text-left">{autoT("legacy.card_number_b5e9a5e8")}</th>
              <th className="p-3 text-left">{autoT("table.customer")}</th>
              <th className="p-3 text-left">{autoT("legacy.discount_0cd95d41")}</th>
              <th className="p-3 text-left">{autoT("table.status")}</th>
              <th className="p-3 text-left">{autoT("legacy.valid_until_a144230d")}</th>
              <th className="p-3 text-left">{autoT("legacy.usage_0bb18642")}</th>
              <th className="p-3 text-center">{autoT("inventory_manager.common.action")}</th>
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
                    {autoT("inventory_manager.common.details")}
                  </button>
                </td>
              </tr>
            ))}

            {discountCards.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  {autoT("legacy.no_discount_cards_found_09ae5411")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
