
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { HexColorPicker } from "react-colorful";
import { generateShortCode } from "@/lib/utils";
import { CalendarIcon, Copy, Link, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type QRCodeGeneratorProps = {
  onSave: (qrCodeData: {
    name: string;
    targetUrl: string;
    shortCode: string;
    expiresAt: Date | null;
    fgColor: string;
    bgColor: string;
  }) => void;
  isLoading?: boolean;
};

export function QRCodeGenerator({ onSave, isLoading = false }: QRCodeGeneratorProps) {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [shortCode, setShortCode] = useState(generateShortCode());
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [fgColor, setFgColor] = useState("#7828f8");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trackingUrl, setTrackingUrl] = useState("");
  const { toast } = useToast();
  
  // Generate the tracking URL whenever the shortCode changes
  useEffect(() => {
    const origin = window.location.origin;
    setTrackingUrl(`${origin}/r/${shortCode}`);
  }, [shortCode]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    
    if (!targetUrl.trim()) {
      newErrors.targetUrl = "Target URL is required";
    } else {
      try {
        // Ensure URL has protocol
        const urlToCheck = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`;
        new URL(urlToCheck);
      } catch (error) {
        newErrors.targetUrl = "Please enter a valid URL";
      }
    }
    
    if (!shortCode.trim()) {
      newErrors.shortCode = "Short code is required";
    } else if (shortCode.length < 3) {
      newErrors.shortCode = "Short code must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      newErrors.shortCode = "Short code can only contain letters, numbers, underscores and hyphens";
    }
    
    // Validate that expiration date is not in the past
    if (expiresAt && expiresAt < new Date()) {
      newErrors.expiresAt = "Expiration date cannot be in the past";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure URL has protocol
    let processedUrl = targetUrl;
    if (processedUrl && !processedUrl.match(/^https?:\/\//i)) {
      processedUrl = `https://${processedUrl}`;
      setTargetUrl(processedUrl);
    }
    
    if (validateForm()) {
      onSave({
        name,
        targetUrl: processedUrl,
        shortCode,
        expiresAt,
        fgColor,
        bgColor,
      });
    }
  };

  const generateNewCode = () => {
    setShortCode(generateShortCode());
  };
  
  const copyTrackingUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "URL copied to clipboard",
      description: "The tracking URL has been copied to your clipboard.",
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create QR Code</h2>
          <p className="text-muted-foreground">
            Generate a custom QR code that links to your target URL.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My QR Code"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetUrl">Target URL</Label>
            <div className="flex items-center space-x-1 rounded-md border border-input px-3 py-1">
              <Link className="h-4 w-4 text-muted-foreground" />
              <Input
                id="targetUrl"
                placeholder="example.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className={`${errors.targetUrl ? "border-destructive" : ""} border-none px-0`}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a website URL (https:// will be added if missing)
            </p>
            {errors.targetUrl && <p className="text-xs text-destructive">{errors.targetUrl}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shortCode">Short Code</Label>
            <div className="flex gap-2">
              <Input
                id="shortCode"
                placeholder="Short code"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className={errors.shortCode ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={generateNewCode}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This will be part of your QR code URL. Only letters, numbers, underscores and hyphens.
            </p>
            {errors.shortCode && <p className="text-xs text-destructive">{errors.shortCode}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trackingUrl">Tracking URL</Label>
            <div className="flex gap-2">
              <Input
                id="trackingUrl"
                value={trackingUrl}
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copyTrackingUrl}
                title="Copy to clipboard"
                disabled={isLoading}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is the URL that will be encoded in your QR code. When scanned, we'll track the visit and redirect to your target URL.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Expiration Date (Optional)</Label>
            <DatePicker
              date={expiresAt}
              setDate={setExpiresAt}
              className="w-full"
              disabled={isLoading}
            />
            {errors.expiresAt && <p className="text-xs text-destructive">{errors.expiresAt}</p>}
            <p className="text-xs text-muted-foreground">
              When set, the QR code will stop working after this date.
            </p>
          </div>
          
          <div className="space-y-4">
            <Label>QR Code Style</Label>
            <Tabs defaultValue="foreground">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="foreground">Foreground Color</TabsTrigger>
                <TabsTrigger value="background">Background Color</TabsTrigger>
              </TabsList>
              <TabsContent value="foreground" className="space-y-2 mt-2">
                <div className="w-full h-[180px]">
                  <HexColorPicker color={fgColor} onChange={setFgColor} className="w-full" />
                </div>
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </TabsContent>
              <TabsContent value="background" className="space-y-2 mt-2">
                <div className="w-full h-[180px]">
                  <HexColorPicker color={bgColor} onChange={setBgColor} className="w-full" />
                </div>
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save QR Code"}
          </Button>
        </form>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="p-4 rounded-xl bg-white shadow-lg">
          <QRCodeSVG
            value={trackingUrl || window.location.origin}
            size={280}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
            includeMargin
          />
        </div>
        <div className="mt-4 text-center space-y-1">
          <p className="font-medium">{name || "QR Code Preview"}</p>
          <p className="text-sm text-muted-foreground">
            {targetUrl || "Your target URL"}
          </p>
          {expiresAt && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {expiresAt < new Date() ? (
                <span className="text-destructive">Expired {format(expiresAt, "PPP")}</span>
              ) : (
                <span>Expires {format(expiresAt, "PPP")}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
