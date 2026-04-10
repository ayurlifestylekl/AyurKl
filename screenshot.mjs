#!/usr/bin/env node
// Headless screenshot CLI for prototype iteration.
//
// Usage:
//   node screenshot.mjs <url>            -> ./temporary screenshots/screenshot-N.png
//   node screenshot.mjs <url> <label>    -> ./temporary screenshots/screenshot-N-<label>.png
//
// Env overrides:
//   VIEWPORT=375x812 node screenshot.mjs http://localhost:3000   # mobile size
//   FULL_PAGE=false node screenshot.mjs http://localhost:3000    # only viewport, not full scroll

import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}

const OUT_DIR = join(process.cwd(), 'temporary screenshots');
await mkdir(OUT_DIR, { recursive: true });

// Find the next available screenshot-N number
const existing = await readdir(OUT_DIR).catch(() => []);
const numbers = existing
  .map((name) => name.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const nextN = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;

// Sanitize label: only allow safe filename chars
const safeLabel = label ? label.replace(/[^a-zA-Z0-9_-]/g, '-') : null;
const filename = safeLabel
  ? `screenshot-${nextN}-${safeLabel}.png`
  : `screenshot-${nextN}.png`;
const outPath = join(OUT_DIR, filename);

// Viewport (default desktop 1440x900, deviceScaleFactor 2 for retina sharpness)
const viewportEnv = process.env.VIEWPORT;
let width = 1440;
let height = 900;
if (viewportEnv) {
  const m = viewportEnv.match(/^(\d+)x(\d+)$/);
  if (m) {
    width = Number(m[1]);
    height = Number(m[2]);
  } else {
    console.error(`Invalid VIEWPORT format: "${viewportEnv}". Use WIDTHxHEIGHT (e.g. 375x812).`);
    process.exit(1);
  }
}

const fullPage = process.env.FULL_PAGE !== 'false';

console.log(`\u2192 Loading ${url}`);
console.log(`  viewport: ${width}x${height}, fullPage: ${fullPage}`);

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: outPath, fullPage });
  console.log(`\u2713 Saved ${outPath}`);
} catch (err) {
  console.error(`\u2717 Screenshot failed: ${err.message}`);
  process.exit(1);
} finally {
  await browser.close();
}
