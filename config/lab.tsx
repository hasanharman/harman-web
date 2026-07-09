import React from "react";

import VinylRecord from "@/components/vinyl-record";
import AnalogClock from "@/components/analog-clock";
import WallSwitch from "@/components/wall-switch";
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
  /** Exported symbol used in the Usage snippet, e.g. "VinylRecord". */
  importName: string;
  /** True when the component is a named (not default) export. */
  named?: boolean;
  /** Optional full Usage snippet override (for components that need props). */
  usage?: string;
  /** Optional prop reference rendered as an API table on the detail page. */
  props?: PropDoc[];
  /** Optional worked examples, each with its own preview + code (shadcn-style). */
  examples?: LabExample[];
};

export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type LabExample = {
  title: string;
  description?: string;
  preview: React.ReactNode;
  code: string;
  hint?: string;
  previewClassName?: string;
};

/** The import + basic JSX shown in the Usage section. */
export function usageSnippet(item: LabItem) {
  if (item.usage) return item.usage;
  const importLine = item.named
    ? `import { ${item.importName} } from "@/components/${item.slug}";`
    : `import ${item.importName} from "@/components/${item.slug}";`;
  return `${importLine}\n\nexport default function Example() {\n  return <${item.importName} />;\n}`;
}

/** Album covers used across the Vinyl Record previews. */
const COVERS = {
  linkinPark:
    "https://linkinpedia.com/w/images/thumb/f/fe/Album-From_Zero.png/800px-Album-From_Zero.png",
  redHotChiliPeppers:
    "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/5e/49/35/5e493511-d87b-5aa2-b379-30fffbae902b/093624932154.jpg/600x600bb.jpg",
  sebnemFerah:
    "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/32/0e/f8/320ef83c-5748-d558-25e9-ac595ae63cac/cover.jpg/600x600bb.jpg",
};

