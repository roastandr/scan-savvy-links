
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { BarChart, Smartphone, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockScanData: ScanData[] = [
  { date: "May 1", count: 5 },
  { date: "May 2", count: 12 },
  { date: "May 3", count: 8 },
  { date: "May 4", count: 15 },
  { date: "May 5", count: 25 },
  { date: "May 6", count: 18 },
  { date: "May 7", count: 30 },
  { date: "May 8", count: 42 },
  { date: "May 9", count: 37 },
  { date: "May 10", count: 48 },
  { date: "May 11", count: 51 },
  { date: "May 12", count: 44 },
  { date: "May 13", count: 52 },
];

const mockLocationData = [
  { name: "United States", value: 124 },
  { name: "Germany", value: 86 },
  { name: "United Kingdom", value: 72 },
  { name: "Canada", value: 51 },
  { name: "Japan", value: 43 },
];

const mockDeviceData = [
  { name: "Mobile", value: 245 },
  { name: "Desktop", value: 108 },
  { name: "Tablet", value: 43 },
];

const mockBrowserData = [
  { name: "Chrome", value: 186 },
  { name: "Safari", value: 124 },
  { name: "Firefox", value: 53 },
  { name: "Edge", value: 33 },
];

const mockOSData = [
  { name: "iOS", value: 148 },
  { name: "Android", value: 132 },
  { name: "Windows", value: 86 },
  { name: "macOS", value: 30 },
];

// Weekly, monthly, and all-time data
const mockTimeRanges = {
  "7d": mockScanData.slice(-7),
  "30d": mockScanData.slice(-13), // Using all we have for demo
  "90d": mockScanData,
  "all": mockScanData,
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  const stats = [
    {
      title: "Total Scans",
      value: "448",
      description: "All time",
      change: 12,
      data: [
        { name: "1", value: 12 },
        { name: "2", value: 18 },
        { name: "3", value: 22 },
        { name: "4", value: 15 },
        { name: "5", value: 25 },
        { name: "6", value: 32 },
        { name: "7", value: 28 },
      ],
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total Visitors",
      value: "386",
      description: "Unique users",
      change: 8,
      data: [
        { name: "1", value: 10 },
        { name: "2", value: 15 },
        { name: "3", value: 18 },
        { name: "4", value: 12 },
        { name: "5", value: 22 },
        { name: "6", value: 28 },
        { name: "7", value: 24 },
      ],
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Mobile Users",
      value: "68%",
      description: "Of total users",
      change: 3,
      data: [
        { name: "1", value: 62 },
        { name: "2", value: 64 },
        { name: "3", value: 65 },
        { name: "4", value: 66 },
        { name: "5", value: 67 },
        { name: "6", value: 68 },
        { name: "7", value: 68 },
      ],
      icon: <Smartphone className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Conversion Rate",
      value: "24%",
      description: "From scan to action",
      change: -2,
      data: [
        { name: "1", value: 28 },
        { name: "2", value: 26 },
        { name: "3", value: 24 },
        { name: "4", value: 22 },
        { name: "5", value: 25 },
        { name: "6", value: 24 },
        { name: "7", value: 22 },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive QR code scan analytics and insights.
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsCards stats={stats} />
      
      <ScanChart 
        data={mockTimeRanges[timeRange]} 
        title="Scan Activity"
        description="Track the number of scans over time"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <LocationChart data={mockLocationData} />
        <DeviceChart data={mockDeviceData} />
      </div>

      <Tabs defaultValue="browsers">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Detailed Metrics</h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browsers">Browsers</TabsTrigger>
            <TabsTrigger value="os">Operating Systems</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="browsers">
          <DeviceChart
            data={mockBrowserData}
            title="Browser Distribution"
            description="Web browsers used to scan your QR codes"
            type="browser"
          />
        </TabsContent>
        <TabsContent value="os">
          <DeviceChart
            data={mockOSData}
            title="OS Distribution"
            description="Operating systems scanning your QR codes"
            type="os"
          />
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Performing QR Codes</CardTitle>
          <CardDescription>
            Your most scanned QR codes in the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 font-medium">QR Code</th>
                    <th className="text-left pb-3 font-medium">Target URL</th>
                    <th className="text-right pb-3 font-medium">Total Scans</th>
                    <th className="text-right pb-3 font-medium">Conversion Rate</th>
                    <th className="text-right pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Website QR</td>
                    <td className="py-3 text-muted-foreground">https://example.com</td>
                    <td className="py-3 text-right">245</td>
                    <td className="py-3 text-right text-green-500">32%</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-green-200 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Product Page</td>
                    <td className="py-3 text-muted-foreground">https://example.com/product</td>
                    <td className="py-3 text-right">112</td>
                    <td className="py-3 text-right text-green-500">24%</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-green-200 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Event Registration</td>
                    <td className="py-3 text-muted-foreground">https://example.com/event</td>
                    <td className="py-3 text-right">89</td>
                    <td className="py-3 text-right text-red-500">18%</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-red-200 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Inactive
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
