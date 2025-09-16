---
title: A typed, combinator-based, functional smart contract language without loops or recursion, designed for Bitcoin-like blockchains.
hide:
  - toc
---

<div class="grid cards" markdown>

- ### :material-code-braces: Expressive Smart Contracts
Simplicity lets you define precise smart contracts with more structure than Bitcoin Script while remaining statically analyzable. Encode multi-step financial flows, conditional transfers, and asset logic in a form that can be reviewed and reasoned about.

- ### :material-gauge: Predictable Resource Usage
Each program has a statically bounded cost. You know the upper execution bounds before funding a transaction, avoiding unpredictable fee dynamics.

- ### :material-microscope: Formally Specified
The semantics are formally defined and suitable for machine-checked proofs. You can prove safety properties (e.g. no unauthorized spend path) and have high assurance the implementation matches the specification.

- ### :material-shield-check: Enhanced Security
No loops or unbounded recursion, deterministic evaluation, and explicit control flow eliminate broad classes of runtime failure. Behavior matches the committed program; no hidden side effects.

- ### :material-link-variant: Seamless Bitcoin and Liquid Integration
Designed for the Bitcoin-style networks. On Liquid you can bind assets and amounts while still benefiting from confidentiality at the transaction layer.

- ### :material-source-branch: Support for Conditional Logic
You can encode conditional payments, options, staged settlement, and automated triggers directly on-chain without relying on off-chain escrow logic or custodians.

- ### :material-package-variant-closed: Compact and Efficient Design
A small combinator core and Merkle-structured programs keep on-chain footprints low. Verification costs remain predictable and amenable to static analysis.

- ### :material-account-group: Compatibility with Multi-Party Workflows
Multi-party spending policies, staged cooperation, and recovery paths are expressed as explicit branches. Participants retain sole control of their keys throughout.

</div>

``` rust title="pay to pubkey" 
fn main(pubkey: Pubkey, funds: Funds) -> Funds {
    let (witness = _, funds) = commit(
        Witness = ValidSignature(pubkey, funds),
        funds,
    );
    funds
}// (1)!
```

1.  This compiles to Simplicity ready for on-chain execution. More involved scripts can execute [reverse Dutch auctions](https://delvingbitcoin.org/t/writing-simplicity-programs-with-simplicityhl/1900).

