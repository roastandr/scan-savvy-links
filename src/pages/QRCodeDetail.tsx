import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Check, Download, ExternalLink, PenLine, Share2, Trash2, XCircle } from "lucide-react";
import { QRCodeData } from "@/components/qr-card";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { formatDate } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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

// Mock scan data
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

// Recent scans mock data
const mockRecentScans = [
  {
    id: "1",
    timestamp: "2025-05-13T15:42:10",
    country: "United States",
    city: "New York",
    browser: "Chrome",
    os: "Windows",
    device: "Desktop",
  },
  {
    id: "2",
    timestamp: "2025-05-13T15:38:22",
    country: "Germany",
    city: "Berlin",
    browser: "Safari",
    os: "iOS",
    device: "Mobile",
  },
  {
    id: "3",
    timestamp: "2025-05-13T15:25:56",
    country: "United Kingdom",
    city: "London",
    browser: "Firefox",
    os: "macOS",
    device: "Desktop",
  },
  {
    id: "4",
    timestamp: "2025-05-13T15:14:08",
    country: "Canada",
    city: "Toronto",
    browser: "Chrome",
    os: "Android",
    device: "Mobile",
  },
  {
    id: "5",
    timestamp: "2025-05-13T14:58:31",
    country: "Japan",
    city: "Tokyo",
    browser: "Safari",
    os: "iOS",
    device: "Mobile",
  },
];

export default function QRCodeDetail() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching QR code data
    const foundQrCode = mockQRCodes.find((qr) => qr.id === id);
    if (foundQrCode) {
      setQrCode(foundQrCode);
      setIsActive(foundQrCode.active);
    }
  }, [id]);

  const handleToggleActive = () => {
    if (!qrCode) return;
    
    const newState = !isActive;
    setIsActive(newState);
    
    // In a real app, this would update the backend
    toast({
      title: newState ? "QR Code Activated" : "QR Code Deactivated",
      description: `The QR code has been ${newState ? "activated" : "deactivated"} successfully.`,
    });
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${qrCode.shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been downloaded successfully.",
      });
    }
  };

  if (!qrCode) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">QR Code Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The QR code you're looking for doesn't exist or has been deleted.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/qr-codes">Back to QR Codes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/qr-codes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{qrCode.name}</CardTitle>
                  {isActive ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Created {formatDate(qrCode.createdAt)}
                  {qrCode.expiresAt && (
                    <span className="ml-2">
                      • Expires {formatDate(qrCode.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <PenLine className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Target URL</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={qrCode.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        {qrCode.targetUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Short URL</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`/r/${qrCode.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        domain.com/r/{qrCode.shortCode}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Active</span>
                      <Switch checked={isActive} onCheckedChange={handleToggleActive} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <QRCodeCanvas
                      id="qr-code"
                      value={qrCode.targetUrl}
                      size={180}
                      fgColor={qrCode.color}
                      bgColor="#FFFFFF"
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScanChart 
            data={mockScanData} 
            title="Scan Activity"
            description="Track scans over time"
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <LocationChart data={mockLocationData} />
            <DeviceChart data={mockDeviceData} />
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">
                        {scan.city}, {scan.country}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatDate(scan.timestamp)}</span>
                        <span>•</span>
                        <span>{scan.browser}</span>
                        <span>•</span>
                        <span>{scan.device}</span>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="browser">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="browser">Browsers</TabsTrigger>
                  <TabsTrigger value="device">Devices</TabsTrigger>
                </TabsList>
                <TabsContent value="browser" className="space-y-4 mt-4">
                  {mockBrowserData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.value} scans</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(item.value / mockBrowserData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="device" className="space-y-4 mt-4">
                  {mockDeviceData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.value} scans</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(item.value / mockDeviceData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this QR code and all its scan data.
                </p>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
