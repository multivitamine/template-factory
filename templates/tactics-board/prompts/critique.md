You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Tactics Board" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage is a big glossy whiteboard bolted to a breeze-block wall, with a pitch or track diagram printed faintly in grey. The hero headline is scrawled in marker, and the CTA is a round magnet in --c-primary. Products are magnetic counters with a photo-swatch, name and price, placed in formations on the board. Each category is a 'play', with arrows, X's and O's in dry-erase marker showing how the counters relate. Sections below are taped-on sheets: a fixtures list for opening hours, a squad list for the team, and a clipboard for contact. Texture comes from marker ghosting (faint erased strokes) and glossy reflections on the board. The mood is loud, energetic and hands-on.
Signature interaction: Lasso to compare: the user draws with the pointer (or a marker tool button on touch) directly on the board. The freehand path is captured as points, smoothed with Chaikin's algorithm and rendered as a slightly jittered marker stroke in --c-primary. When the stroke ends near its start (within 40px), it is closed into a polygon, and every product counter whose centre passes a point-in-polygon test is 'circled': it wobbles, gets a marker ring, and is added to a comparison table that slides up from the bottom with specs side by side. Open strokes drawn from one counter to another become arrows with a computed arrowhead. An eraser button wipes all strokes with an animated smear. Keyboard users select counters with Space and press C to compare.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Spaansen content + brand colours
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
