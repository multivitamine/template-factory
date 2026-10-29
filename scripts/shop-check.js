// Renders every template with shop:true and drives search + filters in headless Chrome (server must run).
// Usage: node scripts/shop-check.js <content.json>   (products get fake categories, so filters can be checked)
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { config } from "../config.js";
import { renderTemplate } from "../lib/render.js";

const content = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
const filters = content.catalog.filters.slice(0, 4);
content.catalog.filters = filters;
content.products.forEach((p, i) => (p.category = filters[i % filters.length]));
const ids = (await fs.readdir(path.join(config.root, "templates"))).filter((d) => !d.startsWith("_"));
const out = path.join(config.root, "templates/_check/shop");
const b = await puppeteer.launch({ executablePath: config.chromePath, headless: true });
const rows = [];
for (const id of ids) {
  const pages = await renderTemplate({ templateDir: path.join(config.root, "templates", id), content, templateName: id, shop: true });
  await fs.mkdir(path.join(out, id), { recursive: true });
  for (const [f, html] of Object.entries(pages)) await fs.writeFile(path.join(out, id, f), html);
  const p = await b.newPage(); const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto(`http://localhost:${config.port}/tpl/_check/shop/${id}/catalog.html`, { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  const visible = () => p.evaluate(() => new Set([...document.querySelectorAll("[data-shop-item]")].filter((el) => getComputedStyle(el).display !== "none").map((el) => el.dataset.shopItem)).size);
  const r = await p.evaluate(() => ({ items: new Set([...document.querySelectorAll("[data-shop-item]")].map((e) => e.dataset.shopItem)).size, chips: document.querySelectorAll("[data-shop-filter]").length, injected: !!document.querySelector(".shop-search") }));
  const all = await visible();
  let afterFilter = null, pressed = null, afterSearch = null, emptyShown = null;
  if (r.chips) {
    await p.evaluate(() => document.querySelectorAll("[data-shop-filter]")[1]?.click());
    afterFilter = await visible();
    pressed = await p.evaluate(() => document.querySelectorAll("[data-shop-filter]")[1]?.getAttribute("aria-pressed"));
    await p.evaluate(() => document.querySelectorAll("[data-shop-filter]")[1]?.click()); // toggle off
  }
  const input = await p.evaluateHandle(() => document.querySelector(".shop-search") || [...document.querySelectorAll("input")].find((i) => /zoek|search|filter|find|vind|sku/i.test(i.placeholder + i.getAttribute("aria-label") + i.name + i.id) && !i.closest("footer")));
  if (input.asElement()) {
    await p.evaluate((i) => { i.value = "pitaka"; i.dispatchEvent(new Event("input", { bubbles: true })); }, input);
    afterSearch = await visible();
    await p.evaluate((i) => { i.value = "zzzqqq"; i.dispatchEvent(new Event("input", { bubbles: true })); }, input);
    emptyShown = await p.evaluate(() => !document.querySelector(".shop-empty")?.hidden);
    await p.evaluate((i) => { i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); }, input);
  }
  const reset = await visible();
  rows.push({ id, ...r, all, afterFilter, pressed, afterSearch, emptyShown, reset, errors: errors.length ? errors[0].slice(0, 60) : "" });
  await p.close();
}
await b.close();
const expectFilter = content.products.filter((p) => p.category === filters[1]).length;
const expectSearch = content.products.filter((p) => /pitaka/i.test(p.name + p.tag + p.category)).length;
console.log(`products ${content.products.length} · filter "${filters[1]}" should show ${expectFilter} · search "pitaka" should show ${expectSearch}`);
for (const r of rows) {
  const ok = r.items === content.products.length && (!r.chips || (r.afterFilter === expectFilter && r.pressed === "true")) && r.afterSearch === expectSearch && r.emptyShown && r.reset === r.all && !r.errors;
  console.log(`${ok ? "OK  " : "FAIL"} ${r.id.padEnd(18)} items ${r.items} chips ${r.chips} ${r.injected ? "(search added)" : "(own search)"} filter→${r.afterFilter} pressed=${r.pressed} search→${r.afterSearch} empty=${r.emptyShown} reset→${r.reset}/${r.all} ${r.errors}`);
}
process.exit(0);
