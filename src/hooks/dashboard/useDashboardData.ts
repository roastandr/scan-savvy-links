
import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";
import { ToastProps } from "@/hooks/use-toast";
import { StatItem, calculateStats } from "./statsUtils";
import { handleDeleteQRCode, handleToggleActive } from "./qrCodeActions";
import { fetchAllDashboardData } from "./dataFetchers";

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
  
  // Use a ref to track if we're currently fetching data
  const isFetchingRef = useRef(false);
  // Use a ref to track if we've already fetched data
  const dataFetchedRef = useRef(false);
  // Track component mounted state
  const isMounted = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user || isFetchingRef.current || !isMounted.current) return;
    
    // Set the fetching flag to prevent multiple concurrent fetches
    isFetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    
    const handleError = (message: string) => {
      if (isMounted.current) {
        toast({
          title: "Failed to load dashboard data",
          description: "Using demo data instead. " + message,
          variant: "destructive",
        });
      }
    };
    
    try {
      const result = await fetchAllDashboardData(user, handleError);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Update state with fetched data
        setQrCodes(result.qrCodes);
        setScanData(result.scanData);
        setLocationData(result.locationData);
        setDeviceData(result.deviceData);
        setBrowserData(result.browserData);
        setOsData(result.osData);
        setStats(calculateStats(result.qrCodes, result.scanData));
        setHasError(result.hasError);
      }
    } catch (error: any) {
      console.error("Unexpected error in dashboard data hook:", error);
      if (isMounted.current) {
        setHasError(true);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [user, toast]);

  // Initial data fetch
  useEffect(() => {
    // Only fetch once on initial load
    if (!dataFetchedRef.current) {
      fetchDashboardData();
      dataFetchedRef.current = true;
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
      isFetchingRef.current = false;
    };
  }, [fetchDashboardData]);

  // Update deleteQRCode to return void instead of boolean|void
  const deleteQRCode = useCallback(async (id: string): Promise<void> => {
    if (!isMounted.current) return;
    await handleDeleteQRCode(id, qrCodes, setQrCodes, toast);
  }, [qrCodes, toast]);

  // Update toggleActive to return void instead of boolean|void
  const toggleActive = useCallback(async (id: string, active: boolean): Promise<void> => {
    if (!isMounted.current) return;
    await handleToggleActive(id, active, qrCodes, setQrCodes, toast);
  }, [qrCodes, toast]);

  // Function to manually retry data fetching
  const retryFetchData = useCallback(() => {
    // Reset the dataFetched flag to allow a new fetch
    if (!isMounted.current) return;
    dataFetchedRef.current = false;
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
