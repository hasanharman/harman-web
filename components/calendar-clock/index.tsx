"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { FlipCard } from "@/components/flip-clock";

/** A retro calendar alarm clock: flip day and date wheels beside an analog dial. */

export type CalendarClockProps = {
  /** Freeze at a fixed moment; omit to tick live. A string is a time ("HH:MM[:SS]") on today's date. */
  time?: Date | string;
  /** Tick in real time. Ignored when a fixed `time` is provided. */
  live?: boolean;
  /** IANA time zone, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** BCP 47 locale for the weekday names, e.g. "tr-TR". */
  locale?: string;
  /** Show the second hand. */
  showSeconds?: boolean;
  /** Alarm time "HH:MM". Draws the alarm hand while the alarm is on. */
  alarm?: string;
  /** Start with the alarm switched on (uncontrolled). */
  defaultAlarmOn?: boolean;
  /** Controlled alarm state. */
  alarmOn?: boolean;
  /** Fired when the top-right button switches the alarm. */
  onAlarmChange?: (on: boolean) => void;
  /** Let the top buttons wind the day and date wheels and switch the alarm. */
  interactive?: boolean;
  /** Case width in pixels; everything else scales from it. */
  size?: number;
  /** Outer shell color. */
  caseColor?: string;
  /** Groove, window frames and foot. */
  trimColor?: string;
  /** Inset panel behind the windows. */
  panelColor?: string;
  /** Day/date leaves and the dial face. */
  cardColor?: string;
  /** Type, ticks, hands and the top buttons. */
  inkColor?: string;
  /** Alarm hand color. */
  alarmColor?: string;
  /** One full flip, in milliseconds. */
  flipDuration?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

type Moment = { h: number; m: number; s: number; weekday: number; day: number };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTimeString(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  return { h: Number(match[1]), m: Number(match[2]), s: match[3] ? Number(match[3]) : 0 };
}

function localMoment(d: Date): Moment {
  return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), weekday: d.getDay(), day: d.getDate() };
}

// One formatter per zone — building Intl formatters every second adds up.
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();
function zonedMoment(date: Date, timeZone: string): Moment {
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
    weekday: Math.max(0, WEEKDAYS.indexOf(get("weekday"))),
    day: Number(get("day")),
  };
}

/** Short, uppercase weekday names for a locale, Sunday first. */
function weekdayNames(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  // 2023-01-01 was a Sunday.
  return WEEKDAYS.map((_, i) =>
    fmt.format(new Date(Date.UTC(2023, 0, 1 + i))).replace(/\.$/, "").toLocaleUpperCase(locale)
  );
}

/** Resolve the props into a moment. Null until mounted so SSR and hydration agree. */
function useMoment(time: CalendarClockProps["time"], live: boolean, timeZone?: string) {
  const [now, setNow] = useState<Date | null>(null);
  const fixedDate = time instanceof Date ? time : null;
  const fixedTime = typeof time === "string" ? parseTimeString(time) : null;
  const frozen = Boolean(fixedDate || fixedTime);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    // Re-arm on each second boundary so hands and leaves move with the real tick.
    const tick = () => {
      const d = new Date();
      setNow(d);
      if (live && !frozen) id = setTimeout(tick, 1000 - d.getMilliseconds());
    };
    id = setTimeout(tick, 0);
    return () => clearTimeout(id);
  }, [live, frozen]);

  if (fixedDate) return timeZone ? zonedMoment(fixedDate, timeZone) : localMoment(fixedDate);
  if (!now) return null;
  const current = timeZone ? zonedMoment(now, timeZone) : localMoment(now);
  return fixedTime ? { ...current, ...fixedTime } : current;
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

/** Cartesian point on the 100×100 dial for a radius and clock angle (deg, 12 o'clock = 0). */
function point(radius: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  // Rounded so server and browser trig agree and hydration matches.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return [round(50 + radius * Math.sin(a)), round(50 - radius * Math.cos(a))];
}

