You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Soft Spring" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A warm cream background with pastel blocks derived from the brand through color-mix(in oklch, var(--c-primary) 14%, white), so any colour turns into a gentle tint while the full colour stays reserved for buttons and the cart. Everything is rounded: 32px blocks, pill buttons and circular badges. The hero is a large tinted capsule with a chunky headline, the featured product in a rounded image well, and category pills floating around it on slow bobbing loops. Product cards have rounded tinted image wells (contain, centred), so mixed photos sit like objects on a plate, plus a big round '+' quick-add button. On mobile a sticky add-to-cart bar appears. The catalog has pill filters with a sliding blob indicator, a sort pill and cheerful empty states. The mood is light, warm and happily loud, without clutter.
Signature interaction: Squash-and-stretch add to cart. Pressing '+' squashes the button (scaleX 1.1, scaleY 0.85) and it springs back on release. A 56px circular clone of the product image then flies to the sticky cart pill along a quadratic bezier computed from the two rects, with the control point 160px above the midpoint. It is driven in requestAnimationFrame: each frame the clone rotates to the curve's tangent angle and stretches along it by 1 + speed·k while compressing across it, preserving area. On arrival the cart pill wobbles like jelly through a damped spring on scaleX and scaleY in opposite phase, and the count rolls up vertically. Cards also respond to touch: on pointerdown a card scales to 0.97 with its transform-origin at the pointer, and releases with a little overshoot. The cart is stored in localStorage and the cart pill opens a rounded drawer. Under prefers-reduced-motion the count simply updates with a fade.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Birth Bear content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Terpstra Muziek Drumland) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page

Automatic checks found:
- home-desktop: JavaScript errors: Cannot set properties of null (setting 'textContent')
- home-mobile: JavaScript errors: Cannot set properties of null (setting 'textContent')
- home-stress: JavaScript errors: Cannot set properties of null (setting 'textContent')

# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
