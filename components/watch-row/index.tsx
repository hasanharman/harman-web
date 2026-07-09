"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import AnalogClock from "@/components/analog-clock";

/** A row of live analog watches — one per time zone. */

const ZONES = [
  { label: "NY", timeZone: "America/New_York" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Istanbul", timeZone: "Europe/Istanbul" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
] as const;

const WATCH_SIZE = 88;

export default function WatchRow() {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  // Render on the client only — the clocks read the current time there.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Each watch fades up in sequence so the row reveals rather than hard-popping.
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const } },
  };

  return (
    <motion.div
      className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: reduce ? 0 : 0.05 }}
    >
      {ZONES.map((z) => (
        <motion.div key={z.label} variants={item} className="flex flex-col items-center gap-2">
          <AnalogClock
            size={WATCH_SIZE}
            timeZone={z.timeZone}
            movement="sweep"
            numerals="ticks"
            minuteTrack={false}
            brand=""
            caption=""
          />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {z.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
