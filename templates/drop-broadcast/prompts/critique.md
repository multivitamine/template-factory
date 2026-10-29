You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Live Drop" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The whole site is a live TV broadcast of a drop test from a tall observation tower. The page sits inside a 16:9 'programme feed' frame on near-black studio grey, with a pulsing red-dot LIVE bug and a running timecode top-right, the brand initials as a channel ident top-left, and faint CRT scanlines plus a safe-area guide overlay. The hero is a tall, slim CSS-drawn concrete tower against a dusk gradient, with height markers (0 m … 185 m) ticking down its right edge. The brand headline arrives as a broadcast lower third: a --c-primary bar slides in with the brand name, and a white strip below it carries the tagline, with a 'T-minus' countdown block beside it that holds the primary CTA. Every section opens with a lower-third title card (segment number, title, a 'REPLAY' or 'LIVE' tag), so the metaphor works for any business: products are 'test subjects', categories are 'heats', the about text is 'the promise' set as a guarantee certificate strip with a 12-month seal, and contact is 'the studio line'. Products appear as a grid of broadcast monitor tiles, each with a camera label (CAM 1, CAM 2…), the product name as a mini lower third, the price in a results box and a green 'INTACT ✓' verdict chip. Between sections runs a public scoreboard ticker with tabular-figure counters (products tested, drops survived, promises kept, years in business), fed from content stats and falling back to product and category counts. The catalog page is a 'results table' broadcast graphic with heat filters styled as camera-switcher buttons. The mood is tense, high-contrast and theatrical: matte charcoal surfaces, hairline white rules, broadcast-safe white text and the customer's colour used only for live graphics (bars, bug and verdict highlights), so any primary works, from red to coffee brown.
Signature interaction: Slow-motion drop replay in the hero: a phone-shaped CSS block carrying the brand initials and the featured product name falls down the tower shaft along a GSAP timeline (about 2.4 s, eased with slow-mo in the last 20%). The altitude readout counts from 185 m to 0 m in Share Tech Mono and the timecode switches to 'REPLAY ×0.25'. On impact the frame shakes 4px for 120 ms, a white flash plays at 30% opacity, an SVG radial 'crack' pattern draws its stroke outward over the block and then retracts and fades as if it never stuck, and a large stamp 'INTACT' in --c-primary scales in from 140% to 100%. The 'Promises kept' scoreboard counter then increments by one with a flip animation. A 'Drop again' button in the countdown block replays it, and IntersectionObserver re-triggers a mini 0.8 s version on each product monitor tile the first time it scrolls into view (the tile drops 24px and settles, then its INTACT chip pops in). With prefers-reduced-motion or without JS, the block rests on the ground with the INTACT stamp already shown and all counters at their final values.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with TeleQare content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Brinks Coffee Roasters) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
