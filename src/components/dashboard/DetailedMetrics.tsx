
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceChart } from "@/components/analytics/device-chart";

interface DetailedMetricsProps {
  browserData: Array<{ name: string; value: number }>;
  osData: Array<{ name: string; value: number }>;
  deviceData: Array<{ name: string; value: number }>;
  locationData: Array<{ name: string; value: number }>;
}

export function DetailedMetrics({ browserData, osData, deviceData, locationData }: DetailedMetricsProps) {
  return (
    <Tabs defaultValue="browser">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Detailed Metrics</h2>
        <TabsList>
          <TabsTrigger value="browser">Browsers</TabsTrigger>
          <TabsTrigger value="os">Operating Systems</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="browser">
        <DeviceChart
          data={browserData}
          title="Browser Distribution"
          description="Web browsers used to scan your QR codes"
          type="browser"
        />
      </TabsContent>
      <TabsContent value="os">
        <DeviceChart
          data={osData}
          title="OS Distribution"
          description="Operating systems scanning your QR codes"
          type="os"
        />
      </TabsContent>
    </Tabs>
  );
}
