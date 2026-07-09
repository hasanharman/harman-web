"use client";

import { useState } from "react";

import WatchRow from "@/components/watch-row";
import WorldClocks from "@/components/world-clocks";
import { cn } from "@/lib/utils";

/** Homepage clocks with an analog/digital switcher — same time zones, two faces. */

const MODES = ["analog", "digital"] as const;
type Mode = (typeof MODES)[number];

export default function HomeClocks() {
  const [mode, setMode] = useState<Mode>("analog");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex rounded-full border p-0.5 text-xs">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "rounded-full px-3 py-1 capitalize transition-colors",
              mode === m
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === "analog" ? <WatchRow /> : <WorldClocks />}
    </div>
  );
}
