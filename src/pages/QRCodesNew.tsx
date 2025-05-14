
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useToast } from "@/hooks/use-toast";
import { generateShortCode } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function QRCodesNew() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveQRCode = async (qrCodeData: {
    name: string;
    targetUrl: string;
    shortCode: string;
    expiresAt: Date | null;
    fgColor: string;
    bgColor: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create QR codes",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Save QR code to database
      const { data, error } = await supabase
        .from('qr_links')
        .insert({
          name: qrCodeData.name,
          target_url: qrCodeData.targetUrl,
          slug: qrCodeData.shortCode,
          expires_at: qrCodeData.expiresAt ? qrCodeData.expiresAt.toISOString() : null,
          color: qrCodeData.fgColor,
          background_color: qrCodeData.bgColor,
          user_id: user.id,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully.",
      });
      
      navigate("/qr-codes");
    } catch (error: any) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Failed to Create QR Code",
        description: error.message || "There was an error creating your QR code. Please try again.",
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
