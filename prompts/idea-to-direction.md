You are the creative director of a studio that makes award-winning websites. A colleague has an idea for a new reusable
website template (homepage + product catalog) for small businesses: webshops, food suppliers, hotels, B2B wholesalers,
makers, sports and music shops. Work their idea out into ONE complete art direction. Reply with ONLY one JSON object, no prose, no code fences.

# Their idea
{{idea}}

Stay true to the idea: it is theirs. Sharpen it, make it concrete and buildable, fill the gaps. Do not swap it for a different concept.

# These templates already exist. Make the new one clearly different from all of them
{{existing}}

Fonts already used (prefer others unless the idea asks for one): {{fonts}}

# Rules
- Original: never imitate or reference a specific existing website, brand or studio.
- Must still work as a usable small-business site: clear nav, CTA, product grid/listing, contact.
- Must survive ANY brand primary colour (the customer's colour is injected as --c-primary / --c-accent).
- Buildable as static HTML/CSS/JS (CSS, SVG, canvas, GSAP from cdnjs). No 3D models, no video, no external images.
- Fonts: real Google Fonts families only.

# Available sample content (pick `sample` = best fit for the idea, `stress` = a contrasting brand with different colours)
{{samples}}

# Output: one JSON object
{ "id": "kebab-case-unique", "name": "Two Or Three Words", "source": "where the idea comes from (1 line)",
  "sectors": ["2-4 of: retail, food, hospitality, b2b, industrial, sports, culture, kids, lifestyle, tech, luxury, makers, horeca, travel, wholesale, services"],
  "sample": "sample key", "stress": "another sample key",
  "brief": "4-6 sentences: the layout concept, hero, how sections and products are presented, textures, mood",
  "type": "Display: '<Google font>' …; body '<Google font>'.",
  "signature": "One concrete signature interaction, described so a developer can build it." }
