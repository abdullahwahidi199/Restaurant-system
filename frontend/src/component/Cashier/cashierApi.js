 import axios from "axios";

const API_BASE = "http://127.0.0.1:8000"; // adjust if using another host

export const getOrders = async ()=>{
  const res =  await axios.get(`${API_BASE}/orders/cashier/orders/`);
  console.log(res)
  console.log(res.data)
  return res.data;
  
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await axios.patch(`${API_BASE}/orders/${orderId}/update_status/`, {
    status,
  });
  return res.data;
};

export const assignDeliveryPerson = async (orderId, deliveryPerson) => {
  const res = await axios.patch(`${API_BASE}/orders/${orderId}/assign-delivery/`, {
    delivery_person: deliveryPerson,
  });
  return res.data;
};