export const LAB_ITEMS: LabItem[] = [
  {
    slug: "analog-clock",
    title: "Analog Clock",
    description:
      "A Braun-inspired analog clock drawn in SVG. Dial, case, hand and marker colors, numerals, movement, time zone and brand text are all props — ticks live or freezes at a fixed time. No dependencies.",
    installable: true,
    importName: "AnalogClock",
    previewClassName:
      "min-h-[360px] items-center justify-center bg-muted/30",
    preview: <AnalogClock size={240} />,
    examples: [
      {
        title: "White dial",
        description:
          "The classic white Braun — a white dial, brushed-steel case, black hands and numerals, and the signature yellow second hand. Same props as the black dial, recolored.",
        previewClassName:
          "min-h-[340px] items-center justify-center bg-white",
        preview: (
          <AnalogClock
            size={230}
            dialColor="#ffffff"
            caseColor="#c4c7ca"
            handColor="#111111"
            markerColor="#111111"
            secondColor="#e8a800"
          />
        ),
        code: `<AnalogClock
  dialColor="#ffffff"
  caseColor="#c4c7ca"
  handColor="#111111"
  markerColor="#111111"
  secondColor="#e8a800"
/>`,
      },
      {
        title: "Mechanical sweep",
        description:
          "The movement prop changes how the second hand advances. \"mechanical\" gives the high-frequency stutter of an automatic; \"sweep\" glides continuously; \"quartz\" steps once per second.",
        hint: "Watch the seconds",
        previewClassName:
          "min-h-[340px] items-center justify-center bg-muted/30",
        preview: (
          <AnalogClock
            size={230}
            movement="mechanical"
            caption="automatic"
          />
        ),
        code: `<AnalogClock movement="mechanical" caption="automatic" />`,
      },
      {
        title: "Fixed time & minimal markers",
        description:
          "Pass a time as a Date or \"HH:MM\" string to freeze the clock — handy for stills. Set numerals to \"ticks\" for a marker-only dial.",
        previewClassName:
          "min-h-[340px] items-center justify-center bg-muted/30",
        preview: (
          <AnalogClock
            size={230}
            time="10:09"
            live={false}
            numerals="ticks"
            brand=""
            caption=""
          />
        ),
        code: `<AnalogClock time="10:09" live={false} numerals="ticks" />`,
      },
      {
        title: "Other time zone",
        description:
          "Give it an IANA timeZone and it renders that city's live time — build a wall of them for a world clock.",
        previewClassName:
          "min-h-[340px] items-center justify-center bg-muted/30",
        preview: (
          <AnalogClock
            size={230}
            timeZone="Asia/Tokyo"
            caption="Tokyo"
          />
        ),
        code: `<AnalogClock timeZone="Asia/Tokyo" caption="Tokyo" />`,
      },
      {
        title: "Space watch",
        description:
          "Give it a cosmic palette and a glow color and it turns into a space watch — the halo hugs the case. This is the one on the USS Enterprise line of my homepage.",
        previewClassName:
          "min-h-[340px] items-center justify-center bg-black",
        preview: (
          <AnalogClock
            size={230}
            movement="sweep"
            numerals="ticks"
            minuteTrack={false}
            dialColor="#0a0a1a"
            caseColor="#2b2b40"
            handColor="#e0e7ff"
            secondColor="#22d3ee"
            markerColor="#818cf8"
            brand="STARFLEET"
            caption="stardate"
            glow="#22d3ee"
          />
        ),
        code: `<AnalogClock
  movement="sweep"
  numerals="ticks"
  dialColor="#0a0a1a"
  handColor="#e0e7ff"
  secondColor="#22d3ee"
  markerColor="#818cf8"
  glow="#22d3ee"
/>`,
      },
    ],
    usage: `import AnalogClock from "@/components/analog-clock";

export default function Example() {
  return (
    <AnalogClock
      size={240}
      movement="quartz"
      brand="BRAUN"
      caption="quartz"
    />
  );
}`,
    props: [
      {
        name: "time",
        type: "Date | string",
        default: "—",
        description:
          'Freeze the clock at a fixed time (Date, or "HH:MM" / "HH:MM:SS"). Omit to tick live.',
      },
      {
        name: "live",
        type: "boolean",
        default: "true",
        description: "Tick in real time. Ignored when a fixed time is provided.",
      },
      {
        name: "timeZone",
        type: "string",
        default: "local",
        description:
          'IANA time zone for live mode, e.g. "Europe/Istanbul".',
      },
      {
        name: "movement",
        type: '"quartz" | "mechanical" | "sweep"',
        default: '"quartz"',
        description:
          "How the second hand advances — quartz steps each second, mechanical stutters at ~8 beats/s, sweep glides continuously.",
      },
      {
        name: "size",
        type: "number",
        default: "240",
        description: "Diameter of the clock, in pixels.",
      },
      {
        name: "numerals",
        type: '"arabic" | "roman" | "ticks" | "none"',
        default: '"arabic"',
        description: "Style of the hour markers around the dial.",
      },
      {
        name: "minuteTrack",
        type: "boolean",
        default: "true",
        description: "Show the thin minute ticks between the hour markers.",
      },
      {
        name: "showSeconds",
        type: "boolean",
        default: "true",
        description: "Show the second hand.",
      },
      {
        name: "dialColor",
        type: "string",
        default: '"#0b0b0c"',
        description: "Dial (face) background — any CSS color.",
      },
      {
        name: "caseColor",
        type: "string",
        default: '"#1c1c1e"',
        description: "Case / bezel ring color.",
      },
      {
        name: "handColor",
        type: "string",
        default: '"#f4f4f5"',
        description: "Hour & minute hand color.",
      },
      {
        name: "secondColor",
        type: "string",
        default: '"#f5a623"',
        description: "Second hand accent color.",
      },
      {
        name: "markerColor",
        type: "string",
        default: '"#d4d4d8"',
        description: "Markers, numerals and minute-track color.",
      },
      {
        name: "brand",
        type: "string",
        default: '"BRAUN"',
        description: "Brand name printed on the upper dial (empty string hides it).",
      },
      {
        name: "caption",
        type: "string",
        default: '"quartz"',
        description: 'Small line under the brand, e.g. "quartz".',
      },
      {
        name: "footer",
        type: "[string, string]",
        default: "—",
        description: 'Two-part footer near 6 o\'clock, e.g. ["Made in", "Germany"].',
      },
      {
        name: "glow",
        type: "string",
        default: "—",
        description:
          'A CSS color to cast a glowing halo around the case — the "space watch" look.',
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra classes on the outer wrapper.",
      },
    ],
  },
  {
    slug: "pull-cord",
    title: "Pull-Cord Theme Switcher",
    description:
      "A light-switch cord that hangs from the top — give it a pull to flip the site theme with a circular reveal. 2D spring physics, no 3D libraries.",
    hint: "Pull the cord",
    installable: true,
    importName: "PullCord",
    named: true,
    previewClassName: "min-h-[280px] items-start bg-muted/30",
    preview: <PullCord className="absolute inset-x-0 top-0 z-10 mx-auto" />,
  },
  {
    slug: "vinyl-record",
    title: "Vinyl Record",
    description:
      "A record sleeve that slides its discs out on hover. Cover art, disc colors, count, direction and size are all props — stack a 2LP the way record stores show them.",
    hint: "Hover the sleeve",
    installable: true,
    importName: "VinylRecord",
    writing:
      "/writings/creating-a-vinyl-record-animation-in-react-using-framer-motion",
    previewClassName: "min-h-[360px] items-center justify-center bg-muted/30",
    preview: (
      <VinylRecord
        size={220}
        cover={COVERS.linkinPark}
        alt="Linkin Park — From Zero"
      />
    ),
    examples: [
      {
        title: "Multiple colored discs",
        description:
          "Pass an array to discs to stack a 2LP — each disc takes its own color and staggers out a little further, the way a record store shows them.",
        hint: "Hover the sleeve",
        previewClassName: "min-h-[320px] items-center justify-center bg-muted/30",
        preview: (
          <VinylRecord
            size={210}
            cover={COVERS.redHotChiliPeppers}
            alt="Red Hot Chili Peppers — Stadium Arcadium"
            discs={[{ color: "#dc2626" }, { color: "#111111" }]}
          />
        ),
        code: `<VinylRecord
  cover="/albums/stadium-arcadium.jpg"
  discs={[{ color: "#dc2626" }, { color: "#111111" }]}
/>`,
      },
      {
        title: "Slide direction",
        description:
          "The slide prop controls which way the disc leaves the sleeve — up, down, left or right.",
        hint: "Hover the sleeve",
        previewClassName: "min-h-[460px] items-center justify-center bg-muted/30",
        preview: (
          <VinylRecord
            size={210}
            slide="up"
            cover={COVERS.linkinPark}
            alt="Linkin Park — From Zero"
          />
        ),
        code: `<VinylRecord cover="/albums/from-zero.jpg" slide="up" />`,
      },
      {
        title: "Custom vinyl & label color",
        description:
          "Tint the vinyl and its center label to match the artwork with the color and labelColor fields.",
        hint: "Hover the sleeve",
        previewClassName: "min-h-[320px] items-center justify-center bg-muted/30",
        preview: (
          <VinylRecord
            size={210}
            cover={COVERS.sebnemFerah}
            alt="Şebnem Ferah — Can Kırıkları"
            discs={[{ color: "#7c3aed", labelColor: "#f5d0fe" }]}
          />
        ),
        code: `<VinylRecord
  cover="/albums/can-kiriklari.jpg"
  discs={[{ color: "#7c3aed", labelColor: "#f5d0fe" }]}
/>`,
      },
      {
        title: "Flat finish",
        description:
          "Prefer a cleaner, minimal look? Set finish=\"flat\" to drop the reflections and pressed rim for a simple disc.",
        hint: "Hover the sleeve",
        previewClassName: "min-h-[320px] items-center justify-center bg-muted/30",
        preview: (
          <VinylRecord
            size={210}
            finish="flat"
            cover={COVERS.redHotChiliPeppers}
            alt="Red Hot Chili Peppers — Stadium Arcadium"
            discs={[{ color: "#dc2626" }]}
          />
        ),
        code: `<VinylRecord
  cover="/albums/stadium-arcadium.jpg"
  finish="flat"
  discs={[{ color: "#dc2626" }]}
/>`,
      },
    ],
    usage: `import VinylRecord from "@/components/vinyl-record";

export default function Example() {
  return (
    <VinylRecord
      cover="/albums/return-of-the-dream-canteen.jpg"
      size={256}
      slide="right"
      discs={[{ color: "#1d4ed8" }, { color: "#f4f4f5" }]}
    />
  );
}`,
    props: [
      {
        name: "cover",
        type: "string",
        default: "From Zero cover",
        description: "Album cover image URL shown on the sleeve.",
      },
      {
        name: "alt",
        type: "string",
        default: '"Album cover"',
        description: "Alt text for the cover image.",
      },
      {
        name: "discs",
        type: "number | VinylDisc[]",
        default: "1",
        description:
          "A number renders N black discs; an array sets each disc's { color, labelColor } individually. Discs stagger so each peeks a little further.",
      },
      {
        name: "slide",
        type: '"up" | "down" | "left" | "right"',
        default: '"right"',
        description: "Direction the discs slide out when the sleeve is hovered.",
      },
      {
        name: "finish",
        type: '"glossy" | "flat"',
        default: '"glossy"',
        description:
          "Surface finish — glossy adds realistic reflections and a pressed rim; flat is a clean, minimal disc.",
      },
      {
        name: "size",
        type: "number",
        default: "256",
        description: "Edge length of the square sleeve, in pixels.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra classes on the outer wrapper.",
      },
    ],
  },
  {
    slug: "wall-switch",
    title: "Wall Switch",
    description:
      "An old-school electrical light switch as a toggle. Clean and label-free by default — flip it up or down. Runs controlled or uncontrolled, goes vertical or horizontal, and the slot can glow a color for on/off. No dependencies.",
    hint: "Flip it",
    installable: true,
    importName: "WallSwitch",
    previewClassName:
      "min-h-[240px] items-center justify-center bg-muted/30",
    preview: <WallSwitch defaultChecked />,
    examples: [
      {
        title: "With labels",
        description:
          "Pass a two-part labels prop to flank the switch — the active side brightens.",
        hint: "Flip it",
        previewClassName:
          "min-h-[240px] items-center justify-center bg-muted/30",
        preview: <WallSwitch defaultChecked labels={["On", "Off"]} />,
        code: `<WallSwitch labels={["On", "Off"]} />`,
      },
      {
        title: "Colored slot",
        description:
          "Give onColor and offColor to fill the exposed slot — green when on, red when off — for an at-a-glance status tell.",
        hint: "Flip it",
        previewClassName:
          "min-h-[240px] items-center justify-center bg-muted/30",
        preview: (
          <WallSwitch defaultChecked onColor="#22c55e" offColor="#ef4444" />
        ),
        code: `<WallSwitch onColor="#22c55e" offColor="#ef4444" />`,
      },
      {
        title: "Horizontal",
        description:
          "Set orientation to horizontal to flip the switch on its side — right for on, left for off.",
        hint: "Flip it",
        previewClassName:
          "min-h-[240px] items-center justify-center bg-muted/30",
        preview: (
          <WallSwitch defaultChecked orientation="horizontal" labels={["On", "Off"]} />
        ),
        code: `<WallSwitch orientation="horizontal" labels={["On", "Off"]} />`,
      },
    ],
    usage: `import WallSwitch from "@/components/wall-switch";

export default function Example() {
  return <WallSwitch defaultChecked labels={["On", "Off"]} />;
}`,
    props: [
      {
        name: "checked",
        type: "boolean",
        default: "—",
        description:
          "Controlled on/off state (on = lever up). Omit to run uncontrolled.",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        default: "false",
        description: "Initial state when uncontrolled.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        default: "—",
        description: "Fired with the next state on every flip.",
      },
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        default: '"vertical"',
        description:
          "vertical flips up/down; horizontal flips right/left.",
      },
      {
        name: "size",
        type: "number",
        default: "80",
        description: "Plate height in pixels; everything else scales from it.",
      },
      {
        name: "onColor",
        type: "string",
        default: "—",
        description: 'Color filling the slot when on, e.g. "#22c55e".',
      },
      {
        name: "offColor",
        type: "string",
        default: "—",
        description: 'Color filling the slot when off, e.g. "#ef4444".',
      },
      {
        name: "labels",
        type: "[string, string]",
        default: "—",
        description:
          "Optional [on, off] labels flanking the switch. Omit for a clean switch.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra classes on the outer wrapper.",
      },
    ],
  },
  {
    slug: "world-clocks",
    title: "World Clocks",
    description:
      "Live clocks across time zones, plus the current Star Trek stardate via my trekdate package.",
    installable: true,
    importName: "WorldClocks",
    previewClassName: "min-h-[240px] items-center bg-muted/30 p-6",
    preview: <WorldClocks />,
  },
  {
    slug: "table-of-contents",
    title: "Table of Contents",
    description:
      "The Notion-style floating ToC from my writeups — collapsed tick marks that expand into the full outline on hover.",
    installable: true,
    importName: "TableOfContents",
    usage: `import TableOfContents from "@/components/table-of-contents";

const toc = [
  { title: "Getting started", url: "#getting-started" },
  { title: "Usage", url: "#usage" },
];

export default function Example() {
  return <TableOfContents tocList={toc} />;
}`,
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
    importName: "PhotoFrames",
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
    importName: "ThreeDPhotoCarousel",
    fullWidth: true,
    previewClassName: "h-[420px] overflow-hidden bg-muted/30",
    preview: <ThreeDPhotoCarousel />,
  },
];

export function getLabItem(slug: string): LabItem | undefined {
  return LAB_ITEMS.find((item) => item.slug === slug);
}
