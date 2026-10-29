// Job pipeline: queue -> crawl (headless Chrome) -> content fill + concept pick (Claude) -> render factory template -> done.
// Creative mode (runCreative) takes a finished design and has an agent adapt the concept to the client's own world.
// Every state change is broadcast so the dashboard can show it live.
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { crawlSite } from "./crawl.js";
import { runAgent, runClaudeText } from "./agent.js";
import { screenshot } from "./shots.js";
import { fillContent, parseJson } from "./fill.js";
import { renderTemplate } from "./render.js";
import { conceptBrief, listConcepts, templatesDir } from "./factory.js";

export const bus = new EventEmitter();
export const jobs = new Map();

const LANG_NAMES = { nl: "Dutch", en: "English", de: "German", fr: "French", es: "Spanish" };

async function loadScout(key) {
  let s;
  try {
    s = JSON.parse(await fs.readFile(path.join(config.scoutDir, `${key}.json`), "utf8"));
  } catch {
    // No scout data on this machine: fall back to config.siteUrls plus the cached factory sample.
    if (!config.siteUrls[key]) throw new Error(`no scout file and no config.siteUrls entry for ${key}`);
    let sample = {};
    try { sample = JSON.parse(await fs.readFile(path.join(config.root, "factory/samples", `${key}.json`), "utf8")); } catch {}
    return { key, name: sample.brand?.name || key, url: config.siteUrls[key], summary: sample.brand?.tagline || "", languages: [sample.brand?.lang || "nl"], evidence: [] };
  }
  const url = (s.evidence?.[0] || "").split(" ")[0];
  return { key, name: s.displayName || key, url, summary: s.summary || "", languages: s.languages || ["nl"], evidence: s.evidence || [] };
}

function update(job, patch) {
  Object.assign(job, patch);
  if (patch.step) job.steps.push({ at: Date.now(), step: patch.step });
  bus.emit("job", publicJob(job));
}

export function publicJob(j) {
  const { key, name, url, status, step, detail, steps, template, brand, pages, queuedAt, startedAt, finishedAt, costUsd, turns, error, log, runId, model, path, mode, sourcePath, moonshots } = j;
  return { key, name, url, status, step, detail, steps, template, brand, pages, queuedAt, startedAt, finishedAt, costUsd, turns, error, log: log.slice(-8), runId, model, path, mode, sourcePath, moonshots };
}

// ---- Measurement -------------------------------------------------------------
// Phase boundaries come from the step timeline; everything is in seconds.
const firstAt = (job, step) => job.steps.find((s) => s.step === step)?.at;

export function jobTimings(job) {
  const t0 = job.queuedAt;
  const sec = (a, b) => (a && b ? Math.round((b - a) / 100) / 10 : null);
  const crawlEnd = firstAt(job, "Site crawled");
  const renderStart = firstAt(job, "Rendering");
  return {
    key: job.key,
    // Enough to show the job again on the history page.
    name: job.name,
    url: job.url,
    path: job.path,
    brand: job.brand || null,
    templateId: job.template?.id || null,
    mode: job.mode || "fast",
    sourcePath: job.sourcePath || null,
    why: job.template?.why || null,
    status: job.status,
    template: job.template?.name || null,
    pages: job.pages,
    waitInQueue: sec(t0, job.startedAt),
    crawl: sec(job.startedAt, crawlEnd),
    content: sec(crawlEnd, firstAt(job, "Content ready")),
    concept: sec(crawlEnd, firstAt(job, "Concept chosen")),
    render: sec(renderStart, job.finishedAt),
    total: sec(t0, job.finishedAt),
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
    avgPhases: { crawl: avg("crawl"), content: avg("content"), concept: avg("concept"), render: avg("render") },
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

const fillVars = (template, vars) => template.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? "");

// Claude picks `count` different finished factory concepts for this business in one tool-less call (JSON out).
async function pickConcepts(job, facts, count, skipKeys) {
  const concepts = listConcepts();
  if (!concepts.length) throw new Error("no finished templates in the factory");
  const used = [...jobs.values()].filter((j) => j.runId === job.runId && !skipKeys.includes(j.key) && j.template).map((j) => j.template.id);
  const home = facts.home || {};
  const prompt = fillVars(await fs.readFile(path.join(config.root, "prompts/pick-concept.md"), "utf8"), {
    count: String(count), name: job.name, url: job.url, summary: job.summary || home.description || "",
    facts: JSON.stringify({
      title: home.title, description: home.description, nav: home.nav?.slice(0, 12).map((n) => n.text),
      headings: home.headings?.slice?.(0, 12), colours: home.topBackgrounds?.slice(0, 5),
      products: (facts.catalog?.products || home.products || []).length, text: home.text?.slice(0, 1200),
    }),
    concepts: JSON.stringify(concepts),
    usedNote: used.length ? `
Already given to other businesses in this run (pick something else unless it is clearly the best fit): ${[...new Set(used)].join(", ")}` : "",
  });
  const r = await runClaudeText({ prompt, model: job.model });
  let picks = [];
  try { if (r.ok) picks = parseJson(r.text).picks || []; } catch {}
  const chosen = [];
  for (const p of picks) {
    const c = concepts.find((x) => x.id === p?.id);
    if (c && !chosen.some((x) => x.id === c.id)) chosen.push({ id: c.id, name: c.name, why: p.why || "" });
  }
  // A failed, short or invalid answer should not fail the scan: top up with the best-rated concepts not yet chosen.
  const ranked = [...concepts].sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.jury || 0) - (a.jury || 0));
  for (const c of ranked) {
    if (chosen.length >= count) break;
    if (!chosen.some((x) => x.id === c.id)) chosen.push({ id: c.id, name: c.name, why: `fallback pick (${r.error || "picker gave too few"})`.slice(0, 160) });
  }
  return { templates: chosen.slice(0, count), costUsd: r.costUsd || 0 };
}

