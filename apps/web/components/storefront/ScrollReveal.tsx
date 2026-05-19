"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  yOffset?: number;
  xOffset?: number;
  direction?: "up" | "left" | "right";
  duration?: number;
  delay?: number;
}

export function ScrollReveal({
  children,
  width = "100%",
  yOffset = 50,
  xOffset = 50,
  direction = "up",
  duration = 0.6,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const getHiddenVariant = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -xOffset, y: 0 };
      case "right":
        return { opacity: 0, x: xOffset, y: 0 };
      case "up":
      default:
        return { opacity: 0, x: 0, y: yOffset };
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: getHiddenVariant(),
          visible: { opacity: 1, x: 0, y: 0 },
        } as any}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
