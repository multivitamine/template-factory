You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Mosaic Resolve" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage opens on a full-bleed photographic hero: the featured product image fills the viewport, the brand wordmark is set in small wide caps at the top, and a large italic serif headline sits in the lower left beside a shop CTA. Below the hero the page settles into deep olive-grey bands (#383B34) with bone type, where products appear in a 3-column grid of full-bleed image tiles with no pads or borders. Name and price sit beneath each tile in a thin bone rule-line row. Categories are a row of four tall image tiles with the category name set across the image. The catalog is a full-width grid with a category bar and sort, and switching category is itself a visual event. The mood is moody, cinematic and fashion-forward, with images as the protagonist.
Signature interaction: Canvas mosaic resolve and mosaic crossfade. Every product and hero image is drawn into a canvas the size of its frame (object-fit cover maths done in JS). A mosaic at cell size s is drawn by downscaling to an offscreen canvas of (w/s × h/s) with imageSmoothingEnabled true (so each cell averages its region), then upscaling to the visible canvas with smoothing false. Because pixels are never read, cross-origin images still work. When a tile enters view (IntersectionObserver, threshold 0.3, with a 70ms stagger) its cell size steps 48 → 24 → 12 → 6 → 3 → 1 at 80ms intervals, so the photo resolves out of colour blocks. The hero is scroll-scrubbed: over the first 100vh the cell size goes from 1 to 40 as the headline settles in, quantised to integer steps. In the catalog, switching category coarsens every tile to 32px, swaps the product data at the coarsest step (where old and new images are indistinguishable blocks), then resolves back, so the filter change happens inside the mosaic. A hover-only 'resolve wave' re-runs the step sequence radially from the pointer cell on the hero image. Real <img> elements remain underneath for no-JS and SEO, and under prefers-reduced-motion the canvases are never created.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with BOHLT content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Droogijs365) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
