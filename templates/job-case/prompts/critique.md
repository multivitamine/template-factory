You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Job Case" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The page is a printer's wooden type case pulled out of its cabinet. The hero is a grid of compartments in the real, unequal job-case proportions, with big boxes for common letters and tiny ones for rare letters. Each compartment holds a pile of metal sorts drawn in CSS, and the largest compartments double as category tiles. Below, the catalogue is laid out as printed proofs: each product card is a proof pulled on cream stock, with slight ink-squash edges and a registration mark, and with the price set in a locked-up chase of furniture. Section dividers are lengths of brass rule and wooden reglet. The brand colour becomes the ink on the proofs and the paint on the drawer pull. The mood is warm, tactile and confident.
Signature interaction: Composing-stick search: typing in the search field 'picks' each letter from its compartment in the hero case. A sort element is cloned at that compartment's centre and flies along a GSAP bezier arc into a composing stick at the top of the page, landing mirrored (scaleX(-1)) like real metal type. It then flips to read correctly once the word is complete. Backspace flies the last sort back to its box. The product proofs filter live under the stick, and matching letters in product names flash in --c-primary ink. Clicking a compartment types that letter. Spaces drop in as blank quads. Under prefers-reduced-motion, letters appear in the stick without the flight.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Spaansen content + brand colours
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
