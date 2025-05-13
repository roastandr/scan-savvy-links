
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useToast } from "@/hooks/use-toast";
import { generateShortCode } from "@/lib/utils";

export default function QRCodesNew() {
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
      // This is a placeholder - actual saving will be implemented with Supabase
      console.log("Saving QR code:", qrCodeData);
      
      // Simulate saving success for demo purposes
      setTimeout(() => {
        toast({
          title: "QR Code Created",
          description: "Your QR code has been created successfully.",
        });
        navigate("/qr-codes");
      }, 1500);
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Failed to Create QR Code",
        description: "There was an error creating your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create QR Code</h1>
        <p className="text-muted-foreground">
          Generate a custom QR code with tracking capabilities.
        </p>
      </div>

      <QRCodeGenerator onSave={handleSaveQRCode} isLoading={isLoading} />
    </div>
  );
}
