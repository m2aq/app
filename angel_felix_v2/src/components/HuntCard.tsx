import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface HuntCardProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  index: number;
  reverse?: boolean;
}

const HuntCard = ({ title, subtitle, description, image, index, reverse = false }: HuntCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col items-center gap-8 lg:gap-16 ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      {/* Image */}
      <motion.div
        className="w-full overflow-hidden lg:w-1/2"
        initial={{ opacity: 0, x: reverse ? 100 : -100 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className={`w-full text-center lg:w-1/2 ${reverse ? "lg:text-right" : "lg:text-left"}`}
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.span
          className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {subtitle}
        </motion.span>
        
        <motion.h3
          className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {title}
        </motion.h3>

        <motion.div
          className={`mb-6 h-px w-24 bg-primary ${reverse ? "lg:ml-auto" : ""} mx-auto lg:mx-0`}
          initial={{ width: 0 }}
          animate={isInView ? { width: "6rem" } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        />

        <motion.p
          className="mb-8 font-body text-base leading-relaxed text-muted-foreground md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {description}
        </motion.p>

        <motion.a
          href="#contacto"
          className="inline-block border border-primary/50 px-6 py-3 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
        >
          Más Información
        </motion.a>
      </motion.div>
    </motion.div>
  );
};

export default HuntCard;
