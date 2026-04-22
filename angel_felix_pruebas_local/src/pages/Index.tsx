import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ScrollyTellingSection from "@/components/ScrollyTellingSection";
import HuntsSection from "@/components/HuntsSection";
import GalleryPreview from "@/components/GalleryPreview";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import BookingModal from "@/components/BookingModal";
import { trackPageView } from "@/lib/metricsClient";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedHunt, setSelectedHunt] = useState("General Deposit");
  const location = useLocation();
  const navigate = useNavigate();

  const openBooking = (huntName: string = "General Deposit") => {
    setSelectedHunt(huntName);
    setIsBookingOpen(true);
  };

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const sectionId = state?.scrollTo;

    if (!sectionId) return;

    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    navigate("/", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    trackPageView("/").catch(() => {});
  }, []);

  return (
    <main className="bg-background">
      <Navigation onBookNow={() => openBooking("General Deposit")} />
      <HeroSection onBookNow={() => openBooking("General Deposit")} />
      <ScrollyTellingSection />
      <HuntsSection onBookNow={openBooking} />
      <GalleryPreview />
      <AboutSection />
      <ContactSection />
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        selectedHunt={selectedHunt}
      />
    </main>
  );
};

export default Index;
