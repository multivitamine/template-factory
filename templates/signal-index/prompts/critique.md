You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Signal Index" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A cool off-white page (#F5F6F7) set on a strict 12-column grid of ultra-thin hairlines, monochrome except for --c-primary, which marks selected data, active filters and the cart. The hero is a clean typographic statement with key figures (assortment size, delivery time, minimum order) as large tabular numbers, next to the featured product in a square frame with data-like labels (SKU-style index, category code, price per unit). Homepage products run as a dense table-like grid where every card has a small product photo contained on a #ECEEF0 pad, a mono index, name, price and a tiny bar showing where that price sits in the range, with a quick add. The catalog leads with a full-width price histogram that you brush to filter, plus category toggles, sort and a list/grid density switch, and a live result counter. The mood is cold, precise and trustworthy, made for buyers who compare.
Signature interaction: Brushable price histogram that filters the catalog. On load, JS buckets all product prices into 24 bins and draws an SVG histogram (one rect per bin, height by count, hairline baseline, mono min/max axis labels). Pointer drag across the histogram creates a brush: a translucent --c-primary band with two draggable handles (keyboard: focus a handle and use arrow keys for one bin or Shift+arrow for five). While brushing, bars inside the band fill with the primary and bars outside fade to 25%, and every product card outside the range collapses: its height animates to 0 via a grid-template-rows 1fr→0fr transition with opacity, so the grid tightens without reflow jumps. The result counter tweens numerically. Hovering a bar highlights the products in that bin (outline in --c-primary) and hovering a product lights its bin and moves a tick on the axis to its exact price. The brush range is combined with the category toggles (the histogram redraws to that category's distribution with a 300ms bar-height transition) and is stored in the URL as ?min=&max= so links keep the selection. Without JS, the histogram is a static figure and all products are listed; under prefers-reduced-motion, cards hide and show instantly.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Droogijs365 content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Fredimare) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
