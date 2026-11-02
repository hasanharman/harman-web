#!/usr/bin/env node
// Screenshots /og-capture/<slug> into public/og/lab/<slug>.png with headless Chrome.
// Run with the site up: pnpm og:capture [slug ...] [--url http://localhost:3000]
// No slugs captures every LAB_ITEM. --check captures nothing and fails if any still is
// missing; `pnpm build` runs it so a new component can't ship without one.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const STAGE = { width: 560, height: 534 }; // OG_STAGE in lib/og.tsx
const outDir = path.join(process.cwd(), "public", "og", "lab");
const stillPath = (slug) => path.join(outDir, `${slug}.png`);

// config/lab.tsx is TSX, so read the slugs out of its source: LAB_ITEMS entries sit at this indent.
const labSlugs = [
  ...readFileSync(path.join(process.cwd(), "config", "lab.tsx"), "utf8").matchAll(/^ {4}slug: "([^"]+)"/gm),
].map((match) => match[1]);

if (process.argv.includes("--check")) {
  const missing = labSlugs.filter((slug) => !existsSync(stillPath(slug)));
  if (missing.length) {
    console.error(`Missing share image stills. With the site up, run: pnpm og:capture ${missing.join(" ")}`);
    process.exit(1);
  }
  process.exit(0);
}

const chrome = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.");
  process.exit(1);
}

const args = process.argv.slice(2);
const urlFlag = args.indexOf("--url");
const base = urlFlag >= 0 ? args.splice(urlFlag, 2)[1] : "http://localhost:3000";
const slugs = args.length ? args : labSlugs;

mkdirSync(outDir, { recursive: true });

for (const slug of slugs) {
  const out = stillPath(slug);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    `--window-size=${STAGE.width},${STAGE.height}`,
    "--virtual-time-budget=5000", // let hydration and fonts settle
    `--screenshot=${out}`,
    `${base}/og-capture/${slug}`,
  ]);
  console.log(`✓ ${path.relative(process.cwd(), out)}`);
}
