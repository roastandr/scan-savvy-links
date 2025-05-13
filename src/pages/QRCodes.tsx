
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { QRCard, QRCodeData } from "@/components/qr-card";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockQRCodes: QRCodeData[] = [
  {
    id: "1",
    name: "Website QR",
    shortCode: "web123",
    targetUrl: "https://example.com",
    createdAt: "2025-05-01",
    expiresAt: null,
    active: true,
    scanCount: 245,
    color: "#7828f8",
  },
  {
    id: "2",
    name: "Product Page",
    shortCode: "prod456",
    targetUrl: "https://example.com/product",
    createdAt: "2025-05-05",
    expiresAt: "2025-08-01",
    active: true,
    scanCount: 112,
    color: "#8347ff",
  },
  {
    id: "3",
    name: "Event Registration",
    shortCode: "event789",
    targetUrl: "https://example.com/event",
    createdAt: "2025-05-08",
    expiresAt: "2025-06-15",
    active: false,
    scanCount: 89,
    color: "#9f75ff",
  },
  {
    id: "4",
    name: "Special Offer",
    shortCode: "offer123",
    targetUrl: "https://example.com/offer",
    createdAt: "2025-05-10",
    expiresAt: "2025-07-15",
    active: true,
    scanCount: 76,
    color: "#7828f8",
  },
  {
    id: "5",
    name: "Contact Page",
    shortCode: "contact45",
    targetUrl: "https://example.com/contact",
    createdAt: "2025-05-12",
    expiresAt: null,
    active: true,
    scanCount: 34,
    color: "#8347ff",
  },
];

export default function QRCodes() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>(mockQRCodes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCodeData[]>(mockQRCodes);
  const { toast } = useToast();

  useEffect(() => {
    const filtered = qrCodes.filter(
      (qr) =>
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQRCodes(filtered);
  }, [searchQuery, qrCodes]);

  const handleDeleteQRCode = (id: string) => {
    setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    toast({
      title: "QR Code deleted",
      description: "The QR code has been deleted successfully.",
    });
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setQrCodes(
      qrCodes.map((qr) => (qr.id === id ? { ...qr, active } : qr))
    );
    toast({
      title: active ? "QR Code activated" : "QR Code deactivated",
      description: `The QR code has been ${active ? "activated" : "deactivated"} successfully.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground">
            Manage all your QR codes in one place.
          </p>
        </div>
        <Button asChild>
          <Link to="/qr-codes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search QR codes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div></div>
      </div>

      {filteredQRCodes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQRCodes.map((qr) => (
            <QRCard
              key={qr.id}
              qrCode={qr}
              onDelete={handleDeleteQRCode}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No QR Codes Found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? "No QR codes match your search criteria."
              : "You haven't created any QR codes yet."}
          </p>
          {!searchQuery && (
            <Button className="mt-4" asChild>
              <Link to="/qr-codes/new">Create QR Code</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
