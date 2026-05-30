// import { useContext, useEffect, useRef } from "react";
// import { AuthContext } from "../api/authforRBC";

// export default function useOrdersSocket(onMessage) {
//   const { auth } = useContext(AuthContext);

//   const restaurantId = auth?.user?.restaurant_id;

//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (socketRef.current) return; // prevent duplicate connections

//     const socket = new WebSocket(
//       `wss://pakhlai.com/ws/orders/${restaurantId}/`,
//       // `ws://127.0.0.1:8000/ws/orders/${restaurantId}/`,
//     );

//     socketRef.current = socket;

//     socket.onopen = () => console.log("CONNECTED");
//     socket.onmessage = (e) => onMessage(JSON.parse(e.data));
//     socket.onerror = (e) => console.error("WS ERROR", e);

//     return () => {
//       if (socket.readyState === WebSocket.OPEN) {
//         socket.close();
//         socketRef.current = null;
//       }
//     };
//   }, [restaurantId, onMessage]);
// }

import { useContext, useEffect, useRef, useCallback } from "react";
import { AuthContext } from "../api/authforRBC";

export default function useOrdersSocket(onMessage) {
  const { auth } = useContext(AuthContext);
  const restaurantId = auth?.user?.restaurant_id;
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10;
  const heartbeatIntervalRef = useRef(null);

  const connect = useCallback(() => {
    // 🔥 Kill dead socket FIRST
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (!restaurantId) return;

    const socket = new WebSocket(
      `wss://pakhlai.com/ws/orders/${restaurantId}/`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WS CONNECTED");
      retryCountRef.current = 0; // reset on success

      // 💓 Heartbeat every 25s (beats typical 30s proxy timeout)
      heartbeatIntervalRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "pong") return; // ignore pong
      onMessage(data);
    };

    socket.onerror = (e) => {
      console.error("❌ WS ERROR", e);
    };

    // 🔑 THIS IS THE KEY — detect dead connection
    socket.onclose = (e) => {
      console.log(`🔌 WS CLOSED code=${e.code} reason=${e.reason}`);
      clearInterval(heartbeatIntervalRef.current);

      socketRef.current = null;

      // Auto-reconnect with exponential backoff
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          30000,
        );
        console.log(
          `🔄 Reconnecting in ${delay}ms (attempt ${retryCountRef.current + 1})`,
        );
        reconnectTimerRef.current = setTimeout(() => {
          retryCountRef.current++;
          connect();
        }, delay);
      }
    };
  }, [restaurantId, onMessage]);

  useEffect(() => {
    connect();

    // 🔥 Visibility API: reconnect when user comes back to tab
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      ) {
        console.log("👁 Tab visible — forcing reconnect");
        retryCountRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(reconnectTimerRef.current);
      clearInterval(heartbeatIntervalRef.current);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [connect]);
}
