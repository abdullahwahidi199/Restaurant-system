import { useCallback, useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import instance from "../../api/axiosInstance";
import useOrdersSocket from "../../hooks/useOrdersSocket";
import { AuthContext } from "../../api/authforRBC";
import OrderDetailSidebar from "./OrderDetailSidebar";
import CompactOrderCard from "./CompactOrderCard";
import { UtensilsCrossed, Package } from "lucide-react";
import notification from "../../assets/sounds/notification.mp3";

export default function KitchenHomepage() {
  const [orders, setOrders] = useState([]);
  const { orderSearch = "" } = useOutletContext() || {};
  const search = orderSearch;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);
  const userStationIds = auth?.user?.staff_profile?.stations || [];

  const activeStatusTab = "all";
  const [selectedOrder, setSelectedOrder] = useState(null);

  const playOrderNotification = useCallback(() => {
    const audio = new Audio(notification);
    audio.play().catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await instance.get("/orders/kitchen-orders/", {
        params: {
          status: activeStatusTab,
          search: search || undefined,
        },
      });
      setOrders(res.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatusTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();
    return (
      order.name?.toLowerCase().includes(query) ||
      order.tableName?.toLowerCase().includes(query) ||
      order.order_number?.toString().includes(query)
    );
  });
  const selectOrder = (orderToSelect) => {
    // If items are missing or empty, fetch fresh data from backend
    if (!orderToSelect?.items?.length) {
      setLoading(true); // optional: show loading in sidebar
      instance
        .get(`/orders/orders/${orderToSelect.id}/`)
        .then((res) => {
          setSelectedOrder(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch order details", err);
          setSelectedOrder(orderToSelect); // fallback
        })
        .finally(() => setLoading(false));
    } else {
      setSelectedOrder(orderToSelect);
    }
  };

  // 1️⃣ Safe string-matching helper to check if an item belongs to this Kitchen Manager's station(s):
  const isItemForMyStation = (item) => {
    if (!userStationIds.length) return true; // Admin or restaurant-wide access
    return userStationIds.some((id) => String(id) === String(item.station_id));
  };

  const filterOrderForMyStations = (incomingOrder) => {
    if (!userStationIds.length) return incomingOrder;
    const relevantItems = (incomingOrder.items || []).filter(
      isItemForMyStation,
    );
    if (!relevantItems.length) return null;
    return {
      ...incomingOrder,
      items: relevantItems,
    };
  };

  const handleMessage = (msg) => {
    console.log("SOCKET MESSAGE:", msg);
    if (!msg?.type) return;

    const payload = msg.message ?? msg;
    const type = payload.type ?? msg.type;

    /* =========================
       NEW ORDER
    ========================= */
    if (type === "NEW_ORDER") {
      let incoming = payload.order || payload.message?.order;
      if (!incoming?.id) return;

      // 🔥 FILTER ITEMS FOR MY STATION:
      incoming = filterOrderForMyStations(incoming);
      if (!incoming) return; // Ignore order if 0 items belong to our station

      const isNewPanelOrder = !orders.some((order) => order.id === incoming.id);
      if (isNewPanelOrder) {
        playOrderNotification();
      }

      setOrders((prev) => {
        const exists = prev.some((o) => o.id === incoming.id);
        if (exists) {
          return prev.map((o) => (o.id === incoming.id ? incoming : o));
        }
        return [incoming, ...prev];
      });

      if (selectedOrder?.id === incoming.id) {
        setSelectedOrder(incoming);
      }
    }

    /* =========================
       ITEM CREATED / UPDATED
    ========================= */
    if (type === "ITEM_CREATED" || type === "ITEM_UPDATED") {
      const { order_id, item } = payload;
      if (!order_id || !item?.id) return;

      // 🔥 CRITICAL: IF THIS ITEM BELONGS TO ANOTHER STATION, EXIT IMMEDIATELY:
      if (!isItemForMyStation(item)) {
        return; // Do NOT execute setOrders or add it to this station screen!
      }

      if (type === "ITEM_CREATED") {
        playOrderNotification();
      }

      setOrders((prevOrders) => {
        const index = prevOrders.findIndex((o) => o.id === order_id);

        // Order doesn't exist in our list yet:
        if (index === -1) {
          instance.get(`/orders/orders/${order_id}/`).then((res) => {
            let fresh = res.data;
            // 🔥 FILTER FRESH ORDER ITEMS SO WE DON'T LEAK ITEMS FROM OTHER STATIONS:
            if (userStationIds.length > 0) {
              const matchingItems = (fresh.items || []).filter(
                isItemForMyStation,
              );
              if (matchingItems.length === 0) return;
              fresh = { ...fresh, items: matchingItems };
            }
            setOrders((p) => [fresh, ...p.filter((o) => o.id !== order_id)]);

            if (selectedOrder?.id === order_id) {
              setSelectedOrder(fresh);
            }
          });
          return prevOrders;
        }

        // Order exists - update items:
        const currentOrder = prevOrders[index];
        const currentItems = currentOrder.items || [];

        const updatedItems = currentItems.some((i) => i.id === item.id)
          ? currentItems.map((i) => (i.id === item.id ? item : i))
          : [...currentItems, item];

        const updatedOrder = {
          ...currentOrder,
          items: updatedItems,
          total: currentOrder.total,
          updated_at: new Date().toISOString(),
        };

        const newOrders = [...prevOrders];
        newOrders[index] = updatedOrder;

        if (selectedOrder?.id === order_id) {
          setSelectedOrder(updatedOrder);
        }

        return newOrders;
      });
    }

    /* =========================
       ITEM DELETED
    ========================= */
    if (type === "ITEM_DELETED") {
      const { order_id, item_id } = payload;
      if (!order_id || !item_id) return;

      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== order_id) return order;
          return {
            ...order,
            items: (order.items || []).filter((i) => i.id !== item_id),
          };
        }),
      );
      return;
    }

    /* =========================
       TABLE UPDATED
    ========================= */
    if (type === "TABLE_UPDATED") {
      const updatedTable = payload.table;
      if (!updatedTable?.id) return;

      setOrders((prev) =>
        prev.map((order) =>
          order.table === updatedTable.id
            ? {
                ...order,
                tableName: updatedTable.name,
                table: updatedTable.id,
              }
            : order,
        ),
      );
      return;
    }
  };

  useOrdersSocket(handleMessage);

  // Keep sidebar always in sync with latest order data
  useEffect(() => {
    if (!selectedOrder?.id) return;

    const latest = orders.find((o) => o.id === selectedOrder.id);

    if (
      latest &&
      JSON.stringify(latest.items) !== JSON.stringify(selectedOrder.items)
    ) {
      setSelectedOrder(latest);
    }
  }, [orders, selectedOrder?.id, selectedOrder?.items]);

  const handleOrderPrinted = (orderId, printedIds) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                printedIds.includes(item.id)
                  ? { ...item, is_printed_to_kitchen: true }
                  : item,
              ),
            }
          : order,
      ),
    );

    setSelectedOrder((prev) =>
      prev?.id === orderId
        ? {
            ...prev,
            items: prev.items.map((item) =>
              printedIds.includes(item.id)
                ? { ...item, is_printed_to_kitchen: true }
                : item,
            ),
          }
        : prev,
    );
  };
  const dineInOrders = filteredOrders.filter(
    (order) => order.order_type === "dine-in",
  );
  const takeawayDeliveryOrders = filteredOrders.filter(
    (order) =>
      order.order_type === "takeaway" || order.order_type === "delivery",
  );

  // ✅ Count new items per section for badges
  const hasNewItems = (order) =>
    order.items?.some(
      (i) =>
        i.is_new === true &&
        (i.status === "pending" || i.status === "approved"),
    );

  const dineInNewCount = dineInOrders.filter(hasNewItems).length;
  const takeawayNewCount = takeawayDeliveryOrders.filter(hasNewItems).length;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50 overflow-hidden xl:h-[calc(100vh-3rem)]">
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          selectedOrder ? "mr-96" : ""
        }`}
      >
        {/* Split Screen */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dine-In Section - Top 50% */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Dine-In</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {dineInOrders.length}
                </span>
                {dineInNewCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
                    {dineInNewCount} new
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {dineInOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No dine-in orders found.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dineInOrders.map((order) => (
                    <CompactOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => selectOrder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 🔥 CLEAR VISIBLE DIVIDER */}
          <div className="relative h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md flex-shrink-0">
            <div className="absolute inset-x-0 -top-px h-px bg-white/40"></div>
            <div className="absolute inset-x-0 -bottom-px h-px bg-black/10"></div>
          </div>

          {/* Takeaway & Delivery Section - Bottom 50% */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Takeaway & Delivery
                </h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {takeawayDeliveryOrders.length}
                </span>
                {takeawayNewCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
                    {takeawayNewCount} new
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {takeawayDeliveryOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No takeaway or delivery orders found.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {takeawayDeliveryOrders.map((order) => (
                    <CompactOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => selectOrder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {selectedOrder && (
        <OrderDetailSidebar
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderPrinted={handleOrderPrinted}
        />
      )}
    </div>
  );
}
