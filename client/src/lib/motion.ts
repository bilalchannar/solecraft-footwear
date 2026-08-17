import { Variants } from "framer-motion";

// Luxury, decelerating easing curve for premium e-commerce motion
export const luxuryEase = [0.22, 1, 0.36, 1] as const;

// Snappy spring config for tactile micro-interactions (buttons, pills, icons)
export const microSpring = {
  type: "spring",
  stiffness: 450,
  damping: 30,
} as const;

// Gentle spring for floating / hover elevation
export const gentleSpring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
} as const;

// Standard fade-in variant
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: luxuryEase },
  },
};

// Subtle upward reveal variant
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3, ease: luxuryEase },
  },
};

// Scale & fade variant for modals, badges, cards
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease: luxuryEase },
  },
};

// Stagger parent container variant
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Stagger child item variant
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: luxuryEase },
  },
};

// Split word / text reveal variant with blur to sharp
export const textWordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: luxuryEase,
    },
  },
};

// Button tap feedback
export const buttonTapMotion = {
  scale: 0.975,
  transition: microSpring,
};

// Card hover motion
export const cardHoverMotion = {
  y: -5,
  transition: gentleSpring,
};
