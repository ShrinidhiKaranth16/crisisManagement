# 📡 SonarAssessment — Real-time Dashboard with WebSocket & AI Integration

A high-performance React + TypeScript dashboard for visualizing real-time streaming data, supporting collaboration, and integrating AI-powered insights.

---

## 🔍 Overview

**SonarAssessment** is a scalable, real-time monitoring dashboard for **500+ client websites**. Key highlights:

- ⚡ **WebSocket-based real-time data streaming**
- ⚛️ **React dashboard** with **data virtualization**
- 🤖 **AI Assistant** for natural-language chart queries
- 📤 **PDF/CSV export** for reporting
- 👥 **Multi-user collaboration** with smart caching and state sync

---

## 🚀 Features

- 📊 **Live Dashboard**: Streaming metrics (traffic, latency, errors) per website
- 📡 **Custom `useWebSocket` Hook**: Low-memory, continuous data ingestion
- 🧠 **AI Assistant (OpenAI)**: Conversational insights from dashboard data
- 🗃️ **Data Virtualization**: Efficient rendering of large lists/charts
- 📤 **Export**: CSV/PDF export of chart/table data
- 👥 **Multi-user**: Collaborative sessions supported
- 🧠 **Caching & Pruning**: Smart memory management for streaming data

---

## ⚙️ Tech Stack

| Category           | Stack                                         |
|--------------------|-----------------------------------------------|
| **Frontend**       | React, TypeScript, Vite                       |
| **Realtime Data**  | WebSocket (`wss://...`)                       |
| **Styling**        | Tailwind CSS                                  |
| **Charts**         | Recharts, Chart.js                            |
| **Exports**        | jsPDF, FileSaver.js, papaparse                |
| **Dev Tools**      | ESLint, Prettier, Husky                       |

---

## 🛠️ Installation

```bash
git clone https://github.com/ShrinidhiKaranth16/sonarAssesment.git
cd sonarAssesment
npm install
```

---

## 📜 Scripts

