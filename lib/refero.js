// Builds a local catalog of design styles from https://styles.refero.design.
// The site is a Next.js app; style data lives in the React Server Component payload
// (self.__next_f.push([1,"..."]) chunks), so we decode that instead of scraping the DOM.
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "../config.js";

const BASE = "https://styles.refero.design";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

function decodeRsc(html) {
  let out = "";
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let m;
  while ((m = re.exec(html))) out += JSON.parse('"' + m[1] + '"');
  return out;
}

// Returns the [start, end) span of the JSON object that encloses position `pos`.
function enclosingObject(text, pos) {
  const stack = [];
  let inStr = false;
  let target = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (i === pos) target = stack[stack.length - 1];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") stack.push(i);
    else if (c === "}") {
      const start = stack.pop();
      if (target !== -1 && start === target) return [start, i + 1];
    }
  }
  return null;
}

function objectAt(text, start) {
  const span = enclosingObject(text, start + 1);
  return span ? JSON.parse(text.slice(span[0], span[1])) : null;
}

// Gallery entries look like {"id":"<uuid>","url":"https://...","siteName":"...", ... "colors":[...], "fonts":[...], "northStar":"..."}
function parseGallery(rsc) {
  const styles = new Map();
  const re = /\{"id":"([0-9a-f-]{36})","url":"/g;
  let m;
  while ((m = re.exec(rsc))) {
    if (styles.has(m[1])) continue;
    try {
      const o = objectAt(rsc, m.index);
      if (o?.siteName) styles.set(o.id, o);
    } catch {}
  }
  return [...styles.values()];
}

// The detail page holds one rich object with typeScale, surfaces, spacing, components, guidelines...
function parseDetail(rsc) {
  const pos = rsc.indexOf('"typeScale"');
  if (pos === -1) return null;
  const span = enclosingObject(rsc, pos);
  if (!span) return null;
  const obj = JSON.parse(rsc.slice(span[0], span[1]));
  // Do / Don't rules are rendered as list items rather than data; collect them as plain text.
  const rules = [...rsc.matchAll(/"children":"((?:Never|Use|Set|Apply|Pair|Allow|Keep|Render|Avoid|Always|Reserve|Limit|Prefer|Don't|Do not)[^"]{20,400})"/g)].map((x) => x[1]);
  if (rules.length) obj.rules = [...new Set(rules)];
  return obj;
}

export async function buildStyleCatalog({ force = false } = {}) {
  const catalogFile = path.join(config.dataDir, "styles.json");
  if (!force) {
    try {
      return JSON.parse(await fs.readFile(catalogFile, "utf8"));
    } catch {}
  }
  await fs.mkdir(path.join(config.dataDir, "styles"), { recursive: true });
  const gallery = parseGallery(decodeRsc(await fetchText(BASE + "/")));
  const catalog = [];
  for (const s of gallery) {
    let detail = null;
    try {
      detail = parseDetail(decodeRsc(await fetchText(`${BASE}/style/${s.id}`)));
    } catch (e) {
      console.warn("refero detail failed", s.id, e.message);
    }
    const full = { id: s.id, siteName: s.siteName, url: s.url, colorScheme: s.colorScheme, colors: s.colors?.map(({ name, hex }) => ({ name, hex })), fonts: s.fonts, northStar: s.northStar, screenshotUrl: s.screenshotUrl, ...(detail || {}) };
    await fs.writeFile(path.join(config.dataDir, "styles", `${s.id}.json`), JSON.stringify(full, null, 2));
    catalog.push({
      id: s.id,
      name: s.siteName,
      refUrl: `${BASE}/style/${s.id}`,
      colorScheme: s.colorScheme,
      northStar: s.northStar,
      industry: detail?.industry,
      fonts: s.fonts,
      colors: s.colors?.map((c) => `${c.name} ${c.hex}`),
      radius: detail?.spacing?.radius?.buttons,
    });
  }
  await fs.writeFile(catalogFile, JSON.stringify(catalog, null, 2));
  return catalog;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const c = await buildStyleCatalog({ force: true });
  console.log(`${c.length} styles`);
  for (const s of c) console.log("-", s.name, "|", s.northStar, "|", s.industry);
}
