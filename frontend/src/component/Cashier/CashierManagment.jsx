// src/pages/cashier/CashierManagement.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import DeliveryAssignmentModal from "./components/DeliveryAssignmentModal";
import OrderDetailsModal from "./components/OrderDetailsModal";
import BillPrintModal from "./components/BillPrintModal";
import FilterBar from "./components/FilterBar";
import OrderList from "./components/OrderList";
// import { deliveryBoys } from "./cashierData";
import { getOrders, updateOrderStatus, assignDeliveryPerson } from "./cashierApi";
import toast from "react-hot-toast";
import instance from "../../api/axiosInstance";

const STATUS_COLORS = {
  pending: "bg-yellow-200 text-yellow-800",
  in_progress: "bg-blue-200 text-blue-800",
  ready: "bg-green-200 text-green-800",
  served: "bg-indigo-200 text-indigo-800",
  out_for_delivery: "bg-purple-200 text-purple-800",
  completed: "bg-gray-200 text-gray-800",
  assigned: "bg-green-200 text-green-800",
};

const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS["pending"];
  if (String(status).startsWith("Assigned to")) return STATUS_COLORS["assigned"];
  return STATUS_COLORS[status] || "bg-gray-200 text-gray-800";
};

const defaultFilters = {
  search: "",
  type: "",
  status: "",
  date: "",
};

const CashierManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isPrintOpen, setPrintOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [deliveryBoys,setDeliveryBoys]=useState([])

  // load orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchOrders error:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handlers
  const handleOpenDetails = useCallback((order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleOpenAssignModal = useCallback((order) => {
    setSelectedOrder(order);
    setDeliveryModalOpen(true);
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    setDeliveryModalOpen(false);
    setSelectedOrder(null);
  }, []);

  // assign delivery — uses assignDeliveryPerson API and replaces order with returned object
  const handleAssignDelivery = useCallback(
    async (orderId, deliveryPersonName) => {
      try {
        const updated = await assignDeliveryPerson(orderId, deliveryPersonName);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        // if selected order is same, update it too
        setSelectedOrder((prev) => (prev?.id === updated.id ? updated : prev));
        toast.success(`Assigned to ${deliveryPersonName}`);
      } catch (err) {
        console.error("assignDelivery error:", err);
        toast.error("Failed to assign delivery person");
      }
    },
    []
  );

  // mark completed — sends backend value 'completed'
  const handleMarkCompleted = useCallback(
    async (orderId) => {
      try {
        const updated = await updateOrderStatus(orderId, "completed");
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setSelectedOrder((prev) => (prev?.id === updated.id ? updated : prev));
        toast.success("Order marked as completed");
      } catch (err) {
        console.error("markCompleted error:", err);
        toast.error("Failed to update order status");
      }
    },
    []
  );

  const handlePrintBill = useCallback((order) => {
    setSelectedOrder(order);
    
    setPrintOpen(true);
  }, []);

  const handleRemoveOrderLocally = useCallback((orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setSelectedOrder((prev) => (prev?.id === orderId ? null : prev));
    setDetailsOpen(false);
    setDeliveryModalOpen(false);
    setPrintOpen(false);
  }, []);

  // Filtering - client-side (keeps types/status/date/search UI)
  const filteredOrders = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    return orders.filter((o) => {
      // search by id or customer name or phone
      if (q) {
        const idMatch = String(o.id).toLowerCase().includes(q);
        const name = (o.name || o.customer || o.customer_name || "").toString().toLowerCase();
        const phone = (o.phone || "").toString().toLowerCase();
        if (!idMatch && !name.includes(q) && !phone.includes(q)) return false;
      }

      if (filters.type) {
        if ((o.order_type || "").toString() !== filters.type) return false;
      }

      if (filters.status) {
        if ((o.status || "").toString() !== filters.status) return false;
      }

      if (filters.date) {
        const created = (o.created_at || o.createdAt || "").slice(0, 10);
        if (created !== filters.date) return false;
      }

      return true;
    });
  }, [orders, filters]);

 
  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => {
      // prefer serializer total if present
      if (o.total !== undefined && o.total !== null) return sum + parseFloat(o.total || 0);
      // otherwise compute from items
      const items = o.items || [];
      const orderSum = items.reduce((s, it) => {
        const qty = it.quantity ?? it.qty ?? 0;
        const price = it.item_price ?? it.price ?? (it.menu_item?.price ?? 0);
        return s + qty * price;
      }, 0);
      return sum + orderSum;
    }, 0);
    const statusCount = orders.reduce((acc, o) => {
      const st = o.status || "unknown";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
    return { totalOrders, totalRevenue, statusCount };
  }, [orders]);

  // keyboard: close modals on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDeliveryModalOpen(false);
        setDetailsOpen(false);
        setPrintOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const getDeliveryBoys=async()=>{
    const response=await instance.get(`/users/deliveryBoys/`)
    const data=response.data
    console.log(data)
    setDeliveryBoys(data)
  }

  useEffect(()=>{
    getDeliveryBoys()
  },[])
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Cashier — Orders</h1>


        <FilterBar filters={filters} setFilters={setFilters} />

        {loading ? (
          <div className="text-center text-gray-600 mt-10">Loading orders...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrderList
                orders={filteredOrders}
                onViewDetails={handleOpenDetails}
                onPrintBill={handlePrintBill}
                onAssignDelivery={handleOpenAssignModal}
              />
            </div>

            <aside className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Orders Summary</h2>

              <p className="text-gray-700 mb-2">
                Total Orders: <span className="font-medium">{summary.totalOrders}</span>
              </p>
              <p className="text-gray-700 mb-2">
                Total Revenue: <span className="font-medium">{summary.totalRevenue.toFixed(2)} AFN</span>
              </p>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">By Status</h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(summary.statusCount).length === 0 ? (
                    <div className="text-gray-500">No orders yet</div>
                  ) : (
                    Object.entries(summary.statusCount).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                          {/** show display-friendly label if present on any order */}
                          {status}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button onClick={fetchOrders} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                  Refresh Orders
                </button>

                <button onClick={() => setFilters(defaultFilters)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition">
                  Reset Filters
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Modals */}
      {isDeliveryModalOpen && selectedOrder && (
        <DeliveryAssignmentModal
          isOpen={isDeliveryModalOpen}
          onClose={handleCloseAssignModal}
          order={selectedOrder}
          deliveryPersons={deliveryBoys}
          onAssign={handleAssignDelivery}
        />
      )}

      {isDetailsOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseDetails}
          onPrintBill={handlePrintBill}
          onAssignDelivery={handleOpenAssignModal}
          onMarkCompleted={handleMarkCompleted}
        />
      )}

      {isPrintOpen && selectedOrder && <BillPrintModal order={selectedOrder} onClose={() => setPrintOpen(false)} />}
    </div>
  );
};

export default CashierManagement;
