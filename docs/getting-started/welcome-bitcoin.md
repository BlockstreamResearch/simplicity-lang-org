# Welcome, Bitcoin Developers

## Welcome to the next evolution of building on Bitcoin.

If you're familiar with [Bitcoin Script](../glossary.md#bitcoin-script), you know its strengths: it's secure, predictable, and heavily battle-tested. But you also know its limitations for expressing detailed rules, or arrangements that live longer than a single transaction. When you want to build highly expressive decentralized applications, complex [covenants](../glossary.md#covenant), or advanced [vault](../glossary.md#vault) protocols, you often hit a wall with Script's limited opcode set and the workarounds required to push its boundaries.

Enter Simplicity. Simplicity is a new blockchain programming language designed as a next-generation alternative to Bitcoin Script. Currently available for the [Liquid Network](../glossary.md#liquid) (and designed with future Bitcoin integration in mind), Simplicity gives you maximum expressiveness without sacrificing the predictability you expect from Bitcoin. It achieves this by basing programs on a minimalist set of functional [combinators](../glossary.md#combinator). This means you can compute any bounded function, all while guaranteeing that the exact computing resources required are calculated before execution. No unpredictable fees, and no unbounded loops.

Simplicity offers you tools to represent and enforce complex financial agreements and instruments as on-chain [smart contracts](../glossary.md#smart-contract), in line with Bitcoin architecture and philosophy. And the [SimplicityHL](../glossary.md#simplicityhl) language lets you write this logic in a familiar and highly readable Rust-like syntax.

Imagine building a highly secure, non-interactive vault that features multi-party approvals, hardware wallet integration, time-locked withdrawals, and a sophisticated protocol for emergency key recovery. With Simplicity, you can encode all of this logic into a covenant, expressed in an easy-to-read high-level language, running natively on-chain.

## Where to go from here:

* **Deploy your first smart contract:** Try our [quickstart tutorial](../quickstart/) to make your first Simplicity transaction ("pay-to-public-key" implemented in SimplicityHL) in minutes.
* **Beyond Bitcoin Script:** See how Simplicity programs define execution conditions within the [UTXO model](../../documentation/execution-model) you already know, but with major new capabilities like [introspection](../glossary.md#introspection).
* **Unlock new primitives:** Learn to build programmatic vaults and advanced constraints by reading up on [covenants and state management](../../documentation/state) and [oracles](../../documentation/oracles) in Simplicity. Check how [jets](../../documentation/jets) expose transaction details and efficiently perform complex calculations.
* **See what's possible:** Explore what Simplicity can do with [Simplicity use cases and demos](../../use-cases/).
* **Learn the language:** Dig into <a href="https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples">simple contract source code</a> that demonstrates SimplicityHL language syntax and features, and <a href="https://github.com/BlockstreamResearch/simplicity-contracts">more complex example contracts</a> with frameworks for running demos. The <a href="https://docs.simplicity-lang.org/documentation/">SimplicityHL language documentation</a> is here when you need it.
* **Connect with the community:** Join our [Telegram group](https://t.me/simplicity_community) or [weekly office hours calls](../../office-hours) to discuss your projects and questions with other adopters and the Simplicity team.
