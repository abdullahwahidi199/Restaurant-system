import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../api/authforRBC";

export default function useOrdersSocket(onMessage) {
  const { auth } = useContext(AuthContext);
  const restaurantId = auth?.user?.restaurant_id;
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const retryCountRef = useRef(0);
  const isCleanedUp = useRef(false);

  // 1️⃣ Store latest onMessage callback in a ref so socket.onmessage always calls the newest function without reconnecting!
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!restaurantId) return;
    isCleanedUp.current = false;

    const connect = () => {
      if (isCleanedUp.current) return;

      console.log("🔗 Connecting to WS...");
      const socket = new WebSocket(
        // `ws://127.0.0.1:8001/ws/orders/${restaurantId}/`,
        `wss://pakhlai.com/ws/orders/${restaurantId}/`,
        // `ws://10.10.10.216:8001/ws/orders/${restaurantId}/`,
      );

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WS OPEN");
        retryCountRef.current = 0;

        // Heartbeat every 20s
        heartbeatRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 20000);
      };

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "pong" || data.type === "connection") return;
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error("WS Parse Error:", err);
        }
      };

      socket.onerror = (e) => {
        console.error("❌ WS ERROR", e);
      };

      socket.onclose = (e) => {
        console.log(`🔌 CLOSED code=${e.code}`);
        clearInterval(heartbeatRef.current);

        if (isCleanedUp.current) return;
        socketRef.current = null;

        // Exponential backoff: 2s, 4s, 8s, max 30s
        const delay = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          30000,
        );
        reconnectTimerRef.current = setTimeout(() => {
          retryCountRef.current++;
          connect();
        }, delay);
      };
    };

    connect();

    // 2️⃣ Reconnect when tab becomes visible after sleep
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        (!socketRef.current ||
          socketRef.current.readyState === WebSocket.CLOSED)
      ) {
        console.log("👁 Visible — reconnect");
        retryCountRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCleanedUp.current = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(reconnectTimerRef.current);
      clearInterval(heartbeatRef.current);

      if (socketRef.current) {
        const s = socketRef.current;
        socketRef.current = null;
        s.onclose = null; // Prevent unmounted socket from scheduling reconnect
        s.onerror = null;

        // 3️⃣ Prevent "closed before connection established" warning in React StrictMode:
        if (s.readyState === WebSocket.CONNECTING) {
          s.onopen = () => s.close(1000, "Clean Unmount");
        } else if (s.readyState === WebSocket.OPEN) {
          s.close(1000, "Clean Unmount");
        }
      }
    };
  }, [restaurantId]);
}
