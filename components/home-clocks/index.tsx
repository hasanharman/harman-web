"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import WatchRow from "@/components/watch-row";
import WorldClocks from "@/components/world-clocks";
import WallSwitch from "@/components/wall-switch";

/** Homepage clocks flipped between analog and digital by an old-school wall switch. */

// Strong ease-out for the content crossfade.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function HomeClocks() {
  const [analog, setAnalog] = useState(true);
  const reduce = useReducedMotion();

  return (
    <div className="flex items-start justify-center gap-4">
      {/* Match the clock-face height so the small switch centers on the dials. */}
      <div className="flex h-[88px] items-center">
        <WallSwitch checked={analog} onCheckedChange={setAnalog} size={44} />
      </div>

      {/* Fixed width stops the row re-centering (and the switch shifting) on swap. */}
      <div className="flex min-h-[88px] w-[550px] max-w-full items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={analog ? "analog" : "digital"}
            initial={{ opacity: 0, y: reduce ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {analog ? <WatchRow /> : <WorldClocks />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
