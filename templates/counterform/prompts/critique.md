You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Counterform" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A stark paper-white page (#FAFAF8) with black type, a single --c-primary used for the cart, active states and the scroll-zoom rim, and nothing decorative beyond type and product photography. The hero is the brand name set enormous across the viewport in a wide geometric display face, with the featured product image visible only through the letter counters and bowls (the inside of the O, A, B, R), plus a shop CTA pinned bottom-right. Scrolling zooms into one counter until the product image fills the screen, which is where the products begin. Homepage products sit on a strict 3-column grid of square tiles with a pale #EFEEEA mat around contained photos, oversized prices and a quick add that slides up from the tile base. The catalog keeps the grid and uses large wide category words as filters, with the active word's counters filled with that category's first product image. The mood is loud but disciplined: pure contrast, sharp corners and fast crisp transitions.
Signature interaction: Zoom through the counter. The hero headline is an inline SVG: the brand name as <text> inside a <mask> (white rect plus black glyphs), laid over an <image> of the featured product, so the image shows only inside the counters and gaps. After fonts load, JS finds the largest enclosed counter by rasterising the text to an offscreen canvas at 1/4 size, flood-filling from the edges, and taking the bounding box of the largest unreached region; its centre becomes the zoom origin (with a fallback to the visual centre of the first glyph with a bowl). A pinned section of 220vh (GSAP ScrollTrigger, scrub 0.7) scales the masked SVG group from 1 to about 40 around that origin, so the counter grows until the product fills the viewport, while a 2px ring in --c-primary traces the counter edge and thins out. In the last 20% the featured product's name, price and add-to-cart fade in over the full-bleed image, and the section unpins into the product grid. Catalog filter words reuse the mask at small scale: hovering a word drops a different product image into its counters with a 300ms vertical slide. Without JS or under prefers-reduced-motion the headline renders with the image already inside its counters and the featured product follows as a normal section.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Banks Mansion content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Nacra Sailing) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page

Automatic checks found:
- home-mobile: horizontal overflow (page wider than viewport)

# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
