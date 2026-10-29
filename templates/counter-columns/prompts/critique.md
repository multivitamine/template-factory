You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Counter Columns" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A warm light sand ground (#E8DFD0) is divided by thick 3px black vertical rules into four columns, with a centred axial composition on top. The brand wordmark and a short headline sit dead centre over the columns, with the shop CTA beneath. The hero is a pinned stage where four tall columns of product tiles move in opposite directions, so the shop's range literally flows past the headline. After the stage unpins, the homepage continues with a centred category list in huge condensed caps, a USP row split by the same black rules, and contact. The catalog shows a 4-column grid that keeps the rules, with category and sort controls centred in a black bar. Product tiles are framed on white pads with a fixed 3:4 ratio, and name and price sit in a black strip under each one. The mood is lively, rhythmic and editorial, bold without being noisy.
Signature interaction: Opposing infinite product columns. The hero is a 100vh stage pinned for 250vh (GSAP ScrollTrigger, or a plain sticky + scroll-progress fallback). It holds four columns (two on mobile), each filled with product tiles duplicated until the column is at least twice the stage height. A shared 'travel' value follows scroll with lerp 0.09 for inertia. Each column translates by travel × its own rate (1, −1.35, 0.8, −1.15) and wraps with modulo of the column's content height, so columns flow endlessly up and down against each other. While the user scrolls, the stage's centre headline stays still above the flowing columns on a sand pad. Hovering a tile eases its column's personal rate to 0 over 300ms, so the user can read it, then scales the tile to 1.04 and slides in its price and a quick-add button. Pointer leave restores the flow. Clicking a category in the centred list re-populates the columns with that category's products as the stage replays. Tiles are real links in DOM order, so focusing one stops its column and scrolls it into view. Without JS or under prefers-reduced-motion the stage is a static 4-column grid separated by the black rules.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Spaansen content + brand colours
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
