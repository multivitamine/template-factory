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

// Newest crawl of a site: output/<runId>/<site>/crawl/facts.json (runIds sort by time), else the old flat output/<site>.
export async function crawlFactsFile(site) {
  let runIds = [];
  try { runIds = (await fs.readdir(config.outputDir)).sort().reverse(); } catch {}
  for (const run of runIds) {
    const f = path.join(config.outputDir, run, site, "crawl", "facts.json");
    try { await fs.access(f); return f; } catch {}
  }
  return path.join(config.outputDir, site, "crawl", "facts.json");
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
      factsFile: await crawlFactsFile(site),
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
    const pages = await renderTemplate({ templateDir: dir, content, templateName: t.name, shop: true });
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
  const prompts = await directionPrompts(d);
  // Keep exactly what the agents were sent next to the template (shown via the "prompt" button in the gallery).
  await fs.mkdir(path.join(dir, "prompts"), { recursive: true });
  await fs.writeFile(path.join(dir, "prompts", "build.md"), prompts.build);

  const onEvent = (e) => update(t, { detail: e.detail });
  update(t, { detail: `designing with ${model}` });
  const build = await runAgent({ cwd: dir, prompt: prompts.build, model, onEvent, timeoutMs: config.factoryAgentTimeoutMs, logName: "build.log.jsonl" });
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
  const critiquePrompt = prompts.critique.split("{{issues}}").join(issues.length ? `\nAutomatic checks found:\n${issues.join("\n")}` : "");
  await fs.writeFile(path.join(dir, "prompts", "critique.md"), critiquePrompt);
  const critique = await runAgent({ cwd: dir, model, onEvent, timeoutMs: config.factoryAgentTimeoutMs, logName: "critique.log.jsonl", prompt: critiquePrompt });
  t.costUsd += critique.costUsd || 0;
  if (isLimitError(critique.error)) stopAutopilot(critique.error);

  update(t, { step: "Final render", detail: "final screenshots" });
  await renderAndShoot(t, dir);
  const meta = await readJson(path.join(dir, "meta.json"));
  const crit = await readJson(path.join(dir, "critique.json"));
  update(t, { status: "done", step: "Done", detail: crit ? `jury: ${crit.scoreBefore} → ~${crit.scoreAfterEstimate}` : "", finishedAt: Date.now(), meta, score: crit, version: Date.now() });
}

// ---- Prompts and directions from your own idea (the "New template from your idea" editor) ----------------

const readPromptFile = (f) => fs.readFile(path.join(config.root, f), "utf8");

// The exact prompts a build sends for a direction. Hand-edited prompts from the idea editor are used verbatim.
// "{{issues}}" stays in the critique prompt: buildOne fills it with the automatic check results.
export async function directionPrompts(d) {
  const [contract, buildTpl, critiqueTpl] = await Promise.all(["factory/contract.md", "prompts/factory-build.md", "prompts/factory-critique.md"].map(readPromptFile));
  const sampleName = (await readJson(path.join(samplesDir, `${d.sample}.json`)))?.brand?.name || d.sample;
  const stressName = (await readJson(path.join(samplesDir, `${d.stress}.json`)))?.brand?.name || d.stress;
  const vars = {
    id: d.id, name: d.name, brief: d.brief, type: d.type, signature: d.signature, sectors: (d.sectors || []).join(", "),
    sectorsJson: JSON.stringify(d.sectors || []), contract, sampleName, stressName,
  };
  // One pass, so {{tags}} inside the contract itself stay untouched.
  const fill = (tpl) => tpl.replace(/{{(\w+)}}/g, (m, k) => (k === "issues" ? m : vars[k] ?? ""));
  return { build: d.buildPrompt || fill(buildTpl), critique: d.critiquePrompt || fill(critiqueTpl) };
}

export async function listSamples() {
  const { keys } = await sampleList();
  return Promise.all(keys.map(async (key) => ({ key, name: (await readJson(path.join(samplesDir, `${key}.json`)))?.brand?.name || key })));
}

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// Cleans up a direction from the editor: unique id and name, known sample brands. Saves nothing.
export async function normalizeDirection(input) {
  const keys = (await sampleList()).keys;
  const name = String(input.name || "").trim().slice(0, 60);
  if (!name || !String(input.brief || "").trim()) throw new Error("a name and a brief are needed");
  const takenIds = new Set(allDirections.map((d) => d.id));
  const takenNames = new Set(allDirections.map((d) => d.name.toLowerCase()));
  let id = slug(input.id) || slug(name);
  while (takenIds.has(id)) id += "-2";
  let finalName = name;
  for (let n = 2; takenNames.has(finalName.toLowerCase()); n++) finalName = `${name} ${n}`;
  const sample = keys.includes(input.sample) ? input.sample : keys[0];
  const stress = keys.includes(input.stress) && input.stress !== sample ? input.stress : keys.find((k) => k !== sample);
  const sectors = (Array.isArray(input.sectors) ? input.sectors : String(input.sectors || "").split(","))
    .map((s) => String(s).trim().toLowerCase()).filter(Boolean).slice(0, 4);
  return {
    id, name: finalName, sectors, sample, stress, brief: String(input.brief).trim(), type: String(input.type || "").trim(),
    signature: String(input.signature || "").trim(), source: String(input.source || "").trim(),
  };
}

