import { useEffect, useState, useRef } from "react";

export interface PerformanceStats {
  fps: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  latencyMs: number;
  alerts: string[];
}

export const usePerformanceMonitor = (
  ws: WebSocket | null
): PerformanceStats => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memoryUsedMB: 0,
    memoryTotalMB: 0,
    latencyMs: 0,
    alerts: [],
  });

  const lastFrame = useRef(performance.now());
  const frameCount = useRef(0);
  const latencyStart = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // FPS tracker
  useEffect(() => {
    let animationFrameId: number;
    const loop = (now: number) => {
      frameCount.current++;
      if (now - lastFrame.current >= 1000) {
        const fps = frameCount.current;
        frameCount.current = 0;
        lastFrame.current = now;

        setStats((prev) => ({
          ...prev,
          fps,
          alerts: [...(fps < 30 ? ["⚠️ Low FPS"] : [])],
        }));
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Memory tracker
  useEffect(() => {
    const interval = setInterval(() => {
      const mem = (window.performance as any).memory;
      if (mem) {
        const used = mem.usedJSHeapSize / 1048576;
        const total = mem.totalJSHeapSize / 1048576;

        setStats((prev) => ({
          ...prev,
          memoryUsedMB: Math.round(used),
          memoryTotalMB: Math.round(total),
          alerts: [
            ...prev.alerts.filter((a) => !a.includes("Memory")),
            ...(used > 400 ? ["🚨 High Memory Usage"] : []),
          ],
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket ping (latency)
  useEffect(() => {
    if (!ws) return;

    const handleOpen = () => {
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          latencyStart.current = Date.now();
          console.log("📤 Pinging...");
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 5000);

      ws.addEventListener("message", onMessage);

      const cleanup = () => {
        clearInterval(pingInterval);
        ws.removeEventListener("message", onMessage);
      };

      // Cleanup when WebSocket closes
      ws.addEventListener("close", cleanup);
      ws.addEventListener("error", cleanup);

      // Cleanup when hook unmounts
      cleanupRef.current = cleanup;
    };

    const onMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "pong" && latencyStart.current) {
          const latency = Date.now() - latencyStart.current;
          console.log(`✅ Pong received: ${latency}ms`);
          setStats((prev) => ({
            ...prev,
            latencyMs: latency,
            alerts: [
              ...prev.alerts.filter((a) => !a.includes("Latency")),
              ...(latency > 200 ? ["⚠️ High WebSocket Latency"] : []),
            ],
          }));
          latencyStart.current = null;
        }
      } catch (err) {
        console.error("Invalid message:", e.data);
      }
    };

    if (ws.readyState === WebSocket.OPEN) {
      handleOpen();
    } else {
      ws.addEventListener("open", handleOpen);
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      ws.removeEventListener("open", handleOpen);
    };
  }, [ws]);

  return stats;
};
