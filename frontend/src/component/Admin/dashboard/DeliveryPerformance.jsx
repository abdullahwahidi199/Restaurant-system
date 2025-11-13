import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Star, DollarSign, Truck } from "lucide-react";

export default function DeliveryPerformance({ data }) {
  if (!data || data.length === 0)
    return <p className="text-gray-500 text-center">No delivery performance data available.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        🚚 Delivery Boys Performance (This Month)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((boy) => (
          <Card
            key={boy.id}
            className="shadow-sm hover:shadow-md transition duration-300 border border-gray-200"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <img
                src={boy.image || "/placeholder.png"}
                alt={boy.name}
                className="w-14 h-14 rounded-full object-cover border"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{boy.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>{boy.deliveries_count || 0} Deliveries</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>
                      {boy.total_revenue
                        ? `Rs ${boy.total_revenue.toLocaleString()}`
                        : "Rs 0"}
                    </span>
                  </div>

                  
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
