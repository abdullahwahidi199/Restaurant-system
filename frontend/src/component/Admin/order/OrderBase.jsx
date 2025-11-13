import { useEffect, useState } from "react";
import OrderStats from "./OrderStats";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsModal from "./OrderDetailsModal";
import instance from "../../../api/axiosInstance";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const fetchOrders = async () => {
    let query = new URLSearchParams(filters).toString();
    const res = await instance.get(`/orders/orders/?${query}`);
    const data = res.data
    setOrders(data);
    console.log(data)
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = [
    { label: "Total Orders", value: orders.length },
    { label: "Pending", value: orders.filter(o => o.status === "pending").length },
    { label: "Completed", value: orders.filter(o => o.status === "completed").length },
    { label: "Revenue (AFN)", value: orders.reduce((sum, o) => sum + o.total, 0) },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Orders Management</h1>

      <OrderStats stats={stats} />

      <OrderFilters filters={filters} setFilters={setFilters} onSearch={fetchOrders} />

      <OrdersTable orders={orders} onView={(order) => setSelectedOrder(order)} />

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
