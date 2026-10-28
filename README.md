# Redesign Booth — local QR simulation

Press a button (simulating a QR scan) → 10 sites from the scout data are crawled and redesigned
in parallel by 10 headless Claude Code agents running on your own account.

## Run
```
npm install
npm start
```
- Dashboard: http://localhost:4321 → press **Simulate 10 scans**
- Phone: scan the QR code on the dashboard (same Wi-Fi) → `/scan` page with a start button

## Pipeline per site
1. **Crawl** (`lib/crawl.js`): headless Chrome loads the homepage plus one catalog page if found, removes cookie popups, saves screenshots and `facts.json` (computed colours, fonts, logo, nav, products, text).
2. **Style catalog** (`lib/refero.js`): 20 templates from styles.refero.design, cached in `data/` (rebuild: `node lib/refero.js`).
3. **Agent** (`lib/agent.js`, prompt in `prompts/build-site.md`): `claude -p` extracts the brand style, picks a Refero template, writes `brand.json`, `index.html` and `catalog.html` if the site has a catalog.
4. Results: `output/<site>/`, served at `/sites/<site>/index.html`.

## Template factory
http://localhost:4321/factory: builds reusable, creative templates ahead of time, to fill live at the event.
- `factory/directions.js`: 20 art directions (layout idea, type, signature interaction)
- `factory/contract.md`: the Mustache + CSS-variable contract every template follows
- Per template: build (Opus) → render with 2 real brands → screenshots → jury round (critique + fixes) → final screenshots
- `lib/fill.js`: crawled facts → content JSON (~20 s); `lib/render.js`: template + content + brand colours → page (~1 s)
- Results: `templates/<id>/` (template.html, catalog.html, meta.json, critique.json, shots/, previews). Rate them with stars in the gallery.

Note: the crawl needs the scout data at `config.scoutDir` (not included in this repo).

## Settings (env vars)
`AGENT_MODEL` (sonnet | opus), `CONCURRENCY` (default 10), `PORT`, `PUBLIC_HOST` (IP in the QR code).
Sites list: `config.js`.
