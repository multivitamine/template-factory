You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Elastic Grid" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A cool mid-tone concrete ground (#A9AEB2) holds stark white inset tiles separated by 2px gutters of the ground colour, so the page reads like a precise, tight-packed product wall. The hero is a 4×2 board: one large headline tile with the shop CTA and seven category or product tiles. Below it the featured products form a dense 4-column board, followed by a USP strip of three white tiles and a contact tile. In the catalog the entire product range is one elastic board under a slim filter rail with category toggles, sort and result count. Each tile shows the photo object-fit cover on a white pad with name and price in a corner label. Motion is purely structural: the grid itself breathes toward the pointer.
Signature interaction: Fisheye track grid. The board is a CSS grid whose grid-template-columns and grid-template-rows are written by JS as fr values. On pointermove, each column i gets target weight w = 1 + 1.6·exp(−dx²/(2·0.9²)), where dx is the distance from the pointer to that column's centre in column units, and rows get the same treatment. Every track weight follows its target through its own spring (stiffness 210, damping 24) and the grid is rewritten once per rAF, so the tile under the cursor swells to about 2.6× while its neighbours compress smoothly with no reflow jumps. A tile's label opacity and quick-add button are bound to a CSS variable --open = clamp(0, (w−1.4)/0.8, 1), so detail appears only on the magnified tile. Pointer leave springs every track back to 1. Keyboard focus sets the focal point to the focused tile, and a tap on touch does the same. When a filter is chosen, non-matching tiles get a weight floor of 0.15 and 20% opacity before being removed after 400ms, so the board visibly squeezes them out. Without JS or under prefers-reduced-motion the board is an even grid and hover only raises the label.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Kartstore International content + brand colours
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
