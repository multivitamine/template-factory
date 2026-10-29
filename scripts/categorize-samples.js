// Gives every product in factory/samples/*.json a category and turns catalog.filters into 2–6 real product groups,
// so the shop runtime (search + filters) works in the gallery previews. One small Claude call per sample.
// Usage: node scripts/categorize-samples.js [model]   (default sonnet)
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { runClaudeText } from "../lib/agent.js";
import { parseJson } from "../lib/fill.js";

const model = process.argv[2] || "sonnet";
const dir = path.join(config.root, "factory", "samples");
const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));

const results = await Promise.all(files.map(async (f) => {
  const file = path.join(dir, f);
  const c = JSON.parse(await fs.readFile(file, "utf8"));
  if (!c.products?.length) return `${f}: no products, skipped`;
  const prompt = `Group the products of this shop for a filter bar. Reply with ONLY one JSON object, no prose.
Shop: ${c.brand?.name} (language: ${c.brand?.lang || "nl"})
Current filter labels on their site (may contain sort options or an "all" item: ignore those): ${JSON.stringify(c.catalog?.filters || [])}
Products (index: name · tag):
${c.products.map((p, i) => `${i}: ${p.name}${p.tag ? ` · ${p.tag}` : ""}`).join("\n")}

Rules: 2–6 filters, real product groups in the shop's language, short (1–3 words), no sort options, no "all".
Prefer their own labels when they are real groups. Every product gets exactly one of the filters. Each filter must have at least one product.
Reply: { "filters": ["…"], "categories": ["filter for product 0", "filter for product 1", …] }`;
  const r = await runClaudeText({ prompt, model });
  if (!r.ok) return `${f}: FAILED ${r.error}`;
  let out;
  try { out = parseJson(r.text); } catch (e) { return `${f}: FAILED invalid JSON`; }
  const filters = (out.filters || []).filter((x) => typeof x === "string" && x.trim()).slice(0, 6);
  if (!filters.length || out.categories?.length !== c.products.length) return `${f}: FAILED wrong shape`;
  c.products.forEach((p, i) => (p.category = filters.includes(out.categories[i]) ? out.categories[i] : null));
  c.featured = c.products.slice(0, 4);
  c.catalog.filters = filters.filter((x) => c.products.some((p) => p.category === x));
  await fs.writeFile(file, JSON.stringify(c, null, 2));
  const counts = c.catalog.filters.map((x) => `${x} ${c.products.filter((p) => p.category === x).length}`).join(", ");
  return `${f}: ${counts} · $${(r.costUsd || 0).toFixed(3)}`;
}));
console.log(results.join("\n"));
