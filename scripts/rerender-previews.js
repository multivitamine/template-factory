// Re-renders preview/ and preview-stress/ of every finished template with the current samples and shop runtime.
// No model calls and no new screenshots. Usage: node scripts/rerender-previews.js [templateId …]
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { renderTemplate } from "../lib/render.js";

const root = path.join(config.root, "templates");
const only = process.argv.slice(2);
const readJson = async (f) => JSON.parse(await fs.readFile(f, "utf8"));
const sample = (key) => readJson(path.join(config.root, "factory", "samples", `${key}.json`));

for (const id of (await fs.readdir(root)).filter((d) => !d.startsWith("_") && (!only.length || only.includes(d)))) {
  const status = await readJson(path.join(root, id, "status.json")).catch(() => null);
  if (status?.status !== "done") continue;
  for (const [folder, key] of [["preview", status.sample], ["preview-stress", status.stress]]) {
    const pages = await renderTemplate({ templateDir: path.join(root, id), content: await sample(key), templateName: status.name, shop: true });
    await fs.mkdir(path.join(root, id, folder), { recursive: true });
    for (const [file, html] of Object.entries(pages)) await fs.writeFile(path.join(root, id, folder, file), html);
  }
  console.log(`${id}: ${status.sample} + ${status.stress}`);
}
