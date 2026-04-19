import { motion } from "framer-motion";
import { Facebook, Instagram, MessageCircleMore } from "lucide-react";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/angelfelixoutfitter",
    icon: Instagram,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61572028505883",
    icon: Facebook,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/14802510258",
    icon: MessageCircleMore,
  },
];

const SocialDock = () => {
  return (
    <motion.aside
      aria-label="Social media links"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:-translate-y-1/2 md:px-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-primary/25 bg-[linear-gradient(180deg,rgba(19,15,13,0.9),rgba(35,26,22,0.92))] px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl md:flex-col md:rounded-[2rem] md:px-2 md:py-4">
        {socialLinks.map(({ name, href, icon: Icon }) => (
          <motion.a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            title={name}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-foreground transition-colors duration-300 hover:border-primary/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,175,103,0.18),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
          </motion.a>
        ))}
      </div>
    </motion.aside>
  );
};

export default SocialDock;
