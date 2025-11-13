 import axios from "axios";
import instance from "../../api/axiosInstance";



export const getOrders = async ()=>{
  const res =  await instance.get(`/orders/cashier/orders/`);
  console.log(res)
  console.log(res.data)
  return res.data;
  
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await instance.patch(`/orders/${orderId}/update_status/`, {
    status,
  });
  return res.data;
};

export const assignDeliveryPerson = async (orderId, deliveryPerson) => {
  const res = await instance.patch(`/orders/${orderId}/assign-delivery/`, {
    delivery_person: deliveryPerson,
  });
  return res.data;
};
