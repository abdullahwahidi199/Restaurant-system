import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../api/authforRBC";

export default function useOrdersSocket(onMessage) {
  const { auth } = useContext(AuthContext);

  const restaurantId = auth?.user?.restaurant_id;

  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) return; // prevent duplicate connections

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/orders/${restaurantId}/`,
    );

    socketRef.current = socket;

    socket.onopen = () => console.log("CONNECTED");
    socket.onmessage = (e) => onMessage(JSON.parse(e.data));
    socket.onerror = (e) => console.error("WS ERROR", e);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
        socketRef.current = null;
      }
    };
  }, [restaurantId, onMessage]);
}
