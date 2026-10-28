"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/** A retro split-flap alarm clock — leaves fall over to show each new number. */

type Digits = "segment" | "print";

export type FlipClockProps = {
  /** Freeze at a fixed time (Date or "HH:MM" / "HH:MM:SS"); omit to tick live. */
  time?: Date | string;
  /** Tick in real time. Ignored when a fixed `time` is provided. */
  live?: boolean;
  /** IANA time zone for live mode, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** Show 01–12 hours with an am/pm indicator instead of 00–23. */
  hour12?: boolean;
  /** Add a third card for seconds — handy for watching the flip. */
  showSeconds?: boolean;
  /** "segment" draws outlined seven-segment numerals; "print" uses solid printed type. */
  digits?: Digits;
  /** Show the alarm bar on top and the foot. */
  hardware?: boolean;
  /** Case width in pixels; everything else scales from it. */
  size?: number;
  /** Plastic case color. The inner ring and foot are shaded from it. */
  caseColor?: string;
  /** Face plate around the cards. */
  faceColor?: string;
  /** Card color for every card; override per card below. */
  cardColor?: string;
  /** Hour card color. Defaults to cardColor. */
  hourColor?: string;
  /** Minute card color. Defaults to cardColor. */
  minuteColor?: string;
  /** Seconds card color. Defaults to cardColor. */
  secondColor?: string;
  /** Numeral color printed on the cards. */
  digitColor?: string;
  /** am/pm label and dot color. */
  labelColor?: string;
  /** One full flip, in milliseconds. */
  flipDuration?: number;
  /** Clack each time a leaf falls. Audio starts after the visitor's first click or key press. */
  flipSound?: boolean;
  /** Tick every second, like a quartz movement. */
  tickSound?: boolean;
  /** Sound volume, 0–1. */
  volume?: number;
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

/* ---------- Sound ---------- */

// One shared context for every clock on the page. Browsers keep it suspended
// until the visitor's first click or key press, so resume it on that gesture.
let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    const resume = () => {
      void audioCtx?.resume();
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }
  return audioCtx.state === "closed" ? null : audioCtx;
}

function noise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  return src;
}

/** A gain node that snaps to `peak` and decays exponentially over `decay` seconds. */
function envelope(ctx: AudioContext, at: number, peak: number, decay: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  gain.connect(ctx.destination);
  return gain;
}

/** Synthesized clock sounds — no audio files. `delay` is in milliseconds. */
export const clockSound = {
  /** A plastic leaf slapping onto the stack: a filtered noise snap over a low knock. */
  flip(volume = 0.5, delay = 0) {
    const ctx = getAudio();
    if (!ctx || ctx.state !== "running") return;
    const at = ctx.currentTime + delay / 1000;
    const snap = noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2400;
    band.Q.value = 0.9;
    snap.connect(band).connect(envelope(ctx, at, volume * 0.9, 0.05));
    snap.start(at, Math.random() * 0.2, 0.06);
    const knock = ctx.createOscillator();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(220, at);
    knock.frequency.exponentialRampToValueAtTime(90, at + 0.04);
    knock.connect(envelope(ctx, at, volume * 0.5, 0.045));
    knock.start(at);
    knock.stop(at + 0.06);
  },
  /** A quartz movement's dry tick. */
  tick(volume = 0.5, delay = 0) {
    const ctx = getAudio();
    if (!ctx || ctx.state !== "running") return;
    const at = ctx.currentTime + delay / 1000;
    const click = noise(ctx);
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 3200;
    click.connect(high).connect(envelope(ctx, at, volume * 0.35, 0.012));
    click.start(at, Math.random() * 0.2, 0.02);
  },
  /** One burst of the classic four-beep digital alarm. */
  alarm(volume = 0.5, delay = 0) {
    const ctx = getAudio();
    if (!ctx || ctx.state !== "running") return;
    const start = ctx.currentTime + delay / 1000;
    for (let i = 0; i < 4; i++) {
      const at = start + i * 0.13;
      const beep = ctx.createOscillator();
      beep.type = "square";
      beep.frequency.value = 2048;
      const soft = ctx.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 3500;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume * 0.25, at + 0.005);
      gain.gain.setValueAtTime(volume * 0.25, at + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
      beep.connect(soft).connect(gain).connect(ctx.destination);
      beep.start(at);
      beep.stop(at + 0.09);
    }
  },
};

