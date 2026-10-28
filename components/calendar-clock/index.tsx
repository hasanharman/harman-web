"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  ContactShadow,
  FlipCard,
  WEEKDAYS,
  clockSound,
  pad,
  parseTimeString,
  shade,
  useClockAudio,
  useClockMoment,
  useReducedMotion,
  type Moment,
} from "@/components/flip-clock";

export type CalendarClockProps = {
  /** Freeze the clock; a string is "HH:MM[:SS]" on today's date. */
  time?: Date | string;
  /** IANA time zone, e.g. "Europe/Istanbul". Defaults to local. */
  timeZone?: string;
  /** BCP 47 locale for weekday names, e.g. "tr-TR". */
  locale?: string;
  showSeconds?: boolean;
  /** Alarm time "HH:MM"; its hand shows while the alarm is on. */
  alarm?: string;
  defaultAlarmOn?: boolean;
  /** Controlled alarm state. */
  alarmOn?: boolean;
  /** Fired when the top-right button switches the alarm. */
  onAlarmChange?: (on: boolean) => void;
  /** Case width in px; everything scales from it. */
  size?: number;
  caseColor?: string;
  /** Groove, window frames and foot. */
  trimColor?: string;
  /** Inset panel behind the windows. */
  panelColor?: string;
  /** Day/date leaves and the dial face. */
  cardColor?: string;
  /** Type, ticks, hands and buttons. */
  inkColor?: string;
  alarmColor?: string;
  /** Flip duration (ms). */
  flipDuration?: number;
  /** Clack when a wheel turns; audio starts after the first click or key press. */
  flipSound?: boolean;
  /** Quartz tick every second. */
  tickSound?: boolean;
  /** Beep while the alarm goes off. */
  alarmSound?: boolean;
  /** 0–1. */
  volume?: number;
  className?: string;
};

