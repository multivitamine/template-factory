You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Rack Focus" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A warm, deep espresso ground (#15110E) with soft ivory type and generous negative space, where depth comes from focus rather than from colour. The hero is a large centred product or brand image in a 3:2 frame with a hairline border and a headline split around it: a thin wide word above and a single heavy word below, with the shop CTA as a quiet underlined link plus a filled primary button. Homepage products run as a single vertical column of wide editorial rows (image left at 5:4 with a matte #201A16 surround so any photo looks framed, name, short line, price and add-to-cart right), and only the row on the reading line is fully sharp. The catalog switches to a 3-column grid with the same focus logic applied by the pointer instead of scroll, plus a sticky filter rail whose active category sits in focus while the others stay softly defocused. Motion is slow and cinematic, with long easings and no bounce, and a faint film-grain canvas at 3% opacity keeps the blacks rich.
Signature interaction: Scroll-linked depth of field with rack-focus pulls. A fixed 'focal plane' sits at 42% of the viewport height. On every rAF tick after scroll, each element with data-focus measures its centre distance d to the focal plane (one getBoundingClientRect per element, batched), and gets filter: blur(min(d/90, 6)px), opacity 1 − min(d/1400, 0.45) and scale 1 − min(d/4000, 0.03). These are written as CSS variables, with values smoothed by lerp 0.12 so focus 'breathes' after scroll stops. Text inside rows uses a lighter blur curve (half strength) so it remains legible. Clicking a row's 'Kijk' link, or pressing F on a focused row, performs a rack-focus pull: the page smoothly scrolls that row onto the focal plane over 900ms (cubic-bezier(.65,0,.35,1)) while its blur briefly overshoots to 0 and every other row goes to maximum blur, then the depth curve resumes. In the catalog, the focal point follows the pointer (radial distance instead of vertical), and keyboard focus pins the focal point to the focused card. Hidden elements are skipped. Without JS everything is sharp, and under prefers-reduced-motion blur is disabled and focus is shown with opacity only.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Hotel Navarra content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Kartstore International) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page

Automatic checks found:
- home-stress: horizontal overflow (page wider than viewport)

# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
