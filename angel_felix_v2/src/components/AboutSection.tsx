import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "25+", label: "Years of Experience" },
  { value: "500+", label: "Satisfied Hunters" },
  { value: "100%", label: "Hunting Success" },
];

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["60px", "0px", "0px", "-40px"]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.98]);

  // Staggered stats animation
  const statsOpacity = useTransform(scrollYProgress, [0.15, 0.4, 0.6, 0.85], [0, 1, 1, 0]);
  const statsY = useTransform(scrollYProgress, [0.15, 0.4, 0.6, 0.85], ["40px", "0px", "0px", "-20px"]);

  return (
    <section 
      id="about"
      ref={ref} 
      className="relative flex min-h-screen snap-section items-center justify-center overflow-hidden bg-secondary"
    >
      <div className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          className="text-center"
          style={{ opacity, y, scale }}
        >
          <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
            Angel Felix Outfitter
          </span>
          <h2 className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
            The Sonora Tradition
          </h2>
          <div className="elegant-line mx-auto mb-8" />
          <p className="mx-auto max-w-3xl font-body text-lg leading-relaxed text-muted-foreground md:text-xl">
            We are a family business with over two decades dedicated to offering 
            exceptional hunting experiences in the wild lands of Sonora, Mexico. 
            Our commitment is to provide ethical, safe, and memorable hunts, 
            always respecting wildlife conservation and the environment.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3"
          style={{ opacity: statsOpacity, y: statsY }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-display text-5xl font-medium text-primary md:text-6xl">
                {stat.value}
              </span>
              <p className="mt-2 font-body text-sm uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
