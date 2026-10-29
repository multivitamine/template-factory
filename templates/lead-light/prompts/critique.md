You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Lead Light" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage is one tall lancet window seen from inside a cool stone interior: a pointed-arch frame holds an irregular mosaic of glass panes separated by thick dark lead lines. The hero panes carry the headline and CTA, and the lower panes become the catalogue: each product sits in its own pane, glazed in a tint derived from --c-primary or --c-accent mixed with amber, rose and sea-green neutrals so any brand colour reads as one more colour of glass. Below the window, the sections sit on pale limestone with a soft coloured light pool on the floor, drawn as a blurred, low-opacity copy of the window. The navigation is a small rose window: a circular row of six petals. Texture comes from seeded-noise mottling inside each pane and a faint reamy wobble on the edges. The mood is luminous, hushed and devotional, but warm.
Signature interaction: Breathing leadwork: the window is an additively weighted Voronoi diagram of about 40 seeds (products, hero and filler panes), rasterised on a 4px grid in a canvas. For each grid cell, compute the seed that minimises distance − weight. Draw lead lines wherever neighbouring cells belong to different seeds, as 6px dark strokes with a 1px highlight. Hovering or focusing a product pane tweens its seed weight from 0 to 90px with a spring, so that pane swells, its neighbours are squeezed, and the lead lines visibly re-route around it. Recompute only inside the dirty bounding box at 30fps. Real DOM buttons are absolutely positioned at each seed so the panes are clickable and tabbable. Under prefers-reduced-motion the weights jump instantly.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Hotel Navarra content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Kartstore International) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
