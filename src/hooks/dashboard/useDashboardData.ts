
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

  const fetchDashboardData = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    
    // Set the fetching flag to prevent multiple concurrent fetches
    isFetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    
    const handleError = (message: string) => {
      toast({
        title: "Failed to load dashboard data",
        description: "Using demo data instead. " + message,
        variant: "destructive",
      });
    };
    
    try {
      const result = await fetchAllDashboardData(user, handleError);
      
      // Update state with fetched data
      setQrCodes(result.qrCodes);
      setScanData(result.scanData);
      setLocationData(result.locationData);
      setDeviceData(result.deviceData);
      setBrowserData(result.browserData);
      setOsData(result.osData);
      setStats(calculateStats(result.qrCodes, result.scanData));
      setHasError(result.hasError);
    } catch (error: any) {
      console.error("Unexpected error in dashboard data hook:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
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
    
    return () => {
      // Reset the fetching flag if component unmounts during fetch
      isFetchingRef.current = false;
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
    // Reset the dataFetched flag to allow a new fetch
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
