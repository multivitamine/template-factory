You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Brush and Seal" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The page is a tall hanging scroll on warm rice paper, mounted in a silk border band in a muted tone, with wooden roller ends at the top and bottom. The hero is a single large brushed word with lots of empty paper around it, the headline set vertically alongside it, and one red seal impression (in --c-primary) as the logo. Sections are separate album leaves with generous margins, each with a short column of text. Products are shown in a sparse two-column album, each with a small ink-wash swatch, its name, a short poem-like description and a seal-style price chop. Texture comes from paper fibres, ink bleed at stroke edges and a slight silk sheen on the mounting. The mood is calm, severe and spacious.
Signature interaction: Velocity-sensitive brush: in the hero (and in a 'sign the guestbook' contact field), pointer movement paints ink on a canvas. Each frame, the brush width is mapped inversely to pointer speed (from 2px to 28px, smoothed with lerp 0.25), and the ink load decreases with distance travelled. As it runs dry, the stroke breaks into 8–12 parallel bristle lines with noise gaps, giving a dry-brush streak. The stroke is drawn as a filled quad strip so the width tapers at the start and end, and pausing on the paper spreads a soft bleed blot. Adding a product to cart presses the red seal: an SVG chop scales from 1.15 to 1 with a slight rotation and leaves a speckled impression made with feTurbulence plus feDisplacementMap. Under prefers-reduced-motion the brush is disabled and the seal appears without the press.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Aiki-Budo Sport content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Terpstra Muziek Drumland) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
