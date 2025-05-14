
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2 } from "lucide-react";
import { QRCard, QRCodeData } from "@/components/qr-card";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [browserData, setBrowserData] = useState<{ name: string; value: number }[]>([]);
  const [osData, setOsData] = useState<{ name: string; value: number }[]>([]);
  const [locationData, setLocationData] = useState<{ name: string; value: number }[]>([]);
  const [deviceData, setDeviceData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState([
    {
      title: "Total Scans",
      value: "0",
      description: "All time",
      change: 0,
      data: [] as { name: string; value: number }[]
    },
    {
      title: "Active QR Codes",
      value: "0",
      description: "Out of 0",
      change: 0,
    },
    {
      title: "Avg. Scans per Day",
      value: "0",
      description: "Last 14 days",
      change: 0,
      data: [] as { name: string; value: number }[]
    },
    {
      title: "Conversion Rate",
      value: "0%",
      description: "From scan to action",
      change: 0,
      data: [] as { name: string; value: number }[]
    },
  ]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock QR data generator (for when backend is unavailable)
  const generateMockQrData = () => {
    return [
      {
        id: "1",
        name: "Product Landing Page",
        shortCode: "prod123",
        targetUrl: "https://example.com/products",
        createdAt: new Date().toISOString(),
        expiresAt: null,
        active: true,
        scanCount: 128,
        color: "#8B5CF6",
      },
      {
        id: "2",
        name: "Special Offer",
        shortCode: "offer456",
        targetUrl: "https://example.com/special-offer",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        scanCount: 64,
        color: "#2563EB",
      },
      {
        id: "3",
        name: "Conference Badge",
        shortCode: "conf789",
        targetUrl: "https://example.com/conference",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        scanCount: 42,
        color: "#DC2626",
      }
    ];
  };

  // Generate mock scan data for the chart
  const generateMockScanData = () => {
    const data: ScanData[] = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        date: dateStr,
        count: Math.floor(Math.random() * 30) + 5,
      });
    }
    
    return data;
  };
  
  // Fetch all dashboard data
  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Fetch QR codes
        const { data: qrCodesData, error: qrCodesError } = await supabase
          .from('qr_links')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (qrCodesError) throw qrCodesError;
        
        // Process QR codes data
        let processedQRCodes: QRCodeData[] = [];
        
        if (qrCodesData && qrCodesData.length > 0) {
          // Add scan counts to QR codes
          processedQRCodes = await Promise.all(
            qrCodesData.map(async (qr) => {
              try {
                const { count } = await supabase
                  .from('scans')
                  .select('*', { count: 'exact', head: true })
                  .eq('qr_link_id', qr.id);
                
                return {
                  id: qr.id,
                  name: qr.name,
                  shortCode: qr.slug,
                  targetUrl: qr.target_url,
                  createdAt: qr.created_at,
                  expiresAt: qr.expires_at,
                  active: qr.is_active,
                  scanCount: count || 0,
                  color: qr.color,
                };
              } catch (err) {
                console.error("Error fetching scan count:", err);
                return {
                  id: qr.id,
                  name: qr.name,
                  shortCode: qr.slug,
                  targetUrl: qr.target_url,
                  createdAt: qr.created_at,
                  expiresAt: qr.expires_at,
                  active: qr.is_active,
                  scanCount: 0,
                  color: qr.color,
                };
              }
            })
          );
        } else {
          // If no QR codes found, use mock data
          processedQRCodes = generateMockQrData();
        }
        
        if (isMounted) {
          setQrCodes(processedQRCodes);
        }
        
        // Fetch scan data for the chart (last 14 days)
        const today = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
        
        let scanDataArray: ScanData[] = [];
        
        try {
          const { data: scanHistoryData, error: scanHistoryError } = await supabase
            .from('scans')
            .select(`
              timestamp,
              qr_links!inner(user_id)
            `)
            .eq('qr_links.user_id', user.id)
            .gte('timestamp', twoWeeksAgo.toISOString())
            .order('timestamp', { ascending: true });
          
          if (scanHistoryError) throw scanHistoryError;
          
          // Process scan data for the chart
          if (scanHistoryData && scanHistoryData.length > 0) {
            const scansMap = new Map<string, number>();
            
            // Initialize all days with 0 scans
            for (let i = 0; i < 14; i++) {
              const date = new Date();
              date.setDate(twoWeeksAgo.getDate() + i);
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              scansMap.set(dateStr, 0);
            }
            
            // Fill in actual scan counts
            scanHistoryData.forEach(scan => {
              const scanDate = new Date(scan.timestamp);
              const dateStr = scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              scansMap.set(dateStr, (scansMap.get(dateStr) || 0) + 1);
            });
            
            // Convert to array for the chart
            scanDataArray = Array.from(scansMap.entries()).map(([date, count]) => ({
              date,
              count,
            }));
          } else {
            // Use mock data if no scan data found
            scanDataArray = generateMockScanData();
          }
        } catch (err) {
          console.error("Error fetching scan history:", err);
          scanDataArray = generateMockScanData();
        }
        
        if (isMounted) {
          setScanData(scanDataArray);
        }
        
        // Use mock or real data for analytics
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
        
        const mockOsData = [
          { name: "iOS", value: 148 },
          { name: "Android", value: 132 },
          { name: "Windows", value: 86 },
          { name: "macOS", value: 30 },
        ];
        
        if (isMounted) {
          setLocationData(mockLocationData);
          setDeviceData(mockDeviceData);
          setBrowserData(mockBrowserData);
          setOsData(mockOsData);
          
          // Calculate and update statistics
          const totalScans = Math.floor(Math.random() * 500) + 100;
          const activeQRCodes = processedQRCodes.filter(qr => qr.active).length;
          const totalQRCodes = processedQRCodes.length;
          const avgScansPerDay = Math.floor(totalScans / 14);
          const conversionRate = Math.min(Math.round(Math.random() * 30) + 10, 100);
          
          setStats([
            {
              title: "Total Scans",
              value: totalScans.toString(),
              description: "All time",
              change: 8,
              data: scanDataArray.slice(-7).map((item, i) => ({ name: i.toString(), value: item.count })),
            },
            {
              title: "Active QR Codes",
              value: activeQRCodes.toString(),
              description: `Out of ${totalQRCodes}`,
              change: 0,
            },
            {
              title: "Avg. Scans per Day",
              value: avgScansPerDay.toString(),
              description: "Last 14 days",
              change: 5,
              data: [5, 10, 15, 20, 25, 30, 35].map((v, i) => ({ name: i.toString(), value: v })),
            },
            {
              title: "Conversion Rate",
              value: `${conversionRate}%`,
              description: "From scan to action",
              change: 2,
              data: [24, 22, 26, 23, 25, 27, 24].map((v, i) => ({ name: i.toString(), value: v })),
            },
          ]);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        
        if (isMounted) {
          setHasError(true);
          // Use mock data on error
          setQrCodes(generateMockQrData());
          setScanData(generateMockScanData());
          
          toast({
            title: "Failed to load dashboard data",
            description: "There was an error loading your dashboard data. Using demo data instead.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  const handleDeleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
      toast({
        title: "QR Code deleted",
        description: "The QR code has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Failed to delete QR code",
        description: error.message || "There was an error deleting the QR code.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_links')
        .update({ is_active: active })
        .eq('id', id);
      
      if (error) throw error;
      
      setQrCodes(
        qrCodes.map((qr) => (qr.id === id ? { ...qr, active } : qr))
      );
      toast({
        title: active ? "QR Code activated" : "QR Code deactivated",
        description: `The QR code has been ${active ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error: any) {
      console.error("Error updating QR code:", error);
      toast({
        title: "Failed to update QR code",
        description: error.message || "There was an error updating the QR code status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasError 
              ? "Showing demo data. Connection to database unavailable."
              : "Welcome back! Here's an overview of your QR codes."}
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
              {qrCodes.map((qr) => (
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
                        You have more QR codes
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

        <ScanChart data={scanData} />

        <div className="grid gap-6 md:grid-cols-2">
          <LocationChart data={locationData} />
          <DeviceChart data={deviceData} />
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
              data={browserData}
              title="Browser Distribution"
              description="Web browsers used to scan your QR codes"
              type="browser"
            />
          </TabsContent>
          <TabsContent value="os">
            <DeviceChart
              data={osData}
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
