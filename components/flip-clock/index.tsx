"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/** A retro split-flap desk clock — leaves fall over to show each new number. */

export type FlipClockProps = {
  /** Freeze at a fixed time (Date or "HH:MM" / "HH:MM:SS"); omit to tick live. */
  time?: Date | string;
  /** Tick in real time. Ignored when a fixed `time` is provided. */
  live?: boolean;
  /** IANA time zone for live mode, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** Show 1–12 hours instead of 00–23. */
  hour12?: boolean;
  /** Add a third card for seconds — handy for watching the flip. */
  showSeconds?: boolean;
  /** Case width in pixels; everything else scales from it. */
  size?: number;
  /** Plastic case color. */
  caseColor?: string;
  /** Panel behind the cards, seen through the clear front. */
  backplateColor?: string;
  /** Hour card color. */
  hourColor?: string;
  /** Minute card color. */
  minuteColor?: string;
  /** Seconds card color (when showSeconds). */
  secondColor?: string;
  /** Numeral color printed on the cards. */
  digitColor?: string;
  /** One full flip, in milliseconds. */
  flipDuration?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

type Parts = { h: number; m: number; s: number };

function parseTimeString(value: string): Parts | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  return { h: Number(match[1]), m: Number(match[2]), s: match[3] ? Number(match[3]) : 0 };
}

function resolveFixed(time: FlipClockProps["time"]): Parts | null {
  if (!time) return null;
  if (typeof time === "string") return parseTimeString(time);
  return { h: time.getHours(), m: time.getMinutes(), s: time.getSeconds() };
}

// One formatter per zone — building Intl formatters every second adds up.
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();
function zonedParts(date: Date, timeZone: string): Parts {
  let fmt = zoneFormatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    zoneFormatters.set(timeZone, fmt);
  }
  const get = (type: string) =>
    Number(fmt.formatToParts(date).find((p) => p.type === type)?.value ?? 0);
  return { h: get("hour"), m: get("minute"), s: get("second") };
}

