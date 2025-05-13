
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useToast } from "@/hooks/use-toast";

export default function Demo() {
  const { toast } = useToast();
  
  const handleSaveQRCode = (qrCodeData: any) => {
    // In demo mode, we just show a toast and don't save anything
    toast({
      title: "Demo Mode",
      description: "In the full version, your QR code would be saved. Sign up to use all features!",
    });
  };
  
  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">QRTrakr Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Try out our QR code generator and see how tracking works. Sign up for the full experience.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a QR Code</CardTitle>
            <CardDescription>
              Generate a custom QR code to test the features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Try generating a QR code with our easy-to-use generator. In demo mode, QR codes aren't saved,
                but you can see how the generator works.
              </p>
              <Button asChild>
                <Link to="/demo/creator">Launch QR Creator</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Analytics Preview</CardTitle>
            <CardDescription>
              See a sample of our analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Explore a preview of our analytics dashboard with sample data to see how QRTrakr
                helps you understand QR code performance.
              </p>
              <Button asChild>
                <Link to="/demo/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Create your free account to start generating and tracking QR codes with full functionality.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Sign Up Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