/** Create the audio context early (while idle) so the first gesture can unlock it. */
export function useClockAudio(enabled: boolean) {
  useEffect(() => {
    if (enabled) getAudio();
  }, [enabled]);
}

/* ---------- Seven-segment numerals ---------- */

// Segment order: a (top), b (top right), c (bottom right), d (bottom), e (bottom left), f (top left), g (middle).
const SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

const DW = 52; // digit viewBox width
const DH = 100; // digit viewBox height
const T = 11; // segment thickness
const GAP = 1.6; // clearance between segment tips
const HT = T / 2; // inset of a segment centerline from the digit edge

/** A hexagonal bar with beveled tips, horizontal or vertical, between two points. */
function bar(x1: number, y1: number, x2: number, y2: number) {
  const h = T / 2;
  if (y1 === y2) {
    const [a, b] = [x1 + GAP, x2 - GAP];
    return `${a},${y1} ${a + h},${y1 - h} ${b - h},${y1 - h} ${b},${y1} ${b - h},${y1 + h} ${a + h},${y1 + h}`;
  }
  const [a, b] = [y1 + GAP, y2 - GAP];
  return `${x1},${a} ${x1 + h},${a + h} ${x1 + h},${b - h} ${x1},${b} ${x1 - h},${b - h} ${x1 - h},${a + h}`;
}

const SEGMENT_POINTS: Record<string, string> = {
  a: bar(HT, HT, DW - HT, HT),
  b: bar(DW - HT, HT, DW - HT, DH / 2),
  c: bar(DW - HT, DH / 2, DW - HT, DH - HT),
  d: bar(HT, DH - HT, DW - HT, DH - HT),
  e: bar(HT, DH / 2, HT, DH - HT),
  f: bar(HT, HT, HT, DH / 2),
  g: bar(HT, DH / 2, DW - HT, DH / 2),
};

