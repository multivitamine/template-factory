// Job pipeline: queue -> crawl (headless Chrome) -> Claude Code agent -> done.
// Every state change is broadcast so the dashboard can show it live.
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { crawlSite } from "./crawl.js";
import { runAgent } from "./agent.js";
import { buildStyleCatalog } from "./refero.js";

export const bus = new EventEmitter();
export const jobs = new Map();

const LANG_NAMES = { nl: "Dutch", en: "English", de: "German", fr: "French", es: "Spanish" };

async function loadScout(key) {
  const s = JSON.parse(await fs.readFile(path.join(config.scoutDir, `${key}.json`), "utf8"));
  const url = (s.evidence?.[0] || "").split(" ")[0];
  return { key, name: s.displayName || key, url, summary: s.summary || "", languages: s.languages || ["nl"], evidence: s.evidence || [] };
}

function update(job, patch) {
  Object.assign(job, patch);
  if (patch.step) job.steps.push({ at: Date.now(), step: patch.step });
  bus.emit("job", publicJob(job));
}

export function publicJob(j) {
  const { key, name, url, status, step, detail, steps, template, brand, pages, queuedAt, startedAt, finishedAt, costUsd, turns, error, log, runId, model } = j;
  return { key, name, url, status, step, detail, steps, template, brand, pages, queuedAt, startedAt, finishedAt, costUsd, turns, error, log: log.slice(-8), runId, model };
}

// ---- Measurement -------------------------------------------------------------
// Phase boundaries come from the step timeline; everything is in seconds.
const firstAt = (job, step) => job.steps.find((s) => s.step === step)?.at;

export function jobTimings(job) {
  const t0 = job.queuedAt;
  const sec = (a, b) => (a && b ? Math.round((b - a) / 100) / 10 : null);
  const crawlEnd = firstAt(job, "Site crawled");
  const agentStart = firstAt(job, "Agent started");
  const tpl = firstAt(job, "Template chosen");
  // Write events fire once a file is written: "Building homepage" = homepage finished.
  const homeWritten = firstAt(job, "Building homepage");
  const catWritten = firstAt(job, "Building catalog page");
  return {
    key: job.key,
    status: job.status,
    template: job.template?.name || null,
    pages: job.pages,
    waitInQueue: sec(t0, job.startedAt),
    crawl: sec(job.startedAt, crawlEnd),
    analyseAndPick: sec(agentStart, tpl || homeWritten),
    homepage: sec(tpl || agentStart, homeWritten || job.finishedAt),
    catalog: catWritten ? sec(homeWritten, catWritten) : null,
    total: sec(t0, job.finishedAt),
    turns: job.turns ?? null,
    costUsd: job.costUsd ?? null,
    error: job.error || null,
  };
}

const pct = (arr, p) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};

export const runs = new Map();

export function runSummary(run) {
  const list = run.keys.map((k) => jobs.get(k)).filter(Boolean);
  const timings = list.map(jobTimings);
  const done = timings.filter((t) => t.status === "done");
  const totals = done.map((t) => t.total);
  const end = Math.max(run.startedAt, ...list.map((j) => j.finishedAt || 0));
  const finished = list.every((j) => j.status === "done" || j.status === "failed");
  const wallSec = ((finished ? end : Date.now()) - run.startedAt) / 1000;
  const throughputPerMin = done.length && wallSec ? done.length / (wallSec / 60) : null;
  const avg = (k) => {
    const v = done.map((t) => t[k]).filter((x) => x != null);
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
  };
  const meanTotal = avg("total");
  return {
    runId: run.id,
    model: run.model,
    concurrency: config.concurrency,
    sites: list.length,
    done: done.length,
    failed: timings.filter((t) => t.status === "failed").length,
    finished,
    wallSec: Math.round(wallSec),
    p50: pct(totals, 50),
    p95: pct(totals, 95),
    max: totals.length ? Math.max(...totals) : null,
    avgPhases: { crawl: avg("crawl"), analyseAndPick: avg("analyseAndPick"), homepage: avg("homepage"), catalog: avg("catalog") },
    throughputPerMin: throughputPerMin && Math.round(throughputPerMin * 100) / 100,
    // Live-event target: 40 sites in 20 minutes = 2 sites/min.
    target: { sites: 40, minutes: 20, neededPerMin: 2 },
    projected40Min: throughputPerMin ? Math.round((40 / throughputPerMin) * 10) / 10 : null,
    // If capacity is only limited by agent slots: waves of `concurrency` agents each taking ~mean time.
    projected40MinIfSlotsOnly: meanTotal ? Math.round(((Math.ceil(40 / config.concurrency) * meanTotal) / 60) * 10) / 10 : null,
    totalCostUsd: Math.round(done.reduce((a, t) => a + (t.costUsd || 0), 0) * 100) / 100,
    jobs: timings,
  };
}

