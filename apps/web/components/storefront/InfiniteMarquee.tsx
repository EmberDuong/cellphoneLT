"use client";

import { motion } from "framer-motion";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  speed?: number; // Higher is slower (duration in seconds)
  direction?: "left" | "right";
}

export function InfiniteMarquee({
  children,
  speed = 20,
  direction = "left",
}: InfiniteMarqueeProps) {
  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        display: "flex",
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ x: direction === "left" ? "0%" : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : "0%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
        style={{
          display: "flex",
          flexShrink: 0,
        }}
      >
        {/* We duplicate the children multiple times to ensure continuous flow */}
        <div style={{ display: "flex", paddingRight: "2rem" }}>{children}</div>
        <div style={{ display: "flex", paddingRight: "2rem" }}>{children}</div>
        <div style={{ display: "flex", paddingRight: "2rem" }}>{children}</div>
        <div style={{ display: "flex", paddingRight: "2rem" }}>{children}</div>
      </motion.div>
    </div>
  );
}
