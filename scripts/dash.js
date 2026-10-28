// Screenshot of the dashboard: node scripts/dash.js <out.jpg>
import puppeteer from "puppeteer-core";
import { config } from "../config.js";

const out = process.argv[2] || `${config.outputDir}/dashboard.jpg`;
const browser = await puppeteer.launch({ executablePath: config.chromePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100 });
await page.goto(`http://localhost:${config.port}/`, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: out, type: "jpeg", quality: 70 });
await browser.close();
console.log(out);
