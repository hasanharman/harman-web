import { Metadata } from "next";
import { notFound } from "next/navigation";

import { LAB_ITEMS, getLabItem } from "@/config/lab";
import { cn } from "@/lib/utils";

// Bare stage that scripts/capture-og.mjs screenshots into public/og/lab/<slug>.png.

export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return LAB_ITEMS.map((item) => ({ slug: item.slug }));
}

export default async function OgCapturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getLabItem(slug);
  if (!item) notFound();
  const { og } = item;
  const preview = og?.preview ?? item.preview;

  return (
    // Covers the root layout's chrome so only the stage is captured. The default stage is
    // pinned dark so stills don't depend on the capturing machine's appearance.
    <div className={cn("fixed inset-0 z-[2147483647] overflow-hidden bg-background text-foreground", !og?.stage && "dark")}>
      {/* Hide the Next dev indicator. */}
      <style>{`nextjs-portal { display: none !important; }`}</style>
      {og?.stage ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: `radial-gradient(120% 90% at 50% 30%, color-mix(in srgb, ${og.stage} 70%, white), ${og.stage} 70%)` }}
        >
          {preview}
        </div>
      ) : (
        // Same stage as the Lab card, stretched to fill the shot.
        <div className={cn("relative flex items-center justify-center", item.previewClassName, "h-full w-full")}>
          {preview}
        </div>
      )}
    </div>
  );
}
