
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileSidebarButton } from "@/layouts/mobile-sidebar-button";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <MobileSidebarButton toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      </div>
    </SidebarProvider>
  );
}
