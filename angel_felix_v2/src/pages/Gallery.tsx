import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BookingModal from "@/components/BookingModal";

const GALLERY_FILES = [
  ...Array.from({ length: 34 }, (_, i) => `photo-${i + 1}.jpg`),
  "photo-35.jpeg",
];

const Gallery = () => {
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const images = GALLERY_FILES.map(
      (fileName) => `${import.meta.env.BASE_URL}album/${fileName}`
    );
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
    
    // Subir al inicio de la página al entrar
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-black">
      <Navigation onBookNow={() => setIsBookingOpen(true)} />
      
      <div className="pt-32 pb-20 px-4 container mx-auto">
        <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-12 uppercase text-xs tracking-[0.2em] font-bold"
        >
            <ArrowLeft size={16} />
            Back to Home
        </Link>

        <header className="mb-16 text-center">
            <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
                The Trophy Collection
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6">Our Legacy</h1>
            <div className="elegant-line mx-auto" />
        </header>

        {/* Uniform Grid instead of Masonry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shuffledImages.map((src, index) => (
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
      
      <footer className="py-20 border-t border-white/10 text-center flex flex-col gap-4 items-center">
         <p className="text-gray-500 text-xs uppercase tracking-widest">© 2025 Angel Felix Hunting</p>
         <a 
            href="https://m2aq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
          >
            Developed by M2AQ
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