```bash
# Start dev server
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧾 Project Structure

```bash
sonarAssesment/
├── src/
│   ├── components/         # Dashboard UI
│   ├── hooks/              # Custom hooks (e.g. useWebSocket)
│   ├── services/           # API interaction (e.g. useDashboardAI)
│   ├── types/              # TypeScript interfaces
│   ├── pages/              # Dashboard and app pages
│   └── App.tsx             # Main app
├── public/                 # Static assets
├── .env                    # Environment variables
├── vite.config.ts          # Vite config
└── README.md               # Documentation
```

---

## 🔌 WebSocket System

Connects to:

```
wss://sonar-lab-server-8881cb834ac4.herokuapp.com/
```

---

## 📦 Data Types

### `Page`

```ts
interface Page {
  path: string;      // e.g., "/home", "/product"
  views: number;     // total views for the page
}
```

### `UserFlow`

```ts
interface UserFlow {
  from: string;      // originating path
  to: string;        // destination path
  count: number;     // number of users transitioning
}
```

### `DataPoint`

```ts
interface DataPoint {
  timestamp: string;               // ISO timestamp
  siteId: string;                  // Unique site identifier
  siteName: string;                // Human-readable name
  pageViews: number;               // Total views in this interval
  uniqueVisitors: number;          // Distinct visitors in the interval
  bounceRate: number;              // Bounce rate in %
  avgSessionDuration: number;      // Avg session duration (seconds)
  topPages: Page[];                // Top pages by views
  performanceMetrics: {
    loadTime: number;                     // Load time (ms)
    firstContentfulPaint: number;         // FCP (ms)
    largestContentfulPaint: number;       // LCP (ms)
  };
  userFlow: UserFlow[];            // Page-to-page user movement
}
```

---

## 📈 Usage

Interfaces are used in:

- `useWebSocket` → for real-time data
- Charts/Tables → for metrics visualization

---

## 📡 useWebSocket Hook

**Streams real-time `DataPoint` objects from a WebSocket endpoint.**  
Designed for high-frequency, low-memory data ingestion.

```tsx
const data = useWebSocket();
```

- Connects on mount (`useEffect`)
- Parses each message into a `DataPoint`
- Stores only the last 1000 entries (`Array.slice(-999)`)
- Handles errors gracefully
- Closes socket on unmount

**Example:**

```tsx
const Dashboard = () => {
  const liveData = useWebSocket();
  return <Chart data={liveData} />;
};
```

---

## 📊 Dashboard Component

**Renders a real-time analytics dashboard for multiple websites using streaming WebSocket data.**

### Charts Rendered

| Chart                | Description                                 |
|----------------------|---------------------------------------------|
| PageViewsLineChart   | Time-series of page views per site          |
| TopPagesBarChart     | Views per page path (bar chart)             |
| UserFlowHeatMap      | User page transitions (heatmap)             |

### State Management

- `data`: Streamed from `useWebSocket`
- `uniqueSites`: All distinct sites from data
- `selectedSite`: Current site being analyzed
- `lineChartData`: Timestamp vs. page views
- `barChartData`: Aggregated views per page
- `heatMapData`: Transition flow between pages

### Key Logic

- Initializes first site on load
- Aggregates/transforms `DataPoint[]` by selected site
- Supports site switching via button group
- Uses `useEffect` to:
  - Watch/parse new streaming data
  - Update visualizations on site change

### Enhancement Ideas

- Persist last selected site (localStorage)
- Add chart export/download
- Add search/filter to site selector
- Add loading/fallback state for data

---

## 🧠 `usePerformanceMonitor` Hook

Custom React hook for **real-time monitoring of frontend performance metrics**:

- 🎞️ **Frames Per Second (FPS)**
- 🧠 **JavaScript Memory Usage**
- 🌐 **WebSocket Latency**
- 🚨 **Auto-generated Alerts** for performance bottlenecks

### Return Type

```ts
interface PerformanceStats {
  fps: number;             // Frames per second (render speed)
  memoryUsedMB: number;    // JS heap used (in MB)
  memoryTotalMB: number;   // Total allocated JS heap (in MB)
  latencyMs: number;       // WebSocket ping-pong round-trip latency
  alerts: string[];        // Warnings like ⚠️ Low FPS, 🚨 High Memory Usage
}
```

### Parameters

```ts
usePerformanceMonitor(ws: WebSocket | null): PerformanceStats
```

| Parameter | Type              | Description                                                                 |
|-----------|-------------------|-----------------------------------------------------------------------------|
| `ws`      | `WebSocket \| null` | Optional open WebSocket instance for latency measurement (ping/pong support) |

### Internal Monitors

- **🎞️ FPS Tracker:**  
  Uses `requestAnimationFrame` to count frames per second.  
  Adds ⚠️ **Low FPS** alert when FPS < 30.

- **🧠 Memory Usage:**  
  Uses `window.performance.memory` every 3 seconds (if supported).  
  Adds 🚨 **High Memory Usage** alert when used JS heap > 400MB.

- **🌐 WebSocket Latency:**  
  Sends ping messages every 5 seconds and measures round-trip time.  
  Adds ⚠️ **High WebSocket Latency** alert if latency > 200ms.

### Example Usage

```tsx
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

const DashboardFooter = ({ ws }: { ws: WebSocket }) => {
  const stats = usePerformanceMonitor(ws);

  return (
    <div className="text-sm text-gray-600">
      FPS: {stats.fps} | Memory: {stats.memoryUsedMB}MB / {stats.memoryTotalMB}MB | Latency: {stats.latencyMs}ms
      <div>
        {stats.alerts.map((a, i) => <p key={i}>{a}</p>)}
      </div>
    </div>
  );
};
```

---

## 🎥 Walkthrough Video

Watch a short video for a visual explanation of the system’s behavior and architecture:

🔗 [**Loom Video — Dashboard Demo & Averaging Logic**](https://www.loom.com/share/786a30ff634a4fd9bcbaf112c75098fb?sid=638cc84b-1f7b-4f41-9e0c-fbe97460f6f9)

---

## 📊 Data Averaging Logic

To ensure optimal memory usage and performance:

- Maintains only the **latest 200 `DataPoint` entries** in the live dataset.
- All data **before these 200 entries is averaged** into a single aggregate baseline.

**This means:**

- The array size appears constant (e.g., `200`)
- The chart keeps evolving over time
- New incoming data gradually shifts the average, keeping the graph **dynamic and accurate**

🔁 **Prevents memory bloat while maintaining meaningful visual trends.**

---

## 🔒 Notes & Limitations

- `performance.memory` is only supported in **Chromium-based browsers**.
- Requires WebSocket server to respond with `{ type: "pong" }` to ping messages.
- Hook is fully self-cleaning and safe across mounts/unmounts or socket restarts.

