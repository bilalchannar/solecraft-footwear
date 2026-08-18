import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { luxuryEase, microSpring, textWordVariants } from "@/lib/motion";
import {
  usePointerScene,
  useParallax,
  useDepthCapable,
  DEPTH,
} from "@/lib/use3d";

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

/* ---- Slide transition variants (3D depth) ---- */
const slideImageVariants = {
  initial: { opacity: 0, scale: 0.94, z: -60, rotateY: -3 },
  animate: {
    opacity: 1,
    scale: 1,
    z: 0,
    rotateY: 0,
    transition: { duration: 0.72, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    z: -80,
    rotateY: 2,
    transition: { duration: 0.45, ease: luxuryEase },
  },
};

const slideCopyVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: luxuryEase },
  },
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
  const reduced = useReducedMotion();
  const depthCapable = useDepthCapable();

  // Auto-play slides continuously every 4.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Pointer scene for multi-layer parallax
  const scene = usePointerScene<HTMLDivElement>({
    spring: DEPTH.sceneSpring,
  });

  // Parallax layers — each moves at a different speed for depth
  const glowX = useParallax(scene.px, 30);
  const glowY = useParallax(scene.py, 30);
  const imageTiltY = useParallax(scene.px, DEPTH.heroTilt);
  const imageTiltX = useParallax(scene.py, -DEPTH.heroTilt);
  const stampX = useParallax(scene.px, 12);
  const stampY = useParallax(scene.py, 10);
  const floatOffsetX = useParallax(scene.px, 18);
  const floatOffsetY = useParallax(scene.py, 14);

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
      ref={scene.ref}
      {...scene.handlers}
    >
      {/* Ambient background glow — responds to pointer */}
      <motion.div
        style={depthCapable ? { x: glowX, y: glowY } : undefined}
        className="hero__ambient-glow pointer-events-none"
      />

      {/* Floating decorative 3D elements — behind content */}
      {!reduced && (
        <>
          <motion.div
            className="hero__float-el hero__float-el--diamond"
            style={depthCapable ? { x: floatOffsetX, y: floatOffsetY } : undefined}
          />
          <motion.div
            className="hero__float-el hero__float-el--ring"
            style={depthCapable ? { x: floatOffsetX, y: floatOffsetY } : undefined}
          />
          <motion.div
            className="hero__float-el hero__float-el--dot"
            style={depthCapable ? { x: floatOffsetX, y: floatOffsetY } : undefined}
          />
        </>
      )}

      <div className="site-container relative z-10">
        <div className="hero__panel relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="hero__content-grid"
            >
              {/* Copy Side */}
              <motion.div
                className="hero__copy"
                variants={slideCopyVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
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

                {/* Two-color staggered animated headline with subtle depth entrance */}
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
                        style={{
                          transformPerspective: 800,
                          transformOrigin: "50% 100%",
                        }}
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
                        style={{
                          transformPerspective: 800,
                          transformOrigin: "50% 100%",
                        }}
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
              </motion.div>

              {/* Interactive Image Side with 3D Parallax & Depth Transitions */}
              <div className="hero__visual-wrap relative flex items-center justify-center">
                <motion.div
                  style={
                    depthCapable
                      ? { rotateX: imageTiltX, rotateY: imageTiltY }
                      : undefined
                  }
                  variants={slideImageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="hero__image-card relative w-full h-full"
                >
                  <div
                    className="hero__image"
                    style={{
                      backgroundImage: `url(${slide.imageUrl})`,
                    }}
                  />
                </motion.div>

                {/* Floating Craft Badge with Micro-Motion + Pointer Parallax */}
                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={
                    depthCapable
                      ? { x: stampX, y: stampY }
                      : undefined
                  }
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
