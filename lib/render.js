// Renders a factory template with customer content (Mustache) and injects the brand colours.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Mustache from "mustache";

const shopRuntimeFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "shop-runtime.js");

function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function brandTokenStyle(colors = {}) {
  const vars = [];
  if (luminance(colors.primary) != null) {
    vars.push(`--c-primary:${colors.primary}`);
    vars.push(`--c-on-primary:${luminance(colors.primary) > 0.4 ? "#111111" : "#ffffff"}`);
  }
  if (luminance(colors.accent) != null) vars.push(`--c-accent:${colors.accent}`);
  return vars.length ? `<style id="brand-tokens">:root{${vars.join(";")}}</style>` : "";
}

// Marks the first element of every product loop and filter loop, so lib/shop-runtime.js can find
// product cards and filter buttons in any template.
function markShopHooks(html) {
  return html
    .replace(/(\{\{#products\}\}\s*<[a-zA-Z][\w-]*)/g, '$1 data-shop-item="{{shopIndex}}"')
    .replace(/(\{\{#catalog\.filters\}\}\s*(?:<li\b[^>]*>\s*)?<[a-zA-Z][\w-]*)/g, '$1 data-shop-filter="{{.}}"');
}

function shopScripts(content, page, runtime) {
  const data = {
    page, lang: content.brand?.lang || "nl", count: content.catalog?.count || "",
    products: (content.products || []).map((p) => ({ name: p.name || "", tag: p.tag || "", category: p.category || "" })),
  };
  // JSON inside <script>: escape "<" so product text can never close the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script id="shop-data" type="application/json">${json}</script>\n<script id="shop-runtime">${runtime}</script>\n`;
}

// palette: "brand" (inject customer colours) or "template" (keep the template's own defaults).
// shop: make search and filter buttons work (booth pages); factory previews leave it off.
export async function renderTemplate({ templateDir, content, templateName, palette = "brand", shop = false }) {
  const products = (content.products || []).map((p, i) => ({ ...p, shopIndex: i }));
  const view = { ...content, products, meta: { templateName, year: String(new Date().getFullYear()), ...(content.meta || {}) } };
  const runtime = shop ? await fs.readFile(shopRuntimeFile, "utf8") : "";
  const out = {};
  for (const [src, dest] of [["template.html", "index.html"], ["catalog.html", "catalog.html"]]) {
    let html;
    try { html = await fs.readFile(path.join(templateDir, src), "utf8"); } catch { continue; }
    let rendered = Mustache.render(shop ? markShopHooks(html) : html, view);
    if (palette === "brand") rendered = rendered.replace(/<\/head>/i, `${brandTokenStyle(content.brand?.colors)}</head>`);
    if (shop) rendered = rendered.replace(/<\/body>/i, `${shopScripts(content, dest === "catalog.html" ? "catalog" : "home", runtime)}</body>`);
    out[dest] = rendered;
  }
  return out;
}
