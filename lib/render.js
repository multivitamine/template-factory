// Renders a factory template with customer content (Mustache) and injects the brand colours.
import fs from "node:fs/promises";
import path from "node:path";
import Mustache from "mustache";

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

// palette: "brand" (inject customer colours) or "template" (keep the template's own defaults).
export async function renderTemplate({ templateDir, content, templateName, palette = "brand" }) {
  const view = { ...content, meta: { templateName, year: String(new Date().getFullYear()), ...(content.meta || {}) } };
  const out = {};
  for (const [src, dest] of [["template.html", "index.html"], ["catalog.html", "catalog.html"]]) {
    let html;
    try { html = await fs.readFile(path.join(templateDir, src), "utf8"); } catch { continue; }
    let rendered = Mustache.render(html, view);
    if (palette === "brand") rendered = rendered.replace(/<\/head>/i, `${brandTokenStyle(content.brand?.colors)}</head>`);
    out[dest] = rendered;
  }
  return out;
}
