---
title: Simplicity is a typed, combinator-based smart contract language for Bitcoin-like blockchains, with formally specified semantics and predictable execution costs.
hide:
  - toc
---

Simplicity is a low-level smart contract language for Bitcoin-like blockchains, built on a small set of functional [combinators](glossary.md#combinator) rather than a growing opcode set. Programs are statically analyzable: every contract has a resource cost that's known before you fund it, and the language's formal semantics support machine-checked proofs of contract behavior.

You write contracts in [SimplicityHL](glossary.md#simplicityhl), a higher-level language with Rust-like syntax that compiles down to Simplicity.

The tutorials on this site currently target Liquid testnet for learning purposes; production deployments run on Liquid mainnet.

<!-- ## Why Simplicity

<div class="grid cards" markdown>

- ### :material-microscope: Formally specified
  Simplicity's semantics are formally defined and suitable for machine-checked proofs, giving high assurance that the implementation matches the specification.

- ### :material-gauge: Predictable execution cost
  Every program has a statically bounded cost, known before you fund a transaction: no surprise fees, no out-of-gas failures.

- ### :material-source-branch: Introspection and covenants
  Programs can inspect the proposed transaction's inputs and outputs, enabling [covenants](glossary.md#covenant) that enforce multi-step spending policies directly on-chain. On Liquid, this extends to bound assets and amounts, alongside confidentiality at the transaction layer.

- ### :material-shield-check: A narrower attack surface
  No loops, no unbounded recursion, fully deterministic evaluation. Broad classes of runtime failure are eliminated by construction.

</div>

## Simplicity examples

<div class="grid cards" markdown>

- ### :material-lock-clock: Hash time-locked contracts (HTLCs)
  The building block for payment channels and atomic swaps. Lock funds until a secret is revealed or a timeout is reached, enabling trustless, cross-chain exchanges and Layer 2 protocols like the Lightning Network.

- ### :material-swap-horizontal-bold: Trustless atomic swaps
  Execute peer-to-peer trades of different assets across blockchains without settlement risk. Simplicity ensures that either both parties receive their assets or the trade is atomically reverted.

- ### :material-chart-line: Covered call options
  Write and settle derivatives contracts directly on-chain. A seller can lock collateral to issue a call option, which a buyer can exercise at a predetermined strike price before an expiry date, all enforced by the Simplicity program.

- ### :material-cash-lock: Collateralized loans
  Lock collateral in a Simplicity contract to borrow assets. The program guarantees that the lender can claim the collateral if the borrower defaults, or that the borrower can reclaim it upon repayment, all without a trusted intermediary.

</div> -->

## Write in a language you already know

You can use SimplicityHL, a high-level language with a clean, Rust-like syntax. This abstracts away low-level complexity, making it straightforward to write clear and reliable financial contracts with minimal code.


```rust title="Hash Time-Locked Contract" 
/*
 * The recipient can spend the coins by providing the secret preimage of a hash.
 * The sender can cancel the transfer after a fixed block height.
 *
 * HTLCs enable two-way payment channels and multi-hop payments,
 * such as on the Lightning network.
 */
fn sha2(string: u256) -> u256 {
    let hasher: Ctx8 = jet::sha_256_ctx_8_init();
    let hasher: Ctx8 = jet::sha_256_ctx_8_add_32(hasher, string);
    jet::sha_256_ctx_8_finalize(hasher)
}

fn checksig(pk: Pubkey, sig: Signature) {
    let msg: u256 = jet::sig_all_hash();
    jet::bip_0340_verify((pk, msg), sig);
}

fn complete_spend(preimage: u256, recipient_sig: Signature) {
    let hash: u256 = sha2(preimage);
    let expected_hash: u256 = 0x66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925;// (2)!
    assert!(jet::eq_256(hash, expected_hash));
    let recipient_pk: Pubkey = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798;// (3)!
    checksig(recipient_pk, recipient_sig);
}

fn cancel_spend(sender_sig: Signature) {
    let timeout: Height = 1000;
    jet::check_lock_height(timeout);
    let sender_pk: Pubkey = 0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5;// (4)!
    checksig(sender_pk, sender_sig)
}

fn main() {
    match witness::COMPLETE_OR_CANCEL {
        Left(preimage_sig: (u256, Signature)) => {
            let (preimage, recipient_sig): (u256, Signature) = preimage_sig;
            complete_spend(preimage, recipient_sig);
        },
        Right(sender_sig: Signature) => cancel_spend(sender_sig),
    }
}// (1)!
```

1.  This compiles to Simplicity ready for on-chain execution. More involved scripts can execute [reverse Dutch auctions](https://delvingbitcoin.org/t/writing-simplicity-programs-with-simplicityhl/1900).

2.  The SHA-256 hash of the all-zero 32-byte value `[0x00; 32]`, a fixed, public preimage used here so the example is self-contained and spendable by anyone trying it.

3.  The public key corresponding to using the number `1` as a private key, for demonstration purposes.

4.  The public key corresponding to using the number `2` as a private key, for demonstration purposes.
