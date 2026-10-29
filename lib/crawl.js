// Crawls a site's homepage (and one catalog page if it has one) with headless Chrome.
// Produces screenshots + a facts.json with computed styles, nav, headings and product-like cards.
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { config } from "../config.js";

// Hotels sell rooms, not products: their room overview counts as the catalog page.
const CATALOG_WORDS = /(producten|products?|shop|webshop|winkel|assortiment|collecti|collections?|catalog|categor|store|kopen|aanbod|koffie|kimono|budo|boats?|zeilen|instrument|gitaar|karts?|parts|rooms?|kamers?|suites?|accommodat)/i;
const SKIP_WORDS = /(login|account|cart|winkelwagen|checkout|contact|over-ons|about|blog|faq|privacy|voorwaarden|terms|vacature|jobs|klantenservice|retour)/i;

let browserPromise;
function getBrowser() {
  browserPromise ??= puppeteer.launch({
    executablePath: config.chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--lang=nl-NL"],
  });
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) (await browserPromise).close().catch(() => {});
  browserPromise = undefined;
}

// Runs inside the page.
function extractFacts() {
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const pick = (el) => {
    const s = cs(el);
    if (!s) return null;
    return { color: s.color, background: s.backgroundColor, font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, radius: s.borderRadius, transform: s.textTransform, letterSpacing: s.letterSpacing };
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && cs(el).visibility !== "hidden" && cs(el).display !== "none";
  };

  // Area-weighted background colors and text colors.
  const bg = {}, fg = {};
  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const s = cs(el), r = el.getBoundingClientRect();
    const area = Math.min(r.width * r.height, 1440 * 900);
    if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) bg[s.backgroundColor] = (bg[s.backgroundColor] || 0) + area;
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) fg[s.color] = (fg[s.color] || 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, weight: Math.round(v) }));

  const fonts = {};
  for (const el of document.querySelectorAll("h1,h2,h3,p,a,button,li,span")) {
    if (!visible(el)) continue;
    const f = cs(el).fontFamily;
    fonts[f] = (fonts[f] || 0) + 1;
  }

  const buttons = [...document.querySelectorAll("button, a.button, a.btn, .btn, [class*=button], input[type=submit]")].filter(visible).slice(0, 6).map((b) => ({ text: b.innerText.trim().slice(0, 40), ...pick(b) }));
  const header = document.querySelector("header, [class*=header], nav");
  const logo = [...document.querySelectorAll("header img, [class*=logo] img, img[class*=logo], img[alt*=logo i], a[href='/'] img, header svg")].find(visible);

  const nav = [...document.querySelectorAll("header a, nav a")].filter(visible).map((a) => ({ text: a.innerText.trim().replace(/\s+/g, " ").slice(0, 60), href: a.href })).filter((a) => a.text && a.href.startsWith("http"));
  const allLinks = [...document.querySelectorAll("a[href]")].map((a) => ({ text: a.innerText.trim().replace(/\s+/g, " ").slice(0, 60), href: a.href })).filter((a) => a.href.startsWith(location.origin));

  const headings = [...document.querySelectorAll("h1,h2,h3")].filter(visible).slice(0, 30).map((h) => `${h.tagName}: ${h.innerText.trim().replace(/\s+/g, " ").slice(0, 120)}`);

  // Product-like cards: an element with an image and a nearby price or title.
  const priceRe = /(?:€|EUR|\$|£)\s?\d[\d.]*(?:,\d{2}|,-)?|\d[\d.]*,\d{2}\s?(?:€|EUR)?/;
  const products = [];
  const seen = new Set();
  for (const img of document.querySelectorAll("img")) {
    if (!visible(img) || products.length >= 24) continue;
    // Climb to the smallest ancestor that carries a price, or at least a title.
    let card = img.parentElement, best = null;
    for (let i = 0; i < 7 && card; i++, card = card.parentElement) {
      const t = card.innerText.trim();
      if (t.length > 400) break;
      if (priceRe.test(t)) { best = card; break; }
      if (!best && t.length >= 15) best = card;
    }
    card = best;
    if (!card) continue;
    const text = card.innerText.trim().replace(/\s+/g, " ");
    const src = img.currentSrc || img.src;
    if (!src || seen.has(src) || src.startsWith("data:")) continue;
    const price = text.match(priceRe)?.[0];
    if (!price && !card.querySelector("a")) continue;
    seen.add(src);
    products.push({ image: src, alt: img.alt, text: text.slice(0, 160), price: price || null, link: card.querySelector("a")?.href || card.closest("a")?.href || null });
  }

  const images = [...document.querySelectorAll("img")].filter(visible).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: Math.round(i.getBoundingClientRect().width) })).filter((i) => i.w > 200).slice(0, 15);

  return {
    title: document.title,
    description: document.querySelector("meta[name=description]")?.content || "",
    lang: document.documentElement.lang,
    themeColor: document.querySelector("meta[name=theme-color]")?.content || null,
    logo: !logo ? null
      : logo.tagName === "IMG" ? { src: logo.currentSrc || logo.src, alt: logo.alt }
      : logo.dataset.injectUrl ? { src: logo.dataset.injectUrl }
      : logo.outerHTML.length < 6000 ? { svg: logo.outerHTML }
      : { note: "inline SVG logo (too large to include) — see screenshot" },
    styles: { body: pick(document.body), header: pick(header), h1: pick(document.querySelector("h1")), h2: pick(document.querySelector("h2")), link: pick(document.querySelector("main a, a")), buttons },
    topBackgrounds: top(bg, 8),
    topTextColors: top(fg, 6),
    topFonts: top(fonts, 5),
    nav: nav.slice(0, 40),
    links: allLinks.slice(0, 200),
    headings,
    products,
    images,
    text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 6000),
  };
}

