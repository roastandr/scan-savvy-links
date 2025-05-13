
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function DemoCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveQRCode = (qrCodeData: {
    name: string;
    targetUrl: string;
    shortCode: string;
    expiresAt: Date | null;
    fgColor: string;
    bgColor: string;
  }) => {
    setIsLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Demo Mode",
          description: "In the full version, your QR code would be saved and tracked. Sign up for full features!",
        });
        navigate("/demo/analytics");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create QR Code</h1>
        <p className="text-muted-foreground">
          Try out our QR code generator in demo mode.
        </p>
      </div>

      <QRCodeGenerator onSave={handleSaveQRCode} isLoading={isLoading} />
    </div>
  );
}
