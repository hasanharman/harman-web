"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Digits = "segment" | "print";

export type FlipClockProps = {
  /** Freeze at a Date or "HH:MM[:SS]"; omit to tick live. */
  time?: Date | string;
  /** IANA time zone, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** 01–12 with am/pm instead of 00–23. */
  hour12?: boolean;
  /** Add a seconds card. */
  showSeconds?: boolean;
  /** Outlined seven-segment numerals, or solid printed type. */
  digits?: Digits;
  /** Show the alarm bar and foot. */
  hardware?: boolean;
  /** Case width in px; everything scales from it. */
  size?: number;
  /** Shell color; ring and foot are shaded from it. */
  caseColor?: string;
  faceColor?: string;
  /** Default color for every card. */
  cardColor?: string;
  /** Defaults to cardColor. */
  hourColor?: string;
  /** Defaults to cardColor. */
  minuteColor?: string;
  digitColor?: string;
  /** am/pm label and dot color. */
  labelColor?: string;
  /** Flip duration (ms). */
  flipDuration?: number;
  /** Clack on each flip; audio starts after the first click or key press. */
  flipSound?: boolean;
  /** Quartz tick every second. */
  tickSound?: boolean;
  /** 0–1. */
  volume?: number;
  className?: string;
};

/* Time */

export type Moment = { h: number; m: number; s: number; weekday: number | null; day: number | null };

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseTimeString(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  return { h: Number(match[1]), m: Number(match[2]), s: match[3] ? Number(match[3]) : 0 };
}

// One formatter per zone; building Intl formatters every tick adds up.
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

function momentOf(date: Date, timeZone?: string): Moment {
  if (!timeZone) {
    return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds(), weekday: date.getDay(), day: date.getDate() };
  }
  let fmt = zoneFormatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      day: "numeric",
    });
    zoneFormatters.set(timeZone, fmt);
  }
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    h: Number(get("hour")),
    m: Number(get("minute")),
    s: Number(get("second")),
    weekday: WEEKDAYS.indexOf(get("weekday")),
    day: Number(get("day")),
  };
}

// One page-wide ticker on the second boundary, so every clock updates in the same commit.
let now = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    const tick = () => {
      now = Date.now();
      listeners.forEach((l) => l());
      timer = setTimeout(tick, 1000 - (now % 1000));
    };
    tick();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) clearTimeout(timer);
  };
}

const subscribeNever = () => () => {};

/** Current moment, null until mounted so SSR and hydration agree; re-renders each second, or each minute without `everySecond`. */
export function useClockMoment(time: Date | string | undefined, timeZone?: string, everySecond = true) {
  const fixedDate = time instanceof Date ? time : null;
  const fixedTime = typeof time === "string" ? parseTimeString(time) : null;
  const unit = everySecond && !fixedTime ? 1000 : 60000;
  const tick = useSyncExternalStore(
    fixedDate ? subscribeNever : subscribeClock,
    // No subscribers means the ticker is stopped and `now` is stale.
    () => (listeners.size ? Math.floor(now / unit) : null),
    () => null
  );

  if (fixedDate) return momentOf(fixedDate, timeZone);
  const current = tick === null ? null : momentOf(new Date(tick * unit), timeZone);
  if (fixedTime) return { ...fixedTime, weekday: current?.weekday ?? null, day: current?.day ?? null };
  return current;
}

let motionQuery: MediaQueryList | undefined;
const reducedMotionQuery = () => (motionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)"));

function subscribeReducedMotion(cb: () => void) {
  reducedMotionQuery().addEventListener("change", cb);
  return () => reducedMotionQuery().removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => reducedMotionQuery().matches, () => false);
}

/* Sound */

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

// Browsers suspend audio until a gesture (and may again later), so every gesture resumes it.
function getAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const resume = () => {
      if (audioCtx?.state !== "running") void audioCtx?.resume();
    };
    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume);
  }
  return audioCtx;
}

