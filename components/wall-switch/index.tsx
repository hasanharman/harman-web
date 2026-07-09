"use client";

import { useState } from "react";

/** A physical light switch that flips between two states. */

export type WallSwitchProps = {
  /** Controlled on/off state (on = lever up). Omit to run uncontrolled. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Fired with the next state on every flip. */
  onCheckedChange?: (checked: boolean) => void;
  /** "vertical" flips up/down (default); "horizontal" flips right/left. */
  orientation?: "vertical" | "horizontal";
  /** Plate height in pixels; everything else scales from it. */
  size?: number;
  /** Color filling the slot when on — e.g. "#22c55e" for a green tell. */
  onColor?: string;
  /** Color filling the slot when off — e.g. "#ef4444". */
  offColor?: string;
  /** Optional [on, off] labels flanking the switch. Omit for a clean switch. */
  labels?: [string, string];
  /** Extra classes on the outer wrapper. */
  className?: string;
};

export default function WallSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  orientation = "vertical",
  size = 80,
  onColor,
  offColor,
  labels,
  className,
}: WallSwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;
  const horizontal = orientation === "horizontal";

  const toggle = () => {
    const next = !on;
    if (checked === undefined) setInternal(next);
    onCheckedChange?.(next);
  };

  const plateW = size * 0.6;
  const slotW = size * 0.3;
  const slotH = size * 0.6;
  const screw = Math.max(4, size * 0.075);
  const inset = size * 0.1;
  const slotTint = on ? onColor : offColor;

  const label = (text: string | undefined, activeWhenOn: boolean) =>
    text ? (
      <span
        className={`text-[10px] uppercase tracking-wider transition-colors ${
          (activeWhenOn ? on : !on) ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {text}
      </span>
    ) : null;

  // Vertical reads on→off top→bottom; horizontal reads off→on left→right.
  const first = horizontal ? label(labels?.[1], false) : label(labels?.[0], true);
  const last = horizontal ? label(labels?.[0], true) : label(labels?.[1], false);

  return (
    <div
      className={`flex items-center gap-1.5 select-none ${
        horizontal ? "flex-row" : "flex-col"
      } ${className ?? ""}`}
    >
      {first}
      {/* Horizontal reserves the rotated footprint so labels don't overlap. */}
      <div
        className="flex items-center justify-center"
        style={horizontal ? { width: size, height: plateW } : undefined}
      >
        <div style={{ transform: horizontal ? "rotate(90deg)" : undefined }}>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Toggle switch"
            onClick={toggle}
            className="relative flex items-center justify-center rounded-lg border bg-card shadow-sm transition-transform active:scale-[0.98]"
            style={{ width: plateW, height: size }}
          >
            {/* Mounting screws */}
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-muted-foreground/25"
              style={{ top: inset, width: screw, height: screw }}
            />
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-muted-foreground/25"
              style={{ bottom: inset, width: screw, height: screw }}
            />

            {/* Recessed slot — tinted by on/off color when set. */}
            <span
              className="relative overflow-hidden rounded-[4px] bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]"
              style={{ width: slotW, height: slotH, background: slotTint, perspective: 320 }}
            >
              {/* The toggle lever — a glossy plastic tab that pivots between halves. */}
              <span
                className="absolute inset-x-0 top-0 h-1/2 rounded-[3px] bg-gradient-to-b from-white to-neutral-300 shadow-[0_2px_3px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
                style={{
                  transformOrigin: "center",
                  transform: on
                    ? "translateY(0%) rotateX(16deg)"
                    : "translateY(100%) rotateX(-16deg)",
                }}
              >
                {/* Grip ridge across the lever. */}
                <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-black/10" />
              </span>
            </span>
          </button>
        </div>
      </div>
      {last}
    </div>
  );
}
