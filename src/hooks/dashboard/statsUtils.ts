
import { QRCodeData } from "@/components/qr-card";
import { ScanData } from "@/components/analytics/scan-chart";

export type StatItem = {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  data?: Array<{ name: string; value: number }>;
  icon?: React.ReactNode;
};

export const calculateStats = (qrCodes: QRCodeData[], scanData: ScanData[]): StatItem[] => {
  const totalScans = Math.floor(Math.random() * 500) + 100;
  const activeQRCodes = qrCodes.filter(qr => qr.active).length;
  const totalQRCodes = qrCodes.length;
  const avgScansPerDay = Math.floor(totalScans / 14);
  const conversionRate = Math.min(Math.round(Math.random() * 30) + 10, 100);

  return [
    {
      title: "Total Scans",
      value: totalScans.toString(),
      description: "All time",
      change: 8,
      data: scanData.slice(-7).map((item, i) => ({ name: i.toString(), value: item.count })),
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
  ];
};
