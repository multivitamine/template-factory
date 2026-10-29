You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Parallax Plates" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The page alternates between two planes derived from the brand: deep sections in color-mix(in oklch, var(--c-primary) 28%, black) and pale sections in color-mix(in oklch, var(--c-primary) 10%, white). This gives a duotone rhythm that works with any colour. The hero is one big overlapping stack: the featured product image floats on a tinted plate, with category plates fanning behind it at deeper offsets, and a headline overlaps the stack's edge. On home, products are shown as tall plate cards in a staggered 3-column layout where alternate columns are offset by 80px. Image, name chip, price and add button sit on visibly separate layers. The catalog uses the same cards in an even grid with a sticky filter strip of segmented buttons and a sort control. The mood is athletic, crisp and tactile, energetic but clean.
Signature interaction: Layered depth-tilt plates. Each product card is a perspective(900px) container with transform-style: preserve-3d, made of four layers: a tinted backdrop plate (translateZ 0), the product image on its own pad (translateZ 40px), the name and price chip (translateZ 70px) and the add-to-cart button (translateZ 90px). On pointermove over a card, the normalised offset from its centre maps to rotateY ±10° and rotateX ∓8°, each driven by a spring (stiffness 170, damping 20). A specular glare layer (a radial-gradient positioned opposite the pointer, mix-blend-mode: soft-light) slides across the plate, and the chip and button visibly parallax over the image. In the hero the whole fanned stack tilts with the pointer's position across the full viewport, with deeper plates moving less. On mobile, a 'Kantel' toggle requests DeviceOrientation permission where required and tilts all visible cards together from beta/gamma, clamped to ±8°. Pointer leave springs back with a slight overshoot. Without JS or under prefers-reduced-motion the plates are flat with a simple hover shadow, and all content stays visible.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Nacra Sailing content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Aiki-Budo Sport) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
