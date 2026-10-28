// Screenshots of rendered pages (desktop + mobile) for previews, critique rounds and the gallery.
import puppeteer from "puppeteer-core";
import { config } from "../config.js";

let browserPromise;
function getBrowser() {
  browserPromise ??= puppeteer.launch({ executablePath: config.chromePath, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
  return browserPromise;
}

export async function screenshot(url, outFile, { width = 1440, height = 900, maxHeight = 4200 } = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 }).catch(() => {});
    // Scroll through so scroll-triggered animations and lazy images settle, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    const dims = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth }));
    await page.screenshot({ path: outFile, type: "jpeg", quality: 72, clip: { x: 0, y: 0, width, height: Math.min(dims.h, maxHeight) }, captureBeyondViewport: true });
    return { errors, overflowX: dims.w > width + 2, height: dims.h };
  } finally {
    await page.close().catch(() => {});
  }
}
