You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Open Canvas" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage hero is a full-viewport pannable field on charcoal (#161616). Products, category cards, a headline card and USP cards lie on an endlessly wrapping grid of irregular card sizes with 48px gutters, so the whole assortment is visible at a glance. A fixed bottom dock holds the shop CTA, category chips and zoom +/− controls. Below the field, a normal scrolling section (bestseller row, trust, contact) serves visitors who never drag. Product images sit contained in uniform #242424 frames with a 1px #333 hairline, and the name, price and quick-add sit outside the image, so mixed photos read as a curated wall. The catalog reuses the same canvas engine with a toggle to a conventional grid view (the default on mobile), and the filter chips and sort live in the dock. The mood is calm, dark and gallery-like, with --c-primary reserved for the dock CTA, active chips and the cart.
Signature interaction: Infinite momentum canvas. Tiles are absolutely positioned in a container, and the canvas state is an offset (x, y), a velocity and a scale. Pointer drag moves the offset 1:1 and estimates velocity from the last 80ms of samples; on release the velocity decays by 0.94 per frame. Each tile is drawn at ((baseX + x) mod W) − margin (and the same for y), so the field repeats seamlessly in both axes, and content is duplicated when there are fewer than about 24 items. The wheel pans. Ctrl+wheel or pinch zooms between 0.5 and 1.6 around the pointer, adjusting the offset so the point under the cursor stays fixed. A pointerup with less than 6px of travel on a product counts as a click: it tweens the offset and scale until that card is centred at 1.4×, dims the other tiles to 30%, and slides in a right-hand detail panel with add-to-cart. Choosing a category chip shrinks non-matching tiles to 0.85 at 20% opacity and glides the canvas to the nearest matching cluster. All tiles stay in DOM order and tabbable, and focusing one pans it to the centre; arrow keys pan by 120px. Without JS or under prefers-reduced-motion, the field is a plain responsive grid.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Spaansen content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Birth Bear) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
