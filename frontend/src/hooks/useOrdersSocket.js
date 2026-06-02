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

  // ✅ Stable connect — NO useCallback, NO dependency array issues
  const connect = () => {
    if (isCleanedUp.current) return;
    if (!restaurantId) return;

    // Kill previous dead socket
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    console.log("🔗 Connecting to WS...");

    const socket = new WebSocket(
      `wss://pakhlai.com/ws/orders/${restaurantId}/`,
      // `ws://127.0.0.1:8000/ws/orders/${restaurantId}/`,
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
      const data = JSON.parse(e.data);
      if (data.type === "pong") return;
      onMessage(data);
    };

    socket.onerror = (e) => {
      console.error("❌ WS ERROR", e);
    };

    socket.onclose = (e) => {
      console.log(`🔌 CLOSED code=${e.code}`);
      clearInterval(heartbeatRef.current);

      if (isCleanedUp.current) return;

      socketRef.current = null;

      // ✅ Exponential backoff: 2s, 4s, 8s, 16s, max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
      console.log(
        `⏳ Reconnect in ${delay}ms (attempt ${retryCountRef.current + 1})`,
      );

      reconnectTimerRef.current = setTimeout(() => {
        retryCountRef.current++;
        connect();
      }, delay);
    };
  };

  useEffect(() => {
    isCleanedUp.current = false;
    connect();

    // Tab visibility reconnect
    const handler = () => {
      if (
        document.visibilityState === "visible" &&
        (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      ) {
        console.log("👁 Visible — reconnect");
        retryCountRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", handler);

    return () => {
      isCleanedUp.current = true;
      document.removeEventListener("visibilitychange", handler);
      clearTimeout(reconnectTimerRef.current);
      clearInterval(heartbeatRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [restaurantId]); // ✅ ONLY restaurantId — onMessage passed directly
}
