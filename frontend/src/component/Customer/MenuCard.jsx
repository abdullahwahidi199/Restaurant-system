import React from "react";
import { motion } from "framer-motion";

export default function MenuCard({ item, onClick }) {
    // console.log(item)
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden cursor-pointer 
                 shadow-lg hover:shadow-red-600/40 transition-all duration-300 group border border-gray-800"
        >
            <div className="relative overflow-hidden">
                <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-80"></div>
            </div>

            <div className="p-5 text-center">
                <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-red-400 transition-colors">
                    {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                <p className="text-red-500 text-lg font-bold">{item.price}</p>
            </div>
        </motion.div>
    );
}