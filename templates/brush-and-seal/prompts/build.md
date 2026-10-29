You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Brush and Seal"
The page is a tall hanging scroll on warm rice paper, mounted in a silk border band in a muted tone, with wooden roller ends at the top and bottom. The hero is a single large brushed word with lots of empty paper around it, the headline set vertically alongside it, and one red seal impression (in --c-primary) as the logo. Sections are separate album leaves with generous margins, each with a short column of text. Products are shown in a sparse two-column album, each with a small ink-wash swatch, its name, a short poem-like description and a seal-style price chop. Texture comes from paper fibres, ink bleed at stroke edges and a slight silk sheen on the mounting. The mood is calm, severe and spacious.

Typography: Display: 'Shippori Mincho B1' 800 for headings, set vertically with writing-mode: vertical-rl where it fits; body 'Zen Kaku Gothic New' 400/500; prices and seal text 'Shippori Mincho B1' 700 inside square chops.
Signature interaction: Velocity-sensitive brush: in the hero (and in a 'sign the guestbook' contact field), pointer movement paints ink on a canvas. Each frame, the brush width is mapped inversely to pointer speed (from 2px to 28px, smoothed with lerp 0.25), and the ink load decreases with distance travelled. As it runs dry, the stroke breaks into 8–12 parallel bristle lines with noise gaps, giving a dry-brush streak. The stroke is drawn as a filled quad strip so the width tapers at the start and end, and pausing on the paper spreads a soft bleed blot. Adding a product to cart presses the red seal: an SVG chop scales from 1.15 to 1 with a slight rotation and leaves a speckled impression made with feTurbulence plus feDisplacementMap. Under prefers-reduced-motion the brush is disabled and the seal appears without the press.
Good fit for: food, makers, lifestyle, luxury

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
`sample.json` in this directory is real content from Aiki-Budo Sport in exactly the shape your template receives.
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
{ "id": "brush-and-seal", "name": "Brush and Seal", "scheme": "light|dark", "sectors": ["food","makers","lifestyle","luxury"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE brush-and-seal`.
