
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Redirect() {
  const { shortCode } = useParams();
  const [status, setStatus] = useState<"loading" | "notFound" | "redirecting">("loading");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const lookupShortCode = async () => {
      try {
        // This would normally be a fetch to your backend
        // Simulating API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        let url = null;
        
        // Demo mock data
        const mockRedirects: Record<string, string> = {
          web123: "https://example.com",
          prod456: "https://example.com/product",
          event789: "https://example.com/event",
          offer123: "https://example.com/offer",
          contact45: "https://example.com/contact",
        };
        
        if (shortCode && mockRedirects[shortCode]) {
          url = mockRedirects[shortCode];
          setTargetUrl(url);
          
          // Log the scan (this would be an API call in real app)
          console.log("Logging scan for", shortCode);
          
          // Wait a bit, then redirect
          setStatus("redirecting");
          setTimeout(() => {
            window.location.href = url!;
          }, 1000);
        } else {
          setStatus("notFound");
        }
      } catch (error) {
        console.error("Error looking up short code:", error);
        setStatus("notFound");
      }
    };
    
    lookupShortCode();
  }, [shortCode]);
  
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
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h1 className="text-xl font-bold mt-4">QR Code Not Found</h1>
            <p className="text-muted-foreground">
              The QR code you scanned doesn't exist or has been deactivated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
