// Crawled facts -> template content JSON (see factory/contract.md). One tool-less Claude call.
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { runClaudeText } from "./agent.js";

const LANG_NAMES = { nl: "Dutch", en: "English", de: "German", fr: "French", es: "Spanish" };

// Keep the prompt small: drop bulky fields the model doesn't need.
const usableUrl = (u) => typeof u === "string" && /^https?:\/\//.test(u) && u.length < 600;
export function trimFacts(facts) {
  const page = (p) => p && {
    url: p.url, title: p.title, description: p.description,
    logo: p.logo?.svg ? { note: "inline svg" } : usableUrl(p.logo?.src) ? p.logo : null,
    styles: p.styles, topBackgrounds: p.topBackgrounds, topTextColors: p.topTextColors, themeColor: p.themeColor,
    nav: p.nav?.slice(0, 20).map((n) => n.text), headings: p.headings,
    // Inline base64 images (data: URIs) can be megabytes: never send them.
    products: p.products?.map((x) => ({ ...x, image: usableUrl(x.image) ? x.image : null })),
    images: p.images?.filter((i) => usableUrl(i.src)),
    text: p.text?.slice(0, 3500),
  };
  return { home: page(facts.home), catalog: page(facts.catalog) };
}

function luminanceOf(css) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(css || "");
  if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) return null; // transparent: unknown
  return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
}

// A logo that sits on a dark header in the original is (almost always) a light logo.
export function logoIsLightFromFacts(facts) {
  const home = facts.home || {};
  if (/(white|wit|light|negative|inverse)/i.test(home.logo?.src || "")) return true;
  const lum = luminanceOf(home.styles?.header?.background);
  return lum == null ? null : lum < 0.35;
}

export function parseJson(text) {
  const s = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(s);
}

export async function fillContent({ scout, factsFile, model = "sonnet" }) {
  const facts = JSON.parse(await fs.readFile(factsFile, "utf8"));
  const tpl = await fs.readFile(path.join(config.root, "prompts/fill.md"), "utf8");
  const prompt = tpl.replace(/{{(\w+)}}/g, (_, k) => ({
    name: scout.name, url: scout.url, summary: scout.summary,
    language: LANG_NAMES[scout.languages?.[0]] || "Dutch",
    catalogNote: facts.catalog ? " + one catalog page" : "",
    facts: JSON.stringify(trimFacts(facts)),
  })[k] ?? "");
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = await runClaudeText({ prompt, model });
    if (!r.ok) { if (attempt === 2) throw new Error(r.error); continue; }
    try {
      const content = normalize(parseJson(r.text));
      const light = logoIsLightFromFacts(facts);
      if (light != null) content.brand.logoIsLight = light;
      return { content, costUsd: r.costUsd, durationMs: r.durationMs };
    } catch (e) {
      if (attempt === 2) throw new Error("fill: invalid JSON: " + e.message);
    }
  }
}

// Fill gaps so templates can rely on the shape.
export function normalize(c) {
  c.brand ??= {};
  c.brand.colors ??= {};
  c.nav ??= [];
  c.hero ??= { title: c.brand.name };
  c.usps ??= [];
  c.categories ??= [];
  c.products = (c.products || []).slice(0, 24);
  c.featured = c.products.slice(0, 4);
  c.hasProducts = c.products.length > 0;
  c.hasCatalog = c.products.length >= 2;
  c.stats ??= [];
  c.gallery ??= [];
  c.contact ??= {};
  c.footerLinks ??= [];
  c.catalog ??= { title: "Assortiment", intro: "", filters: [], count: `${c.products.length} producten` };
  c.brand.initials ||= (c.brand.name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return c;
}
