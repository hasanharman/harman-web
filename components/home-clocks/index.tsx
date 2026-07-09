"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import WatchRow from "@/components/watch-row";
import WorldClocks from "@/components/world-clocks";
import { cn } from "@/lib/utils";

/** Homepage clocks flipped between analog and digital by an old-school wall switch. */

// Strong ease-out for the content crossfade.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function HomeClocks() {
  const [analog, setAnalog] = useState(true);
  const reduce = useReducedMotion();

  return (
    <div className="flex items-center justify-center gap-6">
      <ClockSwitch analog={analog} onToggle={() => setAnalog((v) => !v)} reduce={reduce} />

      {/* Fixed height keeps the switch from jumping as the two faces swap. */}
      <div className="flex min-h-[132px] items-center">
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

/** A wall toggle switch — flips up for Analog, down for Digital. */
function ClockSwitch({
  analog,
  onToggle,
  reduce,
}: {
  analog: boolean;
  onToggle: () => void;
  reduce: boolean | null;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <span
        className={cn(
          "text-[10px] uppercase tracking-wider transition-colors",
          analog ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Analog
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={analog}
        aria-label="Toggle analog or digital clocks"
        onClick={onToggle}
        className="relative flex h-20 w-12 items-center justify-center rounded-lg border bg-card shadow-sm transition-transform active:scale-[0.98]"
      >
        {/* Mounting screws */}
        <span className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-muted-foreground/25" />
        <span className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-muted-foreground/25" />

        {/* Recessed slot */}
        <span
          className="relative h-12 w-6 overflow-hidden rounded-[4px] bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]"
          style={{ perspective: "320px" }}
        >
          {/* The toggle lever — a glossy plastic tab that pivots between halves. */}
          <span
            className="absolute inset-x-0 top-0 h-1/2 rounded-[3px] bg-gradient-to-b from-white to-neutral-300 shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
            style={{
              transformOrigin: "center",
              transform: analog
                ? "translateY(0%) rotateX(16deg)"
                : "translateY(100%) rotateX(-16deg)",
              // Snappy with a hint of overshoot — a real switch snaps into place.
              transition: reduce
                ? "none"
                : "transform 200ms cubic-bezier(0.34, 1.4, 0.64, 1)",
            }}
          >
            {/* Grip ridge across the lever. */}
            <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-black/10" />
          </span>
        </span>
      </button>

      <span
        className={cn(
          "text-[10px] uppercase tracking-wider transition-colors",
          !analog ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Digital
      </span>
    </div>
  );
}
