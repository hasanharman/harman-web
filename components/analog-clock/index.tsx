"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Movement = "quartz" | "mechanical" | "sweep";
type Numerals = "arabic" | "roman" | "ticks" | "none";

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

export type AnalogClockProps = {
  /** Freeze at a fixed time (Date or "HH:MM" / "HH:MM:SS"); omit to tick live. */
  time?: Date | string;
  /** Tick in real time. Ignored when a fixed `time` is provided. */
  live?: boolean;
  /** IANA time zone for live mode, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** Second-hand motion: quartz steps each second, mechanical stutters ~8/s, sweep glides. */
  movement?: Movement;
  /** Diameter of the clock, in pixels. */
  size?: number;
  /** Hour markers style. */
  numerals?: Numerals;
  /** Show the thin minute ticks between the hour markers. */
  minuteTrack?: boolean;
  /** Show the second hand at all. */
  showSeconds?: boolean;

  /** Dial (face) background — any CSS color. */
  dialColor?: string;
  /** Case / bezel ring color. */
  caseColor?: string;
  /** Hour & minute hand color. */
  handColor?: string;
  /** Second hand color — the accent that pops against the dial. */
  secondColor?: string;
  /** Markers, numerals and minute-track color. */
  markerColor?: string;

  /** Brand name printed on the upper dial (empty string hides it). */
  brand?: string;
  /** Small line under the brand, e.g. "quartz". */
  caption?: string;
  /** Two-part footer near 6 o'clock, e.g. ["Made in", "Germany"]. */
  footer?: [string, string];

  /** A CSS color to cast a glowing halo around the case — the "space watch" look. */
  glow?: string;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

/** Cartesian point on the 100×100 dial for a radius and clock angle (deg, 12 o'clock = 0). */
function point(radius: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [50 + radius * Math.sin(a), 50 - radius * Math.cos(a)];
}

/** Resolve the props into the h/m/s the hands should point at. */
function useClockTime(
  time: AnalogClockProps["time"],
  live: boolean,
  timeZone: string | undefined,
  movement: Movement
) {
  const [now, setNow] = useState(() => new Date(0));
  const frozen = useMemo(() => resolveFixed(time), [time]);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (frozen || !live) return;
    // rAF every frame keeps sweep smooth and the second-crossing exact for quartz.
    const tick = () => {
      setNow(new Date());
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [frozen, live]);

  if (frozen) return frozen;

  const parts = timeZone
    ? zonedParts(now, timeZone)
    : { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds(), ms: now.getMilliseconds() };

  return angles(parts, movement);
}

/** Convert h/m/s(+ms) into hand rotation angles for the given movement. */
function angles(t: { h: number; m: number; s: number; ms: number }, movement: Movement) {
  const frac = t.s + t.ms / 1000;
  const sub =
    movement === "sweep"
      ? frac
      : movement === "mechanical"
        ? Math.floor(frac * 8) / 8 // ~8 beats/sec stutter
        : t.s; // quartz: whole-second steps

  const second = sub * 6; // 360 / 60
  const minute = (t.m + sub / 60) * 6;
  const hour = ((t.h % 12) + t.m / 60 + sub / 3600) * 30; // 360 / 12
  return { hour, minute, second };
}

/** Freeze the hands at a fixed time — snapped like a still photo. */
function resolveFixed(time: AnalogClockProps["time"]) {
  if (!time) return null;
  if (typeof time !== "string") {
    return angles({ h: time.getHours(), m: time.getMinutes(), s: time.getSeconds(), ms: 0 }, "quartz");
  }
  const parsed = parseTimeString(time);
  return parsed ? angles({ ...parsed, ms: 0 }, "quartz") : null;
}

function parseTimeString(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  return { h: Number(match[1]), m: Number(match[2]), s: match[3] ? Number(match[3]) : 0 };
}

// Formatters are pricey to build, so cache one per zone — this runs every animation frame.
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();
function zoneFormatter(timeZone: string) {
  let fmt = zoneFormatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    zoneFormatters.set(timeZone, fmt);
  }
  return fmt;
}

/** Extract h/m/s for an IANA time zone without pulling in a date library. */
function zonedParts(date: Date, timeZone: string) {
  try {
    const parts = Object.fromEntries(
      zoneFormatter(timeZone).formatToParts(date).map((p) => [p.type, p.value])
    );
    return {
      h: Number(parts.hour) % 24,
      m: Number(parts.minute),
      s: Number(parts.second),
      ms: date.getMilliseconds(),
    };
  } catch {
    return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds(), ms: date.getMilliseconds() };
  }
}