// Cookie banners and popups would otherwise dominate screenshots and computed colors.
async function dismissOverlays(page) {
  await page.evaluate(() => {
    const re = /(accept|akkoord|toestaan|alle cookies|alles toestaan|alle functionaliteiten|agree|allow all|got it|^ok$|begrepen|prima)/i;
    for (const b of document.querySelectorAll("button, a, [role=button]")) {
      const t = (b.innerText || "").trim();
      if (t.length < 40 && re.test(t)) { b.click(); break; }
    }
  }).catch(() => {});
  await new Promise((r) => setTimeout(r, 700));
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      if (s.position !== "fixed" && s.position !== "sticky" && !el.matches("dialog, [role=dialog], [aria-modal=true]")) continue;
      const r = el.getBoundingClientRect();
      const isHeader = r.top <= 5 && r.height < 220;
      if (!isHeader && (r.width * r.height > vw * vh * 0.08 || el.matches("[role=dialog], [aria-modal=true]") || /cookie|consent|modal|popup|overlay|newsletter/i.test(el.id + " " + el.className))) el.remove();
    }
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  }).catch(() => {});
  await new Promise((r) => setTimeout(r, 300));
}

async function crawlPage(browser, url, outDir, name) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 }).catch(() => page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }));
    await new Promise((r) => setTimeout(r, 1500));
    await dismissOverlays(page);
    // Scroll to trigger lazy-loaded images, then back to top.
    await page.evaluate(async () => {
      for (let y = 0; y < Math.min(document.body.scrollHeight, 8000); y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    const height = await page.evaluate(() => Math.min(document.body.scrollHeight, 5400));
    await page.screenshot({ path: path.join(outDir, `${name}-full.jpg`), type: "jpeg", quality: 60, clip: { x: 0, y: 0, width: 1440, height } }).catch(() => {});
    const facts = await page.evaluate(extractFacts);
    facts.url = page.url();
    return facts;
  } finally {
    await page.close().catch(() => {});
  }
}

function findCatalogUrl(home, evidence) {
  const origin = new URL(home.url).origin;
  const sameSite = (u) => { try { return new URL(u).hostname.replace(/^www\./, "") === new URL(origin).hostname.replace(/^www\./, ""); } catch { return false; } };
  const candidates = [
    ...home.nav.map((l) => ({ ...l, score: 3 })),
    ...home.links.map((l) => ({ ...l, score: 1 })),
    ...evidence.map((href) => ({ href, text: "", score: 2 })),
  ].filter((l) => sameSite(l.href) && !SKIP_WORDS.test(l.href) && new URL(l.href).pathname.length > 1 && CATALOG_WORDS.test(l.href + " " + l.text));
  // Prefer links whose pages are likely to be listings (short paths, matched in nav).
  candidates.sort((a, b) => b.score - a.score || a.href.length - b.href.length);
  return candidates[0]?.href || null;
}

export async function crawlSite({ url, evidence = [], outDir, onStep = () => {} }) {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await getBrowser();
  onStep(`Loading ${url}`);
  const home = await crawlPage(browser, url, outDir, "home");
  const result = { home, catalog: null };
  const catalogUrl = findCatalogUrl(home, evidence);
  if (catalogUrl) {
    onStep(`Loading catalog ${catalogUrl}`);
    try {
      result.catalog = await crawlPage(browser, catalogUrl, outDir, "catalog");
    } catch (e) {
      onStep(`Catalog failed: ${e.message}`);
    }
  }
  // Keep facts compact: links are only needed to find the catalog.
  delete home.links;
  if (result.catalog) delete result.catalog.links;
  await fs.writeFile(path.join(outDir, "facts.json"), JSON.stringify(result, null, 2));
  return result;
}
