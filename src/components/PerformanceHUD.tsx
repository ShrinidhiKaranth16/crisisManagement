import React from 'react';
import type { PerformanceStats } from '../hooks/usePerformanceMonitor';
import "../styles/PerformanceHUD.css";

interface Props {
  stats: PerformanceStats;
}

const PerformanceHUD: React.FC<Props> = ({ stats }) => {
  return (
    <div className="performance-hud">
      <div>🧠 FPS: {stats.fps}</div>
      <div>📦 Memory: {stats.memoryUsedMB} / {stats.memoryTotalMB} MB</div>
      <div>🌐 WS Latency: {stats.latencyMs} ms</div>
      {stats.alerts.length > 0 && (
        <div className="alerts">
          {stats.alerts.map((alert, i) => (
            <div key={i} className="alert">{alert}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceHUD;
