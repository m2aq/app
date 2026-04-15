import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-angel-felix.png";

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bloquear el scroll al iniciar
    document.body.style.overflow = "hidden";

    const handleLoad = () => {
      // Dar un pequeño margen extra para asegurar suavidad
      setTimeout(() => {
        setIsLoading(false);
        // Desbloquear el scroll cuando termine la animación de salida
        setTimeout(() => {
          document.body.style.overflow = "auto";
        }, 800); 
      }, 1500); // Un poco más de tiempo para que se aprecie el logo
    };

    // Si la página ya cargó (por caché), ejecutar manual
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      const timeout = setTimeout(handleLoad, 5000);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <div className="flex flex-col items-center">
            {/* Logo con Aura sutil */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
               {/* Resplandor INTENSO detrás del logo */}
               <div className="absolute inset-0 bg-white/40 blur-[80px] rounded-full scale-150" />
               
               <motion.img 
                src={logo} 
                alt="Angel Felix Hunting" 
                className="w-48 md:w-64 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                animate={{ 
                  filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
               />
            </motion.div>
            
            {/* Texto de carga */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-white text-[10px] tracking-[0.3em] uppercase"
            >
              Loading Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
