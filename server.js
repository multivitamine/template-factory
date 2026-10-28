import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import QRCode from "qrcode";
import { config } from "./config.js";
import { bus, jobs, publicJob, runs, runSummary, startAll } from "./lib/jobs.js";
import { buildTemplates, factoryBus, loadTemplates, publicTemplate, rateTemplate, templates, templatesDir } from "./lib/factory.js";

await loadTemplates();

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

// Prefer the real home/office network over virtual adapters (WSL, Hyper-V, VPN).
function lanIp() {
  if (process.env.PUBLIC_HOST) return process.env.PUBLIC_HOST;
  const addrs = Object.entries(os.networkInterfaces())
    .filter(([name]) => !/vEthernet|WSL|Hyper-V|VirtualBox|VMware|Loopback/i.test(name))
    .flatMap(([, list]) => list || [])
    .filter((a) => a.family === "IPv4" && !a.internal && !a.address.startsWith("169."))
    .map((a) => a.address);
  return addrs.find((a) => a.startsWith("192.168.")) || addrs.find((a) => a.startsWith("10.")) || addrs[0] || "localhost";
}
const scanUrl = `http://${lanIp()}:${config.port}/scan`;

async function sendFile(res, file) {
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

const json = (res, data, status = 200) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = decodeURIComponent(url.pathname);

  if (p === "/") return sendFile(res, path.join(config.root, "public/index.html"));
  if (p === "/scan") return sendFile(res, path.join(config.root, "public/scan.html"));

  if (p === "/api/qr.svg") {
    res.writeHead(200, { "content-type": "image/svg+xml" });
    return res.end(await QRCode.toString(scanUrl, { type: "svg", margin: 1, color: { dark: "#0d0f12", light: "#ffffff" } }));
  }

  if (p === "/api/config") return json(res, { scanUrl, sites: config.sites, model: config.model, models: config.models, concurrency: config.concurrency });

  // Model switch on the dashboard: becomes the default for every start (also from the phone scan page).
  if (p === "/api/model" && req.method === "POST") {
    let body = "";
    for await (const c of req) body += c;
    const { model } = JSON.parse(body || "{}");
    if (!config.models.includes(model)) return json(res, { error: "unknown model" }, 400);
    config.model = model;
    return json(res, { model });
  }

  if (p === "/api/start" && req.method === "POST") {
    let body = "";
    for await (const c of req) body += c;
    const { keys, copies, model } = body ? JSON.parse(body) : {};
    const n = Math.min(10, Math.max(1, Number(copies) || 1));
    const started = await startAll(keys?.length ? keys.filter((k) => config.sites.includes(k)) : config.sites, n, config.models.includes(model) ? model : config.model);
    return json(res, { started });
  }

  if (p === "/api/jobs") return json(res, [...jobs.values()].map(publicJob));

  // Live measurements of the latest run (also saved to data/runs/<id>.json when it finishes).
  if (p === "/api/run") {
    const latest = [...runs.values()].pop();
    return json(res, latest ? runSummary(latest) : null);
  }

  if (p === "/api/events") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    const send = (j) => res.write(`data: ${JSON.stringify(j)}\n\n`);
    for (const j of jobs.values()) send(publicJob(j));
    bus.on("job", send);
    const ping = setInterval(() => res.write(": ping\n\n"), 15000);
    req.on("close", () => { bus.off("job", send); clearInterval(ping); });
    return;
  }

  // ---- Template factory ----
  if (p === "/factory") return sendFile(res, path.join(config.root, "public/factory.html"));
  if (p === "/api/factory/templates") return json(res, [...templates.values()].map(publicTemplate));
  if (p === "/api/factory/build" && req.method === "POST") {
    let body = "";
    for await (const c of req) body += c;
    const { ids, model } = JSON.parse(body || "{}");
    return json(res, { started: buildTemplates({ ids, model: config.models.includes(model) ? model : "opus" }) });
  }
  if (p === "/api/factory/rate" && req.method === "POST") {
    let body = "";
    for await (const c of req) body += c;
    const { id, stars } = JSON.parse(body || "{}");
    return json(res, await rateTemplate(id, stars));
  }
  if (p === "/api/factory/events") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    const send = (t) => res.write(`data: ${JSON.stringify(t)}\n\n`);
    for (const t of templates.values()) send(publicTemplate(t));
    factoryBus.on("tpl", send);
    const ping = setInterval(() => res.write(": ping\n\n"), 15000);
    req.on("close", () => { factoryBus.off("tpl", send); clearInterval(ping); });
    return;
  }
  const tm = p.match(/^\/tpl\/([\w-]+)\/(.+)$/);
  if (tm) {
    const file = path.normalize(path.join(templatesDir, tm[1], tm[2]));
    if (!file.startsWith(templatesDir)) return res.writeHead(403).end();
    return sendFile(res, file);
  }

  // Generated sites + crawl screenshots: /sites/<key>/<file>
  const m = p.match(/^\/sites\/([\w-]+)\/(.+)$/);
  if (m) {
    const file = path.normalize(path.join(config.outputDir, m[1], m[2]));
    if (!file.startsWith(config.outputDir)) return res.writeHead(403).end();
    return sendFile(res, file);
  }

  res.writeHead(404).end("Not found");
});

server.listen(config.port, () => {
  console.log(`Dashboard:  http://localhost:${config.port}`);
  console.log(`Scan page:  ${scanUrl}  (phone on the same Wi-Fi)`);
  console.log(`Agents: ${config.concurrency} at once, model ${config.model}`);
});
