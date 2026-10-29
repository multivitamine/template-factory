You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Slit Velocity" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A near-black field (#0A0B0C) with cool grey hairlines, where --c-primary is the only live colour: prices on hover, the cart count, the active filter and the scroll meter. The hero is a full-bleed featured product set inside a tall portrait frame on the right, against a towering condensed headline on the left that runs the full viewport height, with a single shop CTA and a live speed readout underneath. Homepage products sit in a tight 4-column grid of uniform 4:5 frames on a #141618 surface; each photo is contained with 8% padding and a soft vignette, so mixed backgrounds read as studio shots, with a mono name/price strip beneath and a quick-add square that fills with the primary on hover. The catalog keeps the grid with a slim sticky filter bar of uppercase category words, a sort toggle and a density switch (3/4/6 columns), plus a thin progress line in --c-primary along the top edge. Motion is all about momentum: at rest everything is crisp and still, at speed the page liquefies, and the mood is cold, fast and technical.
Signature interaction: Slit-scan scroll smear. Every product image (and the hero image) is drawn into a canvas the size of its frame as 32 horizontal strips. Each strip i has its own offset spring (stiffness 140 + i·4, damping 22) that targets the current scroll velocity (px/frame, clamped to ±60, measured from rAF-sampled scrollY). The strip is drawn with drawImage at y + offset_i, and the source rect is stretched vertically by 1 + |v|·0.004. Because the strips settle at slightly different rates, images stretch and tear into a slit-scan streak during fast scrolls and snap back crisply when the page stops. Hovering a frame applies the same effect horizontally from pointer velocity (the strips become vertical columns). A thin red-shift on the strip edges is drawn at 2px with globalCompositeOperation 'lighter' in --c-primary at 25% alpha, scaled by speed. A mono speed readout in the hero ('V 0.00') shows the smoothed velocity. Only canvases in view are updated (IntersectionObserver), and a canvas stops redrawing once all springs are within 0.1px of rest. Real <img> elements stay underneath for no-JS and SEO; under prefers-reduced-motion the canvases are never created.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Kartstore International content + brand colours
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
