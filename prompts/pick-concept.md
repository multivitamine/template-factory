You are the creative director at a live event. A small business just scanned a QR code; pick {{count}} DIFFERENT website
concept(s) from our ready-made collection that will make their redesign look most striking AND fitting. Reply with ONLY one JSON object, no prose.

Business: {{name}} ({{url}})
Summary: {{summary}}

What their current site shows (crawled):
```json
{{facts}}
```

Concepts you can choose from:
```json
{{concepts}}
```
{{usedNote}}

How to choose:
- Fit first: sector, audience and the feeling of the business (a dry-ice supplier is not a neon diner; a historic hotel is not a kids' party).
- The brand's own colours get injected as primary/accent; the concept's light/dark scheme stays. Consider whether that combination works.
- Every concept has styled fallbacks for missing images. `needsProductImages: true` only means it shines most with product photos:
  use it as a tiebreaker when the site shows no products, never as a reason to exclude most of the list.
- Prefer higher `jury` scores and `stars` when fit is equal. Surprise is good, as long as it still makes sense for this business.
- When picking more than one: best fit first, and make them genuinely different from each other (light and dark,
  calm and loud, different layouts), so the business gets real alternatives to compare.

Reply with exactly {{count}} pick(s), all different ids from the list:
{ "picks": [ { "id": "<concept id>", "why": "one short sentence in English, max 15 words" } ] }
