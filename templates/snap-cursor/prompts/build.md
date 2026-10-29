You are an award-winning web designer and creative developer (think Awwwards Site of the Day, Godly, FWA).
You work fully automatically: nobody will answer questions. Decide, build, finish.

# Your job
Build ONE reusable, **seriously creative** website template: `template.html` (homepage) and `catalog.html` (product listing),
plus `meta.json`, in the current directory. It will be filled with real small-business content (Dutch webshops,
hotels, food suppliers, B2B wholesalers) and their brand colours, at a live event.

# Art direction: "Snap Cursor"
A deep slate-ink ground (#1B2130) is split asymmetrically: a full-height plane of --c-primary occupies the right third of the hero and returns as colour blocks behind the featured product and the footer, so the page reads as two planes of colour rather than a dark theme. Headlines are set large and light in a high-contrast serif over the ink plane, while the featured product sits half on the ink and half on the brand plane. Products follow on home in an offset two-column list with large images in fixed 4:5 frames on a slightly lighter slate pad, and prices are set in italic. The catalog uses a three-column grid with generous gutters, plus a left sticky column that holds category links and sort as plain text buttons. The overall mood is calm, nocturnal and precise, and every interactive element feels physically attracted to the hand.

Typography: Display: 'Noto Serif Display' 200 at very large sizes, with 600 italic for single emphasised words and prices; body 'Inclusive Sans' 400 at 15px, with uppercase letterspaced 11px for nav and labels.
Signature interaction: Shape-shifting snap cursor that doubles as the focus ring. A fixed div replaces the pointer on (pointer: fine) devices as a 14px dot in --c-primary with mix-blend-mode: difference. Its x, y, width, height and border-radius are each driven by a spring (stiffness 320, damping 30). Over any [data-snap] element (nav links, buttons, filter chips, product cards), the targets become that element's rect plus 6px padding and its computed border-radius, so the dot morphs into an outline that wraps the element. The element itself translates up to 6px toward the pointer (magnetic offset = (pointer − centre)·0.18, clamped), and the outline follows the shifted rect. Over product images the cursor becomes a 92px filled disc reading 'Bekijk · €price'. On free movement the dot stretches along its heading by 1 + speed·0.002, up to 1.6×, with an inverse squash across it. The same spring outline snaps to whichever element has :focus-visible, so keyboard users get the identical morphing ring as their focus indicator. On touch devices the native cursor is used. Under prefers-reduced-motion the outline jumps instantly with no stretch or magnetic offset.
Good fit for: luxury, hospitality, lifestyle, culture

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
{ "id": "snap-cursor", "name": "Snap Cursor", "scheme": "light|dark", "sectors": ["luxury","hospitality","lifestyle","culture"],
  "mood": ["3-5 words"], "needsProductImages": true, "notes": "one line on how brand colours are used" }
```
Write the files in as few steps as possible (one Write per file). When done reply: `DONE snap-cursor`.
