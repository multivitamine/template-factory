# Redesign Booth — local QR simulation

Press a button (simulating a QR scan) → the chosen number of sites are crawled, filled with their own content and
rendered in a concept from the template factory, in parallel, using Claude on your own account.

## Run
```
npm install
npm start
```
- Dashboard: http://localhost:4321 → enter the number of scans → **Simulate**
- Phone: scan the QR code on the dashboard (same Wi-Fi) → `/scan` page with a start button

## Pipeline per site (~35 s)
1. **Crawl** (`lib/crawl.js`): headless Chrome loads the homepage plus one catalog page if found, removes cookie popups, saves screenshots and `facts.json` (computed colours, fonts, logo, nav, products, text).
2. **Content + concept, in parallel**: `lib/fill.js` turns the facts into content JSON; `prompts/pick-concept.md` has Claude choose one finished factory template that fits the business (varied within a run).
3. **Render** (`lib/render.js`): template + content + brand colours → `index.html` and `catalog.html` in ~0.1 s.
4. Results: `output/<site>/`, served at `/sites/<site>/index.html`.

## Template factory
http://localhost:4321/factory: builds reusable, creative templates ahead of time, to fill live at the event.
- `factory/directions.js`: 20 art directions (layout idea, type, signature interaction)
- `factory/contract.md`: the Mustache + CSS-variable contract every template follows
- Per template: build (Opus) → render with 2 real brands → screenshots → jury round (critique + fixes) → final screenshots
- `lib/fill.js`: crawled facts → content JSON (~20 s); `lib/render.js`: template + content + brand colours → page (~1 s)
- Results: `templates/<id>/` (template.html, catalog.html, meta.json, critique.json, shots/, previews). Rate them with stars in the gallery.

Site URLs come from the scout data at `config.scoutDir` (not included in this repo), or from `config.siteUrls` when it is missing.

## Settings (env vars)
`AGENT_MODEL` (sonnet | opus), `CONCURRENCY` (default 10), `PORT`, `PUBLIC_HOST` (IP in the QR code).
Sites list: `config.js`.
