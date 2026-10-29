You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Raking Light" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A matte porcelain-white page (#F4F3F0) where every surface is slightly raised: cards, buttons and the nav are subtly embossed panels, and the only colour is --c-primary on prices, the cart and active states. The hero is a large raised slab holding the headline in a thin, large serif and a contained featured product photo on a recessed pad, with a primary shop button, and the whole page is lit from the pointer like light sweeping across a relief. Homepage products sit on a calm 3-column grid of raised square tiles with photos recessed into a soft inset pad (so any background becomes part of the relief), with name, price and add-to-cart below. The catalog uses the same tiles with a raised segmented filter control and a sort select, and the active segment is pressed in. The mood is quiet, tactile and premium, with very little motion besides the light.
Signature interaction: Pointer-driven raking light. A single light position L follows the pointer with lerp 0.08 (idling on a slow elliptical drift when the pointer leaves), and its height h is mapped from vertical scroll velocity so the light lowers and shadows lengthen while scrolling. Each frame, for every raised element in view (cached rects, refreshed on scroll/resize), JS computes the normalised vector from L to the element's centre and its distance, and writes --sx, --sy, --sl and --hl. CSS uses them for three stacked box-shadows: a tight contact shadow, a long soft shadow offset along the vector (length grows with distance up to 48px, blur up to 60px, alpha falling with distance) and an inset highlight on the edge facing the light. A linear-gradient sheen across the surface is rotated to face the light (angle from Math.atan2). Pressed controls invert the model (inset shadows), and pressing a button animates its depth from raised to pressed in 120ms. Product photo pads are recessed, so their inset shadow shifts opposite to the tile's shadow, giving the photos real depth. Without JS a fixed top-left light is used, and under prefers-reduced-motion the light stays fixed and only hover states change.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Nacra Sailing content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (TeleQare) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
