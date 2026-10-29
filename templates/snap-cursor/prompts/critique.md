You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Snap Cursor" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A deep slate-ink ground (#1B2130) is split asymmetrically: a full-height plane of --c-primary occupies the right third of the hero and returns as colour blocks behind the featured product and the footer, so the page reads as two planes of colour rather than a dark theme. Headlines are set large and light in a high-contrast serif over the ink plane, while the featured product sits half on the ink and half on the brand plane. Products follow on home in an offset two-column list with large images in fixed 4:5 frames on a slightly lighter slate pad, and prices are set in italic. The catalog uses a three-column grid with generous gutters, plus a left sticky column that holds category links and sort as plain text buttons. The overall mood is calm, nocturnal and precise, and every interactive element feels physically attracted to the hand.
Signature interaction: Shape-shifting snap cursor that doubles as the focus ring. A fixed div replaces the pointer on (pointer: fine) devices as a 14px dot in --c-primary with mix-blend-mode: difference. Its x, y, width, height and border-radius are each driven by a spring (stiffness 320, damping 30). Over any [data-snap] element (nav links, buttons, filter chips, product cards), the targets become that element's rect plus 6px padding and its computed border-radius, so the dot morphs into an outline that wraps the element. The element itself translates up to 6px toward the pointer (magnetic offset = (pointer − centre)·0.18, clamped), and the outline follows the shifted rect. Over product images the cursor becomes a 92px filled disc reading 'Bekijk · €price'. On free movement the dot stretches along its heading by 1 + speed·0.002, up to 1.6×, with an inverse squash across it. The same spring outline snaps to whichever element has :focus-visible, so keyboard users get the identical morphing ring as their focus indicator. On touch devices the native cursor is used. Under prefers-reduced-motion the outline jumps instantly with no stretch or magnetic offset.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Banks Mansion content + brand colours
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
