import React from "react";
import { motion } from "framer-motion";

export default function MenuDetails({ item, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-gray-700"
            >
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-56 object-cover"
                />
                <div className="p-6">
                    <h2 className="text-3xl font-bold mb-2 text-white">{item.name.replace("-"," ")}</h2>
                    {item.description}
                    

                    

                    <p className="text-red-500 text-2xl font-bold mb-6">{item.price}</p>

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}