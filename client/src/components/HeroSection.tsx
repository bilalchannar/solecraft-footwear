import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { luxuryEase, microSpring, textWordVariants } from "@/lib/motion";

const defaultBanners: HeroBanner[] = [
  {
    id: 1,
    title: "Steps crafted for your everyday journey.",
    subtitle: "Grounded in authentic Pakistani craft, refined for every direction you take.",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85",
    href: "/shop",
  },
  {
    id: 2,
    title: "Timeless handcrafted leather silhouettes.",
    subtitle: "Occasion-ready Peshawari and artisanal Khussa crafted with intent.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85",
    href: "/shop?category=khussa",
  },
  {
    id: 3,
    title: "Everyday modern comfort & movement.",
    subtitle: "Minimalist loafers and mules designed to remain part of your timeless rotation.",
    imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=85",
    href: "/shop?category=modern-loafers",
  },
];

export type HeroBanner = {
  id?: number;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  href?: string | null;
  placement?: string;
};

export function HeroSection({
  banners = [],
  defaultTitle = "Steps crafted for your everyday journey.",
  defaultSubtitle = "Grounded in authentic Pakistani craft, refined for every direction you take.",
}: {
  banners?: HeroBanner[];
  defaultTitle?: string;
  defaultSubtitle?: string;
}) {
  const slides: HeroBanner[] = banners.length > 0 ? banners : defaultBanners;

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slides continuously every 4.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Desktop Mouse Parallax Effect
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const imageTiltX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const imageTiltY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const glowX = useTransform(springX, [-0.5, 0.5], ["-15%", "15%"]);
  const glowY = useTransform(springY, [-0.5, 0.5], ["-15%", "15%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const slide = slides[currentSlide] ?? slides[0];
  const slideTitle = slide?.title || defaultTitle;

  // Split title into two complementary parts for two-color typography
  const words = slideTitle.split(" ");
  const midPoint = Math.ceil(words.length / 2);
  const titlePart1 = words.slice(0, midPoint).join(" ");
  const titlePart2 = words.slice(midPoint).join(" ");

  return (
    <section
      className="hero relative overflow-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient background glow */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="hero__ambient-glow pointer-events-none"
      />

      <div className="site-container relative z-10">
        <div className="hero__panel relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: luxuryEase }}
              className="hero__content-grid"
            >
              {/* Copy Side */}
              <div className="hero__copy">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05, ease: luxuryEase }}
                  className="inline-flex items-center gap-2"
                >
                  <span className="eyebrow flex items-center gap-1.5">
                    <Sparkles size={12} className="text-clay" />
                    The refined everyday
                  </span>
                </motion.div>

                {/* Two-color staggered animated headline */}
                <h1 className="display hero__title">
                  <span className="block text-ink font-medium">
                    {titlePart1.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        variants={textWordVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.08 + i * 0.05 }}
                        className="inline-block mr-2.5"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                  <span className="block text-clay font-bold mt-1">
                    {titlePart2.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        variants={textWordVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                          delay: 0.08 + (midPoint + i) * 0.05,
                        }}
                        className="inline-block mr-2.5"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.28, ease: luxuryEase }}
                  className="hero__body"
                >
                  {slide.subtitle ?? defaultSubtitle}
                </motion.p>

                {/* CTA Buttons with hover & press micro-interactions */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.38, ease: luxuryEase }}
                  className="hero__cta-group flex flex-wrap items-center gap-3.5"
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={microSpring}
                  >
                    <Link
                      className="button-primary group inline-flex items-center gap-2"
                      href={slide.href ?? "/shop"}
                    >
                      <span>Shop collection</span>
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 4 }}
                        transition={microSpring}
                      >
                        <ArrowRight size={17} />
                      </motion.span>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={microSpring}
                  >
                    <Link
                      className="button-secondary"
                      href="/shop?sort=best_selling"
                    >
                      Best sellers
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {/* Interactive Image Side with 3D Parallax & Scale */}
              <div className="hero__visual-wrap relative flex items-center justify-center">
                <motion.div
                  style={{
                    rotateX: imageTiltX,
                    rotateY: imageTiltY,
                  }}
                  initial={{ scale: 0.92, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: luxuryEase }}
                  className="hero__image-card relative w-full h-full"
                >
                  <div
                    className="hero__image"
                    style={{
                      backgroundImage: `url(${slide.imageUrl})`,
                    }}
                  />
                </motion.div>

                {/* Floating Craft Badge with Micro-Motion */}
                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="hero__stamp select-none"
                >
                  Made for
                  <br />
                  everyday
                  <br />
                  movement
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Centered Dots Only */}
          {slides.length > 1 && (
            <div className="hero__controls-bar">
              <div className="hero__indicators-center flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`hero__dot ${index === currentSlide ? "hero__dot--active" : ""}`}
                  >
                    {index === currentSlide && (
                      <motion.span
                        layoutId="active-dot"
                        className="hero__dot-fill"
                        transition={microSpring}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
