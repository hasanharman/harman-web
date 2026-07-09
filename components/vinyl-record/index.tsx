"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

type SlideDirection = "up" | "down" | "left" | "right";

/** Visual finish of the vinyl surface. */
type VinylFinish = "glossy" | "flat";

export type VinylDisc = {
  /** Any CSS color for the vinyl. Defaults to classic black. */
  color?: string;
  /** Color of the paper label at the disc's center. */
  labelColor?: string;
};

export type VinylRecordProps = {
  /** Album cover image URL. */
  cover?: string;
  /** Alt text for the cover image. */
  alt?: string;
  /**
   * The discs tucked behind the sleeve. Pass a number for N black discs,
   * or an array to control each disc's color individually.
   */
  discs?: number | VinylDisc[];
  /** Direction the discs slide when the sleeve is hovered. */
  slide?: SlideDirection;
  /**
   * Surface finish. "glossy" (default) adds realistic reflections and a
   * pressed rim; "flat" is a clean, minimal disc with just grooves.
   */
  finish?: VinylFinish;
  /** Edge length of the square sleeve, in pixels. */
  size?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

/** Base vinyl colour. Glossy gets radial depth; flat stays near-solid. */
function discSurface(color: string, finish: VinylFinish) {
  if (finish === "flat") {
    return `radial-gradient(circle at center, ${color} 0%, ${color} 74%, color-mix(in srgb, ${color}, black 14%) 100%)`;
  }
  return `radial-gradient(circle at 50% 46%, color-mix(in srgb, ${color}, white 12%) 0%, ${color} 30%, color-mix(in srgb, ${color}, black 28%) 70%, color-mix(in srgb, ${color}, black 60%) 100%)`;
}

/** Where a disc sits at rest (behind the sleeve) and when slid out. */
function offsets(slide: SlideDirection, distance: number) {
  switch (slide) {
    case "up":
      return { hidden: { x: 0, y: 0 }, visible: { x: 0, y: -distance } };
    case "down":
      return { hidden: { x: 0, y: 0 }, visible: { x: 0, y: distance } };
    case "left":
      return { hidden: { x: 0, y: 0 }, visible: { x: -distance, y: 0 } };
    case "right":
    default:
      return { hidden: { x: 0, y: 0 }, visible: { x: distance, y: 0 } };
  }
}

export default function VinylRecord({
  cover = "https://linkinpedia.com/w/images/thumb/f/fe/Album-From_Zero.png/800px-Album-From_Zero.png",
  alt = "Album cover",
  discs = 1,
  slide = "right",
  finish = "glossy",
  size = 256,
  className,
}: VinylRecordProps) {
  const glossy = finish === "glossy";
  const [isHovered, setIsHovered] = useState(false);

  const discList: VinylDisc[] =
    typeof discs === "number"
      ? Array.from({ length: Math.max(0, discs) }, () => ({}))
      : discs;

  const discSize = Math.round(size * 0.94);

  return (
    <div
      className={className}
      // `isolation: isolate` scopes the discs' negative z-index to this box, so
      // they always sit behind the sleeve but in front of whatever is behind the
      // record — never escaping behind an ancestor's background.
      style={{ position: "relative", width: size, height: size, isolation: "isolate" }}
    >
      {/* Discs — rendered behind the sleeve, staggered so each peeks a bit further. */}
      {discList.map((disc, i) => {
        const color = disc.color ?? "#111111";
        // Each successive disc slides out a little further than the last.
        const distance = size * (0.5 + i * 0.28);
        const { hidden, visible } = offsets(slide, distance);
        // A real vinyl has an open spindle hole — punch it clean through the
        // disc (and its label) with a radial mask so the background shows.
        const hole = Math.max(3, discSize * 0.022);
        const punch = `radial-gradient(circle at center, transparent ${hole}px, black ${
          hole + 0.5
        }px)`;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: discSize,
              height: discSize,
              left: "50%",
              top: "50%",
              marginLeft: -discSize / 2,
              marginTop: -discSize / 2,
              zIndex: -i - 1,
              background: discSurface(color, finish),
              boxShadow: glossy
                ? "0 0 0 1px rgba(0,0,0,0.35), 0 10px 22px rgba(0,0,0,0.45)"
                : "0 4px 12px rgba(0,0,0,0.28)",
              maskImage: punch,
              WebkitMaskImage: punch,
            }}
            initial={hidden}
            animate={isHovered ? visible : hidden}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Grooves — fine concentric rings across the playing area. */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "88%",
                height: "88%",
                background: glossy
                  ? "repeating-radial-gradient(circle at center, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 0.5px, rgba(255,255,255,0.05) 1.4px, rgba(255,255,255,0.05) 2px)"
                  : "repeating-radial-gradient(circle at center, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 4px)",
                mixBlendMode: glossy ? "soft-light" : "normal",
              }}
            />
            {glossy ? (
              <>
                {/* Reflective sheen sweep — the signature vinyl gloss. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 210deg at 50% 50%, rgba(255,255,255,0.30), rgba(0,0,0,0.34) 70deg, rgba(255,255,255,0.10) 150deg, rgba(0,0,0,0.34) 220deg, rgba(255,255,255,0.34) 320deg, rgba(255,255,255,0.30) 360deg)",
                    mixBlendMode: "overlay",
                  }}
                />
                {/* Main specular highlight — studio light hitting the upper-left. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse 52% 40% at 33% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)",
                    mixBlendMode: "screen",
                  }}
                />
                {/* Softer secondary reflection lower-right. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse 40% 30% at 70% 78%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%)",
                    mixBlendMode: "screen",
                  }}
                />
                {/* Rim: bright edge highlight over a dark pressed edge. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "inset 0 0 3px rgba(255,255,255,0.45), inset 0 0 14px rgba(0,0,0,0.55)",
                  }}
                />
              </>
            ) : null}
            {/* Center label — the spindle hole is punched through it by the mask. */}
            <div
              className="absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: glossy
                  ? `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${
                      disc.labelColor ?? "#e4e4e7"
                    }, white 12%), ${disc.labelColor ?? "#d4d4d8"} 70%, color-mix(in srgb, ${
                      disc.labelColor ?? "#d4d4d8"
                    }, black 20%))`
                  : (disc.labelColor ?? "#d4d4d8"),
                boxShadow: glossy
                  ? "0 0 0 1px rgba(0,0,0,0.18), inset 0 0 4px rgba(0,0,0,0.25)"
                  : "none",
              }}
            />
          </motion.div>
        );
      })}

      {/* Record sleeve */}
      <motion.div
        className="relative h-full w-full overflow-hidden rounded shadow-xl"
        style={{ zIndex: 10 }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={cover}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}
