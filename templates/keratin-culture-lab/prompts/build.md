You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Culture Lab"
The page is a clean-room bench under cool LED light: pale clinical white-grey (#F3F5F4) with a faint 8px laboratory graph-paper grid. Living cultures in --c-primary are the only warm, saturated colour, and hairline instrument rules and small mono labels (BATCH, MEDIUM, pH 7.2, 37.0 °C, PASSAGE 04) sit in every corner. The hero is split. On the left is a huge, tightly set headline with the brand name stamped like a culture label. On the right is a large circular petri dish, drawn as a canvas inside layered CSS rings (glass rim highlight, meniscus shadow and a printed millimetre scale on the lid) with a 'Inoculeer' CTA beneath it and a vertical bioreactor gauge showing culture density. The homepage continues as lab sections. Categories become a rack of round culture plates, each labelled with a pigment-style code chip derived from the category name, for example 'KR-07 / Sandyblonde Rooted' for a wig maker or 'KR-03 / Espresso Medium' for a roaster. The featured product sits in a 'Batch of the week' bioreactor panel with a tall glass vessel, a CSS fill level and growth-media readouts. In the catalogue, every product card is a specimen record: a small circular dish window holding the product image (masked to a circle, so images of any shape sit naturally), a mono SKU/batch line, a pigment swatch strip in primary and accent tints, and price set in large tabular numerals. The cards are laid out on a microscope-slide grid with frosted-glass filter chips. Contact is a 'request a culture' lab-order form card with a barcode-like strip drawn in CSS. The mood is precise, cool and calm with something warm and alive growing in the middle.

Typography: Display: 'Funnel Display' (tight, large, light-to-bold weights for headlines and huge batch numbers); labels and readouts 'Reddit Mono' (uppercase, tracked, small); body 'Reddit Sans'.
Signature interaction: Live reaction-diffusion cultures. Each dish canvas (the hero dish at a 192×192 grid and the category plates at 96×96, upscaled with image-smoothing on and clipped to a circle) runs a Gray-Scott reaction-diffusion simulation in two Float32Array fields, U and V. Each frame runs 8–12 iterations of U' = U + (Du∇²U − UV² + F(1−U))·dt and V' = V + (Dv∇²V + UV² − (F+k)V)·dt, using a 9-point Laplacian with Du=1.0, Dv=0.5 and dt=1. Wrap-around is off and cells outside the dish radius are clamped to U=1, V=0, so the culture can never grow past the glass. V is rendered through a colour ramp from transparent through --c-accent to --c-primary, which is read from getComputedStyle at startup so the culture always takes the customer's brand colour, and a soft specular highlight is drawn on top. Pointer down or drag on a dish 'inoculates' it, setting V=0.5 in a 5-cell radius at the pointer. Enter or Space seeds the centre of a focused dish. The pattern visibly grows outward from the seed into living spots, worms or labyrinths. Each category plate gets its own (F, k) preset chosen from a hash of the category name, for example (0.035, 0.065) for spots, (0.042, 0.059) for worms and (0.029, 0.057) for maze, so every category grows a recognisably different 'curl pattern'. On the hero dish, the parameter dial under it ('Krul: steil / golf / kroes') tweens F and k between those presets, and the existing culture morphs smoothly from one pattern to another. In the catalogue, choosing a filter re-seeds the hero-sized header dish with that category's preset, and the density gauge beside it (a CSS height bound to the mean of V, sampled every 30 frames) rises as the culture grows. Hovering a product card injects a single seed into its small dish ring overlay, rendered with a cheap 64×64 sim that runs only while hovered and for 1.5s after. Performance: one shared rAF loop, simulations pause when off-screen (IntersectionObserver) or when the tab is hidden, and a dish freezes once total change in V per frame drops below an epsilon. Under prefers-reduced-motion, each dish runs 2500 iterations once off-screen at load and draws a single static frame, and inoculation is disabled. Without JS the dishes show a CSS radial-gradient culture in --c-primary and all content stays visible.
Good fit for: wholesale, b2b, makers, lifestyle

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
`sample.json` in this directory is real content from Kondor Hair in exactly the shape your template receives.
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
{ "id": "keratin-culture-lab", "name": "Culture Lab", "scheme": "light|dark", "sectors": ["wholesale","b2b","makers","lifestyle"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE keratin-culture-lab`.
