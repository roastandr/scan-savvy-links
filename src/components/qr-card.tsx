
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Check, ExternalLink, Eye, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { truncateString, formatDate } from "@/lib/utils";

export type QRCodeData = {
  id: string;
  name: string;
  shortCode: string;
  targetUrl: string;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
  scanCount: number;
  color: string;
};

type QRCardProps = {
  qrCode: QRCodeData;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
};

export function QRCard({ qrCode, onDelete, onToggleActive }: QRCardProps) {
  const [isActive, setIsActive] = useState(qrCode.active);
  
  const handleToggleActive = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggleActive(qrCode.id, newState);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">{qrCode.name}</CardTitle>
            <CardDescription>
              <div className="flex gap-2 items-center text-xs">
                <span>{truncateString(qrCode.targetUrl, 30)}</span>
                <a href={qrCode.targetUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                <Check className="h-3 w-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                <XCircle className="h-3 w-3 mr-1" /> Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(qrCode.createdAt)}</span>
            </div>
            {qrCode.expiresAt && (
              <div className="text-xs text-muted-foreground">
                Expires: {formatDate(qrCode.expiresAt)}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{qrCode.scanCount}</div>
            <div className="text-xs text-muted-foreground">Scans</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <Switch checked={isActive} onCheckedChange={handleToggleActive} />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/qr-codes/${qrCode.id}`}>
                <Eye className="h-4 w-4 mr-2" /> View
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                  <span className="sr-only">Open menu</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={() => onDelete(qrCode.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