async function maybeFinishRun(runId) {
  const run = runs.get(runId);
  if (!run || run.reported) return;
  const summary = runSummary(run);
  if (!summary.finished) return;
  run.reported = true;
  const dir = path.join(config.dataDir, "runs");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${run.id}.json`), JSON.stringify(summary, null, 2));
  bus.emit("run", summary);
}

function render(template, vars) {
  return template.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? "");
}

async function runJob(job) {
  const dir = path.join(config.outputDir, job.key);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(path.join(dir, "crawl"), { recursive: true });
  update(job, { status: "running", step: "Crawling site", startedAt: Date.now() });

  let crawl;
  try {
    crawl = await crawlSite({
      url: job.url,
      evidence: job.evidence,
      outDir: path.join(dir, "crawl"),
      onStep: (d) => { job.log.push(d); update(job, { detail: d }); },
    });
  } catch (e) {
    return update(job, { status: "failed", step: "Crawl failed", error: e.message, finishedAt: Date.now() });
  }
  const hasCatalog = !!crawl.catalog && crawl.catalog.products.length >= 2;
  update(job, { step: "Site crawled", detail: hasCatalog ? `homepage + catalog (${crawl.catalog.products.length} products)` : "homepage only (no catalog found)" });

  const prompt = render(await fs.readFile(path.join(config.root, "prompts/build-site.md"), "utf8"), {
    name: job.name,
    url: job.url,
    summary: job.summary,
    language: LANG_NAMES[job.languages[0]] || job.languages[0],
    stylesDir: config.dataDir.replace(/\\/g, "/"),
    catalogNote: hasCatalog ? " and of one catalog page" : "",
    catalogFiles: hasCatalog ? "- `crawl/catalog.png` and `crawl/catalog-full.jpg`: their catalog page (" + crawl.catalog.url + ")" : "",
    catalogPageJson: hasCatalog ? ', "catalog.html"' : "",
    catalogStep: hasCatalog
      ? "5. **Build `catalog.html`**: one catalog/listing page in the same new design with the same header and footer, showing the real products from `facts.json` → `catalog.products` (image, name, price), a simple filter/sort bar (visual only) and a product grid."
      : "There is no catalog on this site, so only build the homepage.",
    catalogLinkNote: hasCatalog ? " and `catalog.html`" : "",
  });

  update(job, { step: "Agent started", detail: `claude -p (${job.model})` });
  const result = await runAgent({
    cwd: dir,
    model: job.model,
    prompt,
    onEvent: (e) => {
      if (e.detail) job.log.push(e.detail);
      update(job, e.step && e.step !== job.step ? { step: e.step, detail: e.detail } : { detail: e.detail });
      if (e.step === "Template chosen") readBrand(job, dir);
    },
  });
  await readBrand(job, dir);
  const pages = [];
  for (const p of ["index.html", "catalog.html"]) {
    try { await fs.access(path.join(dir, p)); pages.push(p); } catch {}
  }
  update(job, {
    status: pages.length ? "done" : "failed",
    step: pages.length ? "Done" : "Agent failed",
    detail: result.ok ? `${result.turns} turns` : result.error,
    pages,
    costUsd: result.costUsd,
    turns: result.turns,
    error: result.ok ? null : result.error,
    finishedAt: Date.now(),
  });
}

async function readBrand(job, dir) {
  try {
    const b = JSON.parse(await fs.readFile(path.join(dir, "brand.json"), "utf8"));
    update(job, { brand: b.brand, template: b.template });
  } catch {}
}

// Simple concurrency-limited queue.
const queue = [];
let running = 0;
function pump() {
  while (running < config.concurrency && queue.length) {
    const job = queue.shift();
    running++;
    runJob(job)
      .catch((e) => update(job, { status: "failed", step: "Error", error: e.message, finishedAt: Date.now() }))
      .finally(() => { running--; maybeFinishRun(job.runId); pump(); });
  }
}

// `copies` > 1 repeats every site (e.g. 10 sites x 4 = 40 visitors) to load-test the live-event scenario.
export async function startAll(keys = config.sites, copies = 1, model = config.model) {
  if ([...jobs.values()].some((j) => j.status === "running" || j.status === "queued")) return [];
  await buildStyleCatalog(); // cached after the first run
  jobs.clear(); // the dashboard shows one run at a time; old reports stay in data/runs
  const started = [];
  const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const run = { id: runId, startedAt: Date.now(), keys: started, model };
  for (let c = 1; c <= copies; c++) {
    for (const site of keys) {
      const id = copies > 1 ? `${site}-${c}` : site;
      const scout = await loadScout(site);
      const job = { ...scout, key: id, site, name: copies > 1 ? `${scout.name} #${c}` : scout.name, runId, model, queuedAt: Date.now(), status: "queued", step: "Queued", detail: "", steps: [], log: [], pages: [] };
      jobs.set(id, job);
      queue.push(job);
      bus.emit("job", publicJob(job));
      started.push(id);
    }
  }
  if (started.length) {
    runs.set(runId, run);
    bus.emit("run", runSummary(run));
  }
  pump();
  return started;
}
