import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
/** Component still size on StageCard; scripts/capture-og.mjs shoots at this size. */
export const OG_STAGE = { width: 560, height: 534 };

const FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts";
const FONTS = [
  { name: "Geist", weight: 400, url: `${FONT_URL}/geist@latest/latin-400-normal.ttf` },
  { name: "Geist", weight: 600, url: `${FONT_URL}/geist@latest/latin-600-normal.ttf` },
  { name: "Geist Mono", weight: 400, url: `${FONT_URL}/geist-mono@latest/latin-400-normal.ttf` },
] as const;

let fontsPromise: ReturnType<typeof fetchFonts> | null = null;

function fetchFonts() {
  return Promise.all(
    FONTS.map(async ({ name, weight, url }) => ({
      name,
      weight,
      style: "normal" as const,
      data: await fetch(url).then((r) => r.arrayBuffer()),
    }))
  );
}

/** Fonts for ImageResponse, fetched once per process (a failed fetch is retried next time). */
export function ogFonts() {
  return (fontsPromise ??= fetchFonts().catch((error) => {
    fontsPromise = null;
    throw error;
  }));
}

/** Strip emoji/symbols that Satori can't render, and collapse whitespace. */
export function clean(text: string) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** A component still from public/og/lab as a data URI, or null if none was captured. */
export async function labStill(slug: string) {
  const data = await readFile(path.join(process.cwd(), "public", "og", "lab", `${slug}.png`)).catch(() => null);
  return data ? `data:image/png;base64,${data.toString("base64")}` : null;
}

type CardProps = { title: string; label: string; description: string | null; meta: string | null };

const INSET = 48;
const LINE = "rgba(255,255,255,0.14)";
const MUTED = "#a1a1a1";

/** Black canvas with shadcn-style hairline guides; `split` adds a vertical guide at that x. */
function Frame({ split, children }: { split?: number; children: React.ReactNode }) {
  const guides = [
    { left: 0, right: 0, top: INSET, height: 1 },
    { left: 0, right: 0, bottom: INSET, height: 1 },
    { top: 0, bottom: 0, left: INSET, width: 1 },
    { top: 0, bottom: 0, right: INSET, width: 1 },
    ...(split ? [{ top: 0, bottom: 0, left: split, width: 1 }] : []),
  ];
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        position: "relative",
        background: "#000",
        fontFamily: "Geist",
        color: "#fff",
      }}
    >
      {children}
      {guides.map((style, i) => (
        <div key={i} style={{ position: "absolute", display: "flex", background: LINE, ...style }} />
      ))}
    </div>
  );
}

const mono = { display: "flex", fontFamily: "Geist Mono", fontSize: 20, color: MUTED } as const;

export function TextCard({ title, label, description, meta }: CardProps) {
  const titleSize = title.length > 64 ? 60 : title.length > 40 ? 68 : 80;
  return (
    <Frame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: INSET,
          top: INSET,
          right: INSET,
          bottom: INSET,
          padding: "40px 48px",
        }}
      >
        <div style={mono}>hasanharman.dev / {label.toLowerCase()}</div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ display: "flex", fontWeight: 600, fontSize: titleSize, lineHeight: 1.05, letterSpacing: -2.5 }}>
            {title}
          </div>
          {description ? (
            <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.4, color: MUTED }}>
              {description}
            </div>
          ) : null}
        </div>
        <div style={mono}>{meta ?? ""}</div>
      </div>
    </Frame>
  );
}

/** Text in the left cell, the component still filling the right cell. */
export function StageCard({
  title,
  label,
  description,
  code,
  image,
}: Omit<CardProps, "meta"> & { code: string; image: string }) {
  const split = OG_SIZE.width - INSET - OG_STAGE.width;
  return (
    <Frame split={split}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: INSET,
          top: INSET,
          width: split - INSET,
          height: OG_STAGE.height,
          padding: "40px 48px",
        }}
      >
        <div style={mono}>hasanharman.dev / {label.toLowerCase()}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontWeight: 600, fontSize: 64, lineHeight: 1.05, letterSpacing: -2.5 }}>
            {title}
          </div>
          {description ? (
            <div style={{ display: "flex", marginTop: 20, fontSize: 24, lineHeight: 1.45, color: MUTED }}>
              {description}
            </div>
          ) : null}
        </div>
        <div style={{ ...mono, color: "#fff" }}>{code}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
      <img
        src={image}
        width={OG_STAGE.width}
        height={OG_STAGE.height}
        alt=""
        style={{ position: "absolute", left: split, top: INSET, objectFit: "cover" }}
      />
    </Frame>
  );
}
