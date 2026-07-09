import React from "react";

import VinylRecord from "@/components/vinyl-record";
import WorldClocks from "@/components/world-clocks";
import ThreeDPhotoCarousel from "@/components/three-d-carousel";
import PhotoFrames from "@/components/photo-frames";
import { PullCord } from "@/components/pull-cord";
import TableOfContents from "@/components/table-of-contents";

/** Base URL each registry item is served from once deployed. */
export const REGISTRY_BASE_URL = "https://hasanharman.dev/r";

/** The shadcn install command for a given registry item. */
export function installCommand(slug: string) {
  return `shadcn@latest add ${REGISTRY_BASE_URL}/${slug}.json`;
}

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

export type LabItem = {
  /** URL slug — matches the registry item name in registry.json. */
  slug: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  hint?: string;
  writing?: string;
  fullWidth?: boolean;
  previewClassName?: string;
  /** Whether this component is published to the shadcn registry. */
  installable?: boolean;
};

export const LAB_ITEMS: LabItem[] = [
  {
    slug: "pull-cord",
    title: "Pull-Cord Theme Switcher",
    description:
      "A light-switch cord that hangs from the top — give it a pull to flip the site theme with a circular reveal. 2D spring physics, no 3D libraries.",
    hint: "Pull the cord",
    installable: true,
    previewClassName: "min-h-[280px] items-start bg-muted/30",
    preview: <PullCord className="absolute inset-x-0 top-0 z-10 mx-auto" />,
  },
  {
    slug: "vinyl-record",
    title: "Vinyl Record",
    description:
      "A record sleeve that slides its disc out on hover, built with Motion variants.",
    hint: "Hover the cover",
    installable: true,
    writing:
      "/writings/creating-a-vinyl-record-animation-in-react-using-framer-motion",
    preview: <VinylRecord />,
  },
  {
    slug: "world-clocks",
    title: "World Clocks",
    description:
      "Live clocks across time zones, plus the current Star Trek stardate via my trekdate package.",
    installable: true,
    previewClassName: "min-h-[240px] items-center bg-muted/30 p-6",
    preview: <WorldClocks />,
  },
  {
    slug: "table-of-contents",
    title: "Table of Contents",
    description:
      "The Notion-style floating ToC from my writeups — collapsed tick marks that expand into the full outline on hover.",
    installable: true,
    previewClassName: "min-h-[240px] items-center justify-center bg-muted/30",
    preview: (
      <>
        <span className="text-xs text-muted-foreground">Hover the marks →</span>
        <TableOfContents tocList={sampleToc} />
      </>
    ),
  },
  {
    slug: "photo-frames",
    title: "Photo Frames",
    description:
      "A polaroid-style stack of framed photos that straighten and pop on hover — the set from my homepage.",
    hint: "Hover a photo",
    installable: true,
    fullWidth: true,
    previewClassName:
      "min-h-[260px] items-center bg-muted/30 p-6 overflow-hidden",
    preview: <PhotoFrames />,
  },
  {
    slug: "three-d-carousel",
    title: "3D Photo Carousel",
    description:
      "A draggable, cylindrical photo carousel driven by Motion's rotate3d transforms.",
    hint: "Drag to spin",
    installable: true,
    fullWidth: true,
    previewClassName: "h-[420px] overflow-hidden bg-muted/30",
    preview: <ThreeDPhotoCarousel />,
  },
];

export function getLabItem(slug: string): LabItem | undefined {
  return LAB_ITEMS.find((item) => item.slug === slug);
}
