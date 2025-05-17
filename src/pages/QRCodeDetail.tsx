
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Check, Download, ExternalLink, Loader2, PenLine, Share2, Trash2, XCircle } from "lucide-react";
import { QRCodeData } from "@/components/qr-card";
import { ScanChart, ScanData } from "@/components/analytics/scan-chart";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { formatDate } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Recent scans type
type RecentScan = {
  id: string;
  timestamp: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
};

export default function QRCodeDetail() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [locationData, setLocationData] = useState<Array<{ name: string; value: number }>>([]);
  const [deviceData, setDeviceData] = useState<Array<{ name: string; value: number }>>([]);
  const [browserData, setBrowserData] = useState<Array<{ name: string; value: number }>>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const fetchCompleteRef = useState(false);

  useEffect(() => {
    const fetchQRCodeData = async () => {
      if (!id || !user || fetchCompleteRef[0]) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch QR code details
        const { data: qrData, error: qrError } = await supabase
          .from('qr_links')
          .select('*')
          .eq('id', id)
          .single();
          
        if (qrError) {
          throw new Error(qrError.message);
        }
        
        if (!qrData) {
          throw new Error('QR code not found');
        }
        
        // Ensure the QR code belongs to the current user
        if (qrData.user_id !== user.id) {
          throw new Error('You do not have permission to view this QR code');
        }
        
        const formattedQRCode: QRCodeData = {
          id: qrData.id,
          name: qrData.name,
          shortCode: qrData.slug,
          targetUrl: qrData.target_url,
          createdAt: qrData.created_at,
          expiresAt: qrData.expires_at,
          active: qrData.is_active,
          scanCount: 0, // Will be calculated from scan data
          color: qrData.color,
        };
        
        setQrCode(formattedQRCode);
        setIsActive(qrData.is_active);
        
        // Fetch scan data
        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .select('*')
          .eq('qr_link_id', id)
          .order('timestamp', { ascending: false });
          
        if (scanError) {
          console.error('Error fetching scan data:', scanError);
        }
        
        if (scanData && scanData.length > 0) {
          // Update scan count
          formattedQRCode.scanCount = scanData.length;
          setQrCode(formattedQRCode);
          
          // Process recent scans
          const recentScansData = scanData.slice(0, 5).map(scan => ({
            id: scan.id,
            timestamp: scan.timestamp,
            country: scan.country,
            city: scan.city,
            browser: scan.browser,
            os: scan.os,
            device: scan.device_type
          }));
          setRecentScans(recentScansData);
          
          // Process scan history data for chart
          const scanChartData = processScanHistory(scanData);
          setScanData(scanChartData);
          
          // Process location data
          const locationStats = processLocationData(scanData);
          setLocationData(locationStats);
          
          // Process device data
          const deviceStats = processDeviceData(scanData);
          setDeviceData(deviceStats);
          
          // Process browser data
          const browserStats = processBrowserData(scanData);
          setBrowserData(browserStats);
        } else {
          // Set empty data for charts
          setScanData([]);
          setLocationData([]);
          setDeviceData([]);
          setBrowserData([]);
          setRecentScans([]);
        }
        
        fetchCompleteRef[0] = true;
      } catch (error: any) {
        console.error('Error fetching QR code data:', error);
        setError(error.message || 'Failed to load QR code');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQRCodeData();
  }, [id, user, fetchCompleteRef]);

  // Process scan history for the chart
  const processScanHistory = (scanData: any[]): ScanData[] => {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
    
    // Initialize all days with 0 scans
    const scansMap = new Map<string, number>();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(twoWeeksAgo.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      scansMap.set(dateStr, 0);
    }
    
    // Fill in actual scan counts
    scanData.forEach((scan) => {
      const scanDate = new Date(scan.timestamp);
      const dateStr = scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (scansMap.has(dateStr)) {
        scansMap.set(dateStr, (scansMap.get(dateStr) || 0) + 1);
      }
    });
    
    // Convert to array for the chart
    return Array.from(scansMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  };

  // Process location data
  const processLocationData = (scanData: any[]): Array<{ name: string; value: number }> => {
    const locationCounts = new Map<string, number>();
    
    scanData.forEach((scan) => {
      if (scan.country) {
        const location = scan.country;
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      }
    });
    
    // Convert to array and sort by count
    return Array.from(locationCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5
  };

  // Process device data
  const processDeviceData = (scanData: any[]): Array<{ name: string; value: number }> => {
    const deviceCounts = new Map<string, number>();
    
    scanData.forEach((scan) => {
      if (scan.device_type) {
        const device = scan.device_type.charAt(0).toUpperCase() + scan.device_type.slice(1);
        deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
      } else {
        deviceCounts.set('Unknown', (deviceCounts.get('Unknown') || 0) + 1);
      }
    });
    
    // Convert to array
    return Array.from(deviceCounts.entries()).map(([name, value]) => ({ name, value }));
  };

  // Process browser data
  const processBrowserData = (scanData: any[]): Array<{ name: string; value: number }> => {
    const browserCounts = new Map<string, number>();
    
    scanData.forEach((scan) => {
      if (scan.browser) {
        browserCounts.set(scan.browser, (browserCounts.get(scan.browser) || 0) + 1);
      } else {
        browserCounts.set('Unknown', (browserCounts.get('Unknown') || 0) + 1);
      }
    });
    
    // Convert to array and sort by count
    return Array.from(browserCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const handleToggleActive = async () => {
    if (!qrCode || !id) return;
    
    const newState = !isActive;
    
    try {
      const { error } = await supabase
        .from('qr_links')
        .update({ is_active: newState })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsActive(newState);
      setQrCode({ ...qrCode, active: newState });
      
      toast({
        title: newState ? "QR Code Activated" : "QR Code Deactivated",
        description: `The QR code has been ${newState ? "activated" : "deactivated"} successfully.`,
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

  const handleDelete = async () => {
    if (!qrCode || !id) return;
    
    try {
      const { error } = await supabase
        .from('qr_links')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been deleted successfully.",
      });
      
      // Redirect back to QR codes list
      window.location.href = "/qr-codes";
    } catch (error: any) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Failed to delete QR code",
        description: error.message || "There was an error deleting the QR code.",
        variant: "destructive",
      });
    }
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

  const handleCopyTrackingUrl = () => {
    if (!qrCode) return;
    
    const trackingUrl = `${window.location.origin}/r/${qrCode.shortCode}`;
    navigator.clipboard.writeText(trackingUrl);
    
    toast({
      title: "URL Copied",
      description: "The QR code tracking URL has been copied to your clipboard.",
    });
  };

  // Ensure target URL has the correct format
  const getFormattedTargetUrl = () => {
    if (!qrCode || !qrCode.targetUrl) return "";
    
    return qrCode.targetUrl.match(/^https?:\/\//i) 
      ? qrCode.targetUrl
      : `https://${qrCode.targetUrl}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading QR code details...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">QR Code Not Found</h1>
        <p className="text-muted-foreground mt-2">
          {error || "The QR code you're looking for doesn't exist or has been deleted."}
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
                <Button variant="outline" size="sm" onClick={handleCopyTrackingUrl}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/qr-codes/edit/${qrCode.id}`}>
                    <PenLine className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
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
                        href={getFormattedTargetUrl()}
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
                    <p className="text-sm font-medium">Tracking URL</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`/r/${qrCode.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        {window.location.origin}/r/{qrCode.shortCode}
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
                      value={`${window.location.origin}/r/${qrCode.shortCode}`}
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
            data={scanData} 
            title="Scan Activity"
            description={`Total: ${qrCode.scanCount} scans`}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            {locationData.length > 0 && <LocationChart data={locationData} />}
            {deviceData.length > 0 && <DeviceChart data={deviceData} />}
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length > 0 ? (
                <div className="space-y-4">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">
                          {scan.city || "Unknown"}, {scan.country || "Unknown location"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatDate(scan.timestamp)}</span>
                          <span>•</span>
                          <span>{scan.browser || "Unknown browser"}</span>
                          <span>•</span>
                          <span>{scan.device || "Unknown device"}</span>
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No scan data available yet
                </div>
              )}
            </CardContent>
          </Card>
          
          {browserData.length > 0 && (
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
                    {browserData.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>{item.value} scans</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(item.value / browserData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="device" className="space-y-4 mt-4">
                    {deviceData.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>{item.value} scans</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(item.value / deviceData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this QR code and all its scan data.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                >
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
