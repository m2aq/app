import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BookingModal from "@/components/BookingModal";

const Gallery = () => {
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    // Generar array y barajarlo (ahora 28 fotos)
    const images = Array.from({ length: 28 }, (_, i) => `/album/photo-${i + 1}.jpg`);
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
                    className="relative overflow-hidden rounded-lg group aspect-[4/5]"
                >
                    <img 
                        src={src} 
                        alt={`Experience ${index}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="h-0.5 w-8 bg-primary transition-all duration-500 group-hover:w-full" />
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
