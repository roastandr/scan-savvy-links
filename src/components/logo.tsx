
import { QrCode } from "lucide-react";

export function Logo({ size = "default" }: { size?: "default" | "small" | "large" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl",
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="gradient-bg p-1.5 rounded-md shadow-md">
        <QrCode className="text-white" size={size === "large" ? 32 : size === "small" ? 16 : 24} />
      </div>
      <span className={`font-bold ${sizeClasses[size]} gradient-text`}>QRTrakr</span>
    </div>
  );
}