// Runs one site as a group of jobs: a normal scan is a group of 1; "N versions of one URL" shares the crawl,
// the content and one concept-pick call, then renders a different concept per job.
async function runGroup(group) {
  if (group[0].mode === "creative") return runCreative(group[0]);
  const [lead] = group;
  const n = group.length;
  const each = (patch) => { for (const j of group) update(j, patch); };
  const dirOf = (j) => path.join(config.outputDir, j.path); // output/<runId>/<key>: history is never overwritten
  for (const j of group) {
    await fs.rm(dirOf(j), { recursive: true, force: true });
    await fs.mkdir(path.join(dirOf(j), "crawl"), { recursive: true });
  }
  each({ status: "running", step: "Crawling site", startedAt: Date.now() });

  let crawl;
  try {
    crawl = await crawlSite({
      url: lead.url,
      evidence: lead.evidence,
      outDir: path.join(dirOf(lead), "crawl"),
      onStep: (d) => { for (const j of group) j.log.push(d); each({ detail: d }); },
    });
  } catch (e) {
    return each({ status: "failed", step: "Crawl failed", error: e.message, finishedAt: Date.now() });
  }
  // Every version keeps its own copy of the crawl (screenshots for the dashboard, facts for later).
  for (const j of group.slice(1)) await fs.cp(path.join(dirOf(lead), "crawl"), path.join(dirOf(j), "crawl"), { recursive: true });
  const hasCatalog = !!crawl.catalog && crawl.catalog.products.length >= 2;
  // A typed-in URL has no scout data: write the copy in the site's own language.
  const lang = (crawl.home?.lang || "").slice(0, 2).toLowerCase();
  if (lead.fromUrl && lang) for (const j of group) j.languages = [lang];
  each({ step: "Site crawled", detail: hasCatalog ? `homepage + catalog (${crawl.catalog.products.length} products)` : "homepage only (no catalog found)" });

  // Content and concepts are independent: run both Claude calls at the same time.
  each({ step: "Writing content", detail: `content + ${n > 1 ? `${n} concept picks` : "concept pick"} (${lead.model})` });
  const [filled, picked] = await Promise.all([
    fillContent({ scout: lead, factsFile: path.join(dirOf(lead), "crawl", "facts.json"), model: lead.model })
      .then((r) => {
        const brandName = r.content.brand.name;
        group.forEach((j, i) => update(j, {
          step: "Content ready", brand: r.content.brand.colors,
          ...(lead.fromUrl && brandName ? { name: n > 1 ? `${brandName} · v${i + 1}` : brandName } : {}),
        }));
        return r;
      }),
    pickConcepts(lead, crawl, n, group.map((j) => j.key))
      .then((r) => {
        group.forEach((j, i) => update(j, { step: "Concept chosen", template: r.templates[i], detail: r.templates[i].why }));
        return r;
      }),
  ]);
  // Shared calls: split the cost evenly over the versions.
  const costUsd = ((filled.costUsd || 0) + picked.costUsd) / n;

  for (const [i, job] of group.entries()) {
    const template = picked.templates[i];
    const dir = dirOf(job);
    await fs.writeFile(path.join(dir, "content.json"), JSON.stringify(filled.content, null, 2));
    update(job, { step: "Rendering", detail: `${template.name} + brand colours`, costUsd });
    const pages = await renderTemplate({ templateDir: path.join(templatesDir, template.id), content: filled.content, templateName: template.name, shop: true });
    for (const [file, html] of Object.entries(pages)) await fs.writeFile(path.join(dir, file), html);
    update(job, {
      status: pages["index.html"] ? "done" : "failed",
      step: pages["index.html"] ? "Done" : "Render failed",
      detail: `${Object.keys(pages).join(" + ")} rendered`,
      pages: Object.keys(pages),
      costUsd,
      error: pages["index.html"] ? null : `template ${template.id} has no template.html`,
      finishedAt: Date.now(),
    });
    // Creative switch on: every finished fast design gets a creative version next to it.
    if (job.autoCreative && pages["index.html"])
      startCreative(job.path, job.model).catch((e) => update(job, { detail: `creative not started: ${e.message}` }));
  }
}

