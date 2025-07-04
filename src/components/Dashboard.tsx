import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { LineChart, XAxis, YAxis, ResponsiveContainer, Line } from "recharts";
import "../styles/dashboard.css";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface DataPoint {
  siteId: string;
  siteName: string;
  pageViews: number;
  timestamp: number;
  id: number;
}

interface Site {
  siteId: string;
  siteName: string;
  data: DataPoint[];
}

const MAX_POINTS = 200;

// Memoized SiteButton to prevent unnecessary re-renders
const SiteButton = memo(({
  site,
  isActive,
  onClick,
}: {
  site: Site;
  isActive: boolean;
  onClick: (siteId: string) => void;
}) => (
  <button
    onClick={() => onClick(site.siteId)}
    className={isActive ? "active" : ""}
  >
    {site.siteName}
  </button>
));

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Performance stats
  const stats = usePerformanceMonitor(wsRef.current);

  // Calculate metrics outside of render
  const calculateMetrics = useCallback((pageViews: number) => {
    return { loadFactor: (Math.random() * pageViews).toFixed(2) };
  }, []);

  // Memoized selected site data
  const selectedSite = useMemo(() => (
    sites.find((s) => s.siteId === selectedSiteId)
  ), [sites, selectedSiteId]);

  // Memoized chart data processing
  const processChartData = useMemo(() => {
    if (!selectedSite) return [];
    
    return selectedSite.data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      metrics: calculateMetrics(point.pageViews),
    }));
  }, [selectedSite, calculateMetrics]);

  // WebSocket and memory monitoring setup
  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8080");

      wsRef.current.onmessage = (event: MessageEvent) => {
        const newData = JSON.parse(event.data) as Omit<DataPoint, "timestamp" | "id">;
        const enrichedData: DataPoint = {
          ...newData,
          timestamp: Date.now(),
          id: Math.random(),
        };

        // Optimized state updates
        setData(prev => {
          const newDataArray = [...prev.slice(-MAX_POINTS), enrichedData];
          return prev.length === newDataArray.length && 
                 prev[prev.length-1]?.id === newDataArray[newDataArray.length-1]?.id
            ? prev
            : newDataArray;
        });

        setSites(prev => {
          const index = prev.findIndex(s => s.siteId === enrichedData.siteId);
          if (index === -1) {
            return [
              ...prev,
              {
                siteId: enrichedData.siteId,
                siteName: enrichedData.siteName,
                data: [enrichedData],
              },
            ];
          }
          
          const updatedSite = {
            ...prev[index],
            data: [...prev[index].data.slice(-MAX_POINTS), enrichedData],
          };
          
          // Only update if data actually changed
          if (prev[index].data.length === updatedSite.data.length && 
              prev[index].data[prev[index].data.length-1]?.id === updatedSite.data[updatedSite.data.length-1]?.id) {
            return prev;
          }
          
          const updated = [...prev];
          updated[index] = updatedSite;
          return updated;
        });
      };

      wsRef.current.onerror = () => {
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    // Memory logging
    intervalRef.current = setInterval(() => {
      const memoryInfo = (window.performance as any).memory;
      if (memoryInfo) {
        console.log("Memory usage:", {
          used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + "MB",
          total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + "MB",
        });
      }
    }, 5000);

    return () => {
      wsRef.current?.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSiteSelect = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
  }, []);

  const memoryInfo = (window.performance as any)?.memory;

  return (
    <div className="dashboard">
      <div className="site-selector">
        {sites.map((site) => (
          <SiteButton
            key={site.siteId}
            site={site}
            isActive={selectedSiteId === site.siteId}
            onClick={handleSiteSelect}
          />
        ))}
      </div>
  
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processChartData}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#8884d8"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="data-summary">
        <h3>Data Points: {data.length}</h3>
        <h3>Sites: {sites.length}</h3>
        {memoryInfo && (
          <h3>
            Memory Usage:{" "}
            {`${Math.round(memoryInfo.usedJSHeapSize / 1048576)}MB / 
              ${Math.round(memoryInfo.totalJSHeapSize / 1048576)}MB`}
          </h3>
        )}
        <h3>FPS: {stats.fps}</h3>
        <h3>Latency: {stats.latencyMs}ms</h3>
      </div>
    </div>
  );
};

export default memo(Dashboard);