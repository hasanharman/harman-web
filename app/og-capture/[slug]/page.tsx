import { Metadata } from "next";
import { notFound } from "next/navigation";

import { LAB_ITEMS, getLabItem } from "@/config/lab";

// Bare stage that scripts/capture-og.mjs screenshots into public/og/lab/<slug>.png.

export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return LAB_ITEMS.filter((item) => item.og).map((item) => ({ slug: item.slug }));
}

export default async function OgCapturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const og = getLabItem(slug)?.og;
  if (!og) notFound();

  return (
    // Covers the root layout's chrome so only the stage is captured.
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center"
      style={{ background: `radial-gradient(120% 90% at 50% 30%, color-mix(in srgb, ${og.stage} 70%, white), ${og.stage} 70%)` }}
    >
      {/* Hide the Next dev indicator. */}
      <style>{`nextjs-portal { display: none !important; }`}</style>
      {og.preview}
    </div>
  );
}
