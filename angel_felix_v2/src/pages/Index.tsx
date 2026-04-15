import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ScrollyTellingSection from "@/components/ScrollyTellingSection";
import HuntsSection from "@/components/HuntsSection";
import GalleryPreview from "@/components/GalleryPreview";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import BookingModal from "@/components/BookingModal";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedHunt, setSelectedHunt] = useState("General Deposit");

  const openBooking = (huntName: string = "General Deposit") => {
    setSelectedHunt(huntName);
    setIsBookingOpen(true);
  };

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
