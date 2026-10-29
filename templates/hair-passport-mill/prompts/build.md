You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Hair Passport Mill"
The whole site is one unbroken strand that runs from giver to wearer. A single fine thread, drawn in the brand colour and twisted with a thinner accent strand, enters at the top of the page and weaves down the full length of the homepage through numbered mill stations: 01 Gift (the hero), 02 Sort (categories), 03 Comb (featured products), 04 Knot (services: maatwerk, repair, academy), 05 Passport (story and trust), 06 Wearer (contact and partner locations). The hero is set on undyed oatmeal paper with a faint texture of combed parallel hairlines drawn in CSS repeating-linear-gradients, deliberately directional and loose rather than gridded, unlike Cross-Stitch Loom's even-weave squares. It holds a huge serif headline, one handwritten 'donor note' slip pinned by the thread, and a hank of 40–60 fine SVG strands that gather into a single knot at the CTA button. Every product is shown as a hair passport: a small booklet card with a perforated spine, a mono issue number (KH-0001), an origin line, a row of round process stamps (cut, sorted, combed, knotted, checked) with the last stamp in the brand colour, and an optional handwritten note in the corner. For a coffee roaster or a hotel the same stamps read as provenance steps such as farm, roast, pack, or arrival, stay, departure. Categories appear as labelled bobbins on a slim horizontal spindle rail, each bobbin wound with a different thickness of thread. The catalog page is a mill ledger: filters sit as bobbin tabs along the top and products as passports in a calm 3-column grid (1 column at 375px). The mood is warm, quiet and humane, a gift between strangers recorded with industrial care, rather than a rustic workshop (Atelier Craft) or a decorative sampler.

Typography: Display: 'Imbue' (tall high-contrast condensed didone for headlines and station numerals); handwritten donor notes in 'Nanum Pen Script'; passport numbers, stamps and ledger data in 'Victor Mono'; body 'Source Sans 3'.
Signature interaction: The Thread: one absolutely positioned SVG covers the full height of <main> behind the content. On load and on resize (debounced), JS reads the centre point of every [data-station] element (a small knot glyph beside each section heading). It builds one smooth cubic path that zig-zags between these points, alternating between the left and right gutter, and draws it twice: a 2px stroke in var(--c-primary) and a 1px stroke in var(--c-accent) with a 3px sine offset, so the two strands read as twisted yarn. The path's total length becomes stroke-dasharray, and a GSAP ScrollTrigger with scrub:0.6 maps scroll progress to stroke-dashoffset, so the thread spins out exactly as far as the reader has scrolled. When the tip passes a station, that station's knot circle tightens (scale 1.6→1, rotate 90°, 300ms back.out), and a matching numbered stamp lights up in a small fixed 'passport strip' at the bottom-left of the viewport (6 circles, 01–06, each filling with --c-primary as it is stamped). Without JS, or with prefers-reduced-motion, the SVG is not injected: a static CSS 1px dashed vertical line in --c-primary runs down the gutter and all stamps show as filled, so all content stays fully visible. On screens narrower than 640px the path stays inside a 16px left gutter so it never causes horizontal scroll.
Good fit for: wholesale, makers, b2b, lifestyle

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
{ "id": "hair-passport-mill", "name": "Hair Passport Mill", "scheme": "light|dark", "sectors": ["wholesale","makers","b2b","lifestyle"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE hair-passport-mill`.
