import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

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

    if (!fontCache) fontCache = await fetchFonts();

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