// Simple concurrency-limited queue of groups (see runGroup).
const queue = [];
let running = 0;
function pump() {
  while (running < config.concurrency && queue.length) {
    const group = queue.shift();
    running++;
    runGroup(group)
      .catch((e) => { for (const j of group) if (j.status !== "done") update(j, { status: "failed", step: "Error", error: e.message, finishedAt: Date.now() }); })
      .finally(() => { running--; maybeFinishRun(group[0].runId); pump(); });
  }
}

// `count` = number of simulated scans; sites are cycled, so 40 scans = every site 4x (load-test the live-event scenario).
export async function startAll(keys = config.sites, count = keys.length, model = config.model, creative = false) {
  if ([...jobs.values()].some((j) => j.status === "running" || j.status === "queued")) return [];
  jobs.clear(); // the dashboard shows one run at a time; old reports stay in data/runs
  const started = [];
  const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const run = { id: runId, startedAt: Date.now(), keys: started, model };
  const multi = count > keys.length;
  for (let i = 0; i < count; i++) {
    const site = keys[i % keys.length];
    const c = Math.floor(i / keys.length) + 1;
    const id = multi ? `${site}-${c}` : site;
    const scout = await loadScout(site);
    const job = { ...scout, key: id, site, name: multi ? `${scout.name} #${c}` : scout.name, runId, model, autoCreative: creative, path: `${runId}/${id}`, queuedAt: Date.now(), status: "queued", step: "Queued", detail: "", steps: [], log: [], pages: [] };
    jobs.set(id, job);
    queue.push([job]);
    bus.emit("job", publicJob(job));
    started.push(id);
  }
  if (started.length) {
    runs.set(runId, run);
    bus.emit("run", runSummary(run));
  }
  pump();
  return started;
}

const activeRunId = () => [...jobs.values()].find((j) => j.status === "running" || j.status === "queued")?.runId;

// The run in progress, or a fresh one (which replaces the previous run on the dashboard).
function ensureRun(model) {
  const active = activeRunId();
  if (active) return runs.get(active);
  jobs.clear();
  const id = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  runs.set(id, { id, startedAt: Date.now(), keys: [], model });
  return runs.get(id);
}

// Any URL typed on the dashboard: `versions` designs of that one site, each with a different concept.
// Joins the run in progress, otherwise starts a new one.
export async function startUrl(url, model = config.model, versions = 1, creative = false) {
  const run = ensureRun(model);
  const runId = run.id;
  const host = new URL(url).hostname.replace(/^www\./, "");
  const base = host.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const group = [];
  for (let v = 1; v <= versions; v++) {
    let key = base;
    for (let n = 2; jobs.has(key); n++) key = `${base}-${n}`;
    const name = versions > 1 ? `${host} · v${v}` : host;
    const job = { key, site: key, name, url, summary: "", languages: ["nl"], evidence: [], fromUrl: true, runId, model, autoCreative: creative, path: `${runId}/${key}`, queuedAt: Date.now(), status: "queued", step: "Queued", detail: "", steps: [], log: [], pages: [] };
    jobs.set(key, job);
    run.keys.push(key);
    group.push(job);
    bus.emit("job", publicJob(job));
  }
  run.reported = false;
  queue.push(group);
  bus.emit("run", runSummary(run));
  pump();
  return group.map((j) => j.key);
}

