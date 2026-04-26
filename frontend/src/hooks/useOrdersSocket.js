import { useEffect } from "react";

export default function useOrdersSocket(onMessage) {
  useEffect(() => {
    const socket = new WebSocket("ws://185.197.249.94/ws/orders/");

    socket.onopen = () => console.log("CONNECTED");
    socket.onmessage = (e) => onMessage(JSON.parse(e.data));
    socket.onerror = (e) => console.error("WS ERROR", e);

    return () => socket.close();
  }, []);
}
