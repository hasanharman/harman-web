import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";

import VinylRecord from "@/components/vinyl-record";
import WorldClocks from "@/components/world-clocks";
import ThreeDPhotoCarousel from "@/components/three-d-carousel";
import PhotoFrames from "@/components/photo-frames";
import { PullCord } from "@/components/pull-cord";
import TableOfContents from "@/components/table-of-contents";

const sampleToc = [
  { title: "Getting started", url: "#getting-started" },
  {
    title: "Installation",
    url: "#installation",
    items: [
      { title: "Requirements", url: "#requirements" },
      { title: "Setup", url: "#setup" },
    ],
  },
  { title: "Usage", url: "#usage" },
  { title: "API reference", url: "#api-reference" },
];

export const metadata: Metadata = {
  title: "Hasan Harman - Lab",
  description:
    "A lab of interactive React components I've built — animations, motion, and small UI experiments.",
};

type Showcase = {
  title: string;
  description: string;
  preview: React.ReactNode;
  hint?: string;
  writing?: string;
  fullWidth?: boolean;
  previewClassName?: string;
};

const showcases: Showcase[] = [
  {
    title: "Pull-Cord Theme Switcher",
    description:
      "A light-switch cord that hangs from the top — give it a pull to flip the site theme with a circular reveal. 2D spring physics, no 3D libraries.",
    hint: "Pull the cord",
    previewClassName: "min-h-[280px] items-start bg-muted/30",
    preview: <PullCord className="absolute inset-x-0 top-0 z-10 mx-auto" />,
  },
  {
    title: "Vinyl Record",
    description:
      "A record sleeve that slides its disc out on hover, built with Motion variants.",
    hint: "Hover the cover",
    writing:
      "/writings/creating-a-vinyl-record-animation-in-react-using-framer-motion",
    preview: <VinylRecord />,
  },
  {
    title: "World Clocks",
    description:
      "Live clocks across time zones, plus the current Star Trek stardate via my trekdate package.",
    previewClassName: "min-h-[240px] items-center bg-muted/30 p-6",
    preview: <WorldClocks />,
  },
  {
    title: "Table of Contents",
    description:
      "The Notion-style floating ToC from my writeups — collapsed tick marks that expand into the full outline on hover.",
    previewClassName: "min-h-[240px] items-center justify-center bg-muted/30",
    preview: (
      <>
        <span className="text-xs text-muted-foreground">
          Hover the marks →
        </span>
        <TableOfContents tocList={sampleToc} />
      </>
    ),
  },
  {
    title: "Photo Frames",
    description:
      "A polaroid-style stack of framed photos that straighten and pop on hover — the set from my homepage.",
    hint: "Hover a photo",
    fullWidth: true,
    previewClassName: "min-h-[260px] items-center bg-muted/30 p-6 overflow-hidden",
    preview: <PhotoFrames />,
  },
  {
    title: "3D Photo Carousel",
    description:
      "A draggable, cylindrical photo carousel driven by Motion's rotate3d transforms.",
    hint: "Drag to spin",
    fullWidth: true,
    previewClassName: "h-[420px] overflow-hidden bg-muted/30",
    preview: <ThreeDPhotoCarousel />,
  },
];

export default function Lab() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Lab</h1>
      <p className="text-muted-foreground font-light">
        A showcase of interactive components I&apos;ve built along the way —
        animations, motion experiments, and small UI pieces. Play with them
        below.
      </p>
      <hr />
      <div className="grid gap-6 sm:grid-cols-2">
        {showcases.map((item) => (
          <div
            key={item.title}
            className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ${
              item.fullWidth ? "sm:col-span-2" : ""
            }`}
          >
            <div
              className={`relative flex flex-1 items-stretch justify-center ${
                item.previewClassName ?? ""
              }`}
            >
              {item.hint ? (
                <span className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-2 py-0.5 text-xs font-light text-white">
                  {item.hint}
                </span>
              ) : null}
              {item.preview}
            </div>
            <div className="space-y-2 border-t p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm font-light text-muted-foreground">
                {item.description}
              </p>
              {item.writing ? (
                <Link
                  href={item.writing}
                  className="inline-flex items-center gap-1 text-sm hover:underline underline-offset-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read the writeup
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <p className="pt-2 text-sm font-light text-muted-foreground">
        Want the source? Most of these live in my{" "}
        <Link
          href="https://github.com/hasanharman/harman-web"
          target="_blank"
          className="inline-flex items-center gap-1 hover:underline underline-offset-2"
        >
          website repo
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        .
      </p>
    </div>
  );
}