/** Resolve the props into h/m/s. Null until mounted so SSR and hydration agree. */
function useFlipTime(time: FlipClockProps["time"], live: boolean, timeZone?: string) {
  const fixed = useMemo(() => resolveFixed(time), [time]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (fixed) return;
    let id: ReturnType<typeof setTimeout>;
    // Re-arm on each second boundary so the flip lands with the real tick.
    const tick = () => {
      const d = new Date();
      setNow(d);
      if (live) id = setTimeout(tick, 1000 - d.getMilliseconds());
    };
    id = setTimeout(tick, 0);
    return () => clearTimeout(id);
  }, [fixed, live]);

  if (fixed) return fixed;
  if (!now) return null;
  return timeZone
    ? zonedParts(now, timeZone)
    : { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

type CardProps = {
  value: string | null;
  width: number;
  height: number;
  color: string;
  digitColor: string;
  duration: number;
};

/** One half of a leaf. The text is card-tall and clipped so each half shows its slice. */
function Half({
  text,
  half,
  color,
  style,
  ref,
}: {
  text: string;
  half: "top" | "bottom";
  color: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const top = half === "top";
  return (
    <div
      ref={ref}
      className="absolute inset-x-0 overflow-hidden"
      style={{
        top: top ? 0 : "50%",
        height: "50%",
        background: color,
        backgroundImage: top
          ? "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.02))"
          : "linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.12))",
        borderRadius: top ? "6% 6% 0 0 / 12% 12% 0 0" : "0 0 6% 6% / 0 0 12% 12%",
        transformOrigin: top ? "bottom" : "top",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      <span
        className="absolute inset-x-0 flex items-center justify-center leading-none"
        style={{ height: "200%", top: top ? 0 : "-100%" }}
      >
        {text}
      </span>
    </div>
  );
}

function FlipCard({ value, width, height, color, digitColor, duration }: CardProps) {
  const reduced = useReducedMotion();
  // `settled` is the number fully on show; while it trails `value`, a leaf is falling.
  const [settled, setSettled] = useState(value);
  const topFlap = useRef<HTMLDivElement>(null);
  const bottomFlap = useRef<HTMLDivElement>(null);

  // First real value (after mount) or reduced motion: swap straight in, no flip.
  if (settled !== value && (settled === null || reduced)) setSettled(value);
  const flipping = settled !== null && settled !== value && !reduced;

  useEffect(() => {
    if (!flipping || !topFlap.current || !bottomFlap.current) return;
    const half = duration / 2;
    // Upper leaf falls toward you, accelerating like it's under gravity…
    const fall = topFlap.current.animate(
      [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }],
      { duration: half, easing: "cubic-bezier(0.55, 0, 0.9, 0.45)", fill: "forwards" }
    );
    // …and its back lands on the lower half with a small bounce.
    const land = bottomFlap.current.animate(
      [{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }],
      { duration: half, delay: half, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.25)", fill: "both" }
    );
    land.finished.then(() => setSettled(value)).catch(() => {});
    return () => {
      fall.cancel();
      land.cancel();
    };
  }, [flipping, value, duration]);

  const next = value ?? "";
  const prev = settled ?? "";
  const pinW = Math.max(2, width * 0.035);
  const pinH = height * 0.14;

  return (
    <div
      className="relative font-semibold tabular-nums"
      style={{
        width,
        height,
        color: digitColor,
        fontSize: height * 0.62,
        letterSpacing: "-0.02em",
        perspective: height * 4,
        filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.25))",
      }}
    >
      <Half text={next} half="top" color={color} />
      <Half text={flipping ? prev : next} half="bottom" color={color} />
      {flipping && (
        <>
          <Half ref={topFlap} text={prev} half="top" color={color} style={{ zIndex: 2 }} />
          <Half
            ref={bottomFlap}
            text={next}
            half="bottom"
            color={color}
            style={{ zIndex: 2, transform: "rotateX(90deg)" }}
          />
        </>
      )}

      {/* The seam between leaves. */}
      <span
        className="pointer-events-none absolute inset-x-0 z-10 -translate-y-1/2 bg-black/40"
        style={{ top: "50%", height: Math.max(1, height * 0.012) }}
      />
      {/* Hinge pins the leaves pivot on. */}
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          className="pointer-events-none absolute z-10 -translate-y-1/2 rounded-[1px] bg-neutral-800"
          style={{ top: "50%", [side]: -pinW * 0.4, width: pinW, height: pinH }}
        />
      ))}
      {/* Index notch at the top of the card. */}
      <span
        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-b-[1px] bg-white/70"
        style={{ top: 0, width: width * 0.03, height: height * 0.05 }}
      />
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlipClock({
  time,
  live = true,
  timeZone,
  hour12 = false,
  showSeconds = false,
  size = 300,
  caseColor = "#c4352b",
  backplateColor = "#eadfce",
  hourColor = "#79a6c9",
  minuteColor = "#20785a",
  secondColor = "#2b2b2b",
  digitColor = "#e8c36a",
  flipDuration = 600,
  className,
}: FlipClockProps) {
  const parts = useFlipTime(time, live, timeZone);

  const hours = parts
    ? hour12
      ? String(parts.h % 12 || 12)
      : pad(parts.h)
    : null;
  const minutes = parts ? pad(parts.m) : null;
  const seconds = parts ? pad(parts.s) : null;

  const height = size * 0.56;
  const bezel = size * 0.045;
  const cardW = showSeconds ? size * 0.235 : size * 0.29;
  const cardH = showSeconds ? size * 0.24 : size * 0.28;
  const gap = showSeconds ? size * 0.045 : size * 0.1;

  const cards = [
    { key: "h", value: hours, color: hourColor },
    { key: "m", value: minutes, color: minuteColor },
    ...(showSeconds ? [{ key: "s", value: seconds, color: secondColor }] : []),
  ];

  return (
    <div
      role="img"
      aria-label={parts ? `${hours}:${minutes}${showSeconds ? `:${seconds}` : ""}` : "Flip clock"}
      className={`relative shrink-0 select-none ${className ?? ""}`}
      style={{
        width: size,
        height,
        padding: bezel,
        borderRadius: height * 0.17,
        background: caseColor,
        // Molded plastic: a lit top lip, a darker belly and a soft contact shadow.
        boxShadow: [
          `inset 0 ${size * 0.006}px ${size * 0.01}px rgba(255,255,255,0.35)`,
          `inset 0 -${size * 0.012}px ${size * 0.02}px rgba(0,0,0,0.25)`,
          `0 ${size * 0.03}px ${size * 0.05}px -${size * 0.01}px rgba(0,0,0,0.35)`,
        ].join(", "),
      }}
    >
      {/* Clear polycarbonate window over the backplate. */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        style={{
          gap,
          background: backplateColor,
          borderRadius: height * 0.08,
          boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.005)}px rgba(255,255,255,0.55), inset 0 ${size * 0.008}px ${size * 0.02}px rgba(0,0,0,0.22)`,
        }}
      >
        {cards.map((card) => (
          <FlipCard
            key={card.key}
            value={card.value}
            width={cardW}
            height={cardH}
            color={card.color}
            digitColor={digitColor}
            duration={flipDuration}
          />
        ))}
        {/* Glare across the front. */}
        <span
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 28%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.08) 80%)",
          }}
        />
      </div>
    </div>
  );
}