// ---- Creative mode -------------------------------------------------------------------
// A finished fast design is copied, then an agent translates the concept's props, labels and structure to the
// client's own world (prompts/creative-adapt.md), looks at screenshots of its result and fixes what it finds
// (prompts/creative-review.md). If the result still breaks, it is reported as failed; the fast version is untouched.

const exists = (f) => fs.access(f).then(() => true, () => false);

// Details of a finished design: from the live dashboard, or from its saved run report.
async function loadSource(srcPath) {
  const live = [...jobs.values()].find((j) => j.path === srcPath && j.status === "done");
  if (live) return { key: live.key, runId: live.runId, name: live.name, url: live.url, brand: live.brand, template: live.template, inMemory: runs.has(live.runId) };
  const [runId, key] = srcPath.split("/");
  const report = JSON.parse(await fs.readFile(path.join(config.dataDir, "runs", `${runId}.json`), "utf8"));
  const j = report.jobs.find((x) => x.path === srcPath || x.key === key);
  if (!j?.templateId) throw new Error("no record of which concept this design uses");
  return { key, runId, name: j.name || key, url: j.url, brand: j.brand, template: { id: j.templateId, name: j.template, why: j.why }, inMemory: false };
}

export async function startCreative(srcPath, model = config.model) {
  if (!/^[\w-]+\/[\w-]+$/.test(srcPath)) throw new Error("unknown design");
  if (!(await exists(path.join(config.outputDir, srcPath, "index.html")))) throw new Error("that design has no saved pages");
  const src = await loadSource(srcPath);
  // Next to its fast version when that run is still on the dashboard; otherwise in the current (or a new) run.
  const run = src.inMemory ? runs.get(src.runId) : ensureRun(model);
  const base = `${src.key.replace(/-creative(-\d+)?$/, "")}-creative`;
  let key = base;
  for (let n = 2; jobs.has(key) || (await exists(path.join(config.outputDir, run.id, key))); n++) key = `${base}-${n}`;
  const job = {
    key, site: key, name: `${src.name.replace(/ · creative$/, "")} · creative`, url: src.url, brand: src.brand, summary: "", languages: [], evidence: [],
    template: { ...src.template, why: `creative adaptation of ${src.template.name}` }, mode: "creative", sourcePath: srcPath,
    runId: run.id, model, path: `${run.id}/${key}`, queuedAt: Date.now(), status: "queued", step: "Queued", detail: "", steps: [], log: [], pages: [],
  };
  jobs.set(key, job);
  run.keys.push(key);
  run.reported = false;
  queue.push([job]);
  bus.emit("job", publicJob(job));
  bus.emit("run", runSummary(run));
  pump();
  return key;
}

// Screenshots of the adapted pages, plus the automatic checks the factory uses (JS errors, horizontal overflow).
async function checkPages(job) {
  const dir = path.join(config.outputDir, job.path);
  if (!(await exists(path.join(dir, "index.html")))) return ["index.html is missing"];
  await fs.mkdir(path.join(dir, "shots"), { recursive: true });
  const base = `http://localhost:${config.port}/sites/${job.path}`;
  const checks = [["home-desktop", "index.html", {}], ["home-mobile", "index.html", { width: 390, height: 844, maxHeight: 5000 }]];
  if (await exists(path.join(dir, "catalog.html"))) checks.push(["catalog-desktop", "catalog.html", {}]);
  const issues = [];
  for (const [name, file, opts] of checks) {
    const r = await screenshot(`${base}/${file}`, path.join(dir, "shots", `${name}.jpg`), opts);
    if (r.errors.length) issues.push(`${name}: JavaScript errors: ${r.errors.slice(0, 3).join(" | ")}`);
    if (r.overflowX) issues.push(`${name}: horizontal overflow (page wider than viewport)`);
  }
  return issues;
}

