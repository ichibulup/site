import { useEffect } from "react";

export function useRealtime() {
  useEffect(() => {
    const ws = new WebSocket("wss://localhost:8080");

    ws.onopen = () => console.log("WS Connected");
    ws.onmessage = (msg) => {
      const payload = JSON.parse(msg.data);
      console.log("Realtime:", payload);
    };

    return () => ws.close();
  }, []);
}
