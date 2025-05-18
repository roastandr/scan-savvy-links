
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { CalendarIcon, Loader2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface QRCodeDetailData {
  id: string;
  name: string;
  slug: string;
  targetUrl: string;
  color: string;
  backgroundColor: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  scanCount: number;
}

export default function QRCodeDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<QRCodeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetch calls
    if (loadingRef.current) return;
    
    const fetchQRCodeData = async () => {
      if (!id) return;
      
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: qrData, error: qrError } = await supabase
          .from('qr_links')
          .select('*')
          .eq('id', id)
          .single();
          
        if (qrError) {
          throw new Error(qrError.message);
        }
        
        if (!qrData) {
          throw new Error("QR Code not found");
        }
        
        // Get scan count in a separate query
        const { count: scanCount, error: scanError } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('qr_link_id', id);
          
        if (scanError) {
          console.error("Error fetching scan count:", scanError);
        }
        
        setQrCode({
          id: qrData.id,
          name: qrData.name,
          slug: qrData.slug,
          targetUrl: qrData.target_url,
          color: qrData.color || "#7828f8",
          backgroundColor: qrData.background_color || "#ffffff",
          isActive: qrData.is_active,
          expiresAt: qrData.expires_at,
          createdAt: qrData.created_at,
          scanCount: scanCount || 0
        });
      } catch (err: any) {
        setError(err.message || "Failed to load QR code details");
        toast({
          title: "Error",
          description: err.message || "Failed to load QR code details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        // Small delay before allowing another fetch
        setTimeout(() => {
          loadingRef.current = false;
        }, 500);
      }
    };
    
    fetchQRCodeData();
  }, [id, toast]);

  const isExpired = qrCode?.expiresAt && new Date(qrCode.expiresAt) < new Date();
  const trackingUrl = qrCode?.slug ? `${window.location.origin}/r/${qrCode.slug}` : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {error || "QR Code not found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The QR code you're looking for could not be found or an error occurred.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{qrCode.name}</h1>
        <p className="text-muted-foreground">
          QR code details and statistics
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Preview</CardTitle>
            <CardDescription>Scan this QR code to visit the tracking URL</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QRCodeSVG
                value={trackingUrl}
                size={220}
                fgColor={qrCode.color}
                bgColor={qrCode.backgroundColor}
                level="H"
                includeMargin
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={qrCode.isActive ? "default" : "outline"}>
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>
              
              {isExpired && (
                <Badge variant="destructive">
                  Expired
                </Badge>
              )}
            </div>
            
            {qrCode.expiresAt && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{isExpired ? "Expired on" : "Expires on"} {format(new Date(qrCode.expiresAt), "PPP")}</span>
              </div>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Information</CardTitle>
            <CardDescription>Details about this QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Target URL</p>
              <p className="text-sm text-muted-foreground break-all">{qrCode.targetUrl}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Tracking URL</p>
              <p className="text-sm text-muted-foreground break-all">{trackingUrl}</p>
            </div>

            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(qrCode.createdAt), "PPP")}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Total Scans</p>
                <p className="text-sm text-muted-foreground">{qrCode.scanCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
