You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Hush Edition" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage opens on a near-empty warm paper-white field (#F7F5F1). It holds one full-bleed featured image cropped to 21:9, the brand name set tiny in the top-left corner, and a single short headline as the only large type on the page. Products are a sparse asymmetric index: small thumbnails in fixed 4:5 frames, contained on a faint mat of color-mix(var(--c-primary) 4%, white) so mixed photo backgrounds look deliberate, floated at irregular column offsets on a 12-column grid, with name and price in 11px tracked caps beneath. The catalog is a calm three-column grid with a hairline filter bar of text-only toggles and a sort control styled as a single underlined word. Motion is slow and precise: 900ms easings, images settle from 0.96 scale, nothing bounces. --c-primary appears only on the cart count, the active filter underline and the add-to-cart button, and trust and contact sit in a narrow two-column colophon with generous leading.
Signature interaction: Shared-element morph into a detail sheet. Clicking a product thumbnail gives its image and name a view-transition-name and calls document.startViewTransition. Inside the callback the DOM swaps to an in-page detail sheet (a full-viewport overlay with the image full-bleed on the left 60% and details, quantity stepper and add-to-cart on the right), so the small thumbnail morphs continuously into the full-bleed image while everything else cross-fades. Where View Transitions are unsupported, a FLIP fallback measures the thumbnail rect, places a fixed-position clone there and tweens its transform to the target rect over 700ms with cubic-bezier(.2,.7,.1,1). The open sheet pushes history state (#p-<index>), so Escape, the close word or browser Back morphs the image back into its exact slot. Focus is trapped in the sheet and returned to the thumbnail on close. Under prefers-reduced-motion the sheet simply cross-fades.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Banks Mansion content + brand colours
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
