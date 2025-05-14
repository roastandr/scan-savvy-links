
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeaderProps {
  hasError: boolean;
}

export function DashboardHeader({ hasError }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {hasError 
            ? "Showing demo data. Connection to database unavailable."
            : "Welcome back! Here's an overview of your QR codes."}
        </p>
      </div>
      <Button asChild>
        <Link to="/qr-codes/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create QR Code
        </Link>
      </Button>
    </div>
  );
}
