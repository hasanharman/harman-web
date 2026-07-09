"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import WatchRow from "@/components/watch-row";
import WorldClocks from "@/components/world-clocks";
import { cn } from "@/lib/utils";

/** Homepage clocks with an analog/digital switcher — same time zones, two faces. */

const MODES = ["analog", "digital"] as const;
type Mode = (typeof MODES)[number];

// Strong ease-out curve shared by the content swap and the CSS thumb slide.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function HomeClocks() {
  const [mode, setMode] = useState<Mode>("analog");
  const reduce = useReducedMotion();
  const index = MODES.indexOf(mode);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex rounded-full border p-0.5 text-xs">
        {/* Sliding thumb — one tab wide, glides between tabs on transform (GPU, CSS). */}
        <span
          aria-hidden
          className="absolute bottom-0.5 left-0.5 top-0.5 rounded-full bg-foreground"
          style={{
            width: "calc(50% - 2px)",
            transform: `translateX(${index * 100}%)`,
            transition: reduce
              ? "none"
              : "transform 260ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={active}
              className={cn(
                "relative z-10 flex-1 rounded-full px-4 py-1 capitalize",
                "transition-[color,transform] duration-150 active:scale-95",
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: reduce ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {mode === "analog" ? <WatchRow /> : <WorldClocks />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
