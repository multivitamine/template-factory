// Template factory: art direction -> build (agent) -> render + screenshots -> critique & fix (agent) -> final screenshots.
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { directions } from "../factory/directions.js";
import { runAgent, runClaudeText } from "./agent.js";
import { fillContent } from "./fill.js";
import { renderTemplate } from "./render.js";
import { screenshot } from "./shots.js";
import { commitAndPush } from "./git.js";

export const factoryBus = new EventEmitter();
export const templatesDir = path.join(config.root, "templates");
const samplesDir = path.join(config.root, "factory", "samples");
const STEPS = ["Queued", "Building", "Rendering", "Critique", "Final render", "Done"];

export const templates = new Map(); // id -> state

// Hand-written directions plus the ones invented by the art-director step (factory/directions-generated.json).
const generatedFile = path.join(config.root, "factory", "directions-generated.json");
let allDirections = [...directions];
const findDirection = (id) => allDirections.find((x) => x.id === id);

const readJson = async (f, fallback = null) => { try { return JSON.parse(await fs.readFile(f, "utf8")); } catch { return fallback; } };

export async function loadTemplates() {
  allDirections = [...directions, ...(await readJson(generatedFile, []))];
  for (const d of allDirections) {
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
  const { id, name, sectors, status, step, detail, steps, startedAt, finishedAt, rating, score, costUsd, error, model, meta, version, pushed } = t;
  return { id, name, sectors, status, step, detail, steps, startedAt, finishedAt, rating, score, costUsd, error, model, meta, version, pushed, stepIndex: STEPS.indexOf(step) };
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
  const d = findDirection(t.id);
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
  const build = await runAgent({ cwd: dir, prompt: fill(buildTpl), model, onEvent, timeoutMs: config.factoryAgentTimeoutMs, logName: "build.log.jsonl" });
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
    cwd: dir, model, onEvent, timeoutMs: config.factoryAgentTimeoutMs, logName: "critique.log.jsonl",
    prompt: fill(critiqueTpl, { stressName: stress.brand?.name || d.stress, issues: issues.length ? `\nAutomatic checks found:\n${issues.join("\n")}` : "" }),
  });
  t.costUsd += critique.costUsd || 0;
  if (isLimitError(critique.error)) stopAutopilot(critique.error);

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
      .catch((e) => {
        update(t, { status: "failed", step: "Failed", error: e.message, finishedAt: Date.now() });
        if (isLimitError(e.message)) stopAutopilot(e.message);
      })
      .finally(async () => {
        running--;
        await save(t);
        if (t.status === "done") pushTemplate(t);
        pump();
        autopilotTick();
      });
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

// ---- GitHub: every finished template is committed and pushed on its own --------------
async function pushTemplate(t) {
  const result = await commitAndPush({
    paths: [path.join("templates", t.id), path.join("factory", "directions-generated.json")].filter(Boolean),
    message: `Add template: ${t.name}${t.score ? ` (jury ${t.score.scoreBefore} → ~${t.score.scoreAfterEstimate})` : ""}`,
  });
  update(t, { pushed: result });
}

// ---- Art director + autopilot ---------------------------------------------------
// Invents new directions that must differ from every existing one, builds them, and repeats
// until it is switched off or the usage limit is hit.
const isLimitError = (msg) => /usage limit|limit reached|rate.?limit|hit your limit|429|quota/i.test(msg || "");

export const autopilot = { on: false, model: "opus", generating: false, batches: 0, generated: 0, stoppedReason: null };
const emitAutopilot = () => factoryBus.emit("autopilot", { ...autopilot, queued: queue.length, running });

function stopAutopilot(reason) {
  autopilot.on = false;
  autopilot.stoppedReason = String(reason).slice(0, 200);
  // Nothing new can run once the limit is reached: put queued templates back.
  for (const { t } of queue.splice(0)) update(t, { status: "todo", step: "", detail: "waiting (usage limit)" });
  emitAutopilot();
}

