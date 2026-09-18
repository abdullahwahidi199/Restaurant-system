import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../api/authforRBC";

export default function useOrdersSocket(onMessage, onReconnect) {
  const { auth } = useContext(AuthContext);
  const restaurantId = auth?.user?.restaurant_id;
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const retryCountRef = useRef(0);
  const isCleanedUp = useRef(false);
  const reconnectPendingRef = useRef(false);

  // 1️⃣ Store latest onMessage callback in a ref so socket.onmessage always calls the newest function without reconnecting!
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!restaurantId) return;
    isCleanedUp.current = false;
    retryCountRef.current = 0;
    reconnectPendingRef.current = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current === null) return;
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    };

    const clearHeartbeat = () => {
      if (heartbeatRef.current === null) return;
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    };

    const hasActiveSocket = () => {
      const socket = socketRef.current;
      return Boolean(
        socket &&
        (socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN),
      );
    };

    const scheduleReconnect = () => {
      if (
        isCleanedUp.current ||
        reconnectTimerRef.current !== null ||
        hasActiveSocket()
      ) {
        return;
      }

      reconnectPendingRef.current = true;
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        retryCountRef.current++;
        connect();
      }, delay);
    };

    const connect = () => {
      if (isCleanedUp.current || hasActiveSocket()) return;

      // A visibility-triggered connection supersedes pending backoff.
      clearReconnectTimer();

      console.log("🔗 Connecting to WS...");
      const socket = new WebSocket(
        // `ws://127.0.0.1:8001/ws/orders/${restaurantId}/`,
        `wss://pakhlai.com/ws/orders/${restaurantId}/`,
        // `ws://10.10.10.216:8001/ws/orders/${restaurantId}/`,
      );

      socketRef.current = socket;

      socket.onopen = () => {
        if (isCleanedUp.current || socketRef.current !== socket) {
          socket.close(1000, "Superseded Connection");
          return;
        }

        clearReconnectTimer();
        clearHeartbeat();
        console.log("✅ WS OPEN");
        retryCountRef.current = 0;

        // Heartbeat every 20s
        heartbeatRef.current = setInterval(() => {
          if (
            socketRef.current === socket &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 20000);

        if (reconnectPendingRef.current) {
          reconnectPendingRef.current = false;
          try {
            const result = onReconnectRef.current?.();
            result?.catch?.((error) => {
              console.error("Orders WebSocket reconnect sync failed:", error);
            });
          } catch (error) {
            console.error("Orders WebSocket reconnect sync failed:", error);
          }
        }
      };

      socket.onmessage = (e) => {
        if (socketRef.current !== socket) return;

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
        // Ignore a close callback from a socket replaced by visibility recovery.
        if (socketRef.current !== socket) return;

        clearHeartbeat();
        socketRef.current = null;

        if (!isCleanedUp.current) scheduleReconnect();
      };
    };

    connect();

    // 2️⃣ Reconnect when tab becomes visible after sleep
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !hasActiveSocket()) {
        console.log("👁 Visible — reconnect");
        reconnectPendingRef.current = true;
        retryCountRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCleanedUp.current = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearReconnectTimer();
      clearHeartbeat();

      if (socketRef.current) {
        const s = socketRef.current;
        socketRef.current = null;
        s.onclose = null; // Prevent unmounted socket from scheduling reconnect
        s.onerror = null;
        s.onmessage = null;

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
