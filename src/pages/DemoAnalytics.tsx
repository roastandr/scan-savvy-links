
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { BarChart, QrCode, Smartphone, Users } from "lucide-react";

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

export default function DemoAnalytics() {
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
      title: "Active QR Codes",
      value: "3",
      description: "Out of 5",
      change: 0,
      icon: <QrCode className="h-4 w-4 text-muted-foreground" />,
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
      title: "Unique Visitors",
      value: "386",
      description: "Individual scans",
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
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Demo</h1>
        <p className="text-muted-foreground">
          Preview our analytics features with sample data.
        </p>
      </div>

      <StatsCards stats={stats} />
      
      <ScanChart 
        data={mockScanData} 
        title="Sample Scan Activity"
        description="This shows how scan data would appear for your QR codes"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <LocationChart data={mockLocationData} />
        <DeviceChart data={mockDeviceData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing QR Codes</CardTitle>
          <CardDescription>
            Example of your most scanned QR codes
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
                  <tr>
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
