import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

import { OG_SIZE, TextCard, clean, ogFonts, truncate } from "@/lib/og";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawTitle = searchParams.get("title");
    if (!rawTitle) return new Response("No title provided", { status: 400 });
    const param = (key: string) => {
      const value = searchParams.get(key);
      return value ? clean(value) : null;
    };
    const desc = param("desc");

    return new ImageResponse(
      <TextCard
        title={truncate(clean(rawTitle), 90)}
        label={param("label") ?? "Hasan Harman"}
        description={desc && truncate(desc, 160)}
        meta={param("meta")}
      />,
      { ...OG_SIZE, fonts: await ogFonts() }
    );
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }
}
