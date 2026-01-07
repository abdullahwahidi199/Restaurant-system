// RestrictedToast.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RestrictedToast({ actionType, duration = 3000, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full bg-gradient-to-r from-yellow-400 to-yellow-300 border-l-4 border-yellow-600 text-yellow-900 px-6 py-4 rounded-lg shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-yellow-900"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p className="text-sm md:text-base font-medium">
              {!actionType? "This action":"Action"} <span className="font-semibold">{actionType}</span> is restricted in demo mode.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
