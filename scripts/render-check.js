// Renders a template with a sample and screenshots it: node scripts/render-check.js <templateId> <site> [palette]
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { renderTemplate } from "../lib/render.js";
import { screenshot } from "../lib/shots.js";

const [id, site, palette = "brand"] = process.argv.slice(2);
const content = JSON.parse(await fs.readFile(path.join(config.root, "factory/samples", `${site}.json`), "utf8"));
const pages = await renderTemplate({ templateDir: path.join(config.root, "templates", id), content, templateName: id, palette });
const out = path.join(config.root, "templates/_check");
await fs.mkdir(out, { recursive: true });
for (const [f, html] of Object.entries(pages)) await fs.writeFile(path.join(out, `${id}-${site}-${f}`), html);
const r = await screenshot(`http://localhost:${config.port}/tpl/_check/${id}-${site}-index.html`, path.join(out, `${id}-${site}.jpg`));
console.log(path.join(out, `${id}-${site}.jpg`), JSON.stringify(r));
process.exit(0);
