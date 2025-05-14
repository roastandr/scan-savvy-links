
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/analytics/stats-cards";
import { ScanChart } from "@/components/analytics/scan-chart";
import { QRCodesList } from "@/components/dashboard/QRCodesList";
import { EmptyQRCodeState } from "@/components/dashboard/EmptyQRCodeState";
import { DetailedMetrics } from "@/components/dashboard/DetailedMetrics";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
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
  } = useDashboardData(user, toast);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader hasError={true} />
        
        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-xl font-semibold">Connection Error</h2>
            <p className="text-muted-foreground">
              There was an error loading your dashboard data. 
              We're showing demo data below as a fallback.
            </p>
            <button 
              onClick={retryFetchData}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Try Again
            </button>
          </div>
        </div>

        <StatsCards stats={stats} />
        <ScanChart data={scanData} />
        <QRCodesList qrCodes={qrCodes} onDelete={handleDeleteQRCode} onToggleActive={handleToggleActive} />
        <DetailedMetrics browserData={browserData} osData={osData} deviceData={deviceData} locationData={locationData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <DashboardHeader hasError={false} />
      <StatsCards stats={stats} />

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Recent QR Codes</h2>
          {qrCodes.length > 0 ? (
            <QRCodesList qrCodes={qrCodes} onDelete={handleDeleteQRCode} onToggleActive={handleToggleActive} />
          ) : (
            <EmptyQRCodeState />
          )}
        </div>

        <ScanChart data={scanData} />

        <div className="grid gap-6 md:grid-cols-2">
          <LocationChart data={locationData} />
          <DeviceChart data={deviceData} />
        </div>

        <DetailedMetrics browserData={browserData} osData={osData} deviceData={deviceData} locationData={locationData} />
      </div>
    </div>
  );
}

// Add missing imports at the top
import { DeviceChart } from "@/components/analytics/device-chart";
import { LocationChart } from "@/components/analytics/location-chart";
