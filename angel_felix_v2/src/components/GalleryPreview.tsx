import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// Generamos el array de imágenes (1 al 28)
const images = Array.from({ length: 28 }, (_, i) => `/album/photo-${i + 1}.jpg`);

const GalleryPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 mb-10 text-center relative z-20">
        <motion.div style={{ opacity, scale }}>
            <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
                Visual Experience
            </span>
            <h2 className="font-display text-4xl text-white mb-4">The Gallery</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Witness the moments that define our legacy. Click to explore the full collection.
            </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <Link to="/gallery" className="block relative z-0 cursor-pointer group">
        <div className="flex overflow-hidden select-none gap-4">
          {/* Loop doble para efecto infinito fluido */}
          <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4 group-hover:[animation-play-state:paused]">
            {images.slice(0, 15).map((src, index) => (
              <div key={index} className="relative aspect-[4/3] h-64 w-80 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-primary/20">
                <img 
                    src={src} 
                    alt={`Gallery ${index}`} 
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
          <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4 group-hover:[animation-play-state:paused]" aria-hidden="true">
            {images.slice(0, 15).map((src, index) => (
              <div key={`copy-${index}`} className="relative aspect-[4/3] h-64 w-80 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-30">
                <img 
                    src={src} 
                    alt={`Gallery ${index}`} 
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    loading="lazy"
                />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay con texto "View Gallery" al hacer hover */}
        <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm px-8 py-4 rounded-full border border-white/20">
                <span className="text-white uppercase tracking-widest text-sm font-bold">Explore Full Gallery</span>
            </div>
        </div>
      </Link>
    </section>
  );
};

export default GalleryPreview;
