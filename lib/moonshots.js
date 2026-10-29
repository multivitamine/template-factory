// Moonshots: Claude invents bold, business-changing ideas for a scanned site (prompts/moonshots.md), next to the ones
// the ideas-app already has (data/moonshots beside config.scoutDir). Saved as moonshots.json + moonshots.html in the
// design's folder, so they show up in the control room and in history.
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { runClaudeText } from "./agent.js";
import { parseJson, trimFacts } from "./fill.js";

const readJson = async (f) => { try { return JSON.parse(await fs.readFile(f, "utf8")); } catch { return null; } };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

// Scout key per hostname, so a typed-in URL (key "spaansen-nl") still finds its scout and ideas-app data ("spaansen").
let scoutIndex = null;
async function scoutFor(url) {
  if (!scoutIndex) {
    scoutIndex = new Map();
    const files = await fs.readdir(config.scoutDir).catch(() => []);
    for (const f of files.filter((x) => x.endsWith(".json"))) {
      const s = await readJson(path.join(config.scoutDir, f));
      for (const e of s?.evidence || []) { const h = host(e.split(" ")[0]); if (h && !scoutIndex.has(h)) scoutIndex.set(h, { key: f.replace(/\.json$/, ""), scout: s }); }
    }
  }
  return scoutIndex.get(host(url)) || null;
}

// Pushed further than the default: the most audacious idea that is still traceable to their site.
const ALL_OUT = `

# Go all out
Forget "realistic". Pick the single most audacious, spectacular move this business could make: a new industry, a cultural
phenomenon, a physical spectacle, a technology nobody in their sector would dare, a story the whole country would talk about.
It must still grow from something concrete on their site, and the first step must still be small and real.`;

export async function makeMoonshots(sitePath, { model = config.model, count = 3, allOut = false } = {}) {
  if (!/^[\w-]+\/[\w-]+$/.test(sitePath)) throw new Error("unknown design");
  const dir = path.join(config.outputDir, sitePath);
  const content = await readJson(path.join(dir, "content.json"));
  const facts = await readJson(path.join(dir, "crawl", "facts.json"));
  if (!content || !facts) throw new Error("this design has no saved crawl");
  const url = facts.home?.url || "";
  const found = await scoutFor(url);
  const s = found?.scout;
  const existing = found ? ((await readJson(path.join(path.dirname(config.scoutDir), "moonshots", `${found.key}.json`)))?.moonshots || []) : [];
  // Earlier moonshots for this design (from this app) count as taken too, so every new one goes somewhere else.
  const before = (await readJson(path.join(dir, "moonshots.json")))?.moonshots || [];
  const taken = [...before, ...existing];

  const tpl = await fs.readFile(path.join(config.root, "prompts", "moonshots.md"), "utf8");
  const prompt = tpl.replace(/{{(\w+)}}/g, (_, k) => ({
    name: content.brand?.name || s?.displayName || host(url), url, count: String(count),
    scout: s ? [`Industry: ${s.industry || ""}`, `Audience: ${s.audience || ""}`, `Summary: ${s.summary || ""}`].join("\n") : `Tagline: ${content.brand?.tagline || ""}`,
    facts: JSON.stringify(trimFacts(facts)),
    existing: taken.length ? `\n# Moonshots already proposed for them (go somewhere completely else: other mechanism, customer and market)\n${taken.map((m) => `- ${m.title}: ${m.oneLiner || ""}`).join("\n")}` : "",
  })[k] ?? "") + (allOut ? ALL_OUT : "");

  const r = await runClaudeText({ prompt, model });
  if (!r.ok) throw new Error(r.error || "Claude failed");
  const fresh = (parseJson(r.text).moonshots || []).slice(0, count).map((m) => ({ ...m, allOut, model }));
  if (!fresh.length) throw new Error("no moonshots in the answer");
  // Generating again adds to the page instead of replacing it: newest first.
  const moonshots = [...fresh, ...before];
  const result = { url, brand: content.brand, model, createdAt: new Date().toISOString(), costUsd: r.costUsd || 0, moonshots, fromIdeasApp: existing, fresh };
  await fs.writeFile(path.join(dir, "moonshots.json"), JSON.stringify(result, null, 2));
  await fs.writeFile(path.join(dir, "moonshots.html"), moonshotsPage(result));
  return result;
}

