---
paths:
  - "docs/**/*.md"
---

# Bitcoin and Liquid capitalization

Simplicity docs frequently mention Bitcoin and Liquid as networks, protocols, and
assets. Keep the two senses distinguished by capitalization:

- **Capital "Bitcoin"** when it modifies a noun, or refers to the network, protocol, or
  ecosystem itself: "a Bitcoin transaction," "the Bitcoin network," "Bitcoin's security
  model," "built on Bitcoin".
- **Lowercase "bitcoin"** when referring to the asset as a unit of value: "send 0.5
  bitcoin," "the covenant locks bitcoin," "your bitcoin".
- **Quick test:** if "money" or "funds" can substitute for the word and the sentence
  still reads correctly, use lowercase. If "the network" or "the protocol" can
  substitute, use uppercase.

The same logic applies to Liquid Bitcoin:

- **"Liquid Bitcoin"** (capital B) for the protocol-level concept: "Liquid Bitcoin is
  pegged 1:1 to bitcoin on the mainchain".
- **"Liquid bitcoin"** (lowercase b) for the asset being held, moved, or covenant-locked:
  "swap bitcoin for Liquid bitcoin".
- Introduce the abbreviation on first mention per page — "Liquid bitcoin (LBTC)" — then
  use "LBTC" alone afterward. Write "LBTC," never "L-BTC".
- We also have an asset called "test Liquid bitcoin (tLBTC)".

# Link unfamiliar terms to the glossary

`docs/glossary.md` defines terms likely to be unfamiliar to at least part of this site's audience, and glossary links render as a mouseover preview rather than a plain jump-away link. Whenever documentation uses a term defined there — especially an acronym (CMR, PSET, UTXO, and similar) — link the glossary entry on first use of that term per page: `[CMR](../glossary.md#cmr)` (adjust the relative path to the page's depth).

Because the glossary link already carries the full expansion and definition, there's no need to also spell an acronym out inline before using it — the glossary link does that job. Don't re-link the same term on later uses within the same page, unless the page is very long, in which case it can be relinked on first use within each section.
