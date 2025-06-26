import { useEffect, useState } from "react";
import type { DataPoint } from "../types/DataPoint";

export const useWebSocket = (): DataPoint[] => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // 🔧 Changed from Heroku URL

    ws.onmessage = (event) => {
      const point: DataPoint = JSON.parse(event.data);
      console.log(point);
      setData((prev) => [...prev.slice(-999), point]);
    };

    ws.onerror = (e) => {
      console.error("WebSocket error", e);
    };

    return () => {
      ws.close();
    };
  }, []);

  return data;
};
