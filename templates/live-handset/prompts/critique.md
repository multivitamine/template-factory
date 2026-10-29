You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Live Handset" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The whole site is a live product demo of one huge, photoreal smartphone drawn in CSS. On desktop the page splits into two: the left column scrolls through the story, while a sticky handset (about 38% of the width) stands on the right on a soft studio-floor shadow, wearing a case in --c-primary with a MagSafe ring, and its screen changes with every section, as if someone is demoing the phone while you read. On mobile there is no frame: the viewport itself becomes the phone, with a status bar (live time, signal bars, battery %), a Dynamic Island pill at the top that expands to show messages, and a home-indicator bar at the bottom. The hero is a boot sequence: black screen, the brand initials or logo glowing, then the home screen assembles with the headline as the wallpaper text. Sections are phone states, never generic blocks: USPs are Control Center toggles (round glass tiles that switch on in --c-accent as they scroll in), categories are an App Library folder grid, featured products are home-screen widgets in mixed sizes (2x2, 4x2) with the product photos, the story is a long-press peek card, stats are a charging ring and signal bars that show the real numbers, the gallery is a Photos grid, the quote is a message thread with typing dots, the CTA is a share sheet, and contact is a 'Find My'-style card with an SVG radar pin, address, phone and mail. The catalog page is Spotlight search: a large search field on top, the filters as category pills under it, results grouped per category like Spotlight sections, each row with photo, name and a price pill. Textures: frosted glass (backdrop-filter), hairline separators, graphite device chrome, a subtle grain; the wallpaper is a soft mesh of --c-primary and --c-accent under a scrim so any brand colour reads. Mood: tactile, playful, premium, and unmistakably a phone from the first to the last pixel.
Signature interaction: The handset reacts to the page. On desktop, an IntersectionObserver switches the sticky phone's screen (stacked screen layers with data-screen) as each section enters: boot logo, Control Center, a product widget, the message thread, the Find My card. Hovering or focusing a product card drops a push notification from the Dynamic Island on the handset with that product's photo, name and price, and the phone screen briefly shows the product large. On mobile the Dynamic Island expands to show the same notification when a product scrolls into the middle of the viewport. With prefers-reduced-motion or without JS the handset shows a static home screen and all content stays visible.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with TeleQare content + brand colours
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
