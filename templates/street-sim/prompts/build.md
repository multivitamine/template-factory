You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Street Simulator"
The site is the training console of a street-enforcement simulator at dusk: a deep slate cockpit (#14181C) with a cool off-white HUD layer, thin 1px bezel rules, corner brackets on every panel, a faint scanline texture and amber-free instrumentation where --c-primary is the only 'live' colour (active choice, timer, scores) and --c-accent marks branch nodes. The hero is a 'scenario bay': a wide tablet-like viewport framing a top-down street scene drawn in CSS/SVG (kerb lines, a terrace grid, parked-car rectangles, abstract person tokens as rings) with a briefing strip above it ('SCENARIO 07 · Vrijdag 23:40 · Terras') carrying the brand name, headline and primary CTA. Below it, sections are 'modules' of a training curriculum: categories become scenario cards (difficulty pips, duration, pass rate), products are 'drills' in a strict 3-column grid with a mono spec strip (code, price, rating as a 0–100 score bar), the about section is an instructor's log, testimonials are 'trainee debriefs' with a score chip, and contact is a 'dispatch' panel with radio-call style labels. The catalogue is a mission-select screen: a left rail of category filters styled as scenario tabs, a sortable drill grid and a persistent mini-debrief panel showing the count. Mood: calm, exact and slightly tense, like the second before a decision, with all motion confined to the instruments and the scenario bay, never to the page as a whole.

Typography: Display: 'Rajdhani' 600/700 in uppercase with wide tracking for HUD labels, scenario titles and the huge debrief scores; body 'Encode Sans' 400/500; numerals, timecodes and codes in 'Ubuntu Mono'.
Signature interaction: A playable branching scenario with a timed decision and a recorded replay debrief. (1) Branching run: the hero bay plays a 3-step scenario built from the content: each step overlays a dilemma card with 3–4 choices, generated from categories (step 1), featured products (step 2) and contact/CTA options (step 3), so the branch the user takes ends on a real product or CTA. A decision timer (an SVG ring around the card, 8 s, driven by requestAnimationFrame) counts down, and as it drains the bay vignette tightens (radial-gradient opacity bound to the remaining time), a small canvas pulse trace in the corner speeds its beat from 70 to 140 bpm, and the scene tokens drift toward the centre. Choices are buttons; keys 1–4 pick one and Space pauses. A timeout counts as 'geen besluit' and branches too. Each pick appends a node to a small SVG decision tree in the bay's side panel (nodes and right-angled connectors in --c-accent, the taken branch in --c-primary, untaken branches dimmed), confined to that panel and never drawn down the page. (2) Recording: from scenario start, pointermove is sampled into a typed array ring buffer (x, y as fractions of the bay rect, plus t in ms, up to 2,000 samples), together with an event list of choice timestamps and hover-enter times per choice button. (3) Cockpit debrief: after step 3 the bay flips to a debrief overlay with three score dials (Juistheid, De-escalatie, Reactietijd), computed from the choice weights and the reaction time per step; their numbers count up and their arcs fill. A 'Replay' scrubber (an input type=range from 0 to the run duration, with play/pause and 0.5×/1×/2× speed) re-renders the run at time t: a ghost cursor interpolated between the samples on either side of t, a fading 600 ms trail behind it, a 'hesitation' ring that grows wherever the pointer dwelt more than 400 ms within 24 px, the dilemma card and timer as they were at t, and a freeze-frame with the reaction time stamped ('BESLUIT 3.4 s') at each choice moment. Hesitations are also listed as clickable markers under the scrubber that jump to t. 'Opnieuw' restarts and 'Bekijk drill' links to the product the final branch landed on. In the catalogue, choosing a filter replays a 1.2 s mini 'scenario load' in the header (the decision tree redraws with that category as the taken branch) before the grid updates. Without JS the bay shows the scene with all dilemma choices as plain links and the debrief scores at static values. Under prefers-reduced-motion the timer does not run (decisions are untimed), the pulse trace and vignette stay static, and the replay steps between decision freeze-frames instead of animating the ghost.
Good fit for: services, tech, b2b, sports

# The contract (MUST follow exactly)
# Template contract

A template is a pair of static pages, `template.html` (homepage) and `catalog.html` (product listing),
written as **Mustache** templates. At the event, a customer's crawled content (JSON, schema below) is
rendered into them in about 1 second, and the customer's brand colours are injected as CSS variables.
So the design must look great with *any* brand's content and colours.

## Colours (CSS custom properties: REQUIRED)
Define these on `:root` with your own default palette. Use them for every brand-related colour:
```
--c-bg        page background          (template-owned, never overridden)
--c-surface   cards / alternate bands  (template-owned)
--c-text      main text                (template-owned)
--c-muted     secondary text           (template-owned)
--c-line      borders / rules          (template-owned)
--c-primary   brand colour             (OVERRIDDEN with the customer's main brand colour)
--c-on-primary text on primary         (OVERRIDDEN: black or white, computed for contrast)
--c-accent    second brand colour      (OVERRIDDEN with the customer's accent colour)
```
- Only primary / on-primary / accent change per customer. Your bg/surface/text stay, so the template's mood
  (dark, cream, neon…) survives. Design so that ANY primary works: a red, a navy, a pastel, a near-black.
- Derive tints with `color-mix(in srgb, var(--c-primary) 15%, var(--c-bg))` instead of hard-coding them.
- Fonts are template-owned: load them with a Google Fonts `<link>` in `<head>`. Avoid Inter, Roboto, Arial, Open Sans, system-ui as the display font.

## Content (Mustache: HTML-escaped `{{x}}`, sections `{{#list}}…{{/list}}`, inverted `{{^x}}…{{/x}}`)
```jsonc
{
  "brand":   { "name": "Brinks Coffee Roasters", "tagline": "Specialty coffee als de nieuwe norm",
               "logo": "https://…/logo.svg" | null, "logoIsLight": true, "initials": "BC", "lang": "nl" },
  "nav":     [ { "label": "Koffie", "href": "catalog.html" }, … ],          // 3–6 items
  "hero":    { "eyebrow": "Specialty coffee · Hedel", "title": "Easy to love,", "titleAccent": "recognized by most.",
               "text": "…", "cta": "Shop koffie", "ctaHref": "catalog.html", "cta2": "Zakelijk", "image": "https://…" | null },
  "usps":    [ { "title": "…", "text": "…" } ],                               // 3–4
  "categories": [ { "name": "…", "image": "https://…" | null, "href": "catalog.html" } ],  // 0–6
  "products":   [ { "name": "…", "price": "€ 15,75" | null, "oldPrice": "€ 18,00" | null, "image": "https://…" | null,
                    "tag": "Nieuw" | null, "href": "#" } ],                     // 0–24 (homepage: show the first 4–8)
  "featured":   [ …same shape as products, first 4… ],
  "hasProducts": true,
  "story":   { "eyebrow": "…", "title": "…", "text": "…", "image": "https://…" | null },
  "stats":   [ { "value": "1000+", "label": "zakelijke klanten" } ],          // 0–4
  "gallery": [ "https://…", … ],                                             // 0–8 extra images
  "quote":   { "text": "…", "author": "…" } | null,
  "cta":     { "title": "…", "text": "…", "label": "…", "href": "#" },
  "contact": { "address": "…", "phone": "…", "email": "…" },
  "footerLinks": [ { "label": "…", "href": "#" } ],
  "catalog": { "title": "Koffie", "intro": "…", "filters": [ "Bonen", "Cups", "Cafeïnevrij" ], "count": "13 producten" },
  "hasCatalog": true,
  "meta":    { "templateName": "…", "year": "2026" }
}
```
Rules for robustness:
- **Everything can be missing or empty** except brand.name, hero.title, nav. Wrap optional sections in `{{#x}}…{{/x}}`
  so they disappear cleanly; never leave an empty frame or a broken `<img>`.
- Images: always `{{#image}}<img src="{{image}}" alt="…" loading="lazy">{{/image}}{{^image}}<!-- styled fallback block -->{{/image}}`
  and use `object-fit: cover` in fixed-ratio frames. Customer images vary wildly (packshots on white, people, landscapes).
- Logo: `{{#brand.logo}}<img src="{{brand.logo}}">{{/brand.logo}}{{^brand.logo}}<span>{{brand.name}}</span>{{/brand.logo}}`.
  When `brand.logoIsLight` is true the logo is white: it must sit on a dark area or get `filter: brightness(0)`.
  Use `{{#brand.logoIsLight}}…{{/brand.logoIsLight}}` to switch a class.
- Text lengths vary: titles 2–9 words, product names up to 60 characters, 0–24 products. Use clamp() and line clamping.
- `catalog.html` uses the same header/footer and shows ALL `products` in the template's own listing style, plus
  `catalog.title`, `catalog.intro`, `catalog.filters` and `catalog.count`. Link to it with `catalog.html`.
- Search and filters WORK: a shop script is injected at render time. It finds product cards and filter buttons by the
  first element inside `{{#products}}…{{/products}}` and `{{#catalog.filters}}…{{/catalog.filters}}`, so each loop must start
  with one element (one card / one `<button>` with `{{.}}` as its text). Style the active filter with `[aria-pressed="true"]`.
  If the design has room for it, add a search field with `data-shop-search` near the filters (otherwise one is added for you).
  Do NOT write your own filter, search or sort JavaScript; it would fight with the shop script.
- Bottom-left fixed badge (small, tasteful): `Demo redesign · {{meta.templateName}}`.

## Technical
- Self-contained: inline `<style>` and `<script>`. CDNs allowed only: Google Fonts and cdnjs.cloudflare.com
  (e.g. GSAP + ScrollTrigger, Lenis). Respect `prefers-reduced-motion`.
- Must not break if JS fails: content is visible without JS (animate *from* visible, or add a `js` class first).
- Responsive down to 375px. No horizontal scroll.
- No external images of your own: only the content's image URLs. Decorative shapes = CSS/SVG.


# Real sample content
`sample.json` in this directory is real content from Twyns in exactly the shape your template receives.
Read it to see realistic text lengths, image types and product counts. Design for that reality, but do NOT hard-code
anything from it: every visible text and image must come from Mustache tags.

# Creative bar
- It must NOT look like a template. No "centred hero + three feature cards + footer" skeleton, no generic SaaS look,
  no default fonts. Commit fully to the art direction: be bold in layout, scale, rhythm and motion.
- One unforgettable moment above the fold, and the signature interaction must actually work.
- Craft: real typographic hierarchy, deliberate spacing scale, consistent radius/border logic, nice hover states,
  smooth easing, nothing janky. Still clearly a usable shop/site: nav, CTA, products and contact easy to find.
- Must survive ANY brand primary colour (red, navy, pastel, near-black) and messy images.

# Files to write
1. `template.html` and `catalog.html` (shared header/footer/styles, duplicated in each file).
2. `meta.json`:
```json
{ "id": "street-sim", "name": "Street Simulator", "scheme": "light|dark", "sectors": ["services","tech","b2b","sports"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE street-sim`.
