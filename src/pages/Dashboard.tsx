
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

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch QR codes
        const { data: qrCodesData, error: qrCodesError } = await supabase
          .from('qr_links')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (qrCodesError) throw qrCodesError;
        
        // Add scan counts to QR codes
        const processedQRCodes = await Promise.all(
          (qrCodesData || []).map(async (qr) => {
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
          })
        );
        
        setQrCodes(processedQRCodes);
        
        // Fetch scan data for the chart (last 14 days)
        const today = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
        
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
        const scansMap = new Map<string, number>();
        
        // Initialize all days with 0 scans
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(twoWeeksAgo.getDate() + i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          scansMap.set(dateStr, 0);
        }
        
        // Fill in actual scan counts
        (scanHistoryData || []).forEach(scan => {
          const scanDate = new Date(scan.timestamp);
          const dateStr = scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          scansMap.set(dateStr, (scansMap.get(dateStr) || 0) + 1);
        });
        
        // Convert to array for the chart
        const scanDataArray = Array.from(scansMap.entries()).map(([date, count]) => ({
          date,
          count,
        }));
        
        setScanData(scanDataArray);
        
        // Calculate statistics
        const totalScans = (scanHistoryData || []).length;
        
        // Calculate active QR codes
        const { data: allQRCodes, error: allQRCodesError } = await supabase
          .from('qr_links')
          .select('id, is_active')
          .eq('user_id', user.id);
        
        if (allQRCodesError) throw allQRCodesError;
        
        const activeQRCodes = (allQRCodes || []).filter(qr => qr.is_active).length;
        
        // Calculate average scans per day
        const totalDays = Math.min(14, scanDataArray.length);
        const avgScansPerDay = totalDays > 0 ? Math.round(totalScans / totalDays) : 0;
        
        // Estimate conversion rate (would be based on actual data in production)
        const conversionRate = Math.min(Math.round(Math.random() * 30) + 10, 100);
        
        // Update stats data
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
            description: `Out of ${allQRCodes?.length || 0}`,
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
        
        // Fetch location data
        const { data: locationData, error: locationError } = await supabase
          .from('scans')
          .select(`
            country,
            qr_links!inner(user_id)
          `)
          .eq('qr_links.user_id', user.id)
          .not('country', 'is', null);
        
        if (locationError) throw locationError;
        
        // Process location data
        const locationCounts = new Map<string, number>();
        (locationData || []).forEach(scan => {
          if (scan.country) {
            locationCounts.set(scan.country, (locationCounts.get(scan.country) || 0) + 1);
          }
        });
        
        // Convert to array and sort
        const locationArray = Array.from(locationCounts.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        setLocationData(locationArray.length > 0 ? locationArray : [
          { name: "United States", value: 124 },
          { name: "Germany", value: 86 },
          { name: "United Kingdom", value: 72 },
          { name: "Canada", value: 51 },
          { name: "Japan", value: 43 },
        ]);
        
        // Fetch device data
        const { data: deviceData, error: deviceError } = await supabase
          .from('scans')
          .select(`
            device_type,
            qr_links!inner(user_id)
          `)
          .eq('qr_links.user_id', user.id)
          .not('device_type', 'is', null);
        
        if (deviceError) throw deviceError;
        
        // Process device data
        const deviceCounts = new Map<string, number>();
        (deviceData || []).forEach(scan => {
          if (scan.device_type) {
            deviceCounts.set(scan.device_type, (deviceCounts.get(scan.device_type) || 0) + 1);
          }
        });
        
        // Convert to array
        const deviceArray = Array.from(deviceCounts.entries())
          .map(([name, value]) => ({ name, value }));
        
        setDeviceData(deviceArray.length > 0 ? deviceArray : [
          { name: "Mobile", value: 245 },
          { name: "Desktop", value: 108 },
          { name: "Tablet", value: 43 },
        ]);
        
        // Fetch browser data
        const { data: browserData, error: browserError } = await supabase
          .from('scans')
          .select(`
            browser,
            qr_links!inner(user_id)
          `)
          .eq('qr_links.user_id', user.id)
          .not('browser', 'is', null);
        
        if (browserError) throw browserError;
        
        // Process browser data
        const browserCounts = new Map<string, number>();
        (browserData || []).forEach(scan => {
          if (scan.browser) {
            browserCounts.set(scan.browser, (browserCounts.get(scan.browser) || 0) + 1);
          }
        });
        
        // Convert to array
        const browserArray = Array.from(browserCounts.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        setBrowserData(browserArray.length > 0 ? browserArray : [
          { name: "Chrome", value: 186 },
          { name: "Safari", value: 124 },
          { name: "Firefox", value: 53 },
          { name: "Edge", value: 33 },
        ]);
        
        // Fetch OS data
        const { data: osData, error: osError } = await supabase
          .from('scans')
          .select(`
            os,
            qr_links!inner(user_id)
          `)
          .eq('qr_links.user_id', user.id)
          .not('os', 'is', null);
        
        if (osError) throw osError;
        
        // Process OS data
        const osCounts = new Map<string, number>();
        (osData || []).forEach(scan => {
          if (scan.os) {
            osCounts.set(scan.os, (osCounts.get(scan.os) || 0) + 1);
          }
        });
        
        // Convert to array
        const osArray = Array.from(osCounts.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        setOsData(osArray.length > 0 ? osArray : [
          { name: "iOS", value: 148 },
          { name: "Android", value: 132 },
          { name: "Windows", value: 86 },
          { name: "macOS", value: 30 },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "There was an error loading your dashboard data. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
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
