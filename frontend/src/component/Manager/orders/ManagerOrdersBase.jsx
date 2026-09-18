import { useCallback, useContext, useEffect, useRef, useState } from "react";
// import OrderStats from "./OrderStats";
import OrderStats from "../../Admin/order/OrderStats";
import OrderFilters from "../../Admin/order/OrderFilters";
import ManagerOrdersTable from "./ManagerOrdersTable";
import OrderDetailsModal from "../../Admin/order/OrderDetailsModal";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import { ClipboardList, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import OrderCancellationToast from "../../OrderCancellationToast";
import { AuthContext } from "../../../api/authforRBC";
import PaginationControls from "../../ui/PaginationControls";
import {
  freshestOrderSnapshot,
  reconcileOrderSnapshots,
  upsertOrderSnapshot,
} from "../../../utils/orderSnapshot";

export default function ManagerOrderBase() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const latestSnapshotsRef = useRef(new Map());
  const socketRevisionRef = useRef(0);
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const fetchOrders = async (pageNumber = 1) => {
    const revisionAtStart = socketRevisionRef.current;
    // ensure it's always a number
    const page = typeof pageNumber === "number" ? pageNumber : 1;

    let query = new URLSearchParams({
      ...filters,
      page,
    }).toString();

    const res = await instance.get(`/orders/orders/?${query}`);
    const incomingOrders = res.data.results || [];
    for (const incoming of incomingOrders) {
      const id = String(incoming.id);
      latestSnapshotsRef.current.set(
        id,
        freshestOrderSnapshot(latestSnapshotsRef.current.get(id), incoming),
      );
    }

    setOrders((current) =>
      reconcileOrderSnapshots(current, incomingOrders, {
        preserveMissing: socketRevisionRef.current !== revisionAtStart,
      }),
    );
    setCount(res.data.count);
    setPage(page);
    setTotalPages(Math.ceil(res.data.count / 10));
  };

  const handleWsMessage = useCallback((msg) => {
    console.log("WS message received:", msg);

    if (!msg || !msg.order) return;
    const incoming = msg.order;
    socketRevisionRef.current++;
    const id = String(incoming.id);
    const accepted = freshestOrderSnapshot(
      latestSnapshotsRef.current.get(id),
      incoming,
    );
    latestSnapshotsRef.current.set(id, accepted);

    setOrders((prev) => upsertOrderSnapshot(prev, accepted));
    setSelectedOrder((current) =>
      current?.id === accepted.id
        ? freshestOrderSnapshot(current, accepted)
        : current,
    );
  }, []);
  useOrdersSocket(handleWsMessage, () => fetchOrders(page));
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = async (orderId) => {
    try {
      const response = await instance.get(`/orders/orders/${orderId}/`);
      const id = String(response.data.id);
      const incoming = freshestOrderSnapshot(
        latestSnapshotsRef.current.get(id),
        response.data,
      );
      latestSnapshotsRef.current.set(id, incoming);
      setSelectedOrder((current) =>
        current?.id === incoming.id
          ? freshestOrderSnapshot(current, incoming)
          : incoming,
      );
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };
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

      <ManagerOrdersTable
        orders={orders}
        onView={(order) => handleViewOrder(order.id)}
        onCancel={handleCancelClick}
        role={role}
      />

      <PaginationControls
        page={page}
        count={count}
        pageSize={10}
        hasPrevious={page > 1}
        hasNext={page < totalPages}
        onPageChange={fetchOrders}
      />

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
