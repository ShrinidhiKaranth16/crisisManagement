import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  
} from "recharts";

interface ChartPoint {
  date: string;
  pv: number;
}

interface PageViewsLineChartProps {
  data: ChartPoint[];
  selectedName: string;
}
function PageViewsLineChart({ data, selectedName }: PageViewsLineChartProps) {
  return (
    <div className="bg-white p-4 rounded shadow h-72">
      <h2 className="text-xl font-semibold mb-4">Page Views Over Time for {selectedName}</h2>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}

export default PageViewsLineChart;
