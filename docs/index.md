---
title: Simplicity is a minimal, deterministic, functional language built for Bitcoin’s trust model. It offers elegance over complexity, enabling powerful smart contracts without relying on a growing list of ad hoc opcodes.
hide:
  - toc
---

## Simplicity for Bitcoiners

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

## Simplicity for Finance

<div class="grid cards" markdown>

- ### :material-handshake: Reduced Counterparty and Settlement Risk 
  By encoding complex settlement logic directly on-chain, contracts become self-enforcing and physically settled without intermediaries, drastically reducing counterparty risk.

- ### :material-receipt-text-check-outline: No More Surprise "Gas" Fees 
  Every Simplicity contract has a statically bounded computational cost that can be determined before execution. This provides predictable, reliable operational fees, eliminating the unpredictable fee dynamics seen on other platforms.

- ### :material-bank-plus: Build Complex TradFi Products On-Chain
  Simplicity is expressive enough to create sophisticated, non-custodial financial instruments directly on-chain. Build trustless versions of traditional products like options, bonds, and collateralized loans without relying on intermediaries or oracles.

- ### :material-treasure-chest: Programmable Treasury and Asset Control
  Create powerful on-chain rules (covenants) for self-custodied, institutional-grade vaults. Enforce spending limits, require multi-party approval for large transactions, or programmatically enforce time-locked withdrawals and spending velocity limits—all without a trusted third party.

</div>


## Simplicity Examples

<div class="grid cards" markdown>

- ### :material-lock-clock: Hash Time-Locked Contracts (HTLCs)
  The building block for payment channels and atomic swaps. Lock funds until a secret is revealed or a timeout is reached, enabling trustless, cross-chain exchanges and Layer 2 protocols like the Lightning Network.

- ### :material-swap-horizontal-bold: Trustless Atomic Swaps
  Execute peer-to-peer trades of different assets across blockchains without settlement risk. Simplicity ensures that either both parties receive their assets or the trade is atomically reverted.

- ### :material-chart-line: Covered Call Options
  Write and settle derivatives contracts directly on-chain. A seller can lock collateral to issue a call option, which a buyer can exercise at a predetermined strike price before an expiry date, all enforced by the Simplicity program.

- ### :material-cash-lock: Collateralized Loans
  Lock collateral in a Simplicity contract to borrow assets. The program guarantees that the lender can claim the collateral if the borrower defaults, or that the borrower can reclaim it upon repayment—all without a trusted intermediary.

</div>


# Write in a Language You Already Know

You can use SimplicityHL, a high-level language with a clean, Rust-like syntax. This abstracts away low-level complexity, making it straightforward to write clear and reliable financial contracts with minimal code.


``` rust title="Hash Time-Locked Contract" 
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

2.  `sha2([0x00; 32])`

3.  `1 * G`

4. `2 * G`