// A standalone page in the brand's colours: the new moonshots, then the ideas-app ones.
function moonshotsPage({ url, brand = {}, model, createdAt, moonshots, fromIdeasApp }) {
  const name = brand.name || host(url);
  const primary = /^#[0-9a-f]{6}$/i.test(brand.colors?.primary || "") ? brand.colors.primary : "#c6ff3d";
  const card = (m, i) => `
    <article class="shot">
      <div class="num">${String(i + 1).padStart(2, "0")}</div>
      <div class="main">
        ${m.allOut ? `<div class="allout">all out</div>` : ""}
        <h2>${esc(m.title)}</h2>
        <p class="one">${esc(m.oneLiner)}</p>
        <p class="desc">${esc(m.description)}</p>
        <dl>
          <div><dt>Why ${esc(name)}</dt><dd>${esc(m.whyThisSite)}</dd></div>
          <div><dt>The hard part</dt><dd>${esc(m.hardPart)}</dd></div>
          <div><dt>First step this quarter</dt><dd>${esc(m.firstStep)}</dd></div>
        </dl>
        <div class="tags">${(m.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </div>
    </article>`;
  const older = fromIdeasApp.length ? `
    <section class="older">
      <h3>Also proposed earlier · ideas app</h3>
      ${fromIdeasApp.map((m) => `<details><summary>${esc(m.title)}</summary><p>${esc(m.description)}</p>${m.whyThisSite ? `<p class="why">${esc(m.whyThisSite)}</p>` : ""}</details>`).join("")}
    </section>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moonshots · ${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  :root { --bg: #0b0c10; --panel: #14161c; --line: #262a33; --text: #eceef2; --muted: #9aa1ad; --brand: ${primary};
    --glow: color-mix(in srgb, var(--brand) 55%, transparent); }
  * { box-sizing: border-box; }
  body { margin: 0; background: radial-gradient(90% 60% at 80% -10%, color-mix(in srgb, var(--brand) 30%, transparent), transparent 60%), var(--bg);
    color: var(--text); font: 17px/1.6 "IBM Plex Sans", sans-serif; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 56px 24px 80px; }
  header { margin-bottom: 48px; }
  .eyebrow { font: 500 13px "IBM Plex Mono", monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  .eyebrow a { color: inherit; }
  h1 { font: 800 clamp(40px, 7vw, 84px)/.95 "Bricolage Grotesque", sans-serif; letter-spacing: -.035em; margin: 14px 0 16px; }
  h1 span { color: var(--brand); text-shadow: 0 0 40px var(--glow); }
  .lead { color: var(--muted); max-width: 56ch; margin: 0; }
  .shot { display: grid; grid-template-columns: 88px 1fr; gap: 24px; padding: 34px 0; border-top: 1px solid var(--line); }
  .num { font: 800 64px/1 "Bricolage Grotesque", sans-serif; color: transparent; -webkit-text-stroke: 1.5px var(--brand); }
  h2 { font: 800 clamp(26px, 3.4vw, 38px)/1.08 "Bricolage Grotesque", sans-serif; letter-spacing: -.02em; margin: 4px 0 10px; }
  .one { font-size: 20px; color: var(--text); margin: 0 0 14px; }
  .desc { color: #c9cdd5; margin: 0 0 22px; }
  dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 18px; }
  dl div { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }
  dt { font: 500 12px "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .06em; color: var(--brand); margin-bottom: 6px; filter: brightness(1.35); }
  dd { margin: 0; font-size: 15px; color: #d6d9df; }
  .allout { display: inline-block; font: 500 11px "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .1em; color: var(--bg); background: var(--brand); border-radius: 99px; padding: 3px 10px; margin-bottom: 6px; }
  .tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .tags span { font: 500 12px "IBM Plex Mono", monospace; color: var(--muted); border: 1px solid var(--line); border-radius: 99px; padding: 3px 10px; }
  .older { margin-top: 40px; border-top: 1px solid var(--line); padding-top: 28px; }
  .older h3 { font: 500 13px "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin: 0 0 12px; }
  details { border: 1px solid var(--line); border-radius: 12px; padding: 12px 16px; margin-bottom: 10px; background: var(--panel); }
  summary { cursor: pointer; font-weight: 500; }
  details p { color: #c9cdd5; font-size: 15px; }
  details .why { color: var(--muted); }
  footer { margin-top: 48px; font: 500 12px "IBM Plex Mono", monospace; color: var(--muted); }
  @media (max-width: 760px) { .shot { grid-template-columns: 1fr; gap: 6px; } .num { font-size: 44px; } dl { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="eyebrow">Moonshots · <a href="${esc(url)}" target="_blank" rel="noopener">${esc(host(url))}</a> · <a href="index.html">see the redesign</a></div>
    <h1>What if <span>${esc(name)}</span> went to the moon?</h1>
    <p class="lead">${moonshots.length === 1 ? "An idea" : `${moonshots.length} ideas`} that would change what ${esc(name)} is, grounded in something on their own website.</p>
  </header>
  ${moonshots.map(card).join("")}
  ${older}
  <footer>Generated ${esc(createdAt.slice(0, 16).replace("T", " "))} UTC · ${esc(model)} · ideas, not promises</footer>
</div>
</body>
</html>
`;
}
