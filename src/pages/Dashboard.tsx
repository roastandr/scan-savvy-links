
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2 } from "lucide-react";
import { QRCard, QRCodeData } from "@/components/qr-card";
import { ScanChart } from "@/components/analytics/scan-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { LocationChart } from "@/components/analytics/location-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { EmptyQRCodeState } from "@/components/dashboard/EmptyQRCodeState";
import { DetailedMetrics } from "@/components/dashboard/DetailedMetrics";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRCodesList } from "@/components/dashboard/QRCodesList";

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
    return (
      <div className="p-6 flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
            <Button onClick={retryFetchData}>Try Again</Button>
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
