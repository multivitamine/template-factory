// Template factory: art direction -> build (agent) -> render + screenshots -> critique & fix (agent) -> final screenshots.
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { directions } from "../factory/directions.js";
import { runAgent } from "./agent.js";
import { fillContent } from "./fill.js";
import { renderTemplate } from "./render.js";
import { screenshot } from "./shots.js";

export const factoryBus = new EventEmitter();
export const templatesDir = path.join(config.root, "templates");
const samplesDir = path.join(config.root, "factory", "samples");
const STEPS = ["Queued", "Building", "Rendering", "Critique", "Final render", "Done"];

export const templates = new Map(); // id -> state

const readJson = async (f, fallback = null) => { try { return JSON.parse(await fs.readFile(f, "utf8")); } catch { return fallback; } };

export async function loadTemplates() {
  for (const d of directions) {
    const saved = await readJson(path.join(templatesDir, d.id, "status.json"));
    const interrupted = saved && !["done", "failed"].includes(saved.status);
    templates.set(d.id, {
      id: d.id, name: d.name, sectors: d.sectors, sample: d.sample, stress: d.stress,
      status: "todo", step: "", detail: "", steps: [], rating: null,
      ...(saved || {}),
      ...(interrupted ? { status: "failed", step: "Interrupted", error: "server restarted during build" } : {}),
    });
  }
  return templates;
}

function update(t, patch) {
  Object.assign(t, patch);
  if (patch.step) t.steps.push({ step: patch.step, at: Date.now() });
  factoryBus.emit("tpl", publicTemplate(t));
}

async function save(t) {
  await fs.mkdir(path.join(templatesDir, t.id), { recursive: true });
  const { detail, ...rest } = t;
  await fs.writeFile(path.join(templatesDir, t.id, "status.json"), JSON.stringify(rest, null, 2));
}

export function publicTemplate(t) {
  const { id, name, sectors, status, step, detail, steps, startedAt, finishedAt, rating, score, costUsd, error, model, meta, version } = t;
  return { id, name, sectors, status, step, detail, steps, startedAt, finishedAt, rating, score, costUsd, error, model, meta, version, stepIndex: STEPS.indexOf(step) };
}

// Sample content per crawled site (fill step), cached in factory/samples.
const sampleLocks = new Map();
export function getSample(site) {
  if (!sampleLocks.has(site)) sampleLocks.set(site, (async () => {
    const file = path.join(samplesDir, `${site}.json`);
    const cached = await readJson(file);
    if (cached) return cached;
    const scout = JSON.parse(await fs.readFile(path.join(config.scoutDir, `${site}.json`), "utf8"));
    const { content } = await fillContent({
      scout: { name: scout.displayName, url: (scout.evidence?.[0] || "").split(" ")[0], summary: scout.summary, languages: scout.languages },
      factsFile: path.join(config.outputDir, site, "crawl", "facts.json"),
    });
    await fs.mkdir(samplesDir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(content, null, 2));
    return content;
  })().catch((e) => { sampleLocks.delete(site); throw e; }));
  return sampleLocks.get(site);
}

async function renderAndShoot(t, dir, prefix = "") {
  const sample = await getSample(t.sample);
  const stress = await getSample(t.stress);
  const base = `http://localhost:${config.port}/tpl/${t.id}`;
  for (const [folder, content] of [["preview", sample], ["preview-stress", stress]]) {
    const pages = await renderTemplate({ templateDir: dir, content, templateName: t.name });
    await fs.mkdir(path.join(dir, folder), { recursive: true });
    for (const [file, html] of Object.entries(pages)) await fs.writeFile(path.join(dir, folder, file), html);
  }
  const shots = path.join(dir, "shots");
  await fs.mkdir(shots, { recursive: true });
  const results = {
    "home-desktop": await screenshot(`${base}/preview/index.html`, path.join(shots, `${prefix}home-desktop.jpg`)),
    "home-mobile": await screenshot(`${base}/preview/index.html`, path.join(shots, `${prefix}home-mobile.jpg`), { width: 390, height: 844, maxHeight: 5000 }),
    "home-stress": await screenshot(`${base}/preview-stress/index.html`, path.join(shots, `${prefix}home-stress.jpg`)),
    "catalog-desktop": await screenshot(`${base}/preview/catalog.html`, path.join(shots, `${prefix}catalog-desktop.jpg`)),
  };
  const issues = [];
  for (const [name, r] of Object.entries(results)) {
    if (r.errors.length) issues.push(`- ${name}: JavaScript errors: ${r.errors.slice(0, 3).join(" | ")}`);
    if (r.overflowX) issues.push(`- ${name}: horizontal overflow (page wider than viewport)`);
  }
  return issues;
}

