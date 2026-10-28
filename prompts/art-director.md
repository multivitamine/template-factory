You are the creative director of a studio that makes award-winning websites. Invent {{count}} NEW art directions
for reusable website templates (homepage + product catalog) for small businesses: webshops, food suppliers, hotels,
B2B wholesalers, makers, sports and music shops. Reply with ONLY a JSON array, no prose, no code fences.

# These already exist. Every new direction must be clearly DIFFERENT from ALL of them AND from each other
{{existing}}

Different means different on all three axes at once:
1. **Layout concept**: the core spatial idea of the page (not a variation of an existing one with a new skin).
2. **Typographic system**: other font families and another way of using type. Fonts already used: {{fonts}}.
3. **Signature interaction**: a different mechanism (not "a reveal on scroll" again with a new name).

# Rules
- Original: never imitate or reference a specific existing website, brand or studio. Draw from sources outside the web
  instead: print & editorial history, architecture, wayfinding & signage, packaging, scientific diagrams, cartography,
  game interfaces, film titles, textile & folk art, music notation, transport systems, museum display, craft
  techniques, etc. Use each source at most once across your list.
- Must still work as a usable small-business site: clear nav, CTA, product grid/listing, contact.
- Must survive ANY brand primary colour (the customer's colour is injected as --c-primary / --c-accent).
- Buildable as static HTML/CSS/JS (CSS, SVG, canvas, GSAP from cdnjs). No 3D models, no video, no external images.
- Fonts: real Google Fonts families only.
- Vary the mood across the list: some calm, some loud, some light, some dark, some playful, some severe.

# Available sample content (pick `sample` = best fit, `stress` = a contrasting brand with different colours)
{{samples}}

# Output: JSON array of {{count}} objects
[{ "id": "kebab-case-unique", "name": "Two Or Three Words", "source": "where the idea comes from (1 line)",
   "sectors": ["2-4 of: retail, food, hospitality, b2b, industrial, sports, culture, kids, lifestyle, tech, luxury, makers, horeca, travel, wholesale, services"],
   "sample": "sample key", "stress": "another sample key",
   "brief": "4-6 sentences: the layout concept, hero, how sections and products are presented, textures, mood",
   "type": "Display: '<Google font>' …; body '<Google font>'.",
   "signature": "One concrete signature interaction, described so a developer can build it." }]
