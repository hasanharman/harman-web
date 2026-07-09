"use client";

import { useEffect, useState } from "react";
import { toStardate } from "trekdate";

import AnalogClock from "@/components/analog-clock";

/** A row of live analog watches — one per time zone, plus a space watch for the Enterprise. */

const ZONES = [
  { label: "NY", timeZone: "America/New_York" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Istanbul", timeZone: "Europe/Istanbul" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
] as const;

const WATCH_SIZE = 88;

export default function WatchRow() {
  const [stardate, setStardate] = useState("");
  const [mounted, setMounted] = useState(false);

  // Time zones render on the AnalogClock itself; only the stardate needs its own tick.
  useEffect(() => {
    setMounted(true);
    const tick = () => setStardate(toStardate());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Avoid an SSR/client mismatch — the clocks read the current time on the client.
  if (!mounted) return null;

  return (
    <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4">
      {ZONES.map((z) => (
        <div key={z.label} className="flex flex-col items-center gap-2">
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
        </div>
      ))}

      {/* Space watch — the USS Enterprise on stardate time. */}
      <div className="flex flex-col items-center gap-2">
        <AnalogClock
          size={WATCH_SIZE}
          movement="sweep"
          numerals="ticks"
          minuteTrack={false}
          dialColor="#0a0a1a"
          caseColor="#2b2b40"
          handColor="#e0e7ff"
          secondColor="#22d3ee"
          markerColor="#818cf8"
          brand=""
          caption=""
          glow="#22d3ee"
        />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          USS Enterprise 🖖
        </span>
        <span className="-mt-1 font-mono text-[10px] tabular-nums text-muted-foreground/70">
          {stardate}
        </span>
      </div>
    </div>
  );
}