/** One LCD-style numeral: lit segments outlined in ink, unlit ones as faint ghosts. */
function SegmentDigit({ char, color, height }: { char: string; color: string; height: number }) {
  const lit = SEGMENTS[char] ?? "";
  return (
    <svg
      viewBox={`-3 -3 ${DW + 6} ${DH + 6}`}
      height={height}
      width={(height * (DW + 6)) / (DH + 6)}
      aria-hidden
      className="overflow-visible"
    >
      {Object.entries(SEGMENT_POINTS).map(([seg, points]) => {
        const on = lit.includes(seg);
        return (
          <polygon
            key={seg}
            points={points}
            fill={color}
            fillOpacity={on ? 0.72 : 0}
            stroke={color}
            strokeOpacity={on ? 1 : 0.1}
            strokeWidth={on ? 2.6 : 1.4}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/* ---------- Flip card ---------- */

export type FlipCardProps = {
  /** Text on the leaf; null renders blank (e.g. before mount). Changing it flips. */
  value: string | null;
  width: number;
  height: number;
  /** Leaf color. */
  color: string;
  /** Draws the leaf's printed face, laid out at full card size. */
  renderFace: (text: string) => React.ReactNode;
  /** One full flip, in milliseconds. */
  duration?: number;
  /** Show the hinge pins at the seam. */
  pins?: boolean;
  /** Add the LCD dot screen to the leaves. */
  dots?: boolean;
  /** Clack when the leaf falls and lands. */
  sound?: boolean;
  /** Sound volume, 0–1. */
  volume?: number;
};

/** The numerals printed on a leaf, laid out at full card size. */
function Face({ text, digits, digitColor, height }: { text: string; digits: Digits; digitColor: string; height: number }) {
  if (digits === "print") {
    return (
      <span
        className="font-semibold tabular-nums leading-none"
        style={{ color: digitColor, fontSize: height * 0.62, letterSpacing: "-0.02em" }}
      >
        {text}
      </span>
    );
  }
  return (
    <span className="flex items-center" style={{ gap: height * 0.07 }}>
      {text.split("").map((char, i) => (
        <SegmentDigit key={i} char={char} color={digitColor} height={height * 0.6} />
      ))}
    </span>
  );
}

/** One half of a leaf. The face is card-tall and clipped so each half shows its slice. */
function Half({
  children,
  half,
  color,
  radius,
  dots,
  style,
  ref,
}: {
  children: React.ReactNode;
  half: "top" | "bottom";
  color: string;
  radius: number;
  dots?: boolean;
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
        backgroundColor: color,
        // A light falloff on the upper leaf, a darker belly below, and optionally a fine LCD dot screen.
        backgroundImage: [
          top
            ? "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.03))"
            : "linear-gradient(to bottom, rgba(0,0,0,0.07), rgba(0,0,0,0.16))",
          ...(dots ? ["radial-gradient(rgba(0,0,0,0.07) 0.6px, transparent 0.8px)"] : []),
        ].join(", "),
        backgroundSize: dots ? "100% 100%, 3px 3px" : "100% 100%",
        borderRadius: top ? `${radius}px ${radius}px 0 0` : `0 0 ${radius}px ${radius}px`,
        transformOrigin: top ? "bottom" : "top",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      <div
        className="absolute inset-x-0 flex items-center justify-center"
        style={{ height: "200%", top: top ? 0 : "-100%" }}
      >
        {children}
      </div>
    </div>
  );
}

/** A single split-flap card. Exported so other clocks can build on the same mechanism. */
export function FlipCard({
  value,
  width,
  height,
  color,
  renderFace,
  duration = 600,
  pins = false,
  dots = false,
  sound = false,
  volume = 0.5,
}: FlipCardProps) {
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
    if (sound) {
      // A soft tick as the leaf lets go, then the slap as it lands.
      clockSound.flip(volume * 0.35);
      clockSound.flip(volume, half);
    }
    // Upper leaf falls toward you, accelerating and darkening as it tips away from the light…
    const fall = topFlap.current.animate(
      [
        { transform: "rotateX(0deg)", filter: "brightness(1)" },
        { transform: "rotateX(-90deg)", filter: "brightness(0.6)" },
      ],
      { duration: half, easing: "cubic-bezier(0.55, 0, 0.9, 0.45)", fill: "forwards" }
    );
    // …and its back lands on the lower half with a small bounce.
    const land = bottomFlap.current.animate(
      [
        { transform: "rotateX(90deg)", filter: "brightness(1.35)" },
        { transform: "rotateX(0deg)", filter: "brightness(1)" },
      ],
      { duration: half, delay: half, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.25)", fill: "both" }
    );
    land.finished.then(() => setSettled(value)).catch(() => {});
    return () => {
      fall.cancel();
      land.cancel();
    };
  }, [flipping, value, duration, sound, volume]);

  const radius = width * 0.09;
  const face = (text: string | null) => renderFace(text ?? "");

  return (
    <div
      className="relative"
      style={{
        width,
        height,
        perspective: height * 4,
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
      }}
    >
      <Half half="top" color={color} radius={radius} dots={dots}>
        {face(value)}
      </Half>
      <Half half="bottom" color={color} radius={radius} dots={dots}>
        {face(flipping ? settled : value)}
      </Half>
      {flipping && (
        <>
          <Half ref={topFlap} half="top" color={color} radius={radius} dots={dots} style={{ zIndex: 2 }}>
            {face(settled)}
          </Half>
          <Half
            ref={bottomFlap}
            half="bottom"
            color={color}
            radius={radius}
            dots={dots}
            style={{ zIndex: 2, transform: "rotateX(90deg)" }}
          >
            {face(value)}
          </Half>
        </>
      )}

      {/* The seam between leaves: a dark gap with a lit lip under it. */}
      <span
        className="pointer-events-none absolute inset-x-0 z-10"
        style={{
          top: "50%",
          height: Math.max(1, height * 0.014),
          background: "rgba(0,0,0,0.32)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.18)",
          transform: "translateY(-50%)",
        }}
      />
      {/* Inner rim so the card reads as a recessed window. */}
      <span
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          borderRadius: radius,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      />
      {pins &&
        (["left", "right"] as const).map((side) => (
          <span
            key={side}
            className="pointer-events-none absolute z-10 -translate-y-1/2 rounded-[1px] bg-neutral-800"
            style={{
              top: "50%",
              [side]: -Math.max(2, width * 0.035) * 0.4,
              width: Math.max(2, width * 0.035),
              height: height * 0.14,
            }}
          />
        ))}
    </div>
  );
}

/* ---------- Clock ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlipClock({
  time,
  live = true,
  timeZone,
  hour12 = false,
  showSeconds = false,
  digits = "segment",
  hardware = true,
  size = 320,
  caseColor = "#e2302c",
  faceColor = "#e6dcc6",
  cardColor = "#7f8683",
  hourColor,
  minuteColor,
  secondColor,
  digitColor = "#0d0f0f",
  labelColor = "#2b2b2b",
  flipDuration = 600,
  flipSound = false,
  tickSound = false,
  volume = 0.5,
  className,
}: FlipClockProps) {
  const parts = useFlipTime(time, live, timeZone);
  useClockAudio(flipSound || tickSound);

  const second = parts?.s;
  useEffect(() => {
    if (tickSound && second !== undefined) clockSound.tick(volume);
  }, [tickSound, second, volume]);

  const hours = parts ? pad(hour12 ? parts.h % 12 || 12 : parts.h) : null;
  const minutes = parts ? pad(parts.m) : null;
  const seconds = parts ? pad(parts.s) : null;
  const pm = parts ? parts.h >= 12 : false;

  // Case geometry, all scaled from the width.
  const W = size;
  const H = W * 0.44;
  const rim = W * 0.034; // bright outer shell
  const ring = W * 0.014; // darker inner ring
  const groove = Math.max(1, W * 0.006);
  const btnH = W * 0.022;
  const footH = W * 0.05;

  const meridiem = hour12;
  const labelW = meridiem ? W * 0.085 : 0;
  const n = showSeconds ? 3 : 2;
  const innerW = W - 2 * (rim + ring + groove);
  const gap = W * 0.012;
  const sidePad = W * 0.03;
  const cardW = Math.min(
    (innerW - labelW - sidePad * 2 - gap * (n - 1)) / n,
    W * 0.3
  );
  const cardH = Math.min(cardW * 0.84, H - 2 * (rim + ring + groove) - W * 0.05);

  // Shades derived from the case color so a single prop recolors the whole shell.
  const shadeDark = `color-mix(in srgb, ${caseColor} 78%, black)`;
  const shadeDeep = `color-mix(in srgb, ${caseColor} 42%, black)`;
  const shadeLight = `color-mix(in srgb, ${caseColor} 82%, white)`;

  const cards = [
    { key: "h", value: hours, color: hourColor ?? cardColor },
    { key: "m", value: minutes, color: minuteColor ?? cardColor },
    ...(showSeconds ? [{ key: "s", value: seconds, color: secondColor ?? cardColor }] : []),
  ];

  const label = parts
    ? `${hours}:${minutes}${showSeconds ? `:${seconds}` : ""}${meridiem ? (pm ? " pm" : " am") : ""}`
    : "Flip clock";

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative shrink-0 select-none ${className ?? ""}`}
      style={{
        width: W,
        paddingTop: hardware ? btnH : 0,
        paddingBottom: hardware ? footH : W * 0.02,
      }}
    >
      {/* Contact shadow on the surface it stands on. */}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -W * 0.02,
          width: W * 0.92,
          height: W * 0.06,
          background: "radial-gradient(closest-side, rgba(0,0,0,0.28), rgba(0,0,0,0))",
          filter: `blur(${W * 0.008}px)`,
        }}
      />

      {hardware && (
        <>
          {/* Alarm / snooze bar on top. */}
          <span
            className="absolute"
            style={{
              top: 0,
              right: W * 0.09,
              width: W * 0.2,
              height: btnH + W * 0.01,
              borderRadius: `${W * 0.01}px ${W * 0.01}px 0 0`,
              background: "linear-gradient(to bottom, #3a3a3a, #121212)",
            }}
          />
          {/* The foot it stands on. */}
          <span
            className="absolute"
            style={{
              bottom: 0,
              left: W * 0.14,
              width: W * 0.72,
              height: footH + W * 0.02,
              borderRadius: `0 0 ${W * 0.012}px ${W * 0.012}px`,
              background: `linear-gradient(to bottom, ${shadeDeep}, color-mix(in srgb, ${caseColor} 30%, black))`,
            }}
          />
        </>
      )}

      {/* Outer shell: molded plastic with a lit top lip and a shaded belly. */}
      <div
        className="relative"
        style={{
          width: W,
          height: H,
          padding: rim,
          borderRadius: H * 0.2,
          background: `linear-gradient(to bottom, ${shadeLight} 0%, ${caseColor} 22%, ${caseColor} 70%, ${shadeDark} 100%)`,
          boxShadow: [
            `inset 0 ${W * 0.004}px ${W * 0.004}px rgba(255,255,255,0.35)`,
            `inset 0 -${W * 0.006}px ${W * 0.01}px rgba(0,0,0,0.25)`,
            `0 ${W * 0.006}px ${W * 0.012}px rgba(0,0,0,0.18)`,
          ].join(", "),
        }}
      >
        {/* Inner ring, a step down from the shell. */}
        <div
          className="h-full w-full"
          style={{
            padding: ring,
            borderRadius: H * 0.2 - rim,
            background: `linear-gradient(to bottom, ${shadeDark}, ${caseColor} 40%, ${caseColor})`,
            boxShadow: `inset 0 ${W * 0.003}px ${W * 0.006}px rgba(0,0,0,0.35)`,
          }}
        >
          {/* Dark groove, then the face plate. */}
          <div
            className="h-full w-full"
            style={{
              padding: groove,
              borderRadius: H * 0.2 - rim - ring,
              background: shadeDeep,
            }}
          >
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden"
              style={{
                gap,
                paddingInline: sidePad,
                borderRadius: H * 0.2 - rim - ring - groove,
                background: `linear-gradient(to bottom, color-mix(in srgb, ${faceColor} 88%, white), ${faceColor} 30%, color-mix(in srgb, ${faceColor} 92%, black))`,
                boxShadow: `inset 0 ${W * 0.006}px ${W * 0.01}px rgba(0,0,0,0.22)`,
              }}
            >
              {meridiem && (
                <div
                  className="relative flex shrink-0 flex-col justify-center leading-none"
                  style={{ width: labelW, height: cardH, color: labelColor, gap: W * 0.012, fontSize: W * 0.034 }}
                >
                  {(["am", "pm"] as const).map((m) => (
                    <span key={m} className="flex items-center justify-between" style={{ paddingRight: W * 0.008 }}>
                      {m}
                      <span
                        className="rounded-full transition-opacity duration-300"
                        style={{
                          width: W * 0.016,
                          height: W * 0.016,
                          background: labelColor,
                          opacity: parts && (m === "pm") === pm ? 1 : 0,
                        }}
                      />
                    </span>
                  ))}
                </div>
              )}
              {cards.map((card) => (
                <FlipCard
                  key={card.key}
                  value={card.value}
                  width={cardW}
                  height={cardH}
                  color={card.color}
                  duration={flipDuration}
                  sound={flipSound}
                  volume={volume}
                  pins={digits === "print"}
                  dots={digits === "segment"}
                  renderFace={(text) => (
                    <Face text={text} digits={digits} digitColor={digitColor} height={cardH} />
                  )}
                />
              ))}
              {/* Glare across the clear front. */}
              <span
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 26%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.06) 82%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
