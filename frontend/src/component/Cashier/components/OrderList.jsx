// src/pages/cashier/components/OrderList.jsx
import React from "react";
import OrderCard from "./OrderCard";

const OrderList = ({ orders = [], onViewDetails, onPrintBill, onAssignDelivery }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">
                No orders found for the selected filters.
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => (
                <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={onViewDetails}
                    onPrintBill={onPrintBill}
                    onAssignDelivery={onAssignDelivery}
                />
            ))}
        </div>
    );
};

export default OrderList;