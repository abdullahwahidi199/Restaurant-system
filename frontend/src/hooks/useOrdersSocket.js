import { useEffect } from "react";

export default function useOrdersSocket(onMessage) {
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/orders/");

    socket.onopen = () => console.log("CONNECTED");
    socket.onmessage = (e) => onMessage(JSON.parse(e.data));
    socket.onerror = (e) => console.error("ERROR", e);

    return () => socket.close();
  }, []);
}
