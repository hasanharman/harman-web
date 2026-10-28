#!/usr/bin/env node
// Screenshots /og-capture/<slug> into public/og/lab/<slug>.png with headless Chrome.
// Run with the site up: pnpm og:capture [slug ...] [--url http://localhost:3000]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const STAGE = { width: 560, height: 534 }; // OG_STAGE in lib/og.tsx
const DEFAULT_SLUGS = ["flip-clock", "calendar-clock"]; // LAB_ITEMS with `og`

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
const slugs = args.length ? args : DEFAULT_SLUGS;

const outDir = path.join(process.cwd(), "public", "og", "lab");
mkdirSync(outDir, { recursive: true });

for (const slug of slugs) {
  const out = path.join(outDir, `${slug}.png`);
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
