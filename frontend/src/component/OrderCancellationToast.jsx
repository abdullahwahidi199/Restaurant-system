import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderCancellationToast({
  orderId,
  duration = 4000,
  onConfirm,
  onClose,
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleConfirm = async () => {
    await onConfirm?.(orderId);
    setShow(false);
    onClose?.();
  };

  const handleCancel = () => {
    setShow(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white border-l-4 border-red-500 shadow-2xl rounded-xl overflow-hidden"
        >
          <div className="bg-red-50 px-4 py-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86l-8.2 14.22A2 2 0 003.8 21h16.4a2 2 0 001.71-2.92l-8.2-14.22a2 2 0 00-3.42 0z"
              />
            </svg>

            <p className="font-semibold text-red-700">
              Cancel Order #{orderId}
            </p>
          </div>

          <div className="px-4 py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this order?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-800 text-black hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={handleConfirm}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
