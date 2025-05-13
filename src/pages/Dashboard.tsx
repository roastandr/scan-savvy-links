
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { QRCard, QRCodeData } from "@/components/qr-card";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockQRCodes: QRCodeData[] = [
  {
    id: "1",
    name: "Website QR",
    shortCode: "web123",
    targetUrl: "https://example.com",
    createdAt: "2025-05-01",
    expiresAt: null,
    active: true,
    scanCount: 245,
    color: "#7828f8",
  },
  {
    id: "2",
    name: "Product Page",
    shortCode: "prod456",
    targetUrl: "https://example.com/product",
    createdAt: "2025-05-05",
    expiresAt: "2025-08-01",
    active: true,
    scanCount: 112,
    color: "#8347ff",
  },
  {
    id: "3",
    name: "Event Registration",
    shortCode: "event789",
    targetUrl: "https://example.com/event",
    createdAt: "2025-05-08",
    expiresAt: "2025-06-15",
    active: false,
    scanCount: 89,
    color: "#9f75ff",
  },
];

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

export default function Dashboard() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>(mockQRCodes);
  const { toast } = useToast();

  const handleDeleteQRCode = (id: string) => {
    setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    toast({
      title: "QR Code deleted",
      description: "The QR code has been deleted successfully.",
    });
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setQrCodes(
      qrCodes.map((qr) => (qr.id === id ? { ...qr, active } : qr))
    );
    toast({
      title: active ? "QR Code activated" : "QR Code deactivated",
      description: `The QR code has been ${active ? "activated" : "deactivated"} successfully.`,
    });
  };

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
    },
    {
      title: "Active QR Codes",
      value: qrCodes.filter((qr) => qr.active).length.toString(),
      description: "Out of " + qrCodes.length,
      change: 0,
    },
    {
      title: "Avg. Scans per Day",
      value: "34",
      description: "Last 14 days",
      change: 8,
      data: [
        { name: "1", value: 28 },
        { name: "2", value: 32 },
        { name: "3", value: 25 },
        { name: "4", value: 30 },
        { name: "5", value: 35 },
        { name: "6", value: 42 },
        { name: "7", value: 48 },
      ],
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your QR codes.
          </p>
        </div>
        <Button asChild>
          <Link to="/qr-codes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Recent QR Codes</h2>
          {qrCodes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.slice(0, 3).map((qr) => (
                <QRCard
                  key={qr.id}
                  qrCode={qr}
                  onDelete={handleDeleteQRCode}
                  onToggleActive={handleToggleActive}
                />
              ))}
              {qrCodes.length > 3 && (
                <Card className="flex items-center justify-center h-full border-dashed">
                  <CardContent className="py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        You have {qrCodes.length - 3} more QR codes
                      </p>
                      <Button variant="secondary" asChild>
                        <Link to="/qr-codes">View All</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-muted p-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No QR Codes Yet</h3>
                  <p className="text-center text-muted-foreground">
                    You haven't created any QR codes yet. Get started by creating your first one.
                  </p>
                  <Button asChild>
                    <Link to="/qr-codes/new">Create QR Code</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <ScanChart data={mockScanData} />

        <div className="grid gap-6 md:grid-cols-2">
          <LocationChart data={mockLocationData} />
          <DeviceChart data={mockDeviceData} />
        </div>

        <Tabs defaultValue="browser">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Detailed Metrics</h2>
            <TabsList>
              <TabsTrigger value="browser">Browsers</TabsTrigger>
              <TabsTrigger value="os">Operating Systems</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="browser">
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
      </div>
    </div>
  );
}