/** Short uppercase weekday names for a locale, Sunday first. */
function weekdayNames(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  // 2023-01-01 was a Sunday.
  return WEEKDAYS.map((_, i) =>
    fmt.format(new Date(Date.UTC(2023, 0, 1 + i))).replace(/\.$/, "").toLocaleUpperCase(locale)
  );
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
      <rect width="100" height="100" fill={`url(#${vignette})`} />

      {/* Ticks are rotated, not placed with trig, so server and client markup match exactly. */}
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="50"
          y1={i % 3 === 0 ? 19 : 16}
          x2="50"
          y2="9"
          stroke={ink}
          strokeWidth={i % 3 === 0 ? 2.6 : 2}
          strokeLinecap="round"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}

      {moment && (
        <>
          {alarm && (
            <g transform={`rotate(${((alarm.h % 12) + alarm.m / 60) * 30} 50 50)`}>
              <line x1="50" y1="50" x2="50" y2="28" stroke={alarmColor} strokeWidth="1.6" strokeLinecap="round" />
              <path d="M50 24 l3 5 h-6 z" fill={alarmColor} />
            </g>
          )}
          <path
            d="M50 56 L47.6 50 L50 25 L52.4 50 Z"
            fill={ink}
            transform={`rotate(${((moment.h % 12) + moment.m / 60) * 30} 50 50)`}
          />
          <path
            d="M50 57 L48.2 50 L50 12 L51.8 50 Z"
            fill={ink}
            transform={`rotate(${(moment.m + moment.s / 60) * 6} 50 50)`}
          />
          {showSeconds && (
            <line
              x1="50"
              y1="60"
              x2="50"
              y2="13"
              stroke={ink}
              strokeWidth="0.9"
              strokeLinecap="round"
              transform={`rotate(${moment.s * 6} 50 50)`}
            />
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
  timeZone,
  locale = "en-US",
  showSeconds = true,
  alarm,
  defaultAlarmOn = false,
  alarmOn,
  onAlarmChange,
  size = 360,
  caseColor = "#efe8cd",
  trimColor = "#5a3a2c",
  panelColor = "#b4512f",
  cardColor = "#f2e9cb",
  inkColor = "#3f978b",
  alarmColor = "#b4512f",
  flipDuration = 600,
  flipSound = false,
  tickSound = false,
  alarmSound = false,
  volume = 0.5,
  className,
}: CalendarClockProps) {
  const moment = useClockMoment(time, timeZone, showSeconds || tickSound);
  useClockAudio({ enabled: flipSound || tickSound || alarmSound, tick: tickSound, second: moment?.s, volume });
  const reduced = useReducedMotion();
  const names = useMemo(() => weekdayNames(locale), [locale]);
  const alarmTime = alarm ? parseTimeString(alarm) : null;

  // Offsets from hand-winding the day and date wheels.
  const [dayTurns, setDayTurns] = useState(0);
  const [dateTurns, setDateTurns] = useState(0);
  const [alarmInternal, setAlarmInternal] = useState(defaultAlarmOn);
  const armed = alarmOn ?? alarmInternal;

  const weekday = moment?.weekday != null ? names[(moment.weekday + dayTurns) % 7] : null;
  const date = moment?.day != null ? String(((moment.day - 1 + dateTurns) % 31) + 1) : null;
  const ringing = !!(armed && alarmTime && moment && moment.h === alarmTime.h && moment.m === alarmTime.m);

  useEffect(() => {
    if (!ringing || !alarmSound) return;
    clockSound.alarm(volume);
    const id = setInterval(() => clockSound.alarm(volume), 1000);
    return () => clearInterval(id);
  }, [ringing, alarmSound, volume]);

  // Rattle while ringing.
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
    if (alarmOn === undefined) setAlarmInternal(!armed);
    onAlarmChange?.(!armed);
  };

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
        // Condensed like the printed wheels, without needing a narrow font.
        transform: "scaleX(0.78)",
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </span>
  );

  const buttons = [
    { key: "day", width: cardW, label: "Turn the day wheel", onClick: () => setDayTurns((n) => n + 1) },
    { key: "date", width: cardW, label: "Turn the date wheel", onClick: () => setDateTurns((n) => n + 1) },
    { key: "alarm", width: dialS, label: armed ? "Turn alarm off" : "Turn alarm on", onClick: toggleAlarm, pressed: armed },
  ];

  const label = moment
    ? `${weekday} ${date}, ${pad(moment.h)}:${pad(moment.m)}${armed && alarm ? `, alarm ${alarm}` : ""}`
    : "Calendar clock";

  return (
    <div
      ref={body}
      role="group"
      aria-label={label}
      className={`relative shrink-0 select-none ${className ?? ""}`}
      style={{ width: W, paddingTop: btnH, paddingBottom: footH }}
    >
      <ContactShadow size={W} />

      {/* Push buttons, one above each window. */}
      <div className="absolute inset-x-0 top-0 flex justify-center" style={{ gap, paddingInline: shell + groove }}>
        {buttons.map((b) => (
          <div key={b.key} className="flex justify-center" style={{ width: b.width + frame * 2 }}>
            <button
              type="button"
              onClick={b.onClick}
              aria-label={b.label}
              aria-pressed={b.pressed}
              className="block cursor-pointer transition-transform duration-100 ease-out active:translate-y-[18%] motion-reduce:transition-none"
              style={{
                width: W * 0.085,
                height: btnH + W * 0.01,
                borderRadius: `${W * 0.03}px ${W * 0.03}px ${W * 0.006}px ${W * 0.006}px / ${W * 0.018}px ${W * 0.018}px ${W * 0.006}px ${W * 0.006}px`,
                // Cylinder: lit cap over a side shaded at the edges.
                background: [
                  `radial-gradient(ellipse 50% 28% at 50% 22%, ${shade(inkColor, 72, "white")}, ${inkColor} 92%, transparent 100%)`,
                  `linear-gradient(to right, ${shade(inkColor, 70)}, ${inkColor} 30%, ${shade(inkColor, 88, "white")} 55%, ${inkColor} 75%, ${shade(inkColor, 70)})`,
                ].join(", "),
                boxShadow: `0 ${W * 0.002}px ${W * 0.004}px rgba(0,0,0,0.25)`,
                transform: b.pressed ? "translateY(28%)" : undefined,
              }}
            />
          </div>
        ))}
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

      {/* Shell → groove → panel. */}
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
        <div
          className="h-full w-full"
          style={{
            padding: groove,
            borderRadius: radius - shell,
            background: `linear-gradient(to bottom, ${shade(trimColor, 75)}, ${trimColor})`,
          }}
        >
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              gap,
              borderRadius: radius - shell - groove,
              background: `linear-gradient(to bottom, ${shade(panelColor, 80)}, ${panelColor} 18%, ${panelColor} 80%, ${shade(panelColor, 88, "white")})`,
              boxShadow: `inset 0 ${W * 0.008}px ${W * 0.014}px rgba(0,0,0,0.3)`,
            }}
          >
            {[weekday, date].map((value, i) => (
              <div key={i} className="relative" style={windowStyle(cardW, cardH)}>
                <FlipCard
                  value={value}
                  width={cardW}
                  height={cardH}
                  color={cardColor}
                  duration={flipDuration}
                  sound={flipSound}
                  volume={volume}
                  renderFace={face}
                />
                {/* Stacked leaf edges behind the front one. */}
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

            {/* Glare. */}
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
