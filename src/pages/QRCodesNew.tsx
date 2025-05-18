
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function QRCodesNew() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const submittingRef = useRef(false);

  // Function to check if a QR code with the same name already exists
  const checkDuplicateName = async (name: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsCheckingDuplicate(true);
    try {
      const { data, error } = await supabase
        .from('qr_links')
        .select('id')
        .eq('name', name)
        .eq('user_id', user.id);
      
      setIsCheckingDuplicate(false);
      
      if (error) {
        console.error("Error checking duplicate name:", error);
        return false;
      }
      
      // Return true if duplicates were found
      return data && data.length > 0;
    } catch (error) {
      setIsCheckingDuplicate(false);
      console.error("Error checking duplicate name:", error);
      return false;
    }
  };

  // Check for duplicate shortCode
  const checkDuplicateShortCode = async (shortCode: string): Promise<boolean> => {
    if (!shortCode) return false;
    
    try {
      const { data, error } = await supabase
        .from('qr_links')
        .select('id')
        .eq('slug', shortCode);
      
      if (error) {
        console.error("Error checking duplicate short code:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking duplicate short code:", error);
      return false;
    }
  };

  const handleSaveQRCode = async (qrCodeData: {
    name: string;
    targetUrl: string;
    shortCode: string;
    expiresAt: Date | null;
    fgColor: string;
    bgColor: string;
  }) => {
    // Prevent duplicate submissions
    if (submittingRef.current) {
      console.log("Submission already in progress, preventing duplicate submission");
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create QR codes",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure we have a name
    if (!qrCodeData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your QR code",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a target URL
    if (!qrCodeData.targetUrl.trim()) {
      toast({
        title: "Target URL required",
        description: "Please provide a target URL for your QR code",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a short code
    if (!qrCodeData.shortCode.trim()) {
      toast({
        title: "Short code required",
        description: "Please provide a short code for your QR code",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Checking for duplicate name:", qrCodeData.name);
    
    // Check if name already exists before proceeding
    const isDuplicate = await checkDuplicateName(qrCodeData.name);
    if (isDuplicate) {
      toast({
        title: "Duplicate name",
        description: "A QR code with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Checking for duplicate short code:", qrCodeData.shortCode);
    
    // Check if short code already exists
    const isDuplicateShortCode = await checkDuplicateShortCode(qrCodeData.shortCode);
    if (isDuplicateShortCode) {
      toast({
        title: "Duplicate short code",
        description: "This short code is already in use. Please generate a new one.",
        variant: "destructive",
      });
      return;
    }
    
    submittingRef.current = true;
    setIsLoading(true);
    console.log("Starting submission, isLoading set to true");

    try {
      // Validate the URL format
      try {
        new URL(qrCodeData.targetUrl);
      } catch (err) {
        throw new Error("Please enter a valid URL including http:// or https://");
      }
      
      // Validate expiration date is not in the past
      if (qrCodeData.expiresAt && qrCodeData.expiresAt < new Date()) {
        throw new Error("Expiration date cannot be in the past");
      }
      
      console.log("Saving QR code to database");
      
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
          is_active: true,
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("QR code created successfully, id:", data.id);
      
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully.",
      });
      
      navigate(`/qr-codes/${data.id}`);
    } catch (error: any) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Failed to Create QR Code",
        description: error.message || "There was an error creating your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("Submission complete, isLoading set to false");
      
      // Reset submission ref after a short delay
      setTimeout(() => {
        submittingRef.current = false;
        console.log("Reset submittingRef to false");
      }, 500);
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

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Creating your QR code...</p>
          </div>
        </div>
      )}

      <QRCodeGenerator 
        onSave={handleSaveQRCode} 
        isLoading={isLoading || isCheckingDuplicate} 
      />
    </div>
  );
}
