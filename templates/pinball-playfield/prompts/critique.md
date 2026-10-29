You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Pinball Playfield" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage is a tilted pinball playfield seen from the player's end on a dark cabinet. The backglass at the top holds the brand name, the headline and a score display. Below it, the playfield has lanes, slingshots and round pop bumpers, and the bumpers are the category links. Product cards are drop targets and lit inserts arranged along the ramps. The rest of the page goes 'under the glass': the catalogue is a grid of inserts with chrome rails, the info sections sit on apron cards, and the contact block is the instruction card. The brand colour drives every lit insert and the bumper caps, against black and chrome, with a subtle glass glare overlay. The mood is loud, playful and noisy, but built on a clear grid.
Signature interaction: A playable ball in the hero: a canvas runs a fixed-timestep 2D physics loop (120Hz) with gravity tilted down the table, circle-vs-segment collisions for walls and flippers, and circle-vs-circle collisions for the bumpers, which add an outward impulse. The Left/Right arrow keys, or tapping the left and right halves on touch, fire the flippers, which are line segments rotated with angular velocity so their tip speed transfers to the ball. Each bumper hit lights its insert in --c-primary, increments the backglass score, and plays a short WebAudio blip (muted by default). Hitting a category bumper three times opens that category, and the ball draining scrolls to the catalogue. The physics pauses when the hero is out of view. Under prefers-reduced-motion it becomes a static table with clickable bumpers.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Terpstra Muziek Drumland content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Hotel Navarra) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
