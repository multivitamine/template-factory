You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Pocket Screen" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: On desktop the whole site lives inside one large, centred smartphone frame drawn in CSS: graphite bezel, 44px corner radius, a pill-shaped camera island, side buttons as thin raised strips, a soft floor shadow and a pale warm-grey background with faint concentric 'signal' rings. Under 480px the frame and bezel dissolve and the page simply is the phone UI at full width, with no horizontal scroll. The hero is a lock screen: a wallpaper made of a blurred mesh gradient of --c-primary and --c-accent under a dark scrim so any brand colour reads well, a huge thin clock (live time, with a server-rendered fallback), the date line, the brand name as the 'owner info', and two or three USPs stacked as frosted notification cards ('Bezorgd binnen 24 uur', 'Nu 4,8★ uit 300 reviews'). Below it the home screen shows sections as a 4-column grid of rounded app icons with labels (one icon per product category plus Over ons, Contact and Route), a 'widget' row with the featured product and a stat tile, and a dock pinned at the bottom of the screen as the main nav with the CTA as a primary-coloured round 'call' button. Products are shown as app-store-style cards: a rounded-square initials/category icon in a primary tint, name, one-line description, price as a 'GET'-style pill button. The catalog page is an app-store list with a large title, a search field, and a segmented control for the category filters. Contact is an incoming-call screen with avatar initials, answer and message buttons, and address and opening hours as a settings-style grouped list. The mood is clean, tactile and friendly, with neutral chrome (#1c1c1e bezel, #f2f2f7 surfaces, hairline #d1d1d6 lines) so the brand colour carries all the personality.
Signature interaction: Swipe-to-unlock: the lock-screen hero is a sticky layer inside the phone screen with a 'Veeg omhoog om te openen' pill and a bouncing home-indicator bar. With GSAP ScrollTrigger (or pointer drag on the pill), scrolling the first 100vh translates the lock screen up by -100% and fades it out. Over the same distance the home-screen icons scale in from 0.85 and stagger in row by row, and the status bar text switches from white to dark. Clicking the pill tweens the scroll to the end of the trigger. Without JS, or with prefers-reduced-motion, the lock screen is a normal static section above the home screen, so all content stays visible.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Kartstore International content + brand colours
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
