import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import logo from "@/assets/logo-angel-felix.png";
import heroBg from "@/assets/hero-cimarron.jpg";

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // --- TRANSITIONS ---
  
  // 1. TRANSPARENT LOGO
  const logoScale = useTransform(scrollYProgress, [0, 0.4], [1.2, 0.8]);
  const logoOpacity = useTransform(scrollYProgress, [0.2, 0.45], [1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-10%"]);

  // 2. BACKGROUND (Hero Image)
  const bgOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0.3, 1]); // Starts slightly visible
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  // 3. HERO TEXT
  const textOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.45, 0.6], ["30px", "0px"]);

  return (
    <section ref={ref} className="relative h-[200vh] bg-black">
      
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        
        {/* GLOBAL BACKGROUND */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ 
            scale: bgScale,
            opacity: bgOpacity
          }}
        >
          <img
            src={heroBg}
            alt="Desert bighorn sheep"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </motion.div>

        {/* TRANSPARENT LOGO with Intense Aura Glow */}
        <motion.div
          className="relative z-20 flex items-center justify-center"
          style={{ scale: logoScale, opacity: logoOpacity, y: logoY }}
        >
          {/* Intense Radial Glow behind the logo - Layer 1 (Large & Soft) */}
          <div className="absolute h-[30rem] w-[30rem] rounded-full bg-white/30 blur-[120px]" />
          
          {/* Core Glow - Layer 2 (Smaller & Brighter) */}
          <div className="absolute h-64 w-64 rounded-full bg-white/40 blur-[60px]" />
          
          <img
            src={logo}
            alt="Angel Felix Outfitter"
            className="w-72 md:w-[32rem] drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] drop-shadow-[0_0_45px_rgba(255,255,255,0.5)] drop-shadow-[0_0_100px_rgba(255,255,255,0.3)]" 
          />
        </motion.div>

        {/* HERO CONTENT */}
        <motion.div
          className="absolute bottom-20 z-10 flex flex-col items-center text-center md:bottom-32"
          style={{ opacity: textOpacity, y: textY }}
        >
          <h1 className="mb-6 font-display text-4xl font-medium tracking-wider text-white md:text-6xl lg:text-7xl drop-shadow-lg">
            SONORA HUNTS
          </h1>
          
          <div className="elegant-line mb-6 w-24 bg-primary" />

          <p className="max-w-xl text-lg font-light tracking-wide text-gray-200 md:text-xl">
            Exclusive hunting experiences in the heart of Sonora, Mexico
          </p>

          <div className="mt-10">
            <button
              onClick={onBookNow}
              className="inline-block border border-white/50 bg-black/30 px-8 py-4 font-body text-sm uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:bg-primary hover:border-primary"
            >
              Book Your Hunt
            </button>
          </div>
        </motion.div>

        {/* SCROLL INDICATOR */}
        <motion.div
          className="absolute bottom-28 left-1/2 z-30 -translate-x-1/2 md:bottom-32"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
        >
          <div className="flex flex-col items-center gap-2">
            <motion.span
              className="text-xs uppercase tracking-widest text-white/80"
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              Scroll Down
            </motion.span>

            <div className="relative flex h-12 w-7 items-start justify-center rounded-full border border-white/55 bg-black/20 p-1">
              <motion.div
                className="h-2 w-2 rounded-full bg-white/90"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <motion.div
              className="text-white/70"
              animate={{ y: [0, 4, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M1 1L7 8L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
