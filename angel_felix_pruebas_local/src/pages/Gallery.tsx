import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BookingModal from "@/components/BookingModal";
import { trackPageView } from "@/lib/metricsClient";

const GALLERY_FILES = [
  ...Array.from({ length: 12 }, (_, i) => `photo-${i + 1}.jpg`),
  ...Array.from({ length: 21 }, (_, i) => `photo-${i + 14}.jpg`),
  "photo-35.jpeg",
  "photo-36.jpg",
  "photo-13.jpg",
];

const Gallery = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const galleryImages = GALLERY_FILES.map(
    (fileName) => `${import.meta.env.BASE_URL}album/${fileName}`
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView("/gallery").catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-black">
      <Navigation onBookNow={() => setIsBookingOpen(true)} />

      <div className="container mx-auto px-4 pb-20 pt-32">
        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <header className="mb-16 text-center">
          <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
            The Trophy Collection
          </span>
          <h1 className="mb-6 font-display text-5xl text-white md:text-7xl">Our Legacy</h1>
          <div className="elegant-line mx-auto" />
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative h-[22rem] overflow-hidden rounded-lg border border-white/10 bg-black/40 p-3 sm:h-[20rem] lg:h-[19rem]"
            >
              <div className="flex h-full w-full items-center justify-center rounded-md bg-black/25">
                <img
                  src={src}
                  alt={`Experience ${index + 1}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="flex flex-col items-center gap-4 border-t border-white/10 pt-20 pb-32 md:pb-20 text-center">
        <p
          onClick={() => window.dispatchEvent(new Event("af-admin-secret-click"))}
          className="cursor-default text-xs uppercase tracking-widest text-gray-500"
        >
          &copy; 2025 Angel Felix Outfitter LLC. All rights reserved.
        </p>
        <a
          href="https://m2aq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-white/60"
        >
          Developed by m2aq
        </a>
      </footer>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedHunt="General Deposit"
      />
    </main>
  );
};

export default Gallery;
