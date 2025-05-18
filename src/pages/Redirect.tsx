
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const redirectAttempted = useRef(false);
  
  useEffect(() => {
    // Prevent multiple redirect attempts
    if (redirectAttempted.current) return;
    redirectAttempted.current = true;
    
    const fetchQRLink = async () => {
      try {
        if (!shortCode) {
          setError("Invalid QR code link");
          return;
        }
        
        // Use the get_qr_link_by_slug function to get the QR link details
        const { data, error: fetchError } = await supabase
          .rpc('get_qr_link_by_slug', { slug_param: shortCode });
        
        if (fetchError) throw fetchError;
        
        if (!data || data.length === 0) {
          setError("QR code not found");
          return;
        }
        
        const qrLink = data[0];
        
        // Check if the QR code is active
        if (!qrLink.is_active) {
          setError("This QR code is inactive");
          return;
        }
        
        // Check if the QR code has expired
        if (qrLink.expires_at && new Date(qrLink.expires_at) < new Date()) {
          setError("This QR code has expired");
          return;
        }
        
        // Record the scan asynchronously - don't wait for it to complete
        recordScan(qrLink.id).catch(err => {
          console.error("Failed to record scan:", err);
        });
        
        // Redirect to the target URL
        let targetUrl = qrLink.target_url;
        if (!targetUrl.match(/^https?:\/\//i)) {
          targetUrl = `https://${targetUrl}`;
        }
        
        // Redirect the user to the target URL
        window.location.href = targetUrl;
      } catch (err) {
        console.error("Error processing QR code:", err);
        setError("An error occurred while processing this QR code");
      }
    };
    
    fetchQRLink();
  }, [shortCode]);
  
  // Function to record the scan with device and location information
  const recordScan = async (qrLinkId: string) => {
    try {
      // Get browser and OS information from navigator
      const browserInfo = getBrowserInfo();
      const userAgent = navigator.userAgent;
      
      // Simplified device detection
      const deviceType = /mobile|android|iphone|ipad|ipod/i.test(userAgent) 
        ? "mobile" 
        : /tablet|ipad/i.test(userAgent) 
          ? "tablet" 
          : "desktop";
      
      // Use Supabase Edge Function or RPC to record the scan
      await supabase.rpc('record_scan', {
        qr_link_id_param: qrLinkId,
        browser_param: browserInfo.browser,
        os_param: browserInfo.os,
        device_type_param: deviceType,
        referrer_param: document.referrer || null
      });
      
    } catch (err) {
      console.error("Error recording scan:", err);
      // Don't throw here - we want the redirect to happen even if tracking fails
    }
  };
  
  // Function to get browser and OS information
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";
    
    // Browser detection
    if (userAgent.indexOf("Firefox") > -1) {
      browser = "Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
      browser = "Samsung Browser";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
      browser = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
      browser = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
      browser = "Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
      browser = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
      browser = "Safari";
    }
    
    // OS detection
    if (userAgent.indexOf("Win") > -1) {
      os = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
      os = "macOS";
    } else if (userAgent.indexOf("Linux") > -1) {
      os = "Linux";
    } else if (userAgent.indexOf("Android") > -1) {
      os = "Android";
    } else if (userAgent.indexOf("like Mac") > -1) {
      os = "iOS";
    }
    
    return { browser, os };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-destructive mb-4">QR Code Error</h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="mt-4">
              <a 
                href="/" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-primary underline-offset-4 hover:underline"
              >
                Go to Homepage
              </a>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
