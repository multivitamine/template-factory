You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Liquid Pane" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The whole page sits on a slowly drifting mesh gradient built from tints of --c-primary and --c-accent mixed generously with white, so any brand colour becomes an airy pastel atmosphere. All UI is frosted glass: a floating pill nav with the cart, glass product slabs with 28px radius, backdrop-filter blur(24px) saturate(1.6), a 1px white inner border and a specular highlight along the top edge. Product images sit in white rounded inset wells, which unifies mixed backgrounds. The hero holds a large glass panel with the headline and shop CTA, plus a draggable glass 'Shop' orb. The catalog has a glass filter sidebar on desktop, a draggable bottom sheet on mobile and a sticky glass add-to-cart bar. The mood is light, cool and calm, with soft depth.
Signature interaction: Refracting glass orb over a reactive mesh. The background is a canvas with 5 soft colour points moving on slow Lissajous paths, rendered at 1/8 resolution and upscaled with smoothing. Colours are read from getComputedStyle at startup, with a CSS gradient as fallback. The pointer is a gravity well: points within 300px are drawn toward it by a spring, so colour pools around the cursor. The hero 'Shop' orb is draggable with pointer events. In Chromium it refracts what is behind it through backdrop-filter: url(#refract), an SVG filter that uses feImage to load a generated radial displacement map (edge normals encoded in R/G) into feDisplacementMap at scale 40, with ±2px channel offsets for slight chromatic aberration. Other browsers fall back to blur plus a scale. Dragging the orb over a product card lifts that card (scale 1.04 plus highlight). Dropping it on the card adds the product to the cart with a gooey merge: the orb squashes into the card's add button through a feGaussianBlur + feColorMatrix goo filter, then reappears at its home spot. A tap on the orb scrolls to the products. The cart is stored in localStorage. Under prefers-reduced-motion the gradient is static and the orb is a plain button.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with TeleQare content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Brinks Coffee Roasters) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
