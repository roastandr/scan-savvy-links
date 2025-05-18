
import { supabase } from "@/integrations/supabase/client";
import { QRCodeData } from "@/components/qr-card";
import { ToastProps } from "@/hooks/use-toast";

export const handleDeleteQRCode = async (
  id: string, 
  qrCodes: QRCodeData[], 
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeData[]>>,
  toast: (props: ToastProps) => void
): Promise<void> => {
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

export const handleToggleActive = async (
  id: string, 
  active: boolean, 
  qrCodes: QRCodeData[], 
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeData[]>>,
  toast: (props: ToastProps) => void
): Promise<void> => {
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
