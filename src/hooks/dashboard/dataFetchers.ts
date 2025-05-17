
import { supabase } from "@/integrations/supabase/client";
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";
import { generateMockQrData, generateMockScanData, generateMockAnalyticsData } from "./mockDataGenerators";
import { ToastProps } from "@/hooks/use-toast";

// Type for fetch results
export type FetchDashboardDataResult = {
  qrCodes: QRCodeData[];
  scanData: ScanData[];
  browserData: Array<{ name: string; value: number }>;
  osData: Array<{ name: string; value: number }>;
  locationData: Array<{ name: string; value: number }>;
  deviceData: Array<{ name: string; value: number }>;
  hasError: boolean;
};

// Cache mechanism to prevent redundant API calls
type CacheData = {
  timestamp: number;
  data: FetchDashboardDataResult;
};

let dataCache: CacheData | null = null;
const CACHE_EXPIRY_MS = 1000 * 60 * 5; // 5 minutes

// Helper function to check cache validity
const isCacheValid = (): boolean => {
  if (!dataCache) return false;
  const now = Date.now();
  return now - dataCache.timestamp < CACHE_EXPIRY_MS;
};

// Fetch QR codes for a user with proper timeout handling
export const fetchUserQRCodes = async (userId: string): Promise<QRCodeData[]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("QR codes fetch timeout")), 20000);
  });
  
  try {
    // Use Promise.race to handle timeouts
    const { data, error } = await Promise.race([
      supabase
        .from('qr_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      timeoutPromise
    ]) as any;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return generateMockQrData();
    }
    
    // Get all QR IDs for batch scan count query
    const qrIds = data.map((qr: any) => qr.id);
    let scanCounts: Record<string, number> = {};
    
    // Batch fetch scan counts for all QR codes at once
    if (qrIds.length > 0) {
      try {
        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .select('qr_link_id, id')
          .in('qr_link_id', qrIds);
          
        if (!scanError && scanData) {
          // Group counts by QR ID
          scanCounts = scanData.reduce((acc: Record<string, number>, scan: any) => {
            acc[scan.qr_link_id] = (acc[scan.qr_link_id] || 0) + 1;
            return acc;
          }, {});
        }
      } catch (err) {
        console.error("Error batch fetching scan counts:", err);
      }
    }
    
    // Process the QR codes data with scan counts
    const processedQRCodes = data.map((qr: any) => {
      return mapQrCodeData(qr, scanCounts[qr.id] || 0);
    });
    
    return processedQRCodes;
  } catch (err) {
    console.error("Error fetching QR codes:", err);
    return generateMockQrData();
  }
};

// Helper function to map database QR code to QRCodeData
const mapQrCodeData = (qrData: any, scanCount: number): QRCodeData => {
  return {
    id: qrData.id,
    name: qrData.name,
    shortCode: qrData.slug,
    targetUrl: qrData.target_url,
    createdAt: qrData.created_at,
    expiresAt: qrData.expires_at,
    active: qrData.is_active,
    scanCount: scanCount,
    color: qrData.color,
  };
};

// Fetch scan history for a user with proper error handling
export const fetchScanHistory = async (userId: string): Promise<ScanData[]> => {
  try {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
    
    // Use Promise.race for timeout handling
    const scanHistoryPromise = Promise.race([
      supabase
        .from('scans')
        .select(`
          timestamp,
          qr_links!inner(user_id)
        `)
        .eq('qr_links.user_id', userId)
        .gte('timestamp', twoWeeksAgo.toISOString())
        .order('timestamp', { ascending: true }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Scan history query timeout")), 10000);
      })
    ]);
    
    const { data, error } = await scanHistoryPromise as any;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return generateMockScanData();
    }
    
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
    data.forEach((scan: any) => {
      const scanDate = new Date(scan.timestamp);
      const dateStr = scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      scansMap.set(dateStr, (scansMap.get(dateStr) || 0) + 1);
    });
    
    // Convert to array for the chart
    const scanDataArray = Array.from(scansMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
    
    return scanDataArray;
  } catch (err) {
    console.error("Error fetching scan history:", err);
    return generateMockScanData();
  }
};

// Main function to fetch all dashboard data with improved caching
export const fetchAllDashboardData = async (
  user: any, 
  onError: (message: string) => void
): Promise<FetchDashboardDataResult> => {
  // Return cached data if valid to prevent unnecessary API calls
  if (isCacheValid() && dataCache) {
    console.log("Using cached dashboard data");
    return dataCache.data;
  }
  
  if (!user) {
    const mockQrData = generateMockQrData();
    const mockScanData = generateMockScanData();
    const { locationData, deviceData, browserData, osData } = generateMockAnalyticsData();
    
    const mockData: FetchDashboardDataResult = {
      qrCodes: mockQrData,
      scanData: mockScanData,
      locationData,
      deviceData,
      browserData,
      osData,
      hasError: false
    };
    
    return mockData;
  }
  
  try {
    console.log("Fetching fresh dashboard data");
    
    // Fetch QR codes data
    const qrCodesData = await fetchUserQRCodes(user.id);
    
    // Fetch scan history
    const scanHistoryData = await fetchScanHistory(user.id);
    
    // For now, using mock data for analytics
    const { locationData, deviceData, browserData, osData } = generateMockAnalyticsData();
    
    const result: FetchDashboardDataResult = {
      qrCodes: qrCodesData,
      scanData: scanHistoryData,
      locationData,
      deviceData,
      browserData: Array.isArray(browserData) ? browserData : [],
      osData: Array.isArray(osData) ? osData : [],
      hasError: false
    };
    
    // Update cache with timestamp
    dataCache = {
      timestamp: Date.now(),
      data: result
    };
    
    return result;
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    
    // Use mock data on error
    const mockQrData = generateMockQrData();
    const mockScanData = generateMockScanData();
    const { locationData, deviceData, browserData, osData } = generateMockAnalyticsData();
    
    // Show error toast only if it's not a network error
    if (error.message !== "Network Error" && error.message !== "Failed to fetch") {
      onError(error.message || "Failed to load dashboard data");
    }
    
    const errorResult: FetchDashboardDataResult = {
      qrCodes: mockQrData,
      scanData: mockScanData,
      locationData,
      deviceData,
      browserData: Array.isArray(browserData) ? browserData : [],
      osData: Array.isArray(osData) ? osData : [],
      hasError: true
    };
    
    return errorResult;
  }
};
