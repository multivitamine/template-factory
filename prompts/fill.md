You turn crawled website data into content for a website template. Reply with ONLY one JSON object, no prose, no code fences.

Business: {{name}} ({{url}})
Summary: {{summary}}
Write all copy in: {{language}}

Crawled data of their site (homepage{{catalogNote}}):
```json
{{facts}}
```

Produce this JSON (schema and rules):
```jsonc
{
  "brand": { "name": "short brand name", "tagline": "max 8 words", "logo": "logo URL from the data or null",
             "logoIsLight": true/false,   // true if the logo is white/light (e.g. it sits on a dark header in the original)
             "initials": "2 letters", "lang": "nl",
             "colors": { "primary": "#hex main brand colour", "accent": "#hex second brand colour" } },
  "nav": [ { "label": "…", "href": "catalog.html" or "#" } ],      // 3–6 items, the product/shop item links to catalog.html
  "hero": { "eyebrow": "2–5 words", "title": "punchy first half", "titleAccent": "second half (or null)",
            "text": "1–2 sentences", "cta": "…", "ctaHref": "catalog.html or #", "cta2": "… or null", "image": "best large image URL or null" },
  "usps": [ { "title": "…", "text": "1 sentence" } ],                 // 3–4, based on real facts from the data
  "categories": [ { "name": "…", "image": "URL or null", "href": "catalog.html" } ],   // 0–6, only real ones
  "products": [ { "name": "…", "price": "€ 9,95 or null", "oldPrice": null, "image": "URL or null", "tag": "short or null", "href": "#" } ],
  "story": { "eyebrow": "…", "title": "…", "text": "2–3 sentences", "image": "URL or null" },
  "stats": [ { "value": "1000+", "label": "…" } ],                    // 0–4, ONLY numbers that appear in the data
  "gallery": [ "URL", … ],                                             // 0–8 other good images
  "quote": { "text": "…", "author": "…" } or null,                     // only if a real review/quote exists
  "cta": { "title": "…", "text": "…", "label": "…", "href": "#" },
  "contact": { "address": "…", "phone": "…", "email": "…" },           // from the data, empty string if unknown
  "footerLinks": [ { "label": "…", "href": "#" } ],
  "catalog": { "title": "…", "intro": "1 sentence", "filters": ["…"], "count": "13 producten" }
}
```
Rules:
- Use ONLY image URLs, products, prices and facts that appear in the data. Never invent prices, numbers or reviews.
- products: every real product found (catalog page first, then homepage), max 24. If there are no products, return [].
- Prefer large, high-quality images for hero/story (not logos, not icons, not tiny thumbnails).
- Copy: rewrite it to be sharper and more inviting than the original, but stay truthful.
- Brand colours: pick from the computed styles / backgrounds the colour that is most "theirs" (not white/black/grey) as primary.
