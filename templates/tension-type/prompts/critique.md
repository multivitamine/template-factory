You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Tension Type" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A stark white page with black type and --c-primary as the single electric accent. The hero is the brand name set in one line from edge to edge and fitted to exactly 100vw whatever its length, with the shop CTA and a one-line pitch tucked small underneath. Products are small precise objects: 160px square images contained with generous padding on a #EDEDED tile, in a strict 6-up row (2-up on mobile) with tiny name, price and quick-add labels, so the giant type and the small goods play off each other. Every section title is another full-width fitted word, and the trust and contact blocks use the same scale contrast. In the catalog, the category filters are words set in the variable display face at 32px whose weight swells when active, next to a minimal sort select and result count. The mood is loud but disciplined: only black, white, grey and one colour.
Signature interaction: Proximity axes on a fitted wordmark. The hero wordmark is split into per-letter spans. On pointermove, each letter computes its distance d from the pointer, with target wght = 100 + 900·exp(−d²/2σ²) and target wdth = 60 + 70·exp(−d²/2σ²), where σ is 18% of the viewport width. Each letter's current values follow the targets with a spring (stiffness 170, damping 26) applied through font-variation-settings, so a heavy, wide bulge travels with the cursor. Once per frame, after the letters update, the line is measured with one getBoundingClientRect and the container gets transform: scaleX(100vw / width), so the word always spans the viewport exactly. After 2s of idle, a slow sine wave of weight runs across the letters. On touch devices, scroll position drives the same bulge sweeping left to right. Section words get the effect only while hovered, and in the catalog, switching filter tweens the old word to wght 100 and the new one to 900. Under prefers-reduced-motion all words sit statically at weight 700.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Droogijs365 content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (BOHLT) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
