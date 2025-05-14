
import { toast as sonnerToast } from "sonner";
import { ToastActionElement } from "@/components/ui/toast";

type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateToastId() {
  return (count++).toString();
}

// This creates the context without toast state
const toasts: ToasterToast[] = [];

export const useToast = () => {
  const toast = ({ title, description, action, variant }: ToastProps) => {
    const id = generateToastId();
    
    const options: Parameters<typeof sonnerToast>[1] = {
      id,
      description,
      action,
    };
    
    if (variant === "destructive") {
      return sonnerToast.error(title, options);
    }
    
    return sonnerToast(title, options);
  };

  return {
    toast,
    toasts,
  };
};

export { toast } from "sonner";
