import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const RUT_VIDEO_1 = `${import.meta.env.BASE_URL}custom/video1.mp4`;
const RUT_VIDEO_2 = `${import.meta.env.BASE_URL}custom/video2.mp4`;

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["60px", "0px", "0px", "-40px"]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.98]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.35, 0.6, 0.85] }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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
          <span className="mb-4 inline-block font-body text-sm uppercase tracking-[0.3em] text-primary md:text-base">
            ANGEL FELIX OUTFITTER
          </span>
          <h2 className="mb-6 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
            Elite Hunting in Sonora, Mexico
          </h2>
          <div className="elegant-line mx-auto mb-8" />
          <div className="mx-auto max-w-4xl space-y-6 text-left font-body text-base leading-8 text-muted-foreground md:text-lg">
            <p>
              We deliver fully guided hunting experiences in the rugged and exclusive terrains of Sonora, Mexico - built for hunters who demand results, professionalism, and true trophy quality.
            </p>
            <p>
              With over 7 years of experience working alongside one of the top outfitters in Sonora, I developed the discipline, knowledge, and execution required to consistently produce exceptional hunts. This is where I learned how to operate at a world-class standard.
            </p>
            <p>
              We offer limited tags each season, ensuring low hunting pressure, personalized attention, and access to prime, carefully managed areas. This level of exclusivity allows us to maintain a high success rate and trophy-class animals year after year.
            </p>
            <p>
              Every hunt is executed with precision - from scouting to final shot - delivering a seamless, premium experience from arrival to departure.
            </p>
            <p>
              We operate with respect for wildlife, strict ethical standards, and a deep understanding of the land - ensuring every hunt is not only successful, but unforgettable.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <h3 className="mb-8 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
              We take you directly to the Rut
            </h3>
            <div className="space-y-6">
              <video
                ref={(element) => {
                  videoRefs.current[0] = element;
                }}
                className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-2xl"
                controls
                muted
                playsInline
                preload="metadata"
              >
                <source src={RUT_VIDEO_1} type="video/mp4" />
              </video>
              <video
                ref={(element) => {
                  videoRefs.current[1] = element;
                }}
                className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-2xl"
                controls
                muted
                playsInline
                preload="metadata"
              >
                <source src={RUT_VIDEO_2} type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="mt-12">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-primary md:text-base">
              LIMITED TAGS AVAILABLE
            </p>
            <p className="mt-3 font-display text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
              Reserve Your Spot Early
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
