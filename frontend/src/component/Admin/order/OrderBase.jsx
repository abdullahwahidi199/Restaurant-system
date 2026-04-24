import { useContext, useEffect, useState } from "react";
import OrderStats from "./OrderStats";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsModal from "./OrderDetailsModal";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import { ClipboardList, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import OrderCancellationToast from "../../OrderCancellationToast";
import { AuthContext } from "../../../api/authforRBC";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const fetchOrders = async (pageNumber = 1) => {
    // ensure it's always a number
    const page = typeof pageNumber === "number" ? pageNumber : 1;

    let query = new URLSearchParams({
      ...filters,
      page,
    }).toString();

    const res = await instance.get(`/orders/orders/?${query}`);

    setOrders(res.data.results);
    setCount(res.data.count);
    setPage(page);
    setTotalPages(Math.ceil(res.data.count / 10));
  };

  const handleWsMessage = (msg) => {
    console.log("WS message received:", msg);

    if (!msg || !msg.order) return;
    const incoming = msg.order;

    setOrders((prev) => {
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

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelToast(true);
  };
  const cancelOrder = async (id) => {
    await instance.patch(`/orders/${id}/cancel/`);
    fetchOrders();
  };

  const stats = [
    {
      label: t("stats.total_orders"),
      value: orders.length,
      icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
    },
    {
      label: t("stats.pending"),
      value: orders.filter((o) => o.status === "pending").length,
      icon: <Clock className="w-8 h-8 text-yellow-500" />,
    },
    {
      label: t("stats.completed"),
      value: orders.filter((o) => o.status === "completed").length,
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    },
  ];

  return (
    <div
      className="p-4 space-y-4"
      dir={i18n.language === "fa" || i18n.language === "ps" ? "rtl" : "ltr"}
    >
      <h1 className="text-2xl font-bold">{t("orders_management")}</h1>

      <OrderStats stats={stats} />

      <OrderFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={fetchOrders}
      />

      <OrdersTable
        orders={orders}
        onView={(order) => setSelectedOrder(order)}
        onCancel={handleCancelClick}
        role={role}
      />

      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={() => fetchOrders(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-medium">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => fetchOrders(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {showCancelToast && (
        <OrderCancellationToast
          orderId={orderToCancel?.id}
          onClose={() => {
            setShowCancelToast(false);
            setOrderToCancel(null);
          }}
          onConfirm={async (id) => {
            await cancelOrder(id);
          }}
        />
      )}
    </div>
  );
}
