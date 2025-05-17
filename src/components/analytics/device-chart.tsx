
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type DeviceData = {
  name: string;
  value: number;
};

type DeviceChartProps = {
  data: DeviceData[];
  title?: string;
  description?: string;
  type?: "browser" | "os" | "device";
};

const COLORS = ['#8884d8', 'hsl(var(--primary))', '#82ca9d', '#ffc658', '#ff8042'];

export function DeviceChart({ 
  data, 
  title = "Device Distribution", 
  description = "Types of devices scanning your QR codes", 
  type = "device"
}: DeviceChartProps) {
  
  const getTitle = () => {
    switch (type) {
      case "browser": return title || "Browser Distribution";
      case "os": return title || "OS Distribution";
      case "device": return title || "Device Distribution";
      default: return title;
    }
  };

  const getDescription = () => {
    switch (type) {
      case "browser": return description || "Web browsers used to scan your QR codes";
      case "os": return description || "Operating systems scanning your QR codes";
      case "device": return description || "Types of devices scanning your QR codes";
      default: return description;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Fix: Check if data is an array before calling reduce
      // The payload structure from recharts is different than expected
      // Instead, we get the direct value from the current payload item
      const value = data.value;
      
      // Calculate total from the full dataset array
      const total = Array.isArray(data) 
        ? data.reduce((a: number, b: DeviceData) => a + b.value, 0)
        : data.value > 0 ? data.value : 0;
      
      // Calculate percentage safely
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      
      return (
        <div className="bg-popover border border-border p-3 rounded-md shadow-md">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-primary">{value} scans</p>
          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
