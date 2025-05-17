
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

// Fetch QR codes for a user
export const fetchUserQRCodes = async (userId: string): Promise<QRCodeData[]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("QR codes fetch timeout")), 20000);
  });
  
  try {
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
    
    // Process the QR codes data
    const processedQRCodes = await Promise.all(
      data.map(async (qr: any) => {
        try {
          const scanCountPromise = Promise.race([
            supabase
              .from('scans')
              .select('*', { count: 'exact', head: true })
              .eq('qr_link_id', qr.id),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error("Scan count query timeout")), 10000);
            })
          ]);
          
          const { count, error } = await scanCountPromise as any;
          
          if (error) {
            console.warn("Error fetching scan count:", error);
            return mapQrCodeData(qr, 0);
          }
          
          return mapQrCodeData(qr, count || 0);
        } catch (err) {
          console.error("Error processing QR code:", err);
          return mapQrCodeData(qr, 0);
        }
      })
    );
    
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

// Fetch scan history for a user
export const fetchScanHistory = async (userId: string): Promise<ScanData[]> => {
  try {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
    
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

// Main function to fetch all dashboard data
export const fetchAllDashboardData = async (
  user: any, 
  onError: (message: string) => void
): Promise<FetchDashboardDataResult> => {
  if (!user) {
    const mockQrData = generateMockQrData();
    const mockScanData = generateMockScanData();
    const { locationData, deviceData, browserData, osData } = generateMockAnalyticsData();
    
    return {
      qrCodes: mockQrData,
      scanData: mockScanData,
      locationData,
      deviceData,
      browserData,
      osData,
      hasError: false
    };
  }
  
  try {
    // Fetch QR codes data
    const qrCodesData = await fetchUserQRCodes(user.id);
    
    // Fetch scan history
    const scanHistoryData = await fetchScanHistory(user.id);
    
    // For now, using mock data for analytics
    const { locationData, deviceData, browserData, osData } = generateMockAnalyticsData();
    
    return {
      qrCodes: qrCodesData,
      scanData: scanHistoryData,
      locationData,
      deviceData,
      browserData,
      osData,
      hasError: false
    };
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
    
    return {
      qrCodes: mockQrData,
      scanData: mockScanData,
      locationData,
      deviceData,
      browserData,
      osData,
      hasError: true
    };
  }
};
