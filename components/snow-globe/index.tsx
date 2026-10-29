"use client";

import { useEffect, useRef } from "react";
import { geoCircle, geoDistance, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

/** A glass snow globe with a draggable Earth inside — drag to spin and stir the snow. */

export type SnowGlobeMarker = {
  /** Latitude in degrees. */
  lat: number;
  /** Longitude in degrees. */
  lng: number;
  /** Avatar image URL. Falls back to initials from `label`. */
  src?: string;
  /** Name used for the alt text and initials fallback. */
  label?: string;
  /** Optional cluster count shown as a badge, e.g. 13. */
  count?: number;
};

export type SnowGlobeProps = {
  /** Avatars pinned to the map. */
  markers?: SnowGlobeMarker[];
  /** Initial [longitude, latitude] facing the viewer. */
  center?: [number, number];
  /** Number of snow particles. */
  snow?: number;
  /** Auto-spin speed in degrees per second. 0 keeps it still. */
  autoRotate?: number;
  /** Drag to spin the Earth and stir the snow. */
  draggable?: boolean;
  /** Show the map chrome: view pill, zoom buttons and weather chip. */
  controls?: boolean;
  /** Text in the weather chip when `controls` is on. */
  temperature?: string;
  /** Maximum width in pixels; the globe scales down to fit its container. */
  size?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

// Everything is laid out in a 1010×720 frame and scaled to the rendered width.
const FW = 1010;
const FH = 720;
const EARTH = { x: 507, y: 393, r: 283 };
const DOME = { x: 505, y: 375, r: 328 };
const BASE_TOP = { x: 505, y: 478, rx: 332, ry: 158 };
const BASE_BOTTOM = { x: 505, y: 508, rx: 326, ry: 156 };
// The Earth disappears into the base along this ellipse.
const RIM = { x: 507, y: 470, rx: 300, ry: 142 };
const SNOW = { x: 505, y: 360, r: 300 };

const topo = world as unknown as Topology<{
  countries: GeometryCollection;
  land: GeometryCollection;
}>;
const LAND = feature(topo, topo.objects.land);
const BORDERS = mesh(topo, topo.objects.countries, (a, b) => a !== b);
const POLAR = [
  geoCircle().center([0, 90]).radius(29)(),
  geoCircle().center([0, -90]).radius(26)(),
];
const DRY = [
  { c: [12, 22], r: 15 },
  { c: [46, 23], r: 9 },
  { c: [133, -25], r: 11 },
  { c: [-112, 33], r: 5 },
].map(({ c, r }) => geoCircle().center(c as [number, number]).radius(r)());

type Flake = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  bokeh: boolean;
  fall: number;
  phase: number;
  twinkle: number;
};

function spawnFlake(top = false): Flake {
  const bokeh = Math.random() < 0.12;
  let x = 0;
  let y = 0;
  let z = 0;
  do {
    x = Math.random() * 2 - 1;
    y = top ? -1 + Math.random() * 0.35 : Math.random() * 1.6 - 1;
    z = Math.random() * 2 - 1;
  } while (x * x + y * y + z * z > 0.96);
  return {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    r: bokeh ? 7 + Math.random() * 10 : 1 + Math.random() * 2.2,
    bokeh,
    fall: 0.6 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    twinkle: 1 + Math.random() * 3,
  };
}

function makeSprite(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [o, color] of stops) grad.addColorStop(o, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/** Glare sweeping over the Earth's upper-left limb: an outer arc and an offset inner one. */
const CRESCENT = (() => {
  const pt = (cx: number, cy: number, r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  };
  const r1 = EARTH.r - 2;
  const [cx2, cy2, r2] = [EARTH.x + 26, EARTH.y + 30, EARTH.r - 6];
  return `M ${pt(EARTH.x, EARTH.y, r1, 186)} A ${r1} ${r1} 0 0 1 ${pt(EARTH.x, EARTH.y, r1, 280)} A ${r2} ${r2} 0 0 0 ${pt(cx2, cy2, r2, 192)} Z`;
})();

/** The dome's outline of radius r, from where it meets the base at height y, over the top. */
function domeArc(r: number, y: number) {
  const dx = Math.sqrt(r * r - (y - DOME.y) ** 2);
  return `M ${DOME.x - dx} ${y} A ${r} ${r} 0 1 1 ${DOME.x + dx} ${y}`;
}

function initials(label?: string) {
  if (!label) return "";
  return label
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const NO_MARKERS: SnowGlobeMarker[] = [];

export default function SnowGlobe({
  markers = NO_MARKERS,
  center = [-38, 40],
  snow = 220,
  autoRotate = 0,
  draggable = true,
  controls = false,
  temperature = "32°F",
  size = 640,
  className,
}: SnowGlobeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<HTMLCanvasElement>(null);
  const snowRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const view = useRef({
    lng: center[0],
    lat: center[1],
    zoom: 1,
    zoomTarget: 1,
    vLng: 0,
    vLat: 0,
    energy: 0,
    dragging: false,
  });

  useEffect(() => {
    const root = rootRef.current;
    const earthCanvas = earthRef.current;
    const snowCanvas = snowRef.current;
    if (!root || !earthCanvas || !snowCanvas) return;
    const ectx = earthCanvas.getContext("2d");
    const sctx = snowCanvas.getContext("2d");
    if (!ectx || !sctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const v = view.current;
    const dot = makeSprite([
      [0, "rgba(255,255,255,1)"],
      [0.2, "rgba(255,255,255,0.95)"],
      [0.4, "rgba(195,238,255,0.5)"],
      [1, "rgba(150,220,255,0)"],
    ]);
    const bokeh = makeSprite([
      [0, "rgba(245,253,255,0.75)"],
      [0.45, "rgba(185,236,255,0.35)"],
      [1, "rgba(150,220,255,0)"],
    ]);
    const flakes = Array.from({ length: snow }, () => spawnFlake());
    const projection = geoOrthographic()
      .translate([EARTH.x, EARTH.y])
      .clipAngle(90)
      .precision(0.4);
    const path = geoPath(projection, ectx);

    let k = 1;
    let dpr = 1;
    let dirty = true;

    const resize = () => {
      const w = root.clientWidth;
      k = w / FW;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [earthCanvas, snowCanvas]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(w * (FH / FW) * dpr);
      }
      dirty = true;
    };

    const clipEarth = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(EARTH.x, EARTH.y, EARTH.r, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(0, 0, FW, RIM.y);
      ctx.ellipse(RIM.x, RIM.y, RIM.rx, RIM.ry, 0, 0, Math.PI * 2);
      ctx.clip();
    };

    const drawEarth = () => {
      const ctx = ectx;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      ctx.clearRect(0, 0, FW, FH);
      projection.scale(EARTH.r * v.zoom).rotate([-v.lng, -v.lat]);
      ctx.save();
      clipEarth(ctx);

      const ocean = ctx.createRadialGradient(
        EARTH.x - 40, EARTH.y - 50, 0,
        EARTH.x, EARTH.y, EARTH.r * v.zoom
      );
      ocean.addColorStop(0, "#43a9ee");
      ocean.addColorStop(0.7, "#4fb4ef");
      ocean.addColorStop(1, "#8dd3f5");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = ocean;
      ctx.fill();

      // Shallow shelf around the coasts.
      ctx.beginPath();
      path(LAND);
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(170,228,250,0.7)";
      ctx.lineWidth = 7 * v.zoom;
      ctx.stroke();
      ctx.fillStyle = "#c6e5a8";
      ctx.fill();

      // Deserts and polar ice, feathered inside the land.
      ctx.save();
      ctx.clip();
      ctx.filter = `blur(${Math.max(1, 9 * k * dpr * v.zoom)}px)`;
      ctx.fillStyle = "#ece6c4";
      for (const d of DRY) {
        ctx.beginPath();
        path(d);
        ctx.fill();
      }
      ctx.fillStyle = "#f6fafb";
      for (const p of POLAR) {
        ctx.beginPath();
        path(p);
        ctx.fill();
      }
      ctx.restore();

      ctx.beginPath();
      path(BORDERS);
      ctx.strokeStyle = "rgba(205,105,120,0.55)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Soft key light from the top left, then a bright atmospheric limb.
      const light = ctx.createRadialGradient(400, 250, 0, 400, 250, 340);
      light.addColorStop(0, "rgba(255,255,255,0.22)");
      light.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, FW, FH);
      const limb = ctx.createRadialGradient(
        EARTH.x, EARTH.y, 0,
        EARTH.x, EARTH.y, EARTH.r
      );
      limb.addColorStop(0, "rgba(220,245,255,0)");
      limb.addColorStop(0.78, "rgba(220,245,255,0)");
      limb.addColorStop(0.94, "rgba(225,246,255,0.45)");
      limb.addColorStop(1, "rgba(255,255,255,0.85)");
      ctx.fillStyle = limb;
      ctx.fillRect(0, 0, FW, FH);
      ctx.restore();

      const facing: [number, number] = [v.lng, v.lat];
      markers.forEach((m, i) => {
        const el = markerRefs.current[i];
        if (!el) return;
        const d = geoDistance([m.lng, m.lat], facing);
        const p = projection([m.lng, m.lat]);
        const inside =
          p &&
          (p[1] < RIM.y ||
            ((p[0] - RIM.x) / RIM.rx) ** 2 + ((p[1] - RIM.y) / RIM.ry) ** 2 < 0.85) &&
          Math.hypot(p[0] - EARTH.x, p[1] - EARTH.y) < EARTH.r - 12;
        const front = Math.cos(Math.min(d, Math.PI / 2));
        if (!p || !inside || d > 1.45) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = String(Math.min(1, front * 2.2));
        el.style.transform = `translate3d(${p[0] * k}px, ${p[1] * k}px, 0) translate(-50%, -50%) scale(${
          0.7 + 0.3 * front
        })`;
      });
    };

    const clipSnow = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(DOME.x, DOME.y, DOME.r - 8, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(0, 0, FW, RIM.y);
      ctx.ellipse(RIM.x, RIM.y, RIM.rx, RIM.ry, 0, 0, Math.PI * 2);
      ctx.clip();
    };

    const drawSnow = (t: number) => {
      const ctx = sctx;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      ctx.clearRect(0, 0, FW, FH);
      ctx.save();
      clipSnow(ctx);
      for (const f of flakes) {
        const depth = (f.z + 1) / 2;
        const sx = SNOW.x + f.x * SNOW.r;
        const sy = SNOW.y + f.y * SNOW.r;
        const glint = 0.65 + 0.35 * Math.sin(t * f.twinkle + f.phase);
        const s = f.r * (0.7 + 0.6 * depth) * (f.bokeh ? 1 : 4.2);
        ctx.globalAlpha = Math.min(1, (0.55 + 0.6 * depth) * glint);
        ctx.drawImage(f.bokeh ? bokeh : dot, sx - s, sy - s, s * 2, s * 2);
      }
      ctx.restore();
    };

    const stepSnow = (dt: number) => {
      const swirl = (0.1 + v.energy * 1.4) * dt;
      const cos = Math.cos(swirl);
      const sin = Math.sin(swirl);
      const relax = Math.min(1, dt * 1.3);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        const x = f.x * cos - f.z * sin;
        f.z = f.x * sin + f.z * cos;
        f.x = x;
        f.vx -= f.vx * relax;
        f.vz -= f.vz * relax;
        f.vy += (0.05 * f.fall - f.vy) * relax;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.z += f.vz * dt;
        const d = Math.hypot(f.x, f.y, f.z);
        if (d > 0.98) {
          // Bounce softly off the glass.
          const nx = f.x / d;
          const ny = f.y / d;
          const nz = f.z / d;
          const dotv = f.vx * nx + f.vy * ny + f.vz * nz;
          if (dotv > 0) {
            f.vx -= 1.5 * dotv * nx;
            f.vy -= 1.5 * dotv * ny;
            f.vz -= 1.5 * dotv * nz;
          }
          f.x = nx * 0.98;
          f.y = ny * 0.98;
          f.z = nz * 0.98;
        }
        if (f.y > 0.62 && f.vy > 0) flakes[i] = spawnFlake(true);
      }
      v.energy *= Math.exp(-dt * 1.1);
    };

    const stir = (amount: number) => {
      v.energy = Math.min(2.5, v.energy + amount * 0.6);
      for (const f of flakes) {
        f.vx += (Math.random() - 0.5) * amount;
        f.vy -= Math.random() * amount * 0.8;
        f.vz += (Math.random() - 0.5) * amount;
      }
    };

    // Pointer: drag spins the Earth with inertia; the motion stirs the snow.
    let last: { x: number; y: number; t: number } | null = null;
    let moved = 0;
    const onDown = (e: PointerEvent) => {
      if (!draggable || (e.target as HTMLElement).closest("button")) return;
      root.setPointerCapture(e.pointerId);
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      moved = 0;
      v.dragging = true;
      v.vLng = v.vLat = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!last) return;
      const now = performance.now();
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dt = Math.max(1, now - last.t) / 1000;
      const deg = 0.32 / (k * v.zoom);
      v.lng -= dx * deg;
      v.lat = Math.max(-75, Math.min(75, v.lat + dy * deg));
      v.vLng = (-dx * deg) / dt;
      v.vLat = (dy * deg) / dt;
      moved += Math.abs(dx) + Math.abs(dy);
      stir(Math.min(0.5, (Math.abs(dx) + Math.abs(dy)) * 0.004));
      last = { x: e.clientX, y: e.clientY, t: now };
      dirty = true;
    };
    const onUp = () => {
      if (!last) return;
      if (moved < 4) stir(0.9); // a tap gives it a shake
      last = null;
      v.dragging = false;
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!v.dragging) {
        if (Math.abs(v.vLng) + Math.abs(v.vLat) > 0.5) {
          const decay = Math.exp(-dt * 3);
          v.lng += v.vLng * dt;
          v.lat = Math.max(-75, Math.min(75, v.lat + v.vLat * dt));
          v.vLng *= decay;
          v.vLat *= decay;
          dirty = true;
        }
        if (autoRotate && !reduced) {
          v.lng += autoRotate * dt;
          dirty = true;
        }
      }
      if (Math.abs(v.zoomTarget - v.zoom) > 0.001) {
        v.zoom += (v.zoomTarget - v.zoom) * Math.min(1, dt * 8);
        dirty = true;
      }
      if (dirty) {
        drawEarth();
        dirty = false;
      }
      if (!reduced || v.energy > 0.01) stepSnow(dt);
      drawSnow(reduced ? 0 : now / 1000);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(root);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, [markers, snow, autoRotate, draggable]);

  const zoomBy = (step: number) => {
    const v = view.current;
    v.zoomTarget = Math.max(1, Math.min(2.5, v.zoomTarget + step));
  };

  const pct = (n: number, of: number) => `${(n / of) * 100}%`;
  const ellipseArc = (e: typeof BASE_TOP, sweep: 0 | 1) =>
    `A ${e.rx} ${e.ry} 0 0 ${sweep}`;

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="A snow globe with the Earth inside"
      className={`relative w-full select-none touch-none ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${className ?? ""}`}
      style={{
        maxWidth: size,
        aspectRatio: `${FW} / ${FH}`,
        containerType: "inline-size",
      }}
    >
      {/* Back glass: floor shadow, the base and the far side of the dome. */}
      <svg
        viewBox={`0 0 ${FW} ${FH}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="sg-blur-lg" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <linearGradient id="sg-base" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#dfeaf0" />
            <stop offset="0.35" stopColor="#ffffff" />
            <stop offset="0.75" stopColor="#f3f8fa" />
            <stop offset="1" stopColor="#d6e3ea" />
          </linearGradient>
          <radialGradient
            id="sg-dome-back"
            cx={EARTH.x}
            cy={EARTH.y}
            r={DOME.r}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.8" stopColor="#c4e6f6" stopOpacity="0.55" />
            <stop offset="0.93" stopColor="#e9f6fb" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.97" />
          </radialGradient>
          <clipPath id="sg-dome-circle">
            <circle cx={DOME.x} cy={DOME.y} r={DOME.r} />
          </clipPath>
          <clipPath id="sg-above-base">
            <rect x="0" y="0" width={FW} height={BASE_TOP.y} />
            <ellipse cx={BASE_TOP.x} cy={BASE_TOP.y} rx={BASE_TOP.rx} ry={BASE_TOP.ry} />
          </clipPath>
        </defs>
        <ellipse
          cx="520"
          cy="682"
          rx="300"
          ry="28"
          fill="rgba(40,70,100,0.2)"
          filter="url(#sg-blur-lg)"
        />
        <path
          d={`M ${BASE_TOP.x - BASE_TOP.rx} ${BASE_TOP.y} ${ellipseArc(BASE_TOP, 0)} ${
            BASE_TOP.x + BASE_TOP.rx
          } ${BASE_TOP.y} L ${BASE_BOTTOM.x + BASE_BOTTOM.rx} ${BASE_BOTTOM.y} ${ellipseArc(
            BASE_BOTTOM,
            1
          )} ${BASE_BOTTOM.x - BASE_BOTTOM.rx} ${BASE_BOTTOM.y} Z`}
          fill="url(#sg-base)"
        />
        <ellipse
          cx={BASE_TOP.x}
          cy={BASE_TOP.y}
          rx={BASE_TOP.rx}
          ry={BASE_TOP.ry}
          fill="#f4f9fb"
        />
        <g clipPath="url(#sg-dome-circle)">
          <g clipPath="url(#sg-above-base)">
            <circle cx={DOME.x} cy={DOME.y} r={DOME.r} fill="url(#sg-dome-back)" />
          </g>
        </g>
      </svg>

      <canvas ref={earthRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {markers.map((m, i) => (
        <div
          key={`${m.lat},${m.lng},${i}`}
          ref={(el) => {
            markerRefs.current[i] = el;
          }}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          style={{ width: m.count ? "4.6cqw" : "3.8cqw", zIndex: m.count ? 1 : 0 }}
        >
          <div
            className="aspect-square w-full overflow-hidden rounded-full bg-slate-200"
            style={{
              boxShadow:
                "0 0 0 0.3cqw rgba(255,255,255,0.95), 0 0.4cqw 1.2cqw rgba(20,60,90,0.3)",
            }}
          >
            {m.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.src}
                alt={m.label ?? ""}
                draggable={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-200 font-medium text-slate-600"
                style={{ fontSize: "1.4cqw" }}
              >
                {initials(m.label)}
              </span>
            )}
          </div>
          {m.count ? (
            <span
              className="absolute font-medium tabular-nums text-white"
              style={{
                right: "-0.6cqw",
                bottom: "-1.6cqw",
                fontSize: "1.55cqw",
                lineHeight: 1,
                padding: "0.45cqw 0.55cqw",
                borderRadius: "0.6cqw",
                background: "rgba(80,96,110,0.78)",
                backdropFilter: "blur(4px)",
              }}
            >
              {m.count}
            </span>
          ) : null}
        </div>
      ))}

      <canvas
        ref={snowRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Front glass: the lip where the dome meets the base, rim light and glare. */}
      <svg
        viewBox={`0 0 ${FW} ${FH}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="sg-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="sg-blur-md" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <linearGradient id="sg-lip" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="sg-glare" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${BASE_TOP.x - BASE_TOP.rx} ${BASE_TOP.y} ${ellipseArc(BASE_TOP, 0)} ${
            BASE_TOP.x + BASE_TOP.rx
          } ${BASE_TOP.y} L ${RIM.x + RIM.rx} ${RIM.y} ${ellipseArc(RIM, 1)} ${
            RIM.x - RIM.rx
          } ${RIM.y} Z`}
          fill="url(#sg-lip)"
        />
        <path
          d={`M ${BASE_TOP.x - BASE_TOP.rx + 4} ${BASE_TOP.y + 6} ${ellipseArc(BASE_TOP, 0)} ${
            BASE_TOP.x + BASE_TOP.rx - 4
          } ${BASE_TOP.y + 6}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <path
          d={`M ${BASE_BOTTOM.x - BASE_BOTTOM.rx + 6} ${BASE_BOTTOM.y + 4} ${ellipseArc(
            BASE_BOTTOM,
            0
          )} ${BASE_BOTTOM.x + BASE_BOTTOM.rx - 6} ${BASE_BOTTOM.y + 4}`}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
        />
        {/* Dome rim and the big crescent reflection on the upper left. */}
        <path
          d={domeArc(DOME.r, BASE_TOP.y - 6)}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="3"
        />
        <path
          d={domeArc(DOME.r - 10, BASE_TOP.y - 10)}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="10"
          filter="url(#sg-blur-sm)"
        />
        <path
          d={CRESCENT}
          fill="url(#sg-glare)"
          opacity="0.9"
          filter="url(#sg-blur-sm)"
        />
        <path
          d="M 262 338 A 250 250 0 0 1 452 112"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#sg-blur-sm)"
        />
        <ellipse
          cx="790"
          cy="250"
          rx="26"
          ry="80"
          transform="rotate(28 790 250)"
          fill="rgba(255,255,255,0.55)"
          filter="url(#sg-blur-md)"
        />
        {/* Sparkle on the right of the rim. */}
        <g transform="translate(828 318)">
          <circle r="16" fill="rgba(255,255,255,0.8)" filter="url(#sg-blur-md)" />
          <path
            d="M 0 -34 L 3 -3 L 40 0 L 3 3 L 0 34 L -3 3 L -40 0 L -3 -3 Z"
            fill="#ffffff"
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;0.6;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.55;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>

      {controls ? (
        <>
          <span
            aria-hidden
            className="absolute flex items-center bg-white text-neutral-700"
            style={{
              left: pct(55, FW),
              top: pct(55, FH),
              gap: "0.8cqw",
              padding: "0.9cqw 1.3cqw",
              borderRadius: "1.1cqw",
              fontSize: "2.4cqw",
              boxShadow: "0 0.3cqw 1.4cqw rgba(0,0,0,0.08)",
            }}
          >
            Map
            <svg viewBox="0 0 12 12" style={{ width: "1.6cqw" }} fill="none">
              <path
                d="M2.5 4.5 6 8l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div
            className="absolute flex flex-col overflow-hidden bg-white text-neutral-600"
            style={{
              right: pct(55, FW),
              top: pct(55, FH),
              borderRadius: "1.1cqw",
              boxShadow: "0 0.3cqw 1.4cqw rgba(0,0,0,0.08)",
            }}
          >
            {[
              { label: "Zoom in", step: 0.25, d: "M6 2v8M2 6h8" },
              { label: "Zoom out", step: -0.25, d: "M2 6h8" },
            ].map((b, i) => (
              <button
                key={b.label}
                type="button"
                aria-label={b.label}
                onClick={() => zoomBy(b.step)}
                className={`flex items-center justify-center transition-colors hover:bg-neutral-100 ${
                  i ? "border-t border-neutral-100" : ""
                }`}
                style={{ width: "4.7cqw", height: "4.7cqw" }}
              >
                <svg viewBox="0 0 12 12" style={{ width: "2cqw" }} fill="none">
                  <path d={b.d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            ))}
          </div>
          <span
            className="absolute flex items-center bg-white text-neutral-700"
            style={{
              right: pct(55, FW),
              bottom: pct(56, FH),
              gap: "0.8cqw",
              padding: "0.9cqw 1.2cqw",
              borderRadius: "1.1cqw",
              fontSize: "2.2cqw",
              boxShadow: "0 0.3cqw 1.4cqw rgba(0,0,0,0.08)",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: "2.6cqw" }} fill="none" aria-hidden>
              <path
                d="M7 15a4 4 0 1 1 .9-7.9A5.5 5.5 0 0 1 18.5 9 3.5 3.5 0 0 1 18 16H7"
                fill="#d4d8dc"
              />
              {[
                [8, 19],
                [12, 20],
                [16, 19],
                [10, 22],
                [14, 22.5],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill="#b4bcc4" />
              ))}
            </svg>
            {temperature}
          </span>
        </>
      ) : null}
    </div>
  );
}
