# Welcome, Bitcoin Developers

If you know [Bitcoin Script](../glossary.md#bitcoin-script), you know its constraints: a small, deliberately limited opcode set, no loops, and no built-in way to enforce rules across more than one transaction. [Simplicity](../glossary.md#simplicity) targets the same UTXO model and the same Bitcoin-style transaction semantics, but is built on a small set of functional [combinators](../glossary.md#combinator) instead of an opcode set. It adds [introspection](../glossary.md#introspection), so a program can constrain a transaction's outputs and not just check signatures, which is what makes [covenants](../glossary.md#covenant) and multi-transaction [vault](../glossary.md#vault) protocols possible without the workarounds Script requires today. Every program's execution cost is still statically bounded and known before you fund it, the same guarantee you already rely on in Script.

Simplicity provides tools to represent and enforce complex financial agreements and instruments as on-chain [smart contracts](../glossary.md#smart-contract), in line with Bitcoin architecture and philosophy. The [SimplicityHL](../glossary.md#simplicityhl) language expresses this logic in a familiar Rust-like syntax.

## Where to go from here

* **Quickstart:** Make a first Simplicity transaction ("pay-to-public-key" implemented in SimplicityHL) with the [quickstart tutorial](../quickstart/).
* **Execution model:** [The UTXO model](../../documentation/execution-model) that Simplicity programs execute within, including [introspection](../glossary.md#introspection).
* **Covenants, state, and oracles:** [Covenants and state management](../../documentation/state) and [oracles](../../documentation/oracle) cover how to build vaults and advanced constraints. [Jets](../../documentation/jets) expose transaction details and perform calculations efficiently.
* **Use cases:** [Simplicity use cases and demos](../../use-cases/).
* **Example code:** [Basic contract examples](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples) and [more complex example contracts](https://github.com/BlockstreamResearch/simplicity-contracts) demonstrate SimplicityHL syntax and features. The [SimplicityHL language documentation](https://docs.simplicity-lang.org/documentation/) covers the full reference.
* **Community:** Join the [Simplicity forum](https://community.simplicity-lang.org/), [Telegram group](https://t.me/simplicity_community), or the [weekly office hours calls](../../office-hours).
