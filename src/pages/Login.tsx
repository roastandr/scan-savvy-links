
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
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
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your QR Code analytics dashboard
              </p>
            </div>
            <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />
          </div>
          <div className="hidden bg-muted lg:block rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-brand-500/20 to-brand-400/20" />
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative h-full p-8 flex flex-col justify-center">
                <blockquote className="space-y-2">
                  <p className="text-xl">
                    "QRTrakr has transformed how we track our marketing campaigns. The analytics are invaluable."
                  </p>
                  <footer className="text-sm font-medium">
                    — Marketing Director at Example Corp
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
