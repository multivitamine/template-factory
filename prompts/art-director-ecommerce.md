You are the creative director of a studio whose e-commerce sites win Awwwards Site of the Day, FWA and Godly features.
Invent {{count}} NEW art directions for reusable **online shop** templates (homepage + product catalog) that will be
filled with real webshop content (Dutch brands: fashion, coffee, music gear, sports, kids, sailing, karting, wholesale).
Reply with ONLY a JSON array, no prose, no code fences.

# What we want: high-end, modern, digital-native commerce
These must look like what the best product studios ship in 2025–2026 for premium brands: confident, refined,
technically impressive, and above all a shop people want to buy from. Think in terms of current digital design
languages, for example (use each idea at most once, combine freely, invent beyond them):
- quiet-luxury editorial: vast whitespace, tiny precise type, full-bleed product imagery, slow cinematic motion
- oversized variable-font typography that responds to scroll, cursor or viewport, with products as small precise objects
- scroll-driven product storytelling: a pinned product with spec callouts, chapters and progress
- draggable / infinite canvas product grids, momentum and inertia, zoom-to-product
- split-screen layouts with a sticky gallery on one side and a scrolling story or list on the other
- dark "launch page" aesthetics: deep blacks, soft glows, glass and light, technical spec typography
- frosted / liquid-glass UI layers over brand-tinted mesh or grain gradients
- strict modular grids with mixed tile sizes, magnetic hover, FLIP-animated filtering
- horizontal lookbook rails, full-screen image sequences, curtain or mask page transitions
- image distortion or displacement on hover (canvas / SVG filters), cursor-aware lighting, magnetic buttons
- monochrome systems with one electric accent, ultra-thin hairlines and data-like product labels
- soft modern minimal: rounded geometry, pastel brand tints, playful micro-interactions, sticky add-to-cart

# Hard NO: gimmicks
No themed metaphors or dress-up: the page must not pretend to be a newspaper, a map, a game board, a pinball machine, a
ticket, a receipt, a museum, a blueprint, a machine, a craft technique, a film reel or any other physical object.
No retro-costume pastiche, no novelty for its own sake. The wow comes from layout, typography, motion and craft, not
from a theme. The concept is a design SYSTEM, not a costume.

# These already exist. Every new direction must be clearly DIFFERENT from ALL of them AND from each other
{{existing}}

Different on all three axes at once:
1. **Layout concept**: the core spatial idea of the homepage and how products are shown.
2. **Typographic system**: other font families and another way of using type. Fonts already used: {{fonts}}.
3. **Signature interaction**: a different mechanism (not "reveal on scroll" with a new name).
4. **Visual fingerprint**: ground colour + surface treatment + grid/structure must not match an existing one. Each of
   these is already TAKEN, do not reuse them: "cool off-white with a visible hairline 12-column grid, monochrome plus
   one accent"; "near-black with soft brand glows"; "warm cream with pastel rounded tints"; "frosted glass over a mesh
   gradient"; "paper white with tiny type and huge whitespace"; "dark charcoal gallery frames". Explore other grounds
   (saturated full-brand fields, mid-tones, duotones, colour-blocking, photographic full-bleed, split colour planes),
   other structures (overlapping layers, asymmetric columns, centred axial, stacked full-width bands, sticky splits).
Before answering, check each direction against every line of the existing list and against your other directions;
if two would look alike in a thumbnail, replace one.

# Rules
- Original: never imitate or reference a specific existing website, brand or studio.
- Commerce first: clear nav with cart, a strong hero with a shop CTA, products prominent on the homepage (price,
  name, quick add-to-cart), a catalog page with filtering/sorting that feels premium, trust/USP and contact.
- Must survive ANY brand primary colour (the customer's colour is injected as --c-primary / --c-accent) and
  imperfect product photos (mixed backgrounds and aspect ratios: frame them so they look intentional).
- Buildable as static HTML/CSS/JS (CSS, SVG, canvas, GSAP from cdnjs). No 3D models, no video, no external images.
- Fonts: real Google Fonts families only.
- Vary the mood across the list: light and dark, calm and loud, warm and cold, minimal and maximal.

# Available sample content
Prefer real shops for `sample` (brands that sell products), and prefer the ones with the FEWEST existing templates
(count in brackets) so every new template is shown on a brand we have not designed for much yet. `stress` = a
contrasting brand with different colours.
{{samples}}

# Output: JSON array of {{count}} objects
[{ "id": "kebab-case-unique", "name": "Two Or Three Words", "source": "the design language it builds on (1 line)",
   "sectors": ["2-4 of: retail, food, hospitality, b2b, industrial, sports, culture, kids, lifestyle, tech, luxury, makers, horeca, travel, wholesale, services"],
   "sample": "sample key", "stress": "another sample key",
   "brief": "4-6 sentences: the layout concept, hero, how products are presented on home and catalog, textures, motion, mood",
   "type": "Display: '<Google font>' …; body '<Google font>'.",
   "signature": "One concrete signature interaction, described so a developer can build it." }]
