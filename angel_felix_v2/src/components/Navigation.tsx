import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import logo from "@/assets/logo-new.jpg";

interface NavigationProps {
  onBookNow: () => void;
}

const Navigation = ({ onBookNow }: NavigationProps) => {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > window.innerHeight); // Solo activar fondo sólido cuando pasamos la intro completa
  });

  return (
    <motion.nav
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-4">
        {/* Left column (empty or logo) */}
        <div className="flex items-center">
          {/* logo space */}
        </div>

        {/* Center column (Links) */}
        <div className="hidden items-center justify-center gap-8 md:flex mix-blend-difference">
          {["Hunts", "About", "Contact"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-body text-xs uppercase tracking-widest text-white transition-colors hover:text-primary"
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Right column (Button) */}
        <div className="flex justify-end">
          <button
            onClick={onBookNow}
            className={`border px-4 py-2 font-body text-xs uppercase tracking-widest transition-all duration-300 hover:bg-primary hover:text-primary-foreground ${
                scrolled ? "border-primary/50 text-primary" : "border-white/50 text-white hover:border-primary mix-blend-difference"
            }`}
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
