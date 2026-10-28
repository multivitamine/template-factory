// Builds factory/samples/<site>.json for every crawled site (in parallel) and reports timings.
import { config } from "../config.js";
import { getSample } from "../lib/factory.js";

const t0 = Date.now();
const results = await Promise.all(config.sites.map(async (site) => {
  const s = Date.now();
  try {
    const c = await getSample(site);
    return `${site}: ${((Date.now() - s) / 1000).toFixed(1)}s · ${c.products.length} products · primary ${c.brand.colors?.primary} · logoIsLight ${c.brand.logoIsLight}`;
  } catch (e) {
    return `${site}: FAILED ${e.message}`;
  }
}));
console.log(results.join("\n"));
console.log(`total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
