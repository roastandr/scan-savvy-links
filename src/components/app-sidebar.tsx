
import { Link, useLocation } from "react-router-dom";
import { BarChart, Home, PlusCircle, QrCode, Settings, User } from "lucide-react";
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

interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
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
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="small" />
        </Link>
        <SidebarTrigger />
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
        <div className="px-3 py-2">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