// Claude works a free-text idea out into one direction (not saved until you press build).
export async function directionFromIdea(idea, model = "opus") {
  const tpl = await readPromptFile("prompts/idea-to-direction.md");
  const existing = allDirections.map((d) => `- ${d.name}: ${d.brief.split(". ")[0]}.`).join("\n");
  const fonts = [...new Set(allDirections.flatMap((d) => [...(d.type || "").matchAll(QUOTED)].map((m) => m[1])))].join(", ");
  const samples = await sampleList();
  const prompt = tpl.replace(/{{(\w+)}}/g, (_, k) => ({ idea: String(idea).slice(0, 4000), existing, fonts, samples: samples.text })[k] ?? "");
  const r = await runClaudeText({ prompt, model });
  if (!r.ok) throw new Error(r.error || "art director failed");
  const d = JSON.parse(r.text.slice(r.text.indexOf("{"), r.text.lastIndexOf("}") + 1));
  return { direction: await normalizeDirection({ ...d, source: d.source || `your idea: ${String(idea).slice(0, 120)}` }), costUsd: r.costUsd || 0 };
}

// Saves a direction from the editor (with any hand-edited prompts) and starts building it.
export async function createFromIdea({ direction, buildPrompt, critiquePrompt, model = "opus" }) {
  const d = { ...(await normalizeDirection(direction)), generated: true, fromIdea: true, generatedAt: new Date().toISOString() };
  const generatedPrompts = await directionPrompts(d);
  // Only store prompts that differ from what the fields would generate anyway.
  if (buildPrompt && buildPrompt.trim() !== generatedPrompts.build.trim()) d.buildPrompt = buildPrompt;
  if (critiquePrompt && critiquePrompt.trim() !== generatedPrompts.critique.trim()) d.critiquePrompt = critiquePrompt;
  await fs.writeFile(generatedFile, JSON.stringify([...(await readJson(generatedFile, [])), d], null, 2));
  allDirections.push(d);
  const t = { id: d.id, name: d.name, sectors: d.sectors, sample: d.sample, stress: d.stress, status: "todo", step: "", detail: `your idea: ${d.source}`.slice(0, 160), steps: [], rating: null };
  templates.set(d.id, t);
  factoryBus.emit("tpl", publicTemplate(t));
  buildTemplates({ ids: [d.id], model });
  return d.id;
}

// A template's direction plus the prompts it was built with (saved since prompts were kept), or rebuilt from today's prompt files.
export async function directionDetails(id) {
  const d = findDirection(id);
  if (!d) return null;
  const dir = path.join(templatesDir, id, "prompts");
  const saved = { build: await fs.readFile(path.join(dir, "build.md"), "utf8").catch(() => null), critique: await fs.readFile(path.join(dir, "critique.md"), "utf8").catch(() => null) };
  const now = await directionPrompts(d);
  const { buildPrompt, critiquePrompt, ...fields } = d;
  return { direction: fields, build: saved.build || now.build, critique: saved.critique || now.critique, saved: !!saved.build };
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

// The full art direction of a concept, for agents that adapt a filled-in template (creative mode).
export function conceptBrief(id) {
  const d = findDirection(id) || {};
  const t = templates.get(id) || {};
  return { name: d.name || t.name || id, brief: d.brief || "", type: d.type || "", signature: d.signature || "" };
}

// Finished templates the booth can fill at the event, with what a picker needs to choose between them.
export function listConcepts() {
  return [...templates.values()].filter((t) => t.status === "done").map((t) => {
    const d = findDirection(t.id) || {};
    return {
      id: t.id, name: t.name, scheme: t.meta?.scheme, sectors: t.meta?.sectors || t.sectors, mood: t.meta?.mood,
      brief: (d.brief || "").split(". ").slice(0, 2).join(". "), needsProductImages: t.meta?.needsProductImages,
      jury: t.score?.scoreAfterEstimate ?? null, stars: t.rating || null,
    };
  });
}
