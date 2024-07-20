"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollTracker() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress);

  return (
    // <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
    <svg
      className="fixed bottom-[10px] right-[10px] rotate-[-90deg]"
      // id="progress"
      width="100"
      height="100"
      viewBox="0 0 50 50"
    >
      <circle
        cx="30"
        cy="30"
        r="10"
        pathLength="1"
        className="stroke-[#818181] opacity-30"
        style={{ strokeDashoffset: 0, strokeWidth: "8%", fill: "none" }}
      />{" "}
      <motion.circle
        cx="30"
        cy="30"
        r="10"
        pathLength="1"
        className="stroke-[#141414]"
        style={{
          pathLength: scaleX,
          strokeDashoffset: 0,
          strokeWidth: "8%",
          fill: "none",
        }}
      />
    </svg>
  );
}
