# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A local Node app (ESM, no build step, no framework) with two features that share one HTTP server (`server.js`, port 4321):

1. **Redesign Booth** (`/`, `/scan`): a phone QR scan (or "Simulate N scans" on the dashboard) crawls the sites listed in `config.js`, writes their content and lets Claude pick a finished factory concept, then renders it. Every scan keeps its own folder, `output/<runId>/<key>/` (gitignored, never overwritten), served at `/sites/<runId>/<key>/…`. `/history` lists every run report in `data/runs/` with previews of the pages that are still on disk.
2. **Template factory** (`/factory`): builds reusable Mustache website templates in advance, so they can be filled with a customer's crawled content at the event in seconds. Templates live in `templates/<id>/` and are served at `/tpl/<id>/…`. Most commits in this repo are templates the factory produced.

## Commands

```
npm install
npm start                                          # node server.js → http://localhost:4321 and /factory
node scripts/render-check.js <templateId> <site> [brand|template]   # render one template with factory/samples/<site>.json and screenshot it to templates/_check/
node scripts/fill-samples.js                       # (re)build factory/samples/*.json from crawl facts (calls Claude)
node scripts/fix-logo-flags.js                     # reapply the logoIsLight rule to cached samples (no model call)
node lib/refero.js                                 # rebuild the Refero style catalog in data/ (gitignored)
```

There are no tests and no linter (`npm test` is the npm placeholder). Checking work means rendering and screenshotting. The screenshot scripts (`render-check`, `shoot`, `dash`) load pages from `http://localhost:4321`, so the server must be running.

Env vars: `AGENT_MODEL` (sonnet|opus|haiku), `CONCURRENCY`, `FACTORY_CONCURRENCY`, `PORT`, `PUBLIC_HOST`, `CHROME_PATH`, `CLAUDE_EXE`, and `AUTO_PUSH=0`, which stops the factory from committing and pushing.

## Environment assumptions (Windows)

- Chrome runs through `puppeteer-core` from `config.chromePath`. No bundled Chromium.
- Agents run the Claude Code binary found at `%APPDATA%/npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe` (override with `CLAUDE_EXE`), on the user's own account.
- `config.scoutDir` (default `C:/claude/ideas-app-8-16/data/scout`, override with `SCOUT_DIR`) holds the scout JSON files, which live outside this repo. `config.sites` is every reachable scout site with a URL, read once at startup (~100 sites). "Simulate N" draws a random N from it on every run. When the folder is missing, a fixed fallback list is used with `config.siteUrls` plus the cached `factory/samples/<site>.json`. Creating *new* factory samples still needs the scout data and `output/<site>/crawl/facts.json`. Building and re-rendering templates only needs the cached samples.

## Architecture

**Agent runner (`lib/agent.js`).** All model work spawns `claude -p` as a child process. Nothing calls the API directly.
- `runAgent` uses stream-json output with partial messages. The agent gets only the tools Read, Write, Edit, Glob, Grep and WebFetch (no shell), with `acceptEdits`, `--strict-mcp-config` and `--setting-sources project,local`. Its cwd is the target directory. Tool-use events are translated into dashboard progress text (`describeTool`), and the transcript is written to `*.log.jsonl` (gitignored).
- `runClaudeText` is a one-shot call with no tools that returns JSON. It is used by the fill step and the art director.
- Prompts are Markdown files in `prompts/` with `{{key}}` placeholders, substituted by a small regex replace in the caller. This is separate from the Mustache used in templates.

**Booth pipeline (`lib/jobs.js`).** Job queue: crawl (`lib/crawl.js` → screenshots + `facts.json`), then two Claude calls run in parallel: `fillContent` (`lib/fill.js`, crawl facts → contract content JSON) and `pickConcepts` (`prompts/pick-concept.md`, chooses N different `done` templates from `listConcepts()` in `lib/factory.js`, avoiding concepts already used in the run and topping up with the best-rated ones). After that, `renderTemplate` writes `index.html`, `catalog.html` and `content.json` per job. The queue works on groups (`runGroup`): a normal scan is a group of 1. A URL typed on the dashboard with a count of N is a group of N versions that share one crawl, one fill and one pick call, each rendered with a different concept. A scan takes about 35 s. State changes go out on an EventEmitter and stream to the dashboard over SSE (`/api/events`). Run reports (timings plus name, URL, path, colours, concept and why per job) are saved to `data/runs/` when a run finishes; `listHistory()` reads them for `/history`. Code that needs a site's latest crawl uses `crawlFactsFile(site)` in `lib/factory.js`. `prompts/build-site.md` and `lib/refero.js` belong to the older from-scratch agent flow and are no longer called by the booth.

