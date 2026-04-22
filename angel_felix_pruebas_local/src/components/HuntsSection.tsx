import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const BIGHORN_IMAGE = `${import.meta.env.BASE_URL}custom/specialties-bighorn.jpg`;
const MULE_DEER_IMAGE = `${import.meta.env.BASE_URL}custom/specialties-mule-deer.jpg`;
const COUES_DEER_IMAGE = `${import.meta.env.BASE_URL}custom/specialties-coues-deer.jpg`;
const ISLA_TIBURON_IMAGE = `${import.meta.env.BASE_URL}custom/isla-tiburon.jpeg`;

type HuntItemData = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const hunts: HuntItemData[] = [
  {
    title: "Desert Bighorn Sheep",
    subtitle: "The Ultimate Trophy",
    description: "One of the most challenging and prestigious hunts in North America. The Sonora Bighorn is world-renowned for its horn size and the rugged terrain it inhabits.",
    image: BIGHORN_IMAGE,
  },
  {
    title: "Desert Mule Deer",
    subtitle: "Tradition & Elegance",
    description: "Hunt the iconic Mule Deer in the desert of Sonora. We offer expeditions during the rutting season when bucks are most active.",
    image: MULE_DEER_IMAGE,
  },
  {
    title: "Coues Deer",
    subtitle: "Stealth & Precision",
    description: "The elusive Grey Ghost is one of Sonora's most prized and challenging hunts. It demands patience, glassing skill, and precision in rugged terrain.",
    image: COUES_DEER_IMAGE,
  },
  {
    title: "Isla Tiburón, Sonora",
    subtitle: "Hunting Experience",
    description: "Over the years, I've had the opportunity to hunt in some of the most demanding terrains in Sonora, including Isla Tiburón—one of the most prestigious locations for Desert Bighorn Sheep.\n\nSpending time in this environment taught me what it really takes to pursue these animals: long hours of glassing, understanding the mountains, and respecting every step of the process.\n\nMy experience in this terrain allows me to understand the level of preparation, patience, and precision required to succeed in one of the most challenging and rewarding hunts in North America.\n\nIf you're looking for a real hunting experience—not just a trip—this is it.\nLet's plan your next hunt the right way.",
    image: ISLA_TIBURON_IMAGE,
    ctaLabel: "Contact me today",
    ctaHref: "https://wa.me/14802510258",
  },
];

interface HuntsSectionProps {
  onBookNow: (huntName: string) => void;
}

const HuntItem = ({ hunt, index, onBookNow }: { hunt: HuntItemData; index: number; onBookNow: (name: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const isEven = index % 2 === 0;
  
  // Animations for sliding in from sides
  // If even: Image from Left (-x), Content from Right (+x)
  // If odd: Image from Right (+x), Content from Left (-x)
  
  const xLeft = useTransform(scrollYProgress, [0, 0.3], [-100, 0]);
  const xRight = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);
  const isMuleDeer = hunt.image === MULE_DEER_IMAGE;

  return (
    <div
      ref={ref}
      className={`flex min-h-screen snap-section flex-col items-center justify-center gap-8 px-4 py-20 lg:gap-16 ${!isEven ? "lg:flex-row-reverse" : "lg:flex-row"}`}
    >
      {/* Image Side */}
      <motion.div
        className="w-full lg:w-1/2"
        style={{ 
          x: isEven ? xLeft : xRight, 
          opacity, 
          scale 
        }}
      >
        <div
          className={`relative overflow-hidden rounded-lg shadow-2xl ${
            isMuleDeer ? "" : "aspect-[4/3]"
          }`}
        >
          <img
            src={hunt.image}
            alt={hunt.title}
            className={`h-full w-full transition-transform duration-700 ${
              isMuleDeer ? "h-auto object-contain" : "object-cover hover:scale-110"
            }`}
          />
          {!isMuleDeer && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          )}
        </div>
      </motion.div>

      {/* Content Side */}
      <motion.div
        className="w-full lg:w-1/2 text-center"
        style={{ 
          x: isEven ? xRight : xLeft, 
          opacity 
        }}
      >
        <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
          {hunt.subtitle}
        </span>
        
        <h3 className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
          {hunt.title}
        </h3>

        <div className="mb-6 h-px w-24 bg-primary mx-auto" />

        <p className="mb-8 whitespace-pre-line font-body text-base leading-relaxed text-muted-foreground md:text-lg">
          {hunt.description}
        </p>

        {hunt.ctaHref ? (
          <a
            href={hunt.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-primary/50 px-6 py-3 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            {hunt.ctaLabel ?? "Contact"}
          </a>
        ) : (
          <button
            onClick={() => onBookNow(hunt.title)}
            className="inline-block border border-primary/50 px-6 py-3 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Book Now
          </button>
        )}
      </motion.div>
    </div>
  );
};

const HuntsSection = ({ onBookNow }: HuntsSectionProps) => {
  return (
    <section id="hunts" className="relative bg-background overflow-hidden">
      {/* Section header */}
      <div className="flex min-h-[40vh] items-center justify-center pt-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
            Our Specialties
          </span>
          <h2 className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
            Available Hunts
          </h2>
          <div className="elegant-line mx-auto" />
        </div>
      </div>

      {/* Hunt items */}
      {hunts.map((hunt, index) => (
        <HuntItem key={hunt.title} hunt={hunt} index={index} onBookNow={onBookNow} />
      ))}
    </section>
  );
};

export default HuntsSection;
