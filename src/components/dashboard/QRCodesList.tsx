
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QRCard, QRCodeData } from "@/components/qr-card";

interface QRCodesListProps {
  qrCodes: QRCodeData[];
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}

export function QRCodesList({ qrCodes, onDelete, onToggleActive }: QRCodesListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {qrCodes.map((qr) => (
        <QRCard
          key={qr.id}
          qrCode={qr}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
      {qrCodes.length > 3 && (
        <Card className="flex items-center justify-center h-full border-dashed">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-muted-foreground">
                You have more QR codes
              </p>
              <Link to="/qr-codes" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                View All
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
