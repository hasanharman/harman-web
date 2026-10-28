#!/usr/bin/env node
// Screenshots each component's /og-capture/<slug> stage into public/og/lab/<slug>.png,
// which /api/og places on the component's share image.
//
// Run with the site up (`pnpm dev` or `pnpm start`):
//   node scripts/capture-og.mjs [slug ...] [--url http://localhost:3000]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

// Must match the stage box in app/api/og/route.tsx.
const STAGE = { width: 560, height: 534 };
const DEFAULT_SLUGS = ["flip-clock", "calendar-clock"];

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const args = process.argv.slice(2);
const urlFlag = args.indexOf("--url");
const base = urlFlag >= 0 ? args.splice(urlFlag, 2)[1] : "http://localhost:3000";
const slugs = args.length ? args : DEFAULT_SLUGS;

const chrome = CHROME_PATHS.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.");
  process.exit(1);
}

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
    // Let hydration and fonts settle before the shot.
    "--virtual-time-budget=5000",
    `--screenshot=${out}`,
    `${base}/og-capture/${slug}`,
  ]);
  console.log(`✓ ${path.relative(process.cwd(), out)}`);
}
