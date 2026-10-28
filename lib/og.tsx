import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
/** Component still size on StageCard; scripts/capture-og.mjs shoots at this size. */
export const OG_STAGE = { width: 560, height: 534 };

const FONTS = [
  { name: "Pacifico", weight: 400, url: "https://cdn.jsdelivr.net/fontsource/fonts/pacifico@latest/latin-400-normal.ttf" },
  { name: "Questrial", weight: 400, url: "https://cdn.jsdelivr.net/fontsource/fonts/questrial@latest/latin-400-normal.ttf" },
  { name: "Inter", weight: 600, url: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf" },
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

export function TextCard({ title, label, description, meta }: CardProps) {
  const titleSize = title.length > 64 ? 60 : title.length > 40 ? 72 : 84;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b0b0c",
        padding: "72px",
        position: "relative",
        fontFamily: "Questrial",
      }}
    >
      {/* Brand glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -140,
          width: 560,
          height: 560,
          display: "flex",
          background:
            "radial-gradient(circle, rgba(47,123,112,0.55) 0%, rgba(47,123,112,0) 70%)",
        }}
      />
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Pacifico", fontSize: 42, color: "#ffffff" }}>
          Hasan Harman
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 24px",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 999,
            fontSize: 22,
            letterSpacing: 3,
            color: "#7fded0",
          }}
        >
          {label.toUpperCase()}
        </div>
      </div>

      {/* Title + description */}
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: "#fafafa",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.35,
              color: "#a1a1aa",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 24,
          color: "#71717a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#2F7B70",
              display: "flex",
              marginRight: 14,
            }}
          />
          hasanharman.dev
        </div>
        {meta ? <div style={{ display: "flex" }}>{meta}</div> : null}
      </div>
    </div>
  );
}

/** Text on the left, the component itself on a lit stage to the right. */
export function StageCard({
  title,
  label,
  description,
  meta,
  image,
}: CardProps & { image: string }) {
  // Two-line titles shrink so the footer keeps its room.
  const long = title.length > 12;
  const titleSize = long ? 64 : 76;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        // Satori clips radial glows, so the brand tint is linear.
        background: "linear-gradient(135deg, #12302b 0%, #0d1716 28%, #0b0b0c 55%)",
        padding: 48,
        position: "relative",
        fontFamily: "Questrial",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 520,
          height: "100%",
          padding: "12px 40px 12px 16px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Pacifico", fontSize: 34, color: "#ffffff" }}>
          Hasan Harman
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                padding: "8px 20px",
                border: "1px solid rgba(127,222,208,0.35)",
                borderRadius: 999,
                fontSize: 18,
                letterSpacing: 3,
                color: "#7fded0",
              }}
            >
              {label.toUpperCase()}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#fafafa",
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: "flex",
                marginTop: long ? 18 : 22,
                fontSize: long ? 23 : 25,
                lineHeight: 1.42,
                color: "#a1a1aa",
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#71717a" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#2F7B70",
              display: "flex",
              marginRight: 12,
            }}
          />
          {meta ?? "hasanharman.dev"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: OG_STAGE.width,
          height: OG_STAGE.height,
          borderRadius: 28,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
        <img src={image} width={OG_STAGE.width} height={OG_STAGE.height} alt="" style={{ objectFit: "cover" }} />
      </div>
    </div>
  );
}
