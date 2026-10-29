You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Afterglow Launch" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The page is near-black (#07080A), lit only by soft radial glows of --c-primary at about 12% opacity. The hero centres the featured product large over a circular glow plinth, with a whisper-thin headline above and four spec figures set in mono around it. A pinned storytelling chapter follows, then a dark product grid. Each product image sits in a rounded inner light box (an inset radial gradient from #1A1C20 to #0B0C0E with a 1px hairline border), so white-backed photos read as lit displays rather than holes. The catalog is a dark grid with a mono spec line per card and a segmented filter control whose active indicator is a sliding glow, plus a sort menu and live count. Trust is shown as large thin numerals, and contact as a single glowing CTA band. The mood is cold, premium and technical.
Signature interaction: Exploded image layers. The featured product image is rendered 5 times, stacked in a perspective(1400px) container, with each copy clipped to one horizontal band (clip-path: inset) so together they form the intact image. A pinned section of 300vh (GSAP ScrollTrigger, scrub 0.8) maps progress to separation: layer i translates translateZ((i−2)·120px) and translateY((i−2)·28px) and the stack rotates rotateX(−18deg). The image fans apart into floating slices, each with a --c-primary glow along its top edge. As each slice reaches full separation, a spec card from the content (USP or product fact) slides in beside it with a mono index, and a vertical progress rail with 5 ticks fills. In the last 15% the slices recombine and an add-to-cart button for that product fades in under the intact image. On mobile the scroll distance halves and the Z offsets scale by 0.5. Without JS or under prefers-reduced-motion, the image is shown whole with the spec cards as a plain list.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Nacra Sailing content + brand colours
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
