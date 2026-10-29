You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Signal Index"
A cool off-white page (#F5F6F7) set on a strict 12-column grid of ultra-thin hairlines, monochrome except for --c-primary, which marks selected data, active filters and the cart. The hero is a clean typographic statement with key figures (assortment size, delivery time, minimum order) as large tabular numbers, next to the featured product in a square frame with data-like labels (SKU-style index, category code, price per unit). Homepage products run as a dense table-like grid where every card has a small product photo contained on a #ECEEF0 pad, a mono index, name, price and a tiny bar showing where that price sits in the range, with a quick add. The catalog leads with a full-width price histogram that you brush to filter, plus category toggles, sort and a list/grid density switch, and a live result counter. The mood is cold, precise and trustworthy, made for buyers who compare.

Typography: Display: 'Tektur' using its width axis (wdth 75, wght 800) for headlines and wdth 100, wght 500 for big tabular figures; data and labels 'Cousine' 400/700 uppercase at 11px; body 'Mukta' 400/600 at 14px.
Signature interaction: Brushable price histogram that filters the catalog. On load, JS buckets all product prices into 24 bins and draws an SVG histogram (one rect per bin, height by count, hairline baseline, mono min/max axis labels). Pointer drag across the histogram creates a brush: a translucent --c-primary band with two draggable handles (keyboard: focus a handle and use arrow keys for one bin or Shift+arrow for five). While brushing, bars inside the band fill with the primary and bars outside fade to 25%, and every product card outside the range collapses: its height animates to 0 via a grid-template-rows 1fr→0fr transition with opacity, so the grid tightens without reflow jumps. The result counter tweens numerically. Hovering a bar highlights the products in that bin (outline in --c-primary) and hovering a product lights its bin and moves a tick on the axis to its exact price. The brush range is combined with the category toggles (the histogram redraws to that category's distribution with a 300ms bar-height transition) and is stored in the URL as ?min=&max= so links keep the selection. Without JS, the histogram is a static figure and all products are listed; under prefers-reduced-motion, cards hide and show instantly.
Good fit for: wholesale, b2b, industrial, food

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
`sample.json` in this directory is real content from Droogijs365 in exactly the shape your template receives.
Read it to see realistic text lengths, image types and product counts. Design for that reality, but do NOT hard-code
anything from it: every visible text and image must come from Mustache tags.

# Creative bar
- It must NOT look like a template. No "centred hero + three feature cards + footer" skeleton, no generic SaaS look,
  no default fonts. Commit fully to the art direction: be bold in layout, scale, rhythm and motion.
- One unforgettable moment above the fold, and the signature interaction must actually work.
- Craft: real typographic hierarchy, deliberate spacing scale, consistent radius/border logic, nice hover states,
  smooth easing, nothing janky. Still clearly a usable shop/site: nav, CTA, products and contact easy to find.
- Must survive ANY brand primary colour (red, navy, pastel, near-black) and messy images.

# This is a premium online shop (e-commerce focus)
- Benchmark: the best-crafted webshops on Awwwards / Godly today. Modern, digital-native, refined. No themed metaphor,
  no costume, no retro pastiche: the impact comes from layout, typography, motion and finish.
- Products are the hero of the page: a shoppable product moment above or right after the fold, real prices, quick
  add-to-cart with visible cart feedback (count bump, drawer or toast), and a catalog with filtering/sorting that animates.
- Frame imperfect product photos so they look art-directed (consistent aspect, tinted backdrops, object-fit, masks).
- Motion is smooth and purposeful: eased (no linear), interruptible, respects `prefers-reduced-motion`.
- Details that separate Site of the Day from a template: considered hover states, magnetic or cursor-aware touches,
  fluid type scale (clamp), tight optical spacing, crisp hairlines, a memorable footer.

# Files to write
1. `template.html` and `catalog.html` (shared header/footer/styles, duplicated in each file).
2. `meta.json`:
```json
{ "id": "signal-index", "name": "Signal Index", "scheme": "light|dark", "sectors": ["wholesale","b2b","industrial","food"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE signal-index`.
