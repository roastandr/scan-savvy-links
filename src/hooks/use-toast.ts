
import { toast as sonnerToast } from "sonner";
import { ToastActionElement } from "@/components/ui/toast";

export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
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

// Create the toast array
const toasts: ToasterToast[] = [];

export function useToast() {
  const toast = ({ title, description, action, variant }: ToastProps) => {
    const id = generateToastId();
    
    // Create a new toast and add it to the toasts array
    const newToast: ToasterToast = {
      id,
      title,
      description,
      action
    };
    
    toasts.push(newToast);
    
    // Ensure we don't exceed the toast limit
    if (toasts.length > TOAST_LIMIT) {
      toasts.shift();
    }
    
    const options: Parameters<typeof sonnerToast>[1] = {
      id,
      description,
      action,
    };

    if (variant === "destructive") {
      options.style = { background: "var(--destructive)", color: "var(--destructive-foreground)" };
    }
    
    return sonnerToast(title as string, options);
  };

  return {
    toast,
    toasts,
  };
}

export { toast } from "sonner";