export default function AnalogClock({
  time,
  live = true,
  timeZone,
  movement = "quartz",
  size = 240,
  numerals = "arabic",
  minuteTrack = true,
  showSeconds = true,
  dialColor = "#0b0b0c",
  caseColor = "#1c1c1e",
  handColor = "#f4f4f5",
  secondColor = "#f5a623",
  markerColor = "#d4d4d8",
  brand = "BRAUN",
  caption = "quartz",
  footer,
  glow,
  className,
}: AnalogClockProps) {
  const { hour, minute, second } = useClockTime(time, live, timeZone, movement);
  // Unique ids per instance — shared ids would make every clock reuse the first's defs.
  const uid = useId();
  const caseId = `clk-case-${uid}`;
  const dialId = `clk-dial-${uid}`;
  const glassId = `clk-glass-${uid}`;
  // Only continuous sweep gets a transition; stepped movements must snap, not float.
  const secondEase = movement === "sweep" ? "transform 0.9s cubic-bezier(0.4,0,0.2,1)" : "none";

  const markerR = 42;
  const numberR = 35;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        // drop-shadow follows the SVG's circular alpha, so the glow hugs the case.
        filter: glow
          ? `drop-shadow(0 0 ${size * 0.03}px ${glow}) drop-shadow(0 0 ${size * 0.08}px ${glow})`
          : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Clock">
        <defs>
          {/* Case: brushed metal ring around the dial. */}
          <radialGradient id={caseId} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor={mix(caseColor, "#ffffff", 0.18)} />
            <stop offset="70%" stopColor={caseColor} />
            <stop offset="100%" stopColor={mix(caseColor, "#000000", 0.4)} />
          </radialGradient>
          {/* Dial: a soft vignette gives the face a little depth. */}
          <radialGradient id={dialId} cx="50%" cy="44%" r="62%">
            <stop offset="0%" stopColor={mix(dialColor, "#ffffff", 0.06)} />
            <stop offset="72%" stopColor={dialColor} />
            <stop offset="100%" stopColor={mix(dialColor, "#000000", 0.35)} />
          </radialGradient>
          {/* Glass: a single specular sweep across the crystal. */}
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="42%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Case + crown */}
        <circle cx="50" cy="50" r={50} fill={`url(#${caseId})`} />
        <rect x="98.5" y="46.5" width="3" height="7" rx="1" fill={mix(caseColor, "#000000", 0.2)} />
        {/* Dial */}
        <circle cx="50" cy="50" r={46} fill={`url(#${dialId})`} />

        {/* Minute track */}
        {minuteTrack &&
          Array.from({ length: 60 }).map((_, i) => {
            const isHour = i % 5 === 0;
            const [x1, y1] = point(markerR + 3 - (isHour ? 3.4 : 1.6), i * 6);
            const [x2, y2] = point(markerR + 3, i * 6);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={markerColor}
                strokeWidth={isHour ? 0.9 : 0.35}
                strokeLinecap="round"
                opacity={isHour ? 0.95 : 0.5}
              />
            );
          })}

        {/* Hour markers / numerals */}
        {numerals !== "none" &&
          Array.from({ length: 12 }).map((_, i) => {
            if (numerals === "ticks") {
              const [x1, y1] = point(markerR - 5, i * 30);
              const [x2, y2] = point(markerR - 1, i * 30);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={markerColor} strokeWidth={1.6} strokeLinecap="round" />
              );
            }
            const [x, y] = point(numberR, i * 30);
            const label = numerals === "roman" ? ROMAN[i] : String(i === 0 ? 12 : i);
            return (
              <text
                key={i}
                x={x}
                y={y}
                fill={markerColor}
                fontSize={numerals === "roman" ? 5.2 : 6.4}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight={500}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label}
              </text>
            );
          })}

        {/* Brand + caption */}
        {brand ? (
          <text
            x="50"
            y="36"
            fill={markerColor}
            fontSize="6"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
            letterSpacing="0.5"
            textAnchor="middle"
          >
            {brand}
          </text>
        ) : null}
        {caption ? (
          <text
            x="50"
            y="42"
            fill={markerColor}
            fontSize="3"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
            opacity={0.75}
          >
            {caption}
          </text>
        ) : null}
        {footer ? (
          <text
            x="50"
            y="68"
            fill={markerColor}
            fontSize="2.6"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
            opacity={0.7}
          >
            {footer[0]}
            {"  "}
            {footer[1]}
          </text>
        ) : null}

        {/* Hour hand */}
        <g transform={`rotate(${hour} 50 50)`}>
          <rect x="48.4" y="27" width="3.2" height="26" rx="1.6" fill={handColor} />
        </g>
        {/* Minute hand */}
        <g transform={`rotate(${minute} 50 50)`}>
          <rect x="48.9" y="16" width="2.2" height="37" rx="1.1" fill={handColor} />
        </g>
        {/* Second hand */}
        {showSeconds ? (
          <g transform={`rotate(${second} 50 50)`} style={{ transition: secondEase }}>
            <rect x="49.5" y="14" width="1" height="40" fill={secondColor} />
            {/* Counterweight tail */}
            <rect x="49" y="50" width="2" height="10" rx="1" fill={secondColor} />
            <circle cx="50" cy="50" r="2.4" fill={secondColor} />
          </g>
        ) : null}
        {/* Center pin */}
        <circle cx="50" cy="50" r="1.2" fill={handColor} />

        {/* Crystal glare — sits above everything, ignores pointer events. */}
        <circle cx="50" cy="50" r={46} fill={`url(#${glassId})`} pointerEvents="none" />
      </svg>
    </div>
  );
}

/** Blend two hex colors — tiny local helper so the component ships dependency-free. */
function mix(a: string, b: string, amount: number) {
  const pa = hex(a);
  const pb = hex(b);
  if (!pa || !pb) return a;
  const ch = (i: 0 | 1 | 2) => Math.round(pa[i] + (pb[i] - pa[i]) * amount);
  return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`;
}

function hex(value: string): [number, number, number] | null {
  const m = value.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
