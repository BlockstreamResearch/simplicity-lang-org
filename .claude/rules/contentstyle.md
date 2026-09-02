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

These are deliberately mechanical and checkable rather than a general tone instruction,
because "sound professional" doesn't reliably suppress this pattern — naming the
specific rhetorical moves does.
