import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../api/authforRBC";

export default function useDiscountSocket(onMessage) {
  const { auth } = useContext(AuthContext);
  const restaurantId = auth?.user?.restaurant_id;

  const socketRef = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;
    if (socketRef.current) return; // prevent duplicate connections

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/discounts/${restaurantId}/`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("DISCOUNT SOCKET CONNECTED");
    };

    socket.onmessage = (event) => {
      onMessage?.(JSON.parse(event.data));
    };

    socket.onerror = (err) => {
      console.error("DISCOUNT SOCKET ERROR", err);
    };

    socket.onclose = () => {
      console.log("DISCOUNT SOCKET CLOSED");
      socketRef.current = null;
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [restaurantId, onMessage]);
}
