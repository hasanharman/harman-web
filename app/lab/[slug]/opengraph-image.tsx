import { ImageResponse } from "next/og";

import { getLabItem } from "@/config/lab";
import { OG_SIZE, StageCard, TextCard, labStill, ogFonts, truncate } from "@/lib/og";

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const item = getLabItem(params.slug);
  const alt = item ? `${item.title} — ${item.summary ?? item.description}` : "Lab";
  return [{ id: "card", alt, size: OG_SIZE, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getLabItem(slug);
  const card = {
    title: item?.title ?? "Lab",
    label: "Lab",
    description: item ? truncate(item.summary ?? item.description, 155) : null,
    meta: `hasanharman.dev/lab/${slug}`,
  };
  const still = item ? await labStill(slug) : null;

  return new ImageResponse(
    still && item ? <StageCard {...card} code={`<${item.importName} />`} image={still} /> : <TextCard {...card} />,
    {
      ...OG_SIZE,
      fonts: await ogFonts(),
    }
  );
}
