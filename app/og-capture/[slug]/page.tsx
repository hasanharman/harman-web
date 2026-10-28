import { Metadata } from "next";
import { notFound } from "next/navigation";

import { LAB_ITEMS, getLabItem } from "@/config/lab";

/**
 * A bare stage with one component on it, screenshotted by scripts/capture-og.mjs
 * into public/og/lab/<slug>.png for that component's share image.
 */

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return LAB_ITEMS.filter((item) => item.ogPreview).map((item) => ({ slug: item.slug }));
}

export default async function OgCapturePage({ params }: PageProps) {
  const { slug } = await params;
  const item = getLabItem(slug);
  if (!item?.ogPreview) notFound();

  return (
    // Covers the site chrome from the root layout so only the stage is captured.
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center"
      style={{
        background: `radial-gradient(120% 90% at 50% 30%, color-mix(in srgb, ${item.ogStage ?? "#f4f2ee"} 70%, white), ${item.ogStage ?? "#f4f2ee"} 70%)`,
      }}
    >
      {/* Keep the dev-mode indicator out of the shot. */}
      <style>{`nextjs-portal { display: none !important; }`}</style>
      {item.ogPreview}
    </div>
  );
}
