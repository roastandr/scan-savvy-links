
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedia } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileSidebarButtonProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function MobileSidebarButton({
  toggleSidebar,
  isSidebarOpen
}: MobileSidebarButtonProps) {
  const isMobile = useMedia("(max-width: 1023px)");
  
  if (!isMobile) return null;
  
  return (
    <div className={cn(
      "fixed bottom-6 left-6 z-50 transition-opacity", 
      isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
    )}>
      <Button 
        onClick={toggleSidebar} 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
