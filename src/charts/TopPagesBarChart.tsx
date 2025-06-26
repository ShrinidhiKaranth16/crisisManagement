import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Rectangle,
} from "recharts";

interface PageView {
  path: string;
  views: number;
}

interface TopPagesBarChartProps {
  data: PageView[];
  selectedName: string;
}

function TopPagesBarChart({ data, selectedName }: TopPagesBarChartProps) {
  return (
    <div className="bg-white p-4 rounded shadow h-72">
      <h2 className="text-xl font-semibold mb-4">Top Pages by Views for {selectedName}</h2>
<BarChart
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
          <XAxis dataKey="path" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="views" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />

        </BarChart>
    </div>
  );
}

export default TopPagesBarChart;
