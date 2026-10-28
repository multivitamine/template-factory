// Re-applies the logo light/dark rule to cached samples (no model call needed).
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { logoIsLightFromFacts } from "../lib/fill.js";

const dir = path.join(config.root, "factory", "samples");
for (const f of await fs.readdir(dir)) {
  const site = f.replace(".json", "");
  const sample = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
  const facts = JSON.parse(await fs.readFile(path.join(config.outputDir, site, "crawl", "facts.json"), "utf8"));
  const light = logoIsLightFromFacts(facts);
  if (light != null) sample.brand.logoIsLight = light;
  await fs.writeFile(path.join(dir, f), JSON.stringify(sample, null, 2));
  console.log(site, "logoIsLight =", sample.brand.logoIsLight);
}
