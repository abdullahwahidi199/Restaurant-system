import { useCallback, useEffect, useRef, useState } from "react";
// import OrderStats from "./OrderStats";
import OrderStats from "../../Admin/order/OrderStats";
import OrderFilters from "../../Admin/order/OrderFilters";
import OrderPeriodBar from "../../Admin/order/OrderPeriodBar";
import OrdersTable from "../../Admin/order/OrdersTable";
import OrderDetailsModal from "../../Admin/order/OrderDetailsModal";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import OrderCancellationToast from "../../OrderCancellationToast";
import PaginationControls from "../../ui/PaginationControls";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import {
  freshestOrderSnapshot,
  reconcileOrderSnapshots,
  upsertOrderSnapshot,
} from "../../../utils/orderSnapshot";
import { getOrderPeriodRange } from "../../Admin/order/orderPeriod";

export default function ManagerOrderBase() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0 });
  const [period, setPeriod] = useState(() => getOrderPeriodRange("today"));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const latestSnapshotsRef = useRef(new Map());
  const socketRevisionRef = useRef(0);
  const requestSequenceRef = useRef(0);
  const fetchOrdersRef = useRef(null);
  const pageRef = useRef(1);
  const liveRefreshTimerRef = useRef(null);
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const fetchOrders = async (pageNumber = 1, requestedPeriod = period) => {
    const requestSequence = ++requestSequenceRef.current;
    const revisionAtStart = socketRevisionRef.current;
    // ensure it's always a number
    const page = typeof pageNumber === "number" ? pageNumber : 1;

    const queryParams = {
      ...filters,
      page,
    };
    if (requestedPeriod.start && requestedPeriod.end) {
      queryParams.start_date = requestedPeriod.start;
      queryParams.end_date = requestedPeriod.end;
    }
    const query = new URLSearchParams(queryParams).toString();

    const res = await instance.get(`/orders/orders/?${query}`);
    const incomingOrders = res.data.results || [];
    if (requestSequence !== requestSequenceRef.current) return;

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
    setSummary(res.data.summary || {
      total: res.data.count,
      pending: incomingOrders.filter((order) => order.status === "pending").length,
      completed: incomingOrders.filter((order) => order.status === "completed").length,
    });
    setPage(page);
    pageRef.current = page;
    setTotalPages(Math.ceil(res.data.count / 10));
  };
  fetchOrdersRef.current = fetchOrders;

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

    window.clearTimeout(liveRefreshTimerRef.current);
    liveRefreshTimerRef.current = window.setTimeout(() => {
      fetchOrdersRef.current?.(pageRef.current);
    }, 250);
  }, []);
  useOrdersSocket(handleWsMessage, () => fetchOrdersRef.current?.(pageRef.current));
  useEffect(() => {
    fetchOrdersRef.current?.(1);
    return () => window.clearTimeout(liveRefreshTimerRef.current);
    // Fetch once on mount; current callbacks are read from refs.
  }, []);

  const handlePeriodApply = (nextPeriod) => {
    setPeriod(nextPeriod);
    fetchOrders(1, nextPeriod);
  };

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
      value: summary.total,
      icon: <ClipboardList className="h-5 w-5 text-[var(--theme-info)]" />,
    },
    {
      label: t("stats.pending"),
      value: summary.pending,
      icon: <Clock className="h-5 w-5 text-[var(--theme-warning)]" />,
    },
    {
      label: t("stats.completed"),
      value: summary.completed,
      icon: <CheckCircle className="h-5 w-5 text-[var(--theme-success)]" />,
    },
  ];

  return (
    <div
      className="space-y-4"
      dir={i18n.language === "fa" || i18n.language === "ps" ? "rtl" : "ltr"}
    >
      <PageHeader
        icon={ClipboardList}
        title={t("orders_management")}
        description={t("orders.workspace_description", {
          defaultValue: "Review, filter, and manage orders across every service channel.",
        })}
      />

      <OrderPeriodBar period={period} onApply={handlePeriodApply} />

      <OrderStats stats={stats} />

      <OrderFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={fetchOrders}
      />

      <OrdersTable
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
