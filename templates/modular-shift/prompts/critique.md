You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Modular Shift" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A cool light-grey ground (#EEF0F1) with a visible 12-column hairline grid that every element snaps to. Everything is black, grey and white except --c-primary, which marks only the live state (active filter, add button, cart count). The hero is a modular composition: the headline spans 6×3 cells, the featured product 4×4, and a stat cell and the CTA fill the rest, all with ultra-thin 1px rules. Every product tile carries a data label row (index number, short code, category, price) set in condensed mono caps, and images are contained on a white field inside the tile, so mixed photos look catalogued. The catalog leads with sort (price, name, new), category filters and a density toggle for 2, 4 or 6 columns. The mood is cold, exact and quietly technical.
Signature interaction: Rank-packing FLIP grid. Whenever sort, filter or density changes, tiles get spans from their new rank (rank 1 = 2×2, ranks 2–3 = 2×1, the rest 1×1) in a CSS grid with grid-auto-flow: dense, so the layout re-composes itself rather than just reordering. FLIP: record every tile's rect (First), apply the new order and span classes (Last), set the inverse transform including scaleX/scaleY for the size change (Invert), then animate to identity with WAAPI over 520ms using a spring-like cubic-bezier (Play). The image inside each tile gets the inverse scale on the same timeline, so photos never distort. Removed tiles are pinned absolutely at their old rect and fade to 0. New tiles enter from scale 0.9 and 0 opacity with a 30ms stagger, and the result count rolls like an odometer. Magnetic quick-add: within 60px of the pointer, a tile's add button eases toward the pointer by up to 8px and snaps back on leave. Under prefers-reduced-motion the layout changes instantly.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Aiki-Budo Sport content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Droogijs365) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