function Dial({
  moment,
  alarm,
  showSeconds,
  ink,
  face,
  alarmColor,
}: {
  moment: Moment | null;
  alarm: { h: number; m: number } | null;
  showSeconds: boolean;
  ink: string;
  face: string;
  alarmColor: string;
}) {
  const hour = moment ? ((moment.h % 12) + moment.m / 60) * 30 : 0;
  const minute = moment ? (moment.m + moment.s / 60) * 6 : 0;
  const second = moment ? moment.s * 6 : 0;
  const alarmDeg = alarm ? ((alarm.h % 12) + alarm.m / 60) * 30 : 0;
  const vignette = `cc-vignette-${useId()}`;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={vignette}>
          <stop offset="60%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={face} />
      {/* Paper falloff toward the edges. */}
      <rect width="100" height="100" fill={`url(#${vignette})`} />

      {Array.from({ length: 12 }, (_, i) => {
        const long = i % 3 === 0;
        const [x1, y1] = point(long ? 31 : 34, i * 30);
        const [x2, y2] = point(41, i * 30);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={long ? 2.6 : 2} strokeLinecap="round" />
        );
      })}

      {moment && (
        <>
          {alarm && (
            <g transform={`rotate(${alarmDeg} 50 50)`}>
              <line x1="50" y1="50" x2="50" y2="28" stroke={alarmColor} strokeWidth="1.6" strokeLinecap="round" />
              <path d="M50 24 l3 5 h-6 z" fill={alarmColor} />
            </g>
          )}
          {/* Hour hand: a short, broad lozenge. */}
          <path
            d="M50 56 L47.6 50 L50 25 L52.4 50 Z"
            fill={ink}
            transform={`rotate(${hour} 50 50)`}
          />
          {/* Minute hand. */}
          <path
            d="M50 57 L48.2 50 L50 12 L51.8 50 Z"
            fill={ink}
            transform={`rotate(${minute} 50 50)`}
          />
          {showSeconds && (
            <g transform={`rotate(${second} 50 50)`}>
              <line x1="50" y1="60" x2="50" y2="13" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
            </g>
          )}
          <circle cx="50" cy="50" r="4.6" fill={ink} />
          <circle cx="50" cy="50" r="2.2" fill="white" fillOpacity="0.35" />
        </>
      )}
    </svg>
  );
}

