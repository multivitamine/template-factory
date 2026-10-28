import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.setViewport({ width: 1440, height: 760 });
await p.goto("http://localhost:4321/", { waitUntil: "networkidle2" });
await p.click('.models button[data-m="opus"]');
await new Promise((r) => setTimeout(r, 800));
const cfg = await (await fetch("http://localhost:4321/api/config")).json();
console.log("server model after click:", cfg.model, "| page errors:", errors);
await p.screenshot({ path: "C:/claude projects/qr code test/output/dash5.jpg", type: "jpeg", quality: 70, clip: { x: 0, y: 60, width: 360, height: 700 } });
// Reset to sonnet so nothing changes unexpectedly.
await p.click('.models button[data-m="sonnet"]');
await new Promise((r) => setTimeout(r, 500));
console.log("reset to:", (await (await fetch("http://localhost:4321/api/config")).json()).model);
await b.close();
