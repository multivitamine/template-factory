You are the harshest juror at Awwwards and the creative developer who must fix the problems. Work automatically.

The template "Quick Find" in this directory (`template.html`, `catalog.html`) was rendered with real content.
Art direction it must deliver: The homepage is built around one huge search field. A full-width band of --c-primary fills the top 62vh with the brand name, a one-line promise and an oversized input ('Wat zoek je vandaag?') with popular category chips beneath it. Below this band the page drops onto a pale stone ground (#E6E3DD) with an asymmetric two-column layout: a narrow column of categories and USPs on the left and a wide product list on the right. Each product is a horizontal row with a square image pad, name, short description, price and a quick-add button. The catalog page puts the same search engine inline above a sortable list and grid toggle. The mood is efficient, quick and confident, ideal for large ranges, with a premium edge from the restraint and the motion of the results.
Signature interaction: Fuzzy command palette with a live preview pane. Pressing Ctrl/Cmd+K or '/' anywhere (or clicking the nav search) opens a centred palette over a dimmed page, built from an index of products, categories, USPs and contact entries. Scoring is a hand-written fuzzy subsequence matcher: +10 for each matched character, +15 for consecutive matches, +20 for matches at a word start, +30 for a prefix match and −1 per skipped character. Results are grouped (Producten, Categorieën, Info), the top 8 per group are shown, and matched characters are wrapped in <mark> tinted with --c-primary. A selection bar moves between rows with a FLIP translate/height transition (180ms), and the right pane shows the selected product's image, price and an add-to-cart button. Arrow keys move the selection, Enter opens, Shift+Enter adds to cart, and Tab jumps between groups. Recent queries are kept in localStorage and appear as the zero state. The palette is an ARIA combobox with aria-activedescendant. On the catalog page the same engine runs inline: typing reorders the grid by score with a FLIP animation and hides non-matches. Without JS the hero field is a normal GET form to catalog.html?q=, and under prefers-reduced-motion the selection bar jumps instead of sliding.

Screenshots (look at ALL of them with the Read tool):
- `shots/home-desktop.jpg`: homepage with Terpstra Muziek Drumland content + brand colours
- `shots/home-mobile.jpg`: same, 390px wide
- `shots/home-stress.jpg`: homepage with a DIFFERENT brand (Spaansen) and its colours: must still look great
- `shots/catalog-desktop.jpg`: catalog page


# Do this
1. Judge it honestly (1–10) on: creativity/originality, typography, layout & rhythm, polish, brand-colour robustness,
   mobile, and whether it still looks like a generic template.
2. Pick the 3–6 changes with the biggest impact (broken or empty areas, awkward image crops, weak hero, low contrast,
   boring sections, mobile breakage, a signature interaction that's missing) and fix them by editing the files.
   Push the creativity UP, never down. Keep the Mustache contract intact.
3. Write `critique.json`: `{ "scoreBefore": n, "issues": ["…"], "fixed": ["…"], "scoreAfterEstimate": n }`
Reply `DONE` when finished.
