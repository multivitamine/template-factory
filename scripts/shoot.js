// Screenshots generated pages for a quick visual check: node scripts/shoot.js <key> [page]
import puppeteer from "puppeteer-core";
import { config } from "../config.js";

const [key, page = "index.html", width = "1440"] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: config.chromePath, headless: true });
const tab = await browser.newPage();
await tab.setViewport({ width: Number(width), height: 900 });
await tab.goto(`http://localhost:${config.port}/sites/${key}/${page}`, { waitUntil: "networkidle2", timeout: 60000 });
const out = `${config.outputDir}/${key}/shot-${page.replace(".html", "")}-${width}.jpg`;
await tab.screenshot({ path: out, type: "jpeg", quality: 70, fullPage: true });
await browser.close();
console.log(out);