export default function CalendarClock({
  time,
  live = true,
  timeZone,
  locale = "en-US",
  showSeconds = true,
  alarm,
  defaultAlarmOn = false,
  alarmOn,
  onAlarmChange,
  interactive = true,
  size = 360,
  caseColor = "#efe8cd",
  trimColor = "#5a3a2c",
  panelColor = "#b4512f",
  cardColor = "#f2e9cb",
  inkColor = "#3f978b",
  alarmColor = "#b4512f",
  flipDuration = 600,
  className,
}: CalendarClockProps) {
  const moment = useMoment(time, live, timeZone);
  const reduced = useReducedMotion();
  const names = useMemo(() => weekdayNames(locale), [locale]);
  const alarmTime = useMemo(() => (alarm ? parseTimeString(alarm) : null), [alarm]);

  // The real clock's day/date wheels are wound by hand; these offsets are those turns.
  const [dayTurns, setDayTurns] = useState(0);
  const [dateTurns, setDateTurns] = useState(0);
  const [alarmInternal, setAlarmInternal] = useState(defaultAlarmOn);
  const armed = alarmOn ?? alarmInternal;

  const weekday = moment ? names[(moment.weekday + dayTurns) % 7] : null;
  const date = moment ? String(((moment.day - 1 + dateTurns) % 31) + 1) : null;

  const ringing =
    armed && alarmTime && moment ? moment.h === alarmTime.h && moment.m === alarmTime.m : false;

  // Rattle the whole clock while the alarm is going off.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ringing || reduced || !body.current) return;
    const rattle = body.current.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-1.2deg)" },
        { transform: "rotate(1.2deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 160, iterations: Infinity }
    );
    return () => rattle.cancel();
  }, [ringing, reduced]);

  const toggleAlarm = () => {
    const next = !armed;
    if (alarmOn === undefined) setAlarmInternal(next);
    onAlarmChange?.(next);
  };

  // Geometry, all scaled from the width.
  const W = size;
  const H = W * 0.5;
  const shell = W * 0.035;
  const groove = W * 0.012;
  const btnH = W * 0.04;
  const footH = W * 0.035;
  const frame = Math.max(2, W * 0.008);
  const cardW = W * 0.19;
  const cardH = W * 0.2;
  const dialS = W * 0.26;
  const gap = W * 0.045;
  const radius = H * 0.22;

  const shade = (c: string, pct: number, to = "black") => `color-mix(in srgb, ${c} ${pct}%, ${to})`;

  const windowStyle = (w: number, h: number): React.CSSProperties => ({
    width: w + frame * 2,
    height: h + frame * 2,
    padding: frame,
    borderRadius: W * 0.022,
    background: trimColor,
    boxShadow: `0 1px 0 ${shade(panelColor, 75, "white")}, inset 0 ${W * 0.004}px ${W * 0.006}px rgba(0,0,0,0.45)`,
  });

  const face = (text: string) => (
    <span
      className="font-bold leading-none"
      style={{
        color: inkColor,
        fontSize: cardH * (text.length > 2 ? 0.44 : 0.5),
        // Condensed lettering like the printed wheels, without depending on a narrow font.
        transform: "scaleX(0.78)",
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </span>
  );

  const buttons = [
    { key: "day", label: "Turn the day wheel", onClick: () => setDayTurns((n) => n + 1), down: false },
    { key: "date", label: "Turn the date wheel", onClick: () => setDateTurns((n) => n + 1), down: false },
    { key: "alarm", label: armed ? "Turn alarm off" : "Turn alarm on", onClick: toggleAlarm, down: armed },
  ];

  const label = moment
    ? `${weekday} ${date}, ${String(moment.h).padStart(2, "0")}:${String(moment.m).padStart(2, "0")}${armed && alarm ? `, alarm ${alarm}` : ""}`
    : "Calendar clock";

  return (
    <div
      ref={body}
      role="group"
      aria-label={label}
      className={`relative shrink-0 select-none ${className ?? ""}`}
      style={{ width: W, paddingTop: btnH, paddingBottom: footH }}
    >
      {/* Contact shadow. */}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -W * 0.02,
          width: W * 0.95,
          height: W * 0.06,
          background: "radial-gradient(closest-side, rgba(0,0,0,0.25), rgba(0,0,0,0))",
          filter: `blur(${W * 0.008}px)`,
        }}
      />

      {/* Push buttons, one above each window. */}
      <div
        className="absolute inset-x-0 top-0 flex justify-center"
        style={{ gap, paddingInline: shell + groove }}
      >
        {[cardW, cardW, dialS].map((w, i) => {
          const b = buttons[i];
          const Tag = interactive ? "button" : "span";
          return (
            <div key={b.key} className="flex justify-center" style={{ width: w + frame * 2 }}>
              <Tag
                {...(interactive
                  ? { type: "button" as const, onClick: b.onClick, "aria-label": b.label, "aria-pressed": b.key === "alarm" ? armed : undefined }
                  : {})}
                className="block transition-transform duration-100 ease-out active:translate-y-[18%] motion-reduce:transition-none"
                style={{
                  width: W * 0.085,
                  height: btnH + W * 0.01,
                  borderRadius: `${W * 0.03}px ${W * 0.03}px ${W * 0.006}px ${W * 0.006}px / ${W * 0.018}px ${W * 0.018}px ${W * 0.006}px ${W * 0.006}px`,
                  // A cylinder: a lit elliptical cap over a side that rolls into shadow at the edges.
                  background: [
                    `radial-gradient(ellipse 50% 28% at 50% 22%, ${shade(inkColor, 72, "white")}, ${inkColor} 92%, transparent 100%)`,
                    `linear-gradient(to right, ${shade(inkColor, 70)}, ${inkColor} 30%, ${shade(inkColor, 88, "white")} 55%, ${inkColor} 75%, ${shade(inkColor, 70)})`,
                  ].join(", "),
                  boxShadow: `0 ${W * 0.002}px ${W * 0.004}px rgba(0,0,0,0.25)`,
                  transform: b.down ? "translateY(28%)" : undefined,
                  cursor: interactive ? "pointer" : undefined,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Foot. */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 0,
          width: W * 0.88,
          height: footH + W * 0.02,
          borderRadius: `0 0 ${W * 0.008}px ${W * 0.008}px`,
          background: `linear-gradient(to bottom, ${shade(trimColor, 70)}, ${trimColor} 40%, ${shade(trimColor, 85)})`,
        }}
      />

      {/* Shell. */}
      <div
        className="relative"
        style={{
          height: H,
          padding: shell,
          borderRadius: radius,
          background: `linear-gradient(to bottom, ${shade(caseColor, 70, "white")}, ${caseColor} 25%, ${caseColor} 70%, ${shade(caseColor, 88)})`,
          boxShadow: [
            `inset 0 ${W * 0.004}px ${W * 0.004}px rgba(255,255,255,0.6)`,
            `inset 0 -${W * 0.006}px ${W * 0.01}px rgba(0,0,0,0.12)`,
            `0 ${W * 0.004}px ${W * 0.01}px rgba(0,0,0,0.12)`,
          ].join(", "),
        }}
      >
        {/* Groove. */}
        <div
          className="h-full w-full"
          style={{
            padding: groove,
            borderRadius: radius - shell,
            background: `linear-gradient(to bottom, ${shade(trimColor, 75)}, ${trimColor})`,
          }}
        >
          {/* Panel. */}
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              gap,
              borderRadius: radius - shell - groove,
              background: `linear-gradient(to bottom, ${shade(panelColor, 80)}, ${panelColor} 18%, ${panelColor} 80%, ${shade(panelColor, 88, "white")})`,
              boxShadow: `inset 0 ${W * 0.008}px ${W * 0.014}px rgba(0,0,0,0.3)`,
            }}
          >
            {[
              { key: "weekday", value: weekday },
              { key: "date", value: date },
            ].map((wheel) => (
              <div key={wheel.key} className="relative" style={windowStyle(cardW, cardH)}>
                <FlipCard
                  value={wheel.value}
                  width={cardW}
                  height={cardH}
                  color={cardColor}
                  duration={flipDuration}
                  renderFace={face}
                />
                {/* Edges of the leaves stacked up behind the front one. */}
                <span
                  className="pointer-events-none absolute z-20"
                  style={{
                    left: frame + cardW * 0.04,
                    right: frame + cardW * 0.04,
                    bottom: frame + cardH * 0.015,
                    height: cardH * 0.07,
                    background: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0 1px, ${cardColor} 1px 3px)`,
                    borderRadius: 1,
                  }}
                />
              </div>
            ))}

            <div style={windowStyle(dialS, dialS)}>
              <div className="h-full w-full overflow-hidden" style={{ borderRadius: W * 0.014 }}>
                <Dial
                  moment={moment}
                  alarm={armed ? alarmTime : null}
                  showSeconds={showSeconds}
                  ink={inkColor}
                  face={cardColor}
                  alarmColor={alarmColor}
                />
              </div>
            </div>

            {/* Clear front: a soft glare sweep. */}
            <span
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0) 48%, rgba(255,255,255,0.07) 85%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
