
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart, 
  Home, 
  PlusCircle, 
  QrCode, 
  Settings, 
  User,
  Menu,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const mainMenu: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    title: "QR Codes",
    path: "/qr-codes",
    icon: QrCode,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart,
  },
];

const secondaryMenu: MenuItem[] = [
  {
    title: "Account",
    path: "/account",
    icon: User,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Toggle sidebar for mobile
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(prev => !prev);
  };

  return (
    <Sidebar className={cn(
      "lg:static fixed z-50 transition-transform duration-300",
      showMobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <SidebarHeader className="px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="small" />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <Link to="/qr-codes/new">
            <Button className="w-full justify-start">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create QR Code
            </Button>
          </Link>
        </div>
        <SidebarMenu>
          {mainMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarMenu className="mt-6">
          {secondaryMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 flex justify-between items-center">
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut} 
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      
      {/* Mobile overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
    </Sidebar>
  );
}
