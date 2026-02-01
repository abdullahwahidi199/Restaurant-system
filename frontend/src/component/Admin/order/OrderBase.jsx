import { useEffect, useState } from "react";
import OrderStats from "./OrderStats";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsModal from "./OrderDetailsModal";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import { ClipboardList, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const {t}=useTranslation()
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

  const handleWsMessage = (msg) => {
    // msg: { type, action, order }
     console.log("WS message received:", msg);
    if (!msg || !msg.order) return;
    const incoming = msg.order;
    setOrders((prev) => {
      // if order exists, replace; else add to top
      const idx = prev.findIndex((o) => o.id === incoming.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = incoming;
        return copy;
      } else {
        return [incoming, ...prev];
      }
    });
  };
  useOrdersSocket(handleWsMessage);
  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = [
    {
      label: t("stats.total_orders"),
      value: orders.length,
      icon: <ClipboardList className="w-8 h-8 text-blue-500" />
    },
    {
      label: t("stats.pending"),
      value: orders.filter(o => o.status === "pending").length,
      icon: <Clock className="w-8 h-8 text-yellow-500" />
    },
    {
      label: t("stats.completed"),
      value: orders.filter(o => o.status === "completed").length,
      icon: <CheckCircle className="w-8 h-8 text-green-500" />
    },
    {
      label: t("stats.revenue"),
      value: orders.reduce((sum, o) => sum + o.total, 0),
      icon: <DollarSign className="w-8 h-8 text-purple-500" />
    }
  ];

  return (
    <div
      className="p-4 space-y-4"
      dir={i18n.language === "fa" || i18n.language === "ps" ? "rtl" : "ltr"}
    >
      <h1 className="text-2xl font-bold">{t("orders_management")}</h1>

      <OrderStats stats={stats} />

      <OrderFilters filters={filters} setFilters={setFilters} onSearch={fetchOrders} />

      <OrdersTable orders={orders} onView={(order) => setSelectedOrder(order)} />

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
