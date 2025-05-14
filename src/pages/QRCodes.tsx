
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { QRCard, QRCodeData } from "@/components/qr-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function QRCodes() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch QR codes from database
  useEffect(() => {
    const fetchQRCodes = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('qr_links')
          .select(`
            id, 
            name, 
            slug, 
            target_url, 
            created_at, 
            expires_at, 
            is_active, 
            color
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Also fetch scan counts for each QR code
        const qrCodesWithScans = await Promise.all(
          (data || []).map(async (qrCode) => {
            const { count, error: scanError } = await supabase
              .from('scans')
              .select('id', { count: 'exact', head: true })
              .eq('qr_link_id', qrCode.id);
            
            if (scanError) {
              console.error("Error fetching scan count:", scanError);
              return {
                id: qrCode.id,
                name: qrCode.name,
                shortCode: qrCode.slug,
                targetUrl: qrCode.target_url,
                createdAt: qrCode.created_at,
                expiresAt: qrCode.expires_at,
                active: qrCode.is_active,
                scanCount: 0,
                color: qrCode.color,
              } as QRCodeData;
            }
            
            return {
              id: qrCode.id,
              name: qrCode.name,
              shortCode: qrCode.slug,
              targetUrl: qrCode.target_url,
              createdAt: qrCode.created_at,
              expiresAt: qrCode.expires_at,
              active: qrCode.is_active,
              scanCount: count || 0,
              color: qrCode.color,
            } as QRCodeData;
          })
        );
        
        setQrCodes(qrCodesWithScans);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast({
          title: "Failed to load QR codes",
          description: "There was an error loading your QR codes. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQRCodes();
  }, [user, toast]);

  // Filter QR codes based on search query
  useEffect(() => {
    const filtered = qrCodes.filter(
      (qr) =>
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQRCodes(filtered);
  }, [searchQuery, qrCodes]);

  const handleDeleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
      toast({
        title: "QR Code deleted",
        description: "The QR code has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Failed to delete QR code",
        description: error.message || "There was an error deleting the QR code.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_links')
        .update({ is_active: active })
        .eq('id', id);
      
      if (error) throw error;
      
      setQrCodes(
        qrCodes.map((qr) => (qr.id === id ? { ...qr, active } : qr))
      );
      toast({
        title: active ? "QR Code activated" : "QR Code deactivated",
        description: `The QR code has been ${active ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error: any) {
      console.error("Error updating QR code:", error);
      toast({
        title: "Failed to update QR code",
        description: error.message || "There was an error updating the QR code status.",
        variant: "destructive",
      });
    }
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
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQRCodes.length > 0 ? (
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
