// One-off helper: scroll to a CSS selector then screenshot the enclosing <section>.
// Usage: node screenshot-section.mjs <url> <selector> <label>
//
// Triggers framer-motion `whileInView` by stepping through the scroll
// before screenshot, then waits for any animations to settle.
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2];
const selector = process.argv[3];
const label = process.argv[4] || 'section';

const OUT_DIR = join(process.cwd(), 'temporary screenshots');
await mkdir(OUT_DIR, { recursive: true });
const existing = await readdir(OUT_DIR).catch(() => []);
const numbers = existing
  .map((n) => n.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const nextN = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '-');
const outPath = join(OUT_DIR, `screenshot-${nextN}-${safeLabel}.png`);

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Step-scroll the entire page in viewport-sized chunks. This makes every
  // `whileInView` listener fire (margin "-80px" trips before the element
  // is fully on-screen, so each step covers the next region).
  await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight;
    const step = window.innerHeight * 0.7;
    for (let y = 0; y <= total; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await new Promise((r) => setTimeout(r, 500));

  // Now find and scroll back to the target selector's enclosing <section>.
  const box = await page.evaluate((sel) => {
    let el = document.querySelector(sel);
    while (el && el.tagName !== 'SECTION') el = el.parentElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const absY = r.top + window.scrollY;
    window.scrollTo(0, Math.max(0, absY - 40));
    return {
      x: r.left + window.scrollX,
      y: absY,
      width: r.width,
      height: el.getBoundingClientRect().height,
    };
  }, selector);

  if (!box) {
    throw new Error(`Could not resolve enclosing <section> for ${selector}`);
  }

  // Let any newly-revealed animations finish.
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: outPath,
    clip: {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
    captureBeyondViewport: true,
  });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
