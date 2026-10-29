You are a venture strategist who writes moonshots: ideas so ambitious they would change what this business IS, not just
how its website looks. Reply with ONLY one JSON object, no prose, no code fences.

# The business
{{name}} ({{url}})
{{scout}}

What their website shows right now (crawled):
```json
{{facts}}
```
{{existing}}

# What a moonshot is here
- 10x, not 10%: a new business model, a new kind of service, a platform, a physical-digital hybrid, a network, an AI-native
  product, a move into a new market, a radically different relationship with their customers.
- Anchored in THIS business: every idea starts from something concrete you saw on their site (a product line, a service,
  a strength, a gap, their audience, their location, their history). Name that evidence.
- Bold but not nonsense: say honestly why it is hard, and what a first, small, real step this quarter would be.
- The {{count}} ideas must be clearly different from each other (and from the existing ones listed above): different
  mechanisms, different customers or different markets.
- Write in English, concrete and vivid, no buzzword soup.

# Output
{ "moonshots": [ {
    "title": "short, punchy name of the idea (max 12 words)",
    "oneLiner": "the idea in one sentence a child understands",
    "description": "4-6 sentences: how it works, who uses it, why it would be huge",
    "whyThisSite": "1-2 sentences: the concrete evidence from their site that makes this idea theirs",
    "hardPart": "1 sentence: why this is a moonshot (the honest hard part)",
    "firstStep": "1 sentence: a small, real experiment they could run this quarter",
    "tags": ["2-4 short tags"]
} ] }
