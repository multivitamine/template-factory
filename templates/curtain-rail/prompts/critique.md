You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Curtain Rail" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A warm, dark umber ground (#1B1714) with ivory type sets a cinematic mood. On desktop, the homepage is a horizontal sequence of full-viewport panels with vertical wheel input mapped to horizontal travel: a full-bleed hero with a large italic headline and shop CTA, category panels, a lookbook rail of products at 70vh height with varied widths, then trust and contact panels. On mobile it becomes a vertical stack with swipeable rails. Rail images use cover framing by default, but JS checks naturalWidth/naturalHeight and switches extreme aspect ratios to contain on a soft tinted mat, so odd photos stay intentional. Hovering an image plays a brief SVG displacement ripple (feTurbulence + feDisplacementMap, scale tweened 0 → 12 → 0). The catalog is a vertical grid with a horizontal category rail and sort, and a large '03 / 12' style counter tracks position throughout.
Signature interaction: Iris transition across pages. Same-origin link clicks (home, catalog, category and product anchors) are intercepted. The click coordinates, target URL and target title go into sessionStorage, and a fixed overlay in --c-primary grows its clip-path from circle(0 at x y) to circle(R at x y), where R is the distance to the farthest viewport corner, over 650ms. The destination title fades in at the centre in the display italic, then location.href navigates. On load, the next page reads sessionStorage, starts fully covered and shrinks the circle toward the element with the matching data-key (the clicked category or product), or toward the centre otherwise, then clears the key. pageshow with persisted skips the effect so Back stays instant. The horizontal home rail eases wheel and drag input with lerp 0.1, and the panel counter updates on snap. Without JS links work normally, and under prefers-reduced-motion navigation is plain.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Fredimare content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Nacra Sailing) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