async function runCreative(job) {
  const dir = path.join(config.outputDir, job.path);
  update(job, { status: "running", step: "Adapting design", detail: "copying the fast version", startedAt: Date.now() });
  await fs.cp(path.join(config.outputDir, job.sourcePath), dir, { recursive: true });
  await fs.rm(path.join(dir, "shots"), { recursive: true, force: true });
  const content = JSON.parse(await fs.readFile(path.join(dir, "content.json"), "utf8"));
  const concept = conceptBrief(job.template.id);
  const hasCatalogShots = await exists(path.join(dir, "crawl", "catalog.png"));
  const vars = {
    name: content.brand?.name || job.name, url: job.url, language: LANG_NAMES[content.brand?.lang] || "Dutch",
    conceptName: concept.name, brief: concept.brief, type: concept.type, signature: concept.signature,
    catalogShots: hasCatalogShots ? "\n- `crawl/catalog.png`: their current catalog page." : "",
    catalogShot: (await exists(path.join(dir, "catalog.html"))) ? ", `shots/catalog-desktop.jpg`" : "",
  };
  const onEvent = (e) => {
    if (e.detail) job.log.push(e.detail);
    update(job, e.step && e.step !== job.step ? { step: e.step, detail: e.detail } : { detail: e.detail });
  };
  const prompt = async (file, extra = {}) => fillVars(await fs.readFile(path.join(config.root, "prompts", file), "utf8"), { ...vars, ...extra });

  const adapt = await runAgent({ cwd: dir, prompt: await prompt("creative-adapt.md"), model: job.model, onEvent, logName: "creative.log.jsonl" });
  let costUsd = adapt.costUsd || 0;
  if (!adapt.ok) {
    await keepForInspection(dir);
    return update(job, { status: "failed", step: "Creative failed", error: (adapt.error || "agent failed").slice(0, 300), costUsd, finishedAt: Date.now() });
  }

  update(job, { step: "Reviewing", detail: "screenshots + automatic checks", costUsd });
  let issues = await checkPages(job);
  const review = await runAgent({
    cwd: dir, model: job.model, onEvent, logName: "creative-review.log.jsonl",
    prompt: await prompt("creative-review.md", { issues: issues.length ? `\nAutomatic checks found:\n${issues.map((i) => `- ${i}`).join("\n")}` : "" }),
  });
  costUsd += review.costUsd || 0;

  update(job, { step: "Checking", detail: "final screenshots", costUsd });
  issues = await checkPages(job);
  const broken = issues.filter((i) => /JavaScript|missing/.test(i));
  if (broken.length) {
    await keepForInspection(dir);
    return update(job, { status: "failed", step: "Creative failed", error: `kept the fast version: ${broken.join("; ")}`.slice(0, 300), costUsd, finishedAt: Date.now() });
  }
  let notes = null;
  try { notes = JSON.parse(await fs.readFile(path.join(dir, "adapt.json"), "utf8")); } catch {}
  const pages = [];
  for (const p of ["index.html", "catalog.html"]) if (await exists(path.join(dir, p))) pages.push(p);
  update(job, {
    status: "done", step: "Done", pages, costUsd, finishedAt: Date.now(),
    template: { ...job.template, why: notes?.summary || job.template.why },
    detail: issues.length ? `done, with warnings: ${issues.join("; ")}` : `${notes?.translations?.length ?? "?"} concept props translated to their world`,
  });
}

// A failed creative result stays on disk for inspection, but no longer counts as a page.
async function keepForInspection(dir) {
  for (const p of ["index.html", "catalog.html"])
    await fs.rename(path.join(dir, p), path.join(dir, p.replace(".html", ".failed.html"))).catch(() => {});
}

// Shows the moonshots link on a live dashboard card once they exist.
export function markMoonshots(sitePath) {
  const job = [...jobs.values()].find((j) => j.path === sitePath);
  if (job) update(job, { moonshots: true });
}

// ---- History: every saved run report, newest first, with a flag for pages still on disk -----
export async function listHistory() {
  const dir = path.join(config.dataDir, "runs");
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json")); } catch {}
  const out = [];
  for (const f of files.sort().reverse()) {
    let r;
    try { r = JSON.parse(await fs.readFile(path.join(dir, f), "utf8")); } catch { continue; }
    for (const j of r.jobs || []) {
      j.available = false;
      if (j.path) try { await fs.access(path.join(config.outputDir, j.path, "index.html")); j.available = true; } catch {}
      j.moonshots = !!j.path && (await exists(path.join(config.outputDir, j.path, "moonshots.html")));
    }
    out.push({ runId: r.runId, model: r.model, sites: r.sites, done: r.done, failed: r.failed, wallSec: r.wallSec, totalCostUsd: r.totalCostUsd, jobs: r.jobs || [] });
  }
  return out;
}
