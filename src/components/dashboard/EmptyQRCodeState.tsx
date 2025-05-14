
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function EmptyQRCodeState() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No QR Codes Yet</h3>
          <p className="text-center text-muted-foreground">
            You haven't created any QR codes yet. Get started by creating your first one.
          </p>
          <Button asChild>
            <Link to="/qr-codes/new">Create QR Code</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
