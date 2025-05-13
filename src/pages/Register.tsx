
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isAuthenticated } = useAuth();

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      await signUp(email, password);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 lg:h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <div className="w-full flex justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-[1200px] gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
              <p className="text-muted-foreground">
                Enter your information to create your QRTrakr account
              </p>
            </div>
            <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />
          </div>
          <div className="hidden lg:block rounded-lg overflow-hidden">
            <div className="relative h-full w-full bg-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-brand-500/20 to-brand-400/20" />
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative h-full p-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-background/10 backdrop-blur-md p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">1</span>
                      </div>
                      <div className="text-sm text-card-foreground">Create a custom QR code</div>
                    </div>
                  </div>
                  <div className="inline-block rounded-lg bg-background/10 backdrop-blur-md p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">2</span>
                      </div>
                      <div className="text-sm text-card-foreground">Track scans and analytics</div>
                    </div>
                  </div>
                  <div className="inline-block rounded-lg bg-background/10 backdrop-blur-md p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">3</span>
                      </div>
                      <div className="text-sm text-card-foreground">Gain insights from user data</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
