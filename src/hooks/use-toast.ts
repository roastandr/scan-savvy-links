
import { toast as sonnerToast, ToastT } from "sonner";
import { ToastActionElement } from "@/components/ui/toast";

type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const toast = ({ title, description, action, variant }: ToastProps) => {
    const options: Parameters<typeof sonnerToast>[1] = {
      description,
      action,
    };
    
    if (variant === "destructive") {
      return sonnerToast.error(title, options);
    }
    
    return sonnerToast(title, options);
  };

  return { toast };
};

export { toast } from "sonner";
