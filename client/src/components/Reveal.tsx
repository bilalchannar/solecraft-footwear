import { motion } from "framer-motion";
import { luxuryEase } from "@/lib/motion";

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: luxuryEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
