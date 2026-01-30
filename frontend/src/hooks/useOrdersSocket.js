import { useEffect, useRef } from "react";

/**
 * onMessage: (data) => void   called when an order message arrives
 * options: { tableId: number | null }
 */
export default function useOrdersSocket(onMessage, options = {}) {
  const wsRef = useRef(null);
  const { tableId } = options;

  useEffect(() => {
    // choose protocol based on current location
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    let url = `${protocol}://10.10.10.224:8000/ws/orders/`;

    if (tableId) {
      url += `?table=${tableId}`;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Orders WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // data: { type, action, order: {...} }
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    ws.onclose = (e) => {
      console.log("Orders WS closed", e);
      // optional: reconnect logic
    };

    ws.onerror = (err) => {
      console.error("Orders WS error", err);
    };

    return () => {
      ws.close();
    };
  }, [tableId, onMessage]);
}
