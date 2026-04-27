import Preloader from "@/components/Preloader";
import MetricsAdminPanel from "@/components/MetricsAdminPanel";
import SocialDock from "@/components/SocialDock";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient();
const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1800;

const AdminShortcutListener = () => {
  const navigate = useNavigate();
  const countRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onSecretClick = () => {
      countRef.current += 1;
      if (countRef.current >= SECRET_CLICKS_REQUIRED) {
        countRef.current = 0;
        navigate("/admin");
      }
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        countRef.current = 0;
      }, SECRET_CLICK_WINDOW_MS);
    };

    window.addEventListener("af-admin-secret-click", onSecretClick as EventListener);
    return () => {
      window.removeEventListener("af-admin-secret-click", onSecretClick as EventListener);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Preloader />
    <TooltipProvider>
      <SocialDock />
      <Toaster />
      <Sonner />
      <HashRouter>
        <AdminShortcutListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<MetricsAdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