/** The context and start time (`delay` ms from now), or null while audio is locked. */
function begin(delay = 0) {
  const ctx = getAudio();
  return ctx.state === "running" ? { ctx, at: ctx.currentTime + delay / 1000 } : null;
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

/** Gain that snaps to `peak`, then decays over `decay` s. */
function envelope(ctx: AudioContext, at: number, peak: number, decay: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  gain.connect(ctx.destination);
  return gain;
}

/** Synthesized clock sounds; no audio files. */
export const clockSound = {
  /** Noise snap over a low knock. */
  flip(volume: number, delay = 0) {
    const start = begin(delay);
    if (!start) return;
    const { ctx, at } = start;
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
  tick(volume: number) {
    const start = begin();
    if (!start) return;
    const { ctx, at } = start;
    const click = noise(ctx);
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 3200;
    click.connect(high).connect(envelope(ctx, at, volume * 0.35, 0.012));
    click.start(at, Math.random() * 0.2, 0.02);
  },
  /** Four-beep alarm burst. */
  alarm(volume: number) {
    const start = begin();
    if (!start) return;
    const { ctx } = start;
    for (let i = 0; i < 4; i++) {
      const at = start.at + i * 0.13;
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

/** Creates the audio context early so the first gesture unlocks it, and ticks on each new `second` when `tick` is on. */
export function useClockAudio({
  enabled,
  tick = false,
  second,
  volume,
}: {
  enabled: boolean;
  tick?: boolean;
  second?: number;
  volume: number;
}) {
  const vol = useRef(volume);
  useEffect(() => {
    vol.current = volume;
  });
  useEffect(() => {
    if (enabled) getAudio();
  }, [enabled]);
  useEffect(() => {
    if (tick && second !== undefined) clockSound.tick(vol.current);
  }, [tick, second]);
}

/* Shared pieces */

export const pad = (n: number) => String(n).padStart(2, "0");

export const shade = (color: string, pct: number, to = "black") => `color-mix(in srgb, ${color} ${pct}%, ${to})`;

export function ContactShadow({ size }: { size: number }) {
  return (
    <span
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
      style={{
        bottom: -size * 0.02,
        width: size * 0.92,
        height: size * 0.06,
        background: "radial-gradient(closest-side, rgba(0,0,0,0.28), rgba(0,0,0,0))",
        filter: `blur(${size * 0.008}px)`,
      }}
    />
  );
}

/* Seven-segment numerals */

// Segments: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle.
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

const DIGIT_W = 52;
const DIGIT_H = 100;
const HALF_T = 5.5; // half the segment thickness
const GAP = 1.6; // clearance between segment tips

/** Hexagonal segment with beveled tips between two points. */
function bar(x1: number, y1: number, x2: number, y2: number) {
  const h = HALF_T;
  if (y1 === y2) {
    const [a, b] = [x1 + GAP, x2 - GAP];
    return `${a},${y1} ${a + h},${y1 - h} ${b - h},${y1 - h} ${b},${y1} ${b - h},${y1 + h} ${a + h},${y1 + h}`;
  }
  const [a, b] = [y1 + GAP, y2 - GAP];
  return `${x1},${a} ${x1 + h},${a + h} ${x1 + h},${b - h} ${x1},${b} ${x1 - h},${b - h} ${x1 - h},${a + h}`;
}

const L = HALF_T;
const R = DIGIT_W - HALF_T;
const SEGMENT_POINTS: Record<string, string> = {
  a: bar(L, HALF_T, R, HALF_T),
  b: bar(R, HALF_T, R, DIGIT_H / 2),
  c: bar(R, DIGIT_H / 2, R, DIGIT_H - HALF_T),
  d: bar(L, DIGIT_H - HALF_T, R, DIGIT_H - HALF_T),
  e: bar(L, DIGIT_H / 2, L, DIGIT_H - HALF_T),
  f: bar(L, HALF_T, L, DIGIT_H / 2),
  g: bar(L, DIGIT_H / 2, R, DIGIT_H / 2),
};

/** Lit segments outlined, unlit ones faint. */
function SegmentDigit({ char, color, height }: { char: string; color: string; height: number }) {
  const lit = SEGMENTS[char] ?? "";
  return (
    <svg
      viewBox={`-3 -3 ${DIGIT_W + 6} ${DIGIT_H + 6}`}
      height={height}
      width={(height * (DIGIT_W + 6)) / (DIGIT_H + 6)}
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

/* Flip card */

type FlipCardProps = {
  /** null renders blank; changing it flips. */
  value: string | null;
  width: number;
  height: number;
  color: string;
  /** Draws the leaf's face at full card size. */
  renderFace: (text: string) => React.ReactNode;
  /** Flip duration (ms). */
  duration?: number;
  /** Show hinge pins at the seam. */
  pins?: boolean;
  /** Add an LCD dot screen to the leaves. */
  dots?: boolean;
  /** Clack when the leaf falls and lands. */
  sound?: boolean;
  /** 0–1. */
  volume?: number;
};

/** Face is card-tall and clipped so each half shows its slice. */
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

/** One split-flap card; exported so CalendarClock can reuse it. */
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
  // Value fully shown; while it trails `value`, a leaf is falling.
  const [settled, setSettled] = useState(value);
  const topFlap = useRef<HTMLDivElement>(null);
  const bottomFlap = useRef<HTMLDivElement>(null);
  const audio = useRef({ sound, volume });
  useEffect(() => {
    audio.current = { sound, volume };
  });

  // First value or reduced motion: swap in without a flip.
  if (settled !== value && (settled === null || reduced)) setSettled(value);
  const flipping = settled !== null && settled !== value && !reduced;

  useEffect(() => {
    if (!flipping || !topFlap.current || !bottomFlap.current) return;
    const half = duration / 2;
    if (audio.current.sound) {
      clockSound.flip(audio.current.volume * 0.35);
      clockSound.flip(audio.current.volume, half);
    }
    // Top leaf falls and darkens, then its back lands on the bottom with a bounce.
    const fall = topFlap.current.animate(
      [
        { transform: "rotateX(0deg)", filter: "brightness(1)" },
        { transform: "rotateX(-90deg)", filter: "brightness(0.6)" },
      ],
      { duration: half, easing: "cubic-bezier(0.55, 0, 0.9, 0.45)", fill: "forwards" }
    );
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
  }, [flipping, value, duration]);

  const radius = width * 0.09;
  const pinW = Math.max(2, width * 0.035);
  const face = (text: string | null) => renderFace(text ?? "");

  return (
    <div
      className="relative"
      style={{ width, height, perspective: height * 4, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
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

      {/* Seam between leaves. */}
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
            style={{ top: "50%", [side]: -pinW * 0.4, width: pinW, height: height * 0.14 }}
          />
        ))}
    </div>
  );
}

/* Clock */

export default function FlipClock({
  time,
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
  digitColor = "#0d0f0f",
  labelColor = "#2b2b2b",
  flipDuration = 600,
  flipSound = false,
  tickSound = false,
  volume = 0.5,
  className,
}: FlipClockProps) {
  const moment = useClockMoment(time, timeZone, showSeconds || tickSound);
  useClockAudio({ enabled: flipSound || tickSound, tick: tickSound, second: moment?.s, volume });

  const hours = moment ? pad(hour12 ? moment.h % 12 || 12 : moment.h) : null;
  const minutes = moment ? pad(moment.m) : null;
  const seconds = moment ? pad(moment.s) : null;
  const pm = (moment?.h ?? 0) >= 12;

  const W = size;
  const H = W * 0.44;
  const rim = W * 0.034; // bright outer shell
  const ring = W * 0.014; // darker inner ring
  const groove = Math.max(1, W * 0.006);
  const btnH = W * 0.022;
  const footH = W * 0.05;

  const labelW = hour12 ? W * 0.085 : 0;
  const n = showSeconds ? 3 : 2;
  const innerW = W - 2 * (rim + ring + groove);
  const gap = W * 0.012;
  const sidePad = W * 0.03;
  const cardW = Math.min((innerW - labelW - sidePad * 2 - gap * (n - 1)) / n, W * 0.3);
  const cardH = Math.min(cardW * 0.84, H - 2 * (rim + ring + groove) - W * 0.05);

  const cards = [
    { key: "h", value: hours, color: hourColor ?? cardColor },
    { key: "m", value: minutes, color: minuteColor ?? cardColor },
    ...(showSeconds ? [{ key: "s", value: seconds, color: cardColor }] : []),
  ];

  const label = moment
    ? `${hours}:${minutes}${showSeconds ? `:${seconds}` : ""}${hour12 ? (pm ? " pm" : " am") : ""}`
    : "Flip clock";

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative shrink-0 select-none ${className ?? ""}`}
      style={{ width: W, paddingTop: hardware ? btnH : 0, paddingBottom: hardware ? footH : W * 0.02 }}
    >
      <ContactShadow size={W} />

      {hardware && (
        <>
          {/* Alarm bar. */}
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
          {/* Foot. */}
          <span
            className="absolute"
            style={{
              bottom: 0,
              left: W * 0.14,
              width: W * 0.72,
              height: footH + W * 0.02,
              borderRadius: `0 0 ${W * 0.012}px ${W * 0.012}px`,
              background: `linear-gradient(to bottom, ${shade(caseColor, 42)}, ${shade(caseColor, 30)})`,
            }}
          />
        </>
      )}

      {/* Shell → inner ring → groove → face plate. */}
      <div
        className="relative"
        style={{
          width: W,
          height: H,
          padding: rim,
          borderRadius: H * 0.2,
          background: `linear-gradient(to bottom, ${shade(caseColor, 82, "white")} 0%, ${caseColor} 22%, ${caseColor} 70%, ${shade(caseColor, 78)} 100%)`,
          boxShadow: [
            `inset 0 ${W * 0.004}px ${W * 0.004}px rgba(255,255,255,0.35)`,
            `inset 0 -${W * 0.006}px ${W * 0.01}px rgba(0,0,0,0.25)`,
            `0 ${W * 0.006}px ${W * 0.012}px rgba(0,0,0,0.18)`,
          ].join(", "),
        }}
      >
        <div
          className="h-full w-full"
          style={{
            padding: ring,
            borderRadius: H * 0.2 - rim,
            background: `linear-gradient(to bottom, ${shade(caseColor, 78)}, ${caseColor} 40%, ${caseColor})`,
            boxShadow: `inset 0 ${W * 0.003}px ${W * 0.006}px rgba(0,0,0,0.35)`,
          }}
        >
          <div
            className="h-full w-full"
            style={{ padding: groove, borderRadius: H * 0.2 - rim - ring, background: shade(caseColor, 42) }}
          >
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden"
              style={{
                gap,
                paddingInline: sidePad,
                borderRadius: H * 0.2 - rim - ring - groove,
                background: `linear-gradient(to bottom, ${shade(faceColor, 88, "white")}, ${faceColor} 30%, ${shade(faceColor, 92)})`,
                boxShadow: `inset 0 ${W * 0.006}px ${W * 0.01}px rgba(0,0,0,0.22)`,
              }}
            >
              {hour12 && (
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
                          opacity: moment && (m === "pm") === pm ? 1 : 0,
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
                  renderFace={(text) => <Face text={text} digits={digits} digitColor={digitColor} height={cardH} />}
                />
              ))}
              {/* Glare. */}
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
