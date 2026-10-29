You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Phrase Shop" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: A warm cream page (#F6F0E6) with deep ink-brown type, large serif headlines and calm editorial spacing, where --c-primary marks the changeable words, the cart and buttons. The hero is one large sentence that doubles as the shop's entrance, for example 'Ik zoek [alles] voor [iedereen] onder [€ 50]', with each bracketed word underlined and interactive, followed by a shop CTA that reads the sentence's result count ('Bekijk 24 producten'). Homepage products sit in an asymmetric 2+3 editorial grid with the first product large, photos contained on a soft tinted pad with a thin rule frame, serif names, italic prices and a quick add. The catalog repeats the sentence as its sticky header and the grid updates as words change, with a matching count and a gentle crossfade. The mood is warm, literate and inviting, like being helped by a good shop assistant.
Signature interaction: Rolling-word sentence filter. Each changeable word in the sentence is a button that opens an inline vertical roller in place: a column of options (the categories, audience words and price thresholds derived from the content) rendered in the same display italic, clipped to one line with a soft fade mask above and below. Wheel, vertical drag (with momentum and friction 0.92) or arrow keys roll the column, and it snaps to the nearest option with a spring (stiffness 260, damping 28). Neighbouring options tilt slightly away with rotateX and fade by distance, so it feels like a precise picker, not a dropdown. As the word changes, the surrounding sentence reflows smoothly: the width of the word slot animates between the measured widths of old and new word (FLIP on the slot), so the line never jumps. Each settled choice updates the filter state; the CTA count rolls to the new number and the product grid crossfades with a 40ms stagger. Enter or click outside closes the roller. The sentence state is written to the URL so it can be shared. Without JS each word is a native <select> styled as underlined text, and under prefers-reduced-motion the roller snaps without rotation or momentum.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Spaansen content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Kartstore International) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page

Automatic checks found:
- home-mobile: horizontal overflow (page wider than viewport)

# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
