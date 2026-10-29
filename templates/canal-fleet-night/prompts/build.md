You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Canal Fleet"
The page is one long canal at night, seen from water level. A fixed horizontal waterline runs across the viewport at about 58% height. Above it is the quay, a deep blue-black sky (template-owned) with a row of narrow gabled canal-house silhouettes drawn in SVG, their windows lit in warm lantern amber. Below it everything is mirrored as a reflection: a flipped and blurred copy of the brand name and facades, broken up by an SVG feTurbulence ripple filter and fine horizontal shimmer lines. The hero puts the brand name above the waterline in tall Art Deco capitals, with its reflection wobbling underneath and a small brass-framed ticket that holds the tagline and the primary CTA ('Board tonight' / 'Bestel nu'). Below the hero, the page becomes 'Tonight's Route': a single dashed brass route line meanders down the page like a canal on a chart. Each section is a numbered mooring along it (I Embarkation = about, II The Fleet = products, III The Galley = categories/catalog teaser, IV Harbour Office = contact). Each mooring is marked by a CSS lantern on a bollard. Products are presented as moored boats: long rounded-hull cards with an Art Deco sunburst fan engraved in thin gold lines at the bow. Each card shows a berth plaque with the name, a short description, the price as a 'fare', and a reflection strip under the card that repeats the name upside-down at 15% opacity. The catalog page is the full harbour register: a quayside list of berths with filter chips styled as brass mooring tags, and every row has a waterline divider with a subtle ripple. Textures include faint chevron Art Deco borders, fine gold hairlines, grain on the night sky, and a single moon whose glow takes --c-accent. The brand primary only fills lanterns, CTAs and the route line, so any colour reads as 'lamp light on dark water'. The mood is hushed, glamorous and slow, like a skipper's lantern gliding past sleeping houses.

Typography: Display: 'Poiret One' for the brand name, headlines and section numerals (tracked caps); 'Forum' for berth plaques, fares and pull quotes; labels and coordinates in 'Sometype Mono' (small caps-style uppercase, wide tracking); body 'Instrument Sans'.
Signature interaction: 'Tonight's Mooring': the route changes every night. On load, JS seeds a small PRNG with today's date (YYYYMMDD). The seed shuffles the order of 6 preset canal-bend control points, which regenerates the SVG path `d` of the dashed route line running down the page, and picks tonight's mooring name and fake coordinates (e.g. 'Ligplaats 4 · 52.366°N 4.889°E') shown in the hero ticket. A small CSS boat with a glowing --c-primary lantern rides the path. Its position is set with path.getPointAtLength(scrollProgress * totalLength) on scroll (rAF-throttled) and it rotates to the path tangent. When it passes a mooring marker, that section's lantern 'lights' (class toggle: the glow box-shadow animates on), and the reflection beneath the nearest product card ripples once by animating the feTurbulence baseFrequency for 600ms. Without JS, a static default path and all lanterns lit are rendered, and all content stays visible. With prefers-reduced-motion, the boat jumps between moorings instead of gliding and the ripples are disabled.
Good fit for: hospitality, luxury, food, travel

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
`sample.json` in this directory is real content from Banks Mansion in exactly the shape your template receives.
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
{ "id": "canal-fleet-night", "name": "Canal Fleet", "scheme": "light|dark", "sectors": ["hospitality","luxury","food","travel"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE canal-fleet-night`.