**Factory pipeline (`lib/factory.js`).** Per template, `buildOne` runs: Building → Rendering → Critique → Final render → Done.
1. Directions come from `factory/directions.js` (hand-written) plus `factory/directions-generated.json` (written by the art-director step, `prompts/art-director.md`). Each direction has a `sample` site and a `stress` site. The stress site is a second brand with different colours, used to prove the template survives someone else's palette.
2. Build agent (`prompts/factory-build.md` + `factory/contract.md`) writes `template.html`, `catalog.html` and `meta.json` into `templates/<id>/`.
3. `renderAndShoot` renders `preview/` and `preview-stress/` through `lib/render.js` and takes screenshots into `shots/` (first `before-*`, then the final ones) using `lib/shots.js`. It also flags JS errors and horizontal overflow automatically.
4. Critique agent (`prompts/factory-critique.md`) looks at the shots, edits the files and writes `critique.json` (`scoreBefore`, `scoreAfterEstimate`).
5. State is saved to `status.json`. `lib/git.js` then commits **and pushes** `templates/<id>` plus `directions-generated.json` through a serialized promise chain. That is the source of the `Add template: X (jury a → ~b)` commits.
- Prompts come from `directionPrompts(d)`, the single source for both the build and the editor preview. Since the idea editor was added, every build saves what it actually sent to `templates/<id>/prompts/build.md` and `critique.md`.
- "New template from your idea" (factory page): `directionFromIdea` (`prompts/idea-to-direction.md`) turns free text into a direction. `/api/factory/preview` shows the exact prompts, and `createFromIdea` saves the direction to `directions-generated.json` and builds it. Prompts edited by hand are stored on the direction as `buildPrompt` / `critiquePrompt` and used verbatim. Only the `{{issues}}` marker in the critique prompt gets filled during the build.
- Autopilot keeps generating 8 new directions at a time and building them. It stops when it sees a usage-limit or 429 error and puts queued templates back to `todo`.
- On startup, a template whose `status.json` is not `done` or `failed` is marked failed ("server restarted during build").

**Template contract (`factory/contract.md`): read it before editing any template.** In short:
- Templates are self-contained Mustache HTML. Optional sections must be wrapped so they disappear when empty.
- Colours are CSS variables. Only `--c-primary`, `--c-on-primary` and `--c-accent` are overridden per customer. `render.js` injects a `<style id="brand-tokens">` before `</head>`, choosing black or white on-primary text by luminance. `bg`, `surface`, `text`, `muted` and `line` are owned by the template.
- Content shape is defined there. `lib/fill.js` `normalize()` guarantees it, so templates can rely on keys such as `featured`, `hasProducts`, `hasCatalog` and `brand.initials`.
- `brand.logoIsLight` is computed heuristically from the crawl facts, not by the model.
- Content must stay visible without JS. Pages must be responsive to 375px with no horizontal scroll. Only Google Fonts and cdnjs are allowed as CDNs. The template must not ship its own images.

**Working shop on booth pages (`lib/shop-runtime.js`).** `renderTemplate({ shop: true })` (used by the booth, not by factory previews) marks the first element of every `{{#products}}` loop with `data-shop-item="<index>"` and of every `{{#catalog.filters}}` loop with `data-shop-filter`, then inlines `#shop-data` (products with `category` from the fill step) and the runtime before `</body>`. The runtime takes over filter clicks in the capture phase, so templates' own visual-only filter code doesn't interfere. It also adds a search field when the template has none and updates the `catalog.count` text. A homepage search sends visitors to `catalog.html?q=`. Factory previews use it too. `node scripts/rerender-previews.js` re-renders all previews after a runtime change, with no model calls. The samples in `factory/samples/` carry a `category` per product, set by `node scripts/categorize-samples.js`. Check all templates with `node scripts/shop-check.js <content.json>` while the server runs. The runtime is read from disk on every render, so changing it needs no server restart.

**Template directory files.** `template.html`, `catalog.html` and `meta.json` are the source. `preview*/`, `shots/`, `sample.json`, `critique.json` and `status.json` are generated. To change a template, edit the source files and re-render. Never hand-edit `preview/`.

## Conventions

- Plain ESM JavaScript with top-level `await`, compact code and short "why" comments. Every module imports `config` from `config.js`.
- Prompts, code and comments are in English. The generated site content is mostly Dutch (`brand.lang`, default `nl`).
- `.gitignore` excludes the scraped Refero data (`data/styles*`) and `output/` (third-party crawls) for licensing reasons. Do not commit them.
