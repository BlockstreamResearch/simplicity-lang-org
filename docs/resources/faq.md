# Simplicity FAQ

## Simplicity is so simple it fits on a [T-shirt](https://store.blockstream.com/products/simplicity-t-shirt). Does that mean it's as limited as Bitcoin Script?

No, the "simplicity" refers to its foundational design and formal semantics, not its expressiveness.

- Bitcoin Script is deliberately limited; Simplicity is finitarily complete → it can program any finite computation.

- Complex off-chain (even Turing-complete) computations can be verified on-chain with Simplicity.

## Is Simplicity Turing-complete like EVM?

No, and that’s a feature!

- **Predictable Resource Costs:** No “out of gas” issues; costs are known at compile-time.

- **Guaranteed Termination:** No unbounded loops/recursion → all programs halt.

- **Enhanced Verifiability:** Programs are analyzable, enabling formal reasoning.

## How does Simplicity handle state? Does it have global state like Ethereum?

Simplicity has no global state. It is a purely functional language: each program is just a function mapping inputs → outputs.

Contracts run within the Bitcoin UTXO model:

1. Contracts are small programs attached to UTXOs that guard the associated coins.

2. Spending a UTXO means providing witness data so the contract evaluates to true.

3. State is carried forward explicitly by committing data into the next UTXO.

This design avoids shared mutable state (as in Ethereum). Instead, every transition is localized: a UTXO is consumed, and the updated state is re-committed into the new UTXO.

## How do I prove my Simplicity contract is correct?

Formal verification happens in [Coq/Rocq](https://rocq-prover.org/), not directly in Simplicity.

Process:

  1. Simplicity semantics are modeled in Coq.

  2. You prove correctness properties (safety, termination, resource use).

  3. Proofs give guarantees before deployment.

## Simplicity is low-level. Do I write contracts directly in it?

Not usually. There are higher-level options:

| Tool | Description |
|------|-------------|
| **SimplicityHL** | Rust-like syntax compiling to Simplicity |
| **Web IDE** | Try SimplicityHL examples in the browser |
| **Haskell Implementation** | Build Simplicity expressions in a tagless-final style |

The future vision is that there are multiple high-level languages which all compile down to Simplicity + proofs.

## What are Jets, and how do they make programs efficient?

A [Simplicity jet](../documentation/jets-explained.md) is a pre-defined, optimized function that replaces an equivalent Simplicity expression to speed up execution without changing its meaning.

Benefits:

- Programs remain formally verifiable.

- Heavy operations run in optimized C instead of interpreted combinators.

- Keeps execution fast, compact, and analyzable.

## How does Simplicity exist alongside Bitcoin script?

With Taproot’s versioned leaves, a single Taproot output can include both standard Script/Miniscript leaves and a Simplicity leaf. This allows mixing policies: simple paths can remain in Script while advanced paths use Simplicity, preserving flexibility and privacy under one Taptree.

## How do I track the value of a Simplicity contract with partial payouts when different strike prices are being matched?

Simplicity contracts operate on UTXO-committed state. Each contract output carries forward a table of strikes together with their remaining notionals.

At every settlement event, the contract:

1. Reads the current reference price.

2. Applies partial payouts to any strikes that are matched.

3. Updates the strike table by reducing the notional amounts that have been settled.

The value of the contract at any point is given by the piecewise payoff function, evaluated against the latest UTXO state. By inspecting the most recent UTXO, participants can determine both their current position and their outstanding exposure. (see also: Bitcoin Optech [comment from AJ Towns](https://bitcoinops.org/en/newsletters/2024/11/29/#flexible-coin-earmarks) on flexible coin earmarks)
