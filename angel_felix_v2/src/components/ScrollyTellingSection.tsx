import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const SCROLLY_MULE_DEER_IMAGE = "/custom/scrolly-mule-deer.jpg";

gsap.registerPlugin(ScrollTrigger);

const ScrollyTellingSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // FASE 1: La imagen crece (zoom de mira)
      tl.to(imageRef.current, {
        scale: 3, // Zoom más agresivo para simular la mira
        duration: 2,
        ease: "power1.inOut",
      })
      // Activar la mira (Crosshair)
      .to(scopeRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
      }, "<") // Al inicio del zoom
      
        // El Texto 1 desaparece
        .to(
          text1Ref.current,
          {
            y: -100,
            opacity: 0,
            duration: 1,
          },
          "<" 
        )
        // El overlay se oscurece
        .to(
          overlayRef.current,
          {
            opacity: 0.4,
            duration: 2,
          },
          "<"
        );

      // FASE 2: Aparece el segundo texto
      tl.fromTo(
        text2Ref.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 2,
          ease: "power2.out",
        }
      );

      // FASE 3: Zoom final sostenido
      tl.to(imageRef.current, {
        scale: 4,
        duration: 2,
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-earth">
      
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        
        {/* IMAGEN DE FONDO */}
        <img
          ref={imageRef}
          src={SCROLLY_MULE_DEER_IMAGE}
          alt="Mule Deer"
          className="absolute h-full w-full object-cover opacity-80"
          style={{ willChange: "transform" }}
        />

        {/* OVERLAY MIRA TELESCOPICA (SCOPE) */}
        <div 
          ref={scopeRef} 
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0"
          style={{ transform: 'scale(1.2)' }}
        >
           {/* Círculo exterior borroso */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,black_70%)]" />
           
           {/* Cruz de la mira (SVG) */}
           <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0 z-30 opacity-80">
             <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.1" />
             <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.1" />
             <line x1="50" y1="0" x2="50" y2="10" stroke="white" strokeWidth="0.5" />
             <line x1="50" y1="90" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
             <line x1="0" y1="50" x2="10" y2="50" stroke="white" strokeWidth="0.5" />
             <line x1="90" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
             <circle cx="50" cy="50" r="0.2" fill="red" />
           </svg>
        </div>

        {/* OVERLAY OSCURO GENERAL */}
        <div 
          ref={overlayRef} 
          className="absolute inset-0 bg-black opacity-20" 
        />

        {/* CONTENIDO DE TEXTO 1 */}
        <div className="absolute z-10 p-8 text-center">
          <h2
            ref={text1Ref}
            className="font-display text-6xl font-bold text-cream md:text-8xl drop-shadow-2xl"
          >
            The Wild <br />
            <span className="text-gold">Essence</span>
          </h2>
        </div>

        {/* CONTENIDO DE TEXTO 2 */}
        <div className="absolute z-10 max-w-2xl p-8 text-center">
          <h2
            ref={text2Ref}
            className="font-display text-5xl font-bold text-white opacity-0 md:text-7xl drop-shadow-2xl"
          >
            Precision in <br />
            Every <span className="text-accent">Moment</span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ScrollyTellingSection;
