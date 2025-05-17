
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";
import { ToastProps } from "@/hooks/use-toast";
import { generateMockQrData, generateMockScanData, generateMockAnalyticsData } from "./mockDataGenerators";
import { StatItem, calculateStats } from "./statsUtils";
import { handleDeleteQRCode, handleToggleActive } from "./qrCodeActions";

export type ChartDataPoint = { name: string; value: number };

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

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      const mockQrData = generateMockQrData();
      const mockScanData = generateMockScanData();
      const { locationData: mockLocationData, deviceData: mockDeviceData, 
              browserData: mockBrowserData, osData: mockOsData } = generateMockAnalyticsData();
      
      setQrCodes(mockQrData);
      setScanData(mockScanData);
      setLocationData(mockLocationData);
      setDeviceData(mockDeviceData);
      setBrowserData(mockBrowserData);
      setOsData(mockOsData);
      setStats(calculateStats(mockQrData, mockScanData));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Increase timeout to 20 seconds to prevent premature timeouts
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 20000);
      });
      
      // Fetch QR codes with a timeout
      const qrCodesPromise = Promise.race([
        supabase
          .from('qr_links')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),  // Increased limit for better data display
        timeoutPromise
      ]);
      
      // Fetch QR codes
      const { data: qrCodesData, error: qrCodesError } = await qrCodesPromise as any;
      
      if (qrCodesError) throw qrCodesError;
      
      // Process QR codes data
      let processedQRCodes: QRCodeData[] = [];
      
      if (qrCodesData && qrCodesData.length > 0) {
        // Add scan counts to QR codes - with improved error handling
        processedQRCodes = await Promise.all(
          qrCodesData.map(async (qr) => {
            try {
              // Use timeoutPromise for scan count queries too
              const scanCountPromise = Promise.race([
                supabase
                  .from('scans')
                  .select('*', { count: 'exact', head: true })
                  .eq('qr_link_id', qr.id),
                new Promise((_, reject) => {
                  setTimeout(() => reject(new Error("Scan count query timeout")), 10000);
                })
              ]);
              
              const { count, error } = await scanCountPromise as any;
              
              if (error) {
                console.warn("Error fetching scan count:", error);
                // Continue with count as 0 instead of failing
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
              // Continue with count as 0 instead of failing
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
        // Add timeout for scan history query too
        const scanHistoryPromise = Promise.race([
          supabase
            .from('scans')
            .select(`
              timestamp,
              qr_links!inner(user_id)
            `)
            .eq('qr_links.user_id', user.id)
            .gte('timestamp', twoWeeksAgo.toISOString())
            .order('timestamp', { ascending: true }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Scan history query timeout")), 10000);
          })
        ]);
        
        const { data: scanHistoryData, error: scanHistoryError } = await scanHistoryPromise as any;
        
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
      
      // Use mock data for analytics
      const { locationData: mockLocationData, deviceData: mockDeviceData, 
              browserData: mockBrowserData, osData: mockOsData } = generateMockAnalyticsData();
      
      setLocationData(mockLocationData);
      setDeviceData(mockDeviceData);
      setBrowserData(mockBrowserData);
      setOsData(mockOsData);
      
      // Calculate statistics
      setStats(calculateStats(processedQRCodes, scanDataArray));
      
      setHasError(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setHasError(true);
      
      // Use mock data on error
      const mockQrData = generateMockQrData();
      const mockScanData = generateMockScanData();
      const { locationData: mockLocationData, deviceData: mockDeviceData, 
              browserData: mockBrowserData, osData: mockOsData } = generateMockAnalyticsData();
      
      setQrCodes(mockQrData);
      setScanData(mockScanData);
      setLocationData(mockLocationData);
      setDeviceData(mockDeviceData);
      setBrowserData(mockBrowserData);
      setOsData(mockOsData);
      setStats(calculateStats(mockQrData, mockScanData));

      // Show error toast only if it's not a network error (which might be annoying on disconnection)
      if (error.message !== "Network Error" && error.message !== "Failed to fetch") {
        toast({
          title: "Failed to load dashboard data",
          description: "Using demo data instead. " + (error.message || ""),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const deleteQRCode = useCallback(async (id: string) => {
    return handleDeleteQRCode(id, qrCodes, setQrCodes, toast);
  }, [qrCodes, toast]);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    return handleToggleActive(id, active, qrCodes, setQrCodes, toast);
  }, [qrCodes, toast]);

  // Function to manually retry data fetching
  const retryFetchData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    handleDeleteQRCode: deleteQRCode,
    handleToggleActive: toggleActive,
    retryFetchData
  };
};