async function sampleList() {
  const files = (await fs.readdir(samplesDir)).filter((f) => f.endsWith(".json"));
  const keys = files.map((f) => f.replace(".json", ""));
  const lines = [];
  for (const key of keys) {
    const scout = await readJson(path.join(config.scoutDir, `${key}.json`), {});
    lines.push(`- ${key}: ${scout.displayName || key} (${scout.industry || scout.sector || ""})`);
  }
  return { keys, text: lines.join("\n") };
}

const QUOTED = /'([^']+)'/g;

export async function generateDirections(count = 8, model = "opus") {
  const tpl = await fs.readFile(path.join(config.root, "prompts/art-director.md"), "utf8");
  const existing = allDirections.map((d) => `- ${d.name}: ${d.brief.split(". ")[0]}. Type: ${d.type} Signature: ${d.signature}`).join("\n");
  const fonts = [...new Set(allDirections.flatMap((d) => [...(d.type || "").matchAll(QUOTED)].map((m) => m[1])))].join(", ");
  const samples = await sampleList();
  const prompt = tpl.replace(/{{(\w+)}}/g, (_, k) => ({ count: String(count), existing, fonts, samples: samples.text })[k] ?? "");
  const r = await runClaudeText({ prompt, model });
  if (!r.ok) throw new Error(r.error || "art director failed");
  const list = JSON.parse(r.text.slice(r.text.indexOf("["), r.text.lastIndexOf("]") + 1));

  const takenIds = new Set(allDirections.map((d) => d.id));
  const takenNames = new Set(allDirections.map((d) => d.name.toLowerCase()));
  const fresh = [];
  for (const d of list) {
    if (!d?.id || !d.brief || !d.name || takenNames.has(d.name.toLowerCase())) continue;
    let id = d.id.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    while (takenIds.has(id)) id += "-2";
    const sample = samples.keys.includes(d.sample) ? d.sample : samples.keys[fresh.length % samples.keys.length];
    const stress = samples.keys.includes(d.stress) && d.stress !== sample ? d.stress : samples.keys.find((k) => k !== sample);
    fresh.push({
      id, name: d.name, sectors: d.sectors || [], sample, stress, brief: d.brief, type: d.type || "",
      signature: d.signature || "", source: d.source || "", generated: true, generatedAt: new Date().toISOString(),
    });
    takenIds.add(id);
    takenNames.add(d.name.toLowerCase());
  }
  await fs.writeFile(generatedFile, JSON.stringify([...(await readJson(generatedFile, [])), ...fresh], null, 2));
  allDirections.push(...fresh);
  for (const d of fresh) {
    const t = { id: d.id, name: d.name, sectors: d.sectors, sample: d.sample, stress: d.stress, status: "todo", step: "", detail: d.source ? `idea: ${d.source}` : "", steps: [], rating: null };
    templates.set(d.id, t);
    factoryBus.emit("tpl", publicTemplate(t));
  }
  return fresh;
}

export async function autopilotTick() {
  if (!autopilot.on || autopilot.generating) return emitAutopilot();
  // Keep the queue fed: generate the next batch while the current one is still building.
  if (queue.length + running >= config.factoryConcurrency + 2) return emitAutopilot();
  autopilot.generating = true;
  emitAutopilot();
  try {
    const fresh = await generateDirections(8, autopilot.model);
    autopilot.batches++;
    autopilot.generated += fresh.length;
    if (autopilot.on) buildTemplates({ ids: fresh.map((d) => d.id), model: autopilot.model });
  } catch (e) {
    if (isLimitError(e.message)) stopAutopilot(e.message);
    else { autopilot.on = false; autopilot.stoppedReason = "art director error: " + e.message.slice(0, 160); }
  } finally {
    autopilot.generating = false;
    emitAutopilot();
  }
}

export function setAutopilot(on, model) {
  autopilot.on = !!on;
  if (model) autopilot.model = model;
  if (autopilot.on) {
    autopilot.stoppedReason = null;
    buildTemplates({ model: autopilot.model }); // unbuilt / interrupted ones first
    autopilotTick();
  }
  emitAutopilot();
  return { ...autopilot };
}

export const getAutopilot = () => ({ ...autopilot, queued: queue.length, running });
