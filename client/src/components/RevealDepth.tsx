import { motion, useReducedMotion } from "framer-motion";
import { luxuryEase } from "@/lib/motion";

/**
 * Scroll entrance that brings content forward out of depth rather than just
 * sliding it up: the element starts pushed back on the Z axis and hinged away
 * from the viewer, then settles flat.
 *
 * Uses `transformPerspective` so no wrapper element is needed — the DOM stays
 * as light as the plain `Reveal` it sits alongside. Under
 * `prefers-reduced-motion` it degrades to a plain opacity fade.
 */
export function RevealDepth({
  children,
  className = "",
  delay = 0,
  y = 30,
  rotate = 6,
  z = -70,
  origin = "50% 92%",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
  y?: number;
  /** Starting rotateX in degrees — the "hinge away" amount. */
  rotate?: number;
  /** Starting translateZ in px (negative = further from the viewer). */
  z?: number;
  origin?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, rotateX: rotate, z }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.72,
        delay: delay / 1000,
        ease: luxuryEase,
      }}
      style={{
        transformPerspective: 1100,
        transformOrigin: origin,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
