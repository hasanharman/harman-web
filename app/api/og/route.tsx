import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FONT_URLS = {
  wordmark:
    "https://cdn.jsdelivr.net/fontsource/fonts/pacifico@latest/latin-400-normal.ttf",
  body: "https://cdn.jsdelivr.net/fontsource/fonts/questrial@latest/latin-400-normal.ttf",
  bold: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf",
};

// Fetched once per server process, then reused across requests.
let fontCache: Awaited<ReturnType<typeof fetchFonts>> | null = null;

async function fetchFonts() {
  const [wordmark, body, bold] = await Promise.all(
    [FONT_URLS.wordmark, FONT_URLS.body, FONT_URLS.bold].map((url) =>
      fetch(url).then((r) => r.arrayBuffer())
    )
  );
  return [
    { name: "Pacifico", data: wordmark, weight: 400 as const, style: "normal" as const },
    { name: "Questrial", data: body, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 600 as const, style: "normal" as const },
  ];
}

/** Strip emoji/symbols that Satori can't render, and collapse whitespace. */
function clean(text: string) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Stills are read from disk once and inlined — next/og won't fetch our own host.
const stageCache = new Map<string, string | null>();

/** Load a captured still from public/og as a data URI. Only our own files, never a URL. */
async function stageImage(imagePath: string | null) {
  if (!imagePath || !/^\/og\/[\w/-]+\.png$/.test(imagePath)) return null;
  if (!stageCache.has(imagePath)) {
    const data = await readFile(path.join(process.cwd(), "public", imagePath)).catch(() => null);
    stageCache.set(imagePath, data ? `data:image/png;base64,${data.toString("base64")}` : null);
  }
  return stageCache.get(imagePath) ?? null;
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawTitle = searchParams.get("title");
    if (!rawTitle) return new Response("No title provided", { status: 400 });

    const title = truncate(clean(rawTitle), 90);
    const label = clean(searchParams.get("label") ?? "Hasan Harman");
    const descRaw = searchParams.get("desc");
    const description = descRaw ? truncate(clean(descRaw), 160) : null;
    const meta = searchParams.get("meta") ? clean(searchParams.get("meta")!) : null;

    // Scale the title down as it gets longer so it always fits.
    const titleSize = title.length > 64 ? 60 : title.length > 40 ? 72 : 84;

    const image = await stageImage(searchParams.get("image"));

    if (!fontCache) fontCache = await fetchFonts();

    if (image) {
      return new ImageResponse(
        <StageCard title={title} label={label} description={description} meta={meta} image={image} />,
        { width: 1200, height: 630, fonts: fontCache }
      );
    }

    return new ImageResponse(
      (
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
      ),
      { width: 1200, height: 630, fonts: fontCache }
    );
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }
}

/** Text on the left, the component itself on a lit stage to the right. */
function StageCard({
  title,
  label,
  description,
  meta,
  image,
}: {
  title: string;
  label: string;
  description: string | null;
  meta: string | null;
  image: string;
}) {
  // The stage is 560×534 — the size scripts/capture-og.mjs shoots at.
  // Two-line titles get a smaller size and tighter copy so the footer keeps its room.
  const long = title.length > 12;
  const titleSize = long ? 64 : 76;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        // Brand tint washing in from the top-left (Satori clips radial glows, linear is safe).
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
          width: 560,
          height: 534,
          borderRadius: 28,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
        <img src={image} width={560} height={534} alt="" style={{ objectFit: "cover" }} />
      </div>
    </div>
  );
}
