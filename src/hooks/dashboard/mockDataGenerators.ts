
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";

export const generateMockQrData = (): QRCodeData[] => {
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

export const generateMockScanData = (): ScanData[] => {
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

export const generateMockAnalyticsData = () => {
  const locationData = [
    { name: "United States", value: 124 },
    { name: "Germany", value: 86 },
    { name: "United Kingdom", value: 72 },
    { name: "Canada", value: 51 },
    { name: "Japan", value: 43 },
  ];
  
  const deviceData = [
    { name: "Mobile", value: 245 },
    { name: "Desktop", value: 108 },
    { name: "Tablet", value: 43 },
  ];
  
  const browserData = [
    { name: "Chrome", value: 186 },
    { name: "Safari", value: 124 },
    { name: "Firefox", value: 53 },
    { name: "Edge", value: 33 },
  ];
  
  const osData = [
    { name: "iOS", value: 148 },
    { name: "Android", value: 132 },
    { name: "Windows", value: 86 },
    { name: "macOS", value: 30 },
  ];

  return {
    locationData,
    deviceData,
    browserData,
    osData
  };
};
