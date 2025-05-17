
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Link, AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { supabase } from "@/integrations/supabase/client";

export default function Redirect() {
  const { shortCode } = useParams();
  const [status, setStatus] = useState<"loading" | "notFound" | "redirecting">("loading");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Use ref to track if we already processed the lookup
  const lookupProcessedRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple lookups for the same short code
    if (lookupProcessedRef.current) return;
    
    const lookupShortCode = async () => {
      if (!shortCode) {
        setStatus("notFound");
        return;
      }

      try {
        // Mark lookup as processed to prevent recursive calls
        lookupProcessedRef.current = true;
        
        console.log("Looking up short code:", shortCode);
        
        // Get QR link info from database
        const { data: qrLink, error } = await supabase
          .from('qr_links')
          .select('id, target_url, is_active, expires_at')
          .eq('slug', shortCode)
          .single();
        
        if (error) {
          console.error("Error looking up short code:", error);
          setStatus("notFound");
          setError(`Database error: ${error.message}`);
          return;
        }

        if (!qrLink) {
          console.error("QR link not found for shortcode:", shortCode);
          setStatus("notFound");
          setError("QR code not found in database");
          return;
        }

        console.log("QR link found:", qrLink);

        // Check if QR code is active and not expired
        if (!qrLink.is_active) {
          setStatus("notFound");
          setError("This QR code has been deactivated");
          return;
        }

        if (qrLink.expires_at && new Date(qrLink.expires_at) < new Date()) {
          setStatus("notFound");
          setError("This QR code has expired");
          return;
        }

        // Ensure target URL has a protocol
        let finalTargetUrl = qrLink.target_url;
        if (finalTargetUrl && !finalTargetUrl.match(/^https?:\/\//i)) {
          finalTargetUrl = `https://${finalTargetUrl}`;
        }

        setTargetUrl(finalTargetUrl);

        // Collect browser and device info
        const userAgent = navigator.userAgent;
        const deviceType = /mobile|tablet|ipad/i.test(userAgent) ? "mobile" : "desktop";
        const browser = detectBrowser(userAgent);
        const os = detectOS(userAgent);
        const referrer = document.referrer;

        console.log("Recording scan with data:", {
          qr_link_id: qrLink.id,
          device_type: deviceType,
          browser: browser,
          os: os,
          referrer: referrer
        });

        // Record the scan - run this in background without waiting
        try {
          // Use Promise to handle the async operation
          supabase.rpc('record_scan', {
            qr_link_id_param: qrLink.id,
            device_type_param: deviceType,
            browser_param: browser,
            os_param: os,
            referrer_param: referrer
          }).then(({ error: scanError }) => {
            if (scanError) {
              console.error("Error recording scan:", scanError);
            } else {
              console.log("Scan recorded successfully");
            }
          });
        } catch (recordError) {
          // Just log the error, don't prevent redirect
          console.error("Error in scan recording:", recordError);
        }
        
        // Wait a bit, then redirect
        setStatus("redirecting");
        setTimeout(() => {
          if (finalTargetUrl) {
            console.log("Redirecting to:", finalTargetUrl);
            window.location.href = finalTargetUrl;
          } else {
            console.error("Target URL is null or empty");
            setStatus("notFound");
            setError("Invalid target URL");
          }
        }, 1500);
      } catch (error: any) {
        console.error("Error in redirect process:", error);
        setStatus("notFound");
        setError(`Unexpected error: ${error.message || "Unknown error"}`);
      }
    };
    
    lookupShortCode();
    
    return () => {
      // Cleanup - mark as processed to prevent additional calls
      lookupProcessedRef.current = true;
    };
  }, [shortCode]);
  
  // Simple browser detection
  const detectBrowser = (userAgent: string): string => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    return 'Other';
  };

  // Simple OS detection
  const detectOS = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Other';
  };
  
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="mb-8">
        <Logo size="large" />
      </div>
      
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Looking up your destination...</p>
          </div>
        )}
        
        {status === "redirecting" && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-lg font-medium">Redirecting to your destination...</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">
              {targetUrl}
            </p>
          </div>
        )}
        
        {status === "notFound" && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-xl font-bold mt-4">QR Code Error</h1>
            <p className="text-muted-foreground">
              {error || "The QR code you scanned doesn't exist, has expired, or has been deactivated."}
            </p>
            <div className="mt-4">
              <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                <Link className="h-4 w-4 mr-2" /> Return Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
