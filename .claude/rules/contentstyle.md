---
paths:
  - "docs/**/*.md"
---

# Content style

@../../CONTRIBUTING.md

## Additional guidance for AI agents

The rules above are the canonical content standards for this repo. The items below make
"keep it grounded" and "show, don't tell" concrete for an AI agent, since those two
principles are exactly where generated prose tends to drift toward promotional tone
without a model realizing it. Each item names a specific pattern to avoid and what to
write instead.

- **No antithesis-for-emphasis.** Don't state a fact and then restate its negation for
  rhetorical punch ("X, not Y"). State it once.
  - Avoid: "the wrapped result, handed to you, not hidden from you."
  - Prefer: "the addition returns the wrapped result as an explicit value."
- **Don't personify the language or tooling.** The compiler, type system, or language
  doesn't want, refuse, or insist on anything. Describe the mechanical behavior.
  - Avoid: "the type system makes sure you look at it" / "the language won't let a
    program quietly proceed."
  - Prefer: "the overflow condition is returned as a value that must be handled
    explicitly."
- **No "reveal" sentences.** Don't add a sentence whose only job is to tell the reader
  what the point was or how to feel about what they just read ("That's the entire trick
  behind...", "That's the point", "Here's what's powerful about this").  State what
  happens; let the reader draw the conclusion, or state the conclusion once as a plain
  fact rather than as a rhetorical flourish.
- **Headers name the topic, not a claim about it.** Use plain noun phrases, not epigrams.
  - Avoid: "Overflow is a value, not a surprise."
  - Prefer: "Arithmetic overflow."
- **Don't reach for rhetorical list rhythm.** A three-item asyndetic list ("No X, no Y,
  no Z.") used purely for cadence reads as ad copy. If three items are the natural
  count, list them plainly; don't add or trim items to hit a rhetorical pattern.
- **Reference and navigation lists use noun labels, not marketing imperatives.**
  - Avoid: "Make it real:", "Go deeper:", "Unlock new capabilities:"
  - Prefer: "Quickstart:", "Tutorial:", "Reference:" — name what the linked thing is.
- **Don't assert that something is interesting, powerful, surprising, or impressive.**
  Demonstrate it with a concrete, runnable example and let the reader judge. If a claim
  of significance is needed, state the mechanical reason plainly rather than the
  adjective.
- **Avoid comparative-superiority framing against other ecosystems**, especially for
  anything that isn't actually unique to Simplicity (e.g., hash-preimage checks exist in
  Solidity too). Prefer honest fit-based framing: describe what the code does and who it
  is for, rather than implying another platform can't do it.
- **No em dashes.** Restructure the sentence instead: use a period, colon, or
  parentheses. Em dashes are a persistent generated-prose tell; check for them before
  finishing any edit to `docs/**/*.md`.
  - Avoid: "the redeem-time witness — the data supplied at spend time — proves the
    branch."
  - Prefer: "the redeem-time witness (the data supplied at spend time) proves the
    branch."
- **No filler affirmations, paragraph-opener tics, or hedges.** Don't open a paragraph
  with "So,", "Now,", "Additionally,", "Furthermore,", "Moreover,", "Let's dive in," or
  "Let's explore," and don't add intensifiers or hedges whose only job is tone
  ("genuinely," "truly," "That's a big deal," "It's worth noting," "Of course"). If the
  sentence works without it, drop it.
- **No negative parallelism.** Don't pair a construction with its own negation for
  rhetorical balance ("not only X, but also Y"). This is a cousin of the antithesis
  pattern above; state the point directly.
  - Avoid: "The jet not only speeds up execution, but also reduces the on-chain
    footprint."
  - Prefer: "The jet speeds up execution and reduces the on-chain footprint."
- **No present-participle tails.** Don't close a sentence with a dangling "-ing" clause
  that restates the consequence of what was just said ("..., enabling developers to...",
  "..., ensuring that..."). State the consequence as its own sentence, or drop it if it's
  redundant.
  - Avoid: "The type system tracks widths at compile time, ensuring that overflow is
    caught before deployment."
  - Prefer: "The type system tracks widths at compile time. Overflow is caught before
    deployment."
- **No bold-label bullet lists in explanatory prose.** A bulleted list where every item
  opens with a **bold label:** followed by a sentence is the most recognizable
  generated-docs pattern. It's fine in genuinely reference-shaped lists (parameter
  tables, glossary-style lookups); in explanatory prose, write sentences or paragraphs
  instead.
  - Avoid: "- **Pruning:** removes unused branches. - **Jets:** speed up execution."
  - Prefer: "Pruning removes unused branches from the published program. Jets speed up
    execution of common operations."

These are deliberately mechanical and checkable rather than a general tone instruction,
because "sound professional" doesn't reliably suppress this pattern: naming the
specific rhetorical moves does.
