import React, { useState, useEffect, useRef, useCallback } from "react";
import instance from "../../../api/axiosInstance";

const DeliveryAssignmentModal = ({
  isOpen,
  onClose,
  order,
  deliveryPersons = [],
  onAssign,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef(null);

  // ── Reset & focus on open ──
  useEffect(() => {
    if (isOpen) {
      setSelectedPersonId(String(order?.delivery_boy || ""));
      setSearchTerm("");
      setCopied(false);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, order]);

  // ── Keyboard shortcuts (Escape / Enter) ──
  const selectedIdRef = useRef(selectedPersonId);
  selectedIdRef.current = selectedPersonId;
  const loadingRef = useRef(isLoading);
  loadingRef.current = isLoading;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && selectedIdRef.current && !loadingRef.current) {
        document.getElementById("btn-send-whatsapp")?.click();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  // ── Helpers ──
  const filteredPersons = deliveryPersons.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  });

  const selectedPerson = deliveryPersons.find(
    (p) => String(p.id) === String(selectedPersonId),
  );

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const buildMessage = useCallback(() => {
    const greeting = selectedPerson?.name
      ? `Hi ${selectedPerson.name},`
      : "Hi,";

    let itemsText = "";
    if (order.items?.length > 0) {
      itemsText =
        "\n\n*Items:*\n" +
        order.items
          .map(
            (it, i) =>
              `${i + 1}. ${it.name || it.product_name || "Item"} x${
                it.quantity || 1
              }`,
          )
          .join("\n");
    }

    const total = order.total || order.amount || order.grand_total;
    const payment = order.payment_status || order.payment_method || "Pending";

    let msg = `${greeting}

🚚 *New Delivery Assignment*

*Order #:* ${order.order_number}
*Customer:* ${order.name}
*Phone:* ${order.phone}
*Address:* ${order.address}${itemsText}

💰 *Total:* AFN${total || "N/A"}
💳 *Payment:* ${payment}`;

    if (order.notes || order.delivery_note) {
      msg += `\n📝 *Note:* ${order.notes || order.delivery_note}`;
    }

    if (order.latitude && order.longitude) {
      const map = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
      msg += `\n\n📍 *Location:* ${map}`;
    }

    msg += `\n\nPlease confirm once delivered.`;
    return msg;
  }, [order, selectedPerson]);

  // ── API call ──
  const assignOnBackend = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.patch(
        `/orders/orders/${order.id}/assign-delivery/`,
        { delivery_person_id: selectedPersonId },
      );
      return data;
    } catch (err) {
      console.error(err);
      alert("❌ Assignment failed. Order was NOT sent to delivery boy.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Actions ──
  const handleAssignOnly = async () => {
    const data = await assignOnBackend();
    if (data) {
      onAssign(data);
      onClose();
    }
  };

  const handleSendAndAssign = async () => {
    if (!selectedPerson) {
      alert("Please select a delivery person");
      return;
    }
    if (!selectedPerson.phone) {
      alert("Selected delivery person has no phone number");
      return;
    }

    // 1. Save first — only message if DB succeeds
    const data = await assignOnBackend();
    if (!data) return;

    // 2. Open WhatsApp
    const phone = selectedPerson.phone.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      buildMessage(),
    )}`;
    window.open(url, "_blank");

    // 3. Close modal
    onAssign(data);
    onClose();
  };

  const handleCopy = async () => {
    if (!selectedPerson) {
      alert("Select a delivery boy first");
      return;
    }
    try {
      await navigator.clipboard.writeText(buildMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {order.delivery_boy ? "🔄 Reassign Order" : "🚚 Assign Order"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              #{order.order_number} • {order.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {/* Search */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search name or phone..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Delivery Boy Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {filteredPersons.map((person) => {
              const active = String(selectedPersonId) === String(person.id);
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPersonId(String(person.id))}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                    active
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      active
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {getInitials(person.name)}
                  </div>
                  <span className="text-sm font-semibold leading-tight">
                    {person.name}
                  </span>
                  <span className="text-xs opacity-80 mt-0.5">
                    {person.phone}
                  </span>
                </button>
              );
            })}

            {filteredPersons.length === 0 && (
              <div className="col-span-2 text-center text-sm text-gray-400 py-6">
                No delivery boys found
              </div>
            )}
          </div>

          {/* Message Preview */}
          {selectedPerson && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  WhatsApp Preview
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium text-green-700 hover:text-green-900"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
                {buildMessage()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="grid ">
            <button
              id="btn-send-whatsapp"
              onClick={handleSendAndAssign}
              disabled={!selectedPersonId || isLoading}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold text-white shadow transition flex items-center justify-center gap-2 ${
                !selectedPersonId || isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send & Assign
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            <kbd className="font-sans bg-gray-200 px-1 rounded">Enter</kbd> to
            send &nbsp;•&nbsp;{" "}
            <kbd className="font-sans bg-gray-200 px-1 rounded">Esc</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAssignmentModal;
