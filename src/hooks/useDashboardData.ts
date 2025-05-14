import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";
import { ToastProps } from "@/hooks/use-toast";

type ChartDataPoint = { name: string; value: number };
type StatItem = {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  data?: Array<{ name: string; value: number }>;
  icon?: React.ReactNode;
};

export const useDashboardData = (user: any, toast: (props: ToastProps) => void) => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [browserData, setBrowserData] = useState<ChartDataPoint[]>([]);
  const [osData, setOsData] = useState<ChartDataPoint[]>([]);
  const [locationData, setLocationData] = useState<ChartDataPoint[]>([]);
  const [deviceData, setDeviceData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([
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

  // Mock data generators
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

  const fetchDashboardData = useCallback(async () => {
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
      
      setQrCodes(processedQRCodes);
      
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
      
      setScanData(scanDataArray);
      
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
      
      setHasError(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setHasError(true);
      
      // Use mock data on error
      setQrCodes(generateMockQrData());
      setScanData(generateMockScanData());
      
      toast({
        title: "Failed to load dashboard data",
        description: "There was an error loading your dashboard data. Using demo data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchDashboardData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

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

  // Function to manually retry data fetching
  const retryFetchData = () => {
    fetchDashboardData();
  };

  return {
    qrCodes,
    scanData,
    browserData,
    osData,
    locationData,
    deviceData,
    isLoading,
    hasError,
    stats,
    handleDeleteQRCode,
    handleToggleActive,
    retryFetchData
  };
};