async function buildOne(t, model) {
  const d = directions.find((x) => x.id === t.id);
  const dir = path.join(templatesDir, t.id);
  await fs.mkdir(dir, { recursive: true });
  update(t, { status: "running", step: "Building", detail: "preparing sample content", startedAt: Date.now(), finishedAt: null, error: null, model, steps: [], costUsd: 0, rating: null });

  const sample = await getSample(d.sample);
  await getSample(d.stress);
  await fs.writeFile(path.join(dir, "sample.json"), JSON.stringify(sample, null, 2));
  const [contract, buildTpl, critiqueTpl] = await Promise.all(
    ["factory/contract.md", "prompts/factory-build.md", "prompts/factory-critique.md"].map((f) => fs.readFile(path.join(config.root, f), "utf8")));
  const fill = (tpl, extra = {}) => tpl.replace(/{{(\w+)}}/g, (_, k) => ({
    id: d.id, name: d.name, brief: d.brief, type: d.type, signature: d.signature, sectors: d.sectors.join(", "),
    sectorsJson: JSON.stringify(d.sectors), contract, sampleName: sample.brand?.name || d.sample, ...extra,
  })[k] ?? "");

  const onEvent = (e) => update(t, { detail: e.detail });
  update(t, { detail: `designing with ${model}` });
  const build = await runAgent({ cwd: dir, prompt: fill(buildTpl), model, onEvent, timeoutMs: config.factoryAgentTimeoutMs });
  t.costUsd += build.costUsd || 0;
  try { await fs.access(path.join(dir, "template.html")); } catch {
    throw new Error("build produced no template.html: " + (build.error || build.text || ""));
  }

  update(t, { step: "Rendering", detail: "rendering with 2 brands + screenshots" });
  const issues = await renderAndShoot(t, dir, "before-");
  // The critique reads the unprefixed names; copy the "before" shots there.
  for (const n of ["home-desktop", "home-mobile", "home-stress", "catalog-desktop"])
    await fs.copyFile(path.join(dir, "shots", `before-${n}.jpg`), path.join(dir, "shots", `${n}.jpg`));

  update(t, { step: "Critique", detail: "jury round: judging and fixing" });
  const stress = await getSample(d.stress);
  const critique = await runAgent({
    cwd: dir, model, onEvent, timeoutMs: config.factoryAgentTimeoutMs,
    prompt: fill(critiqueTpl, { stressName: stress.brand?.name || d.stress, issues: issues.length ? `\nAutomatic checks found:\n${issues.join("\n")}` : "" }),
  });
  t.costUsd += critique.costUsd || 0;

  update(t, { step: "Final render", detail: "final screenshots" });
  await renderAndShoot(t, dir);
  const meta = await readJson(path.join(dir, "meta.json"));
  const crit = await readJson(path.join(dir, "critique.json"));
  update(t, { status: "done", step: "Done", detail: crit ? `jury: ${crit.scoreBefore} → ~${crit.scoreAfterEstimate}` : "", finishedAt: Date.now(), meta, score: crit, version: Date.now() });
}

// Queue
const queue = [];
let running = 0;
function pump() {
  while (running < config.factoryConcurrency && queue.length) {
    const { t, model } = queue.shift();
    running++;
    buildOne(t, model)
      .catch((e) => update(t, { status: "failed", step: "Failed", error: e.message, finishedAt: Date.now() }))
      .finally(async () => { running--; await save(t); pump(); });
  }
}

export function buildTemplates({ ids, model = "opus", onlyMissing = true } = {}) {
  const picked = [];
  for (const t of templates.values()) {
    if (ids?.length && !ids.includes(t.id)) continue;
    if (["queued", "running"].includes(t.status)) continue;
    if (onlyMissing && !ids?.length && t.status === "done") continue;
    update(t, { status: "queued", step: "Queued", detail: "", steps: [], error: null, queuedAt: Date.now() });
    t.steps = [{ step: "Queued", at: Date.now() }];
    queue.push({ t, model });
    picked.push(t.id);
  }
  pump();
  return picked;
}

export async function rateTemplate(id, stars) {
  const t = templates.get(id);
  if (!t) return null;
  update(t, { rating: Math.max(0, Math.min(5, Number(stars) || 0)) });
  await save(t);
  return publicTemplate(t);
}
