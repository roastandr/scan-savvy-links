
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const { toast } = useToast();
  
  const handleDeleteAccount = async () => {
    // In a real app, we'd call an API to delete the user's account
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted.",
    });
    
    // After deleting the account, sign the user out
    await signOut();
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully saved.",
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive email notifications when your QR codes are scanned
                </span>
              </Label>
              <Switch
                id="email-notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="weekly-digest" className="flex flex-col space-y-1">
                <span>Weekly digest</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Get a weekly summary of your QR code performance
                </span>
              </Label>
              <Switch
                id="weekly-digest"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings}>Save settings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark mode</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings}>Save settings</Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="text-destructive">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-destructive">
            <p className="text-sm">
              Once you delete your account, all of your data, including QR codes and analytics, will be permanently removed. This action cannot be undone.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 size={16} />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
