You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Cut Sheet" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The page is the bed of a precision glass-cutting machine seen from directly above. A cool graphite cutting table with a faint 5mm registration grid holds large sheets of toughened glass, drawn as pale translucent panels with a soft blue-green edge tint, a diagonal sheen gradient and tiny chamfered corners. In the hero the brand headline sits on one big glass sheet, and a single --c-primary cutting head (a small crosshair carriage riding on a horizontal gantry rail that spans the viewport) traces dashed SVG cut lines around rounded-rectangle 'screen' shapes nested on the sheet. Beside it a machine-display strip shows QR-set readouts in mono type: DESIGN #, DEPTH 0.33 mm, TORQUE 2.4 Nm, SHEETS CUT and a small CSS QR glyph. Below the hero, categories are laid out like a nesting plan: one long sheet whose irregular shapes (phone, tablet, dashboard, kiosk outlines, which become generic rounded panels for a hotel or roaster) are each a category link with a stencilled part number. Products sit in the catalog as cut-out glass tiles: each card is a pane with a cut-line border, a mono spec row (SKU-style index, category, price) and a fine score mark in one corner. The 'library' strip counts up the shape library ('36,000 designs' → the business's own stat or product count), and a 'live map' section draws a dot-matrix Europe made of tiny glass squares. The ones near the business glow in --c-primary for locations and contact, with the address and opening hours on a machine-plate panel. The mood is clean-room calm and exact: cool neutrals owned by the template, crisp 1px lines, no ornament apart from the glass. Everything works without JS because the cut lines simply render as static dashed outlines.
Signature interaction: The 'cut-out' reveal. Every product tile and category shape has an SVG overlay rect with stroke-dasharray matching its perimeter (pathLength=1) and the --c-primary crosshair cutting head as an absolutely positioned element. When a tile enters the viewport (IntersectionObserver, threshold 0.4, staggered 90ms per tile), GSAP moves the crosshair along the rect path with MotionPathPlugin over 0.9s while stroke-dashoffset animates from 1 to 0, so the line is drawn exactly behind the head. A mono readout in the tile corner ticks DEPTH and TORQUE values with GSAP number tweens. On completion the pane 'drops out' of the sheet: translateY(-4px) plus a deeper shadow, the sheet behind gets a darker inset hole the same shape, and a tiny 'CUT ✓ #<index>' label stamps in. On hover the head re-traces at 2× speed. When prefers-reduced-motion is on, or without JS, the tiles render already cut with solid outlines.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with TeleQare content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Brinks Coffee Roasters) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
