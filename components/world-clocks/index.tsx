"use client";

import { useEffect, useState } from "react";
import { toStardate } from "trekdate";

const ZONES = [
  { label: "NY", timezone: "America/New_York" },
  { label: "London", timezone: "Europe/London" },
  { label: "Istanbul", timezone: "Europe/Istanbul" },
  { label: "Tokyo", timezone: "Asia/Tokyo" },
] as const;

function formatTime(timezone: string) {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function WorldClocks() {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [stardate, setStardate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function tick() {
      const now: Record<string, string> = {};
      for (const z of ZONES) {
        now[z.label] = formatTime(z.timezone);
      }
      setTimes(now);
      setStardate(toStardate());
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground font-mono">
      {ZONES.map((z) => (
        <div key={z.label} className="flex flex-col items-center">
          <span className="text-[10px] opacity-60 uppercase tracking-wider">{z.label}</span>
          <span className="text-sm tabular-nums">{times[z.label]}</span>
        </div>
      ))}
      <div className="flex flex-col items-center">
        <span className="text-[10px] opacity-60 uppercase tracking-wider">USS Enterprise 🖖</span>
        <span className="text-sm tabular-nums">{stardate}</span>
      </div>
    </div>
  );
}
