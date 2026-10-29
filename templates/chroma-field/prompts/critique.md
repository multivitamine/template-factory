You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Chroma Field" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The whole page is a single saturated colour field in the brand's own primary. It is built from stacked full-width bands with no cards around the sections, so the brand colour itself is the ground. Each band carries one gigantic headline that runs off the edge, with products set as crisp cut-out tiles on a matte pad that alternates between ink and bone, and price plus quick-add sitting in a hard-edged strip under each image. The homepage runs hero, then featured products, a four-tile category band, a USP band with oversized numerals, and contact. The catalog keeps the field behind a sticky filter bar of pill toggles and a sort select, with the grid in three columns on desktop and two on mobile. The mood is loud, confident and graphic, with no textures, only colour, type and product.
Signature interaction: Scroll-mapped OKLab colour field. At startup JS reads --c-primary with getComputedStyle, converts it from sRGB to OKLab/OKLCH with the standard matrices, and derives 5 tones: the primary itself, a deep shade (L−0.2), a pale tint (L+0.3, C×0.35), a hue-rotated sibling (h+40°, same L, chroma clamped to stay in gamut) and a near-ink (L 0.18). Each band has data-tone=0–4. On every rAF after scroll, it finds the two bands that straddle the viewport's 50% line, computes progress t between their tops, interpolates the two tones in OKLab (not RGB, so there is no muddy midpoint) and writes the result to --field on <body>. The text colour --ink is chosen per frame by relative luminance (threshold 0.42) and crossfades over 0.15 of t, so type flips between black and white exactly when contrast demands it. The same interpolated colour, darkened by 8%, becomes the pad behind every product image so mixed photo backgrounds read as one system. Without JS each band gets a static colour-mix() of its tone; under prefers-reduced-motion the field switches per band with a 200ms fade instead of interpolating.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Droogijs365 content + brand colours
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
