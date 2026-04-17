import puppeteer from 'puppeteer';
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'reviews';
const viewport = (process.env.VIEWPORT || '1440x900').split('x').map(Number);
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: viewport[0], height: viewport[1], deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => {
  const el = document.querySelector('#reviews');
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 4;
    window.scrollTo({ top: y, behavior: 'instant' });
  }
});
await new Promise(r => setTimeout(r, 1800));
const path = `./temporary screenshots/scroll-${label}-${Date.now()}.png`;
await page.screenshot({ path, fullPage: false });
console.log(`Saved ${path}`);
await browser.close();
