"use client";

import { motion } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  yOffset?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  yOffset = 15,
  duration = 3,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
