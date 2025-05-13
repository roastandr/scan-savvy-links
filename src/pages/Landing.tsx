
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { CheckCircle, BarChart, QrCode, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
            </nav>
            <ModeToggle />
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-10" />
        <div
          className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent -z-10"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent -z-10"
          aria-hidden="true"
        />

        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Track and analyze your QR code performance
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create custom QR codes, track scans, and gain insights with our analytics dashboard.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">Try Demo</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative bg-gradient-to-b from-muted/70 to-muted p-8 rounded-2xl shadow-lg">
                <div className="absolute inset-0 rounded-2xl bg-grid-white/10" />
                <div className="relative">
                  <QrCode className="h-16 w-16 mb-4 text-primary" />
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">QR Code Analytics</h3>
                    <p className="text-muted-foreground">Track scans in real-time</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-3"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="text-sm">QR Code scan from {["United States", "Germany", "Japan"][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24" id="features">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Powerful QR code tracking features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Everything you need to create, manage, and track your QR codes in one platform
            </p>
          </div>
          <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col p-6 space-y-4 rounded-lg border border-border/50 bg-card"
              >
                <div className="p-2 rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to start tracking your QR codes?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Sign up for QRTrakr today and start tracking your QR code performance.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="small" />
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QRTrakr. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link to="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link to="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: QrCode,
    title: "QR Code Generator",
    description: "Create custom QR codes with your branding and colors that link to any URL."
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description: "Track scans, view geographical data, and analyze user behavior with detailed analytics."
  },
  {
    icon: Shield,
    title: "Data Privacy",
    description: "Your data is secure with our enterprise-grade security and row-level protection."
  },
  {
    icon: CheckCircle,
    title: "Scan Validation",
    description: "Verify scans and prevent fraud with our advanced validation system."
  },
  {
    icon: CheckCircle,
    title: "Device Tracking",
    description: "See which devices and browsers are scanning your QR codes."
  },
  {
    icon: CheckCircle,
    title: "Expiration Control",
    description: "Set expiration dates for your QR codes to control access."
  },
];
