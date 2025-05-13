import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/main-layout";
import Dashboard from "./pages/Dashboard";
import QRCodes from "./pages/QRCodes";
import QRCodesNew from "./pages/QRCodesNew";
import QRCodeDetail from "./pages/QRCodeDetail";
import Analytics from "./pages/Analytics";
import Redirect from "./pages/Redirect";
import Demo from "./pages/Demo";
import DemoLayout from "./components/demo/demo-layout";
import DemoCreator from "./pages/DemoCreator";
import DemoAnalytics from "./pages/DemoAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect system */}
          <Route path="/r/:shortCode" element={<Redirect />} />
          
          {/* Demo routes */}
          <Route path="/demo" element={<DemoLayout />}>
            <Route index element={<Demo />} />
            <Route path="creator" element={<DemoCreator />} />
            <Route path="analytics" element={<DemoAnalytics />} />
          </Route>
          
          {/* Protected routes - in a real app, these would be protected by auth */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="qr-codes" element={<QRCodes />} />
            <Route path="qr-codes/new" element={<QRCodesNew />} />
            <Route path="qr-codes/:id" element={<QRCodeDetail />} />
            <Route path="analytics" element={<Analytics />} />
            {/* Other protected routes */}
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
