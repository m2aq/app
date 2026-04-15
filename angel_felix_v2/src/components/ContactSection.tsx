import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import logo from "@/assets/logo-angel-felix.png";

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], ["60px", "0px", "0px", "0px"]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  // Staggered content
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.4], ["30px", "0px"]);

  return (
    <section 
      id="contact" 
      ref={ref} 
      className="relative flex min-h-screen snap-section items-center justify-center bg-card"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <motion.img
          src={logo}
          alt="Angel Felix Outfitter"
          className="mx-auto mb-8 h-20 w-auto opacity-60"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0, 0.6]), scale }}
        />

        <motion.div style={{ opacity, y, scale }}>
          <span className="mb-4 inline-block font-body text-xs uppercase tracking-[0.3em] text-primary">
            Book Your Expedition
          </span>

          <h2 className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
            Contact Us
          </h2>

          <div className="elegant-line mx-auto mb-8" />
        </motion.div>

        <motion.div style={{ opacity: contentOpacity, y: contentY }}>
          <p className="mb-12 font-body text-lg text-muted-foreground">
            We are ready to craft your perfect hunting adventure.
            Contact us for inquiries and reservations.
          </p>

          <div className="mb-12 space-y-6">
            <div>
              <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">Email</p>
              <a href="mailto:info@angelfelixoutfitter.com" className="font-display text-2xl text-foreground transition-colors hover:text-primary">
                info@angelfelixoutfitter.com
              </a>
            </div>
            <div>
              <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">Phone</p>
              <a href="tel:+526621234567" className="font-display text-2xl text-foreground transition-colors hover:text-primary">
                +52 662 123 4567
              </a>
            </div>
            <div>
              <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">Location</p>
              <p className="font-display text-2xl text-foreground">Hermosillo, Sonora, Mexico</p>
            </div>
          </div>

          <a
            href="mailto:info@angelfelixoutfitter.com"
            className="inline-block border border-primary bg-primary px-10 py-4 font-body text-sm uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary"
          >
            Send Message
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-24 border-t border-border pt-8 text-center flex flex-col gap-4 items-center"
          style={{ opacity: contentOpacity }}
        >
          <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            © 2025 Angel Felix Outfitter. All rights reserved.
          </p>
          <a 
            href="https://m2aq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
          >
            Developed by M2AQ
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
