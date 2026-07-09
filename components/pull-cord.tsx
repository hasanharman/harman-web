"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

// Geometry (SVG user units == px)
const W = 72; // svg width
const ANCHOR_X = W / 2; // where the cord attaches at the top
const REST = 58; // resting cord length
const MAX_PULL = 130; // how far the bead can be dragged down
const MAX_SWAY = 34; // horizontal give while dragging
const THRESHOLD = 66; // pull past this (px) to flip the theme
const H = REST + MAX_PULL + 30; // svg height, room for bead + overshoot

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

interface PullCordProps {
  /**
   * Positioning/visibility classes for the wrapper. Defaults to a fixed cord
   * hanging from the top-right on large screens. Override to embed the cord
   * inside a container (e.g. the components showcase).
   */
  className?: string;
}

export function PullCord({ className }: PullCordProps) {
  const { setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const busy = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Raw, pointer-driven targets. The springs lag behind them for the rope feel.
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const springX = useSpring(pullX, { stiffness: 180, damping: 12, mass: 0.9 });
  const springY = useSpring(pullY, { stiffness: 300, damping: 10, mass: 0.9 });

  const beadRef = React.useRef<SVGCircleElement>(null);
  const dragging = React.useRef(false);
  const origin = React.useRef({ x: 0, y: 0 });

  // Cord: a quadratic curve from the anchor to the bead, bowing toward the sway.
  const cordD = useTransform<number, string>(
    [springX, springY],
    ([x, y]: number[]) => {
      const bx = ANCHOR_X + x;
      const by = REST + y;
      const ctrlX = ANCHOR_X + x * 0.55;
      const ctrlY = by * 0.55;
      return `M ${ANCHOR_X} 0 Q ${ctrlX} ${ctrlY} ${bx} ${by}`;
    }
  );
  const beadCx = useTransform(springX, (x) => ANCHOR_X + x);
  const beadCy = useTransform(springY, (y) => REST + y);

  const flip = React.useCallback(() => {
    // Ignore pulls while a transition is mid-flight, and read the *live* theme
    // from the DOM rather than a possibly-stale React value — otherwise two
    // quick pulls compute the same target and cancel out ("doesn't change"),
    // and overlapping view transitions visually double up.
    if (busy.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    const rect = beadRef.current?.getBoundingClientRect();
    const ox = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const oy = rect ? rect.top + rect.height / 2 : 40;

    // No View Transition support / reduced motion → just flip.
    if (reduceMotion || !("startViewTransition" in document)) {
      setTheme(next);
      return;
    }

    busy.current = true;
    const root = document.documentElement;
    root.dataset.themeReveal = "";
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(ox, window.innerWidth - ox),
        Math.max(oy, window.innerHeight - oy)
      );
      root.animate(
        {
          clipPath: [
            `circle(0px at ${ox}px ${oy}px)`,
            `circle(${endRadius}px at ${ox}px ${oy}px)`,
          ],
        },
        {
          duration: 550,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
    // Release the lock only once the whole transition is done.
    transition.finished.finally(() => {
      delete root.dataset.themeReveal;
      busy.current = false;
    });
  }, [setTheme, reduceMotion]);

  // Global listeners: a release/cancel ANYWHERE (or the window losing focus)
  // always ends the drag, so the cord can never get stuck pulled — the failure
  // mode of listening only on the bead itself.
  React.useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      pullX.set(clamp(e.clientX - origin.current.x, -MAX_SWAY, MAX_SWAY));
      pullY.set(clamp(e.clientY - origin.current.y, 0, MAX_PULL));
    };
    const end = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const pulled = pullY.get();
      // Let go: springs snap the cord back with a little overshoot.
      pullX.set(0);
      pullY.set(0);
      if (pulled >= THRESHOLD) flip();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("blur", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", end);
    };
  }, [flip, pullX, pullY]);

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
  };

  // Avoid hydration mismatch (theme is only known on the client).
  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pointer-events-none select-none",
        className || "fixed right-6 top-0 z-[60] block lg:right-8"
      )}
      style={{ width: W, height: H }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible text-foreground"
        fill="none"
      >
        {/* ceiling mount */}
        <circle cx={ANCHOR_X} cy={1} r={3} className="fill-foreground/50" />
        {/* the cord */}
        <motion.path
          d={cordD}
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* invisible fat hit area for easy grabbing */}
        <motion.circle
          cx={beadCx}
          cy={beadCy}
          r={22}
          fill="transparent"
          className="pointer-events-auto cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={startDrag}
        />
        {/* the bead / pull handle */}
        <motion.circle
          ref={beadRef}
          cx={beadCx}
          cy={beadCy}
          r={8}
          className="fill-foreground"
        />
      </svg>
    </div>
  );
}
