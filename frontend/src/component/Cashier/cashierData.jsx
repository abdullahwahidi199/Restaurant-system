// src/pages/cashier/cashierData.js
// Mock data and delivery persons for local development/demo

export const deliveryBoys = [
  { id: "d1", name: "Hamid" },
  { id: "d2", name: "Zara" },
  { id: "d3", name: "Omid" },
];

export const mockOrders = [
  {
    id: "ORD-1001",
    type: "Dine-in",
    table: 5,
    customer: "Ali Rahimi",
    items: [
      { name: "Cheese Burger", qty: 2, price: 6.5 },
      { name: "Fries", qty: 1, price: 2.5 },
    ],
    tax: 0.07,
    status: "Ready", // Pending, In Progress, Ready, Served, Out for Delivery, Completed
    paymentMethod: "Cash",
    createdAt: "2025-10-25T10:12:00",
  },
  {
    id: "ORD-1002",
    type: "Takeaway",
    table: null,
    customer: "Fatima",
    items: [
      { name: "Chicken Wrap", qty: 1, price: 5.0 },
      { name: "Soda", qty: 1, price: 1.5 },
    ],
    tax: 0.07,
    status: "Ready",
    paymentMethod: "Card",
    createdAt: "2025-10-25T10:14:00",
  },
  {
    id: "ORD-1003",
    type: "Online",
    table: null,
    customer: "Delivery - 0700123456",
    items: [{ name: "Margherita Pizza", qty: 1, price: 8.0 }],
    tax: 0.07,
    status: "Pending",
    paymentMethod: "Online",
    createdAt: "2025-10-25T10:20:00",
  },
];