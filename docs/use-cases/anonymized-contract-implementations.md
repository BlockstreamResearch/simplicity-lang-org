# Contract implementation index

This file maps the anonymized IDs in `anonymized-contract-recreation-set.md` to the public implementation used as the recreation target. The first file intentionally contains no source names or links.

| ID | Implementation | Main code | Supporting material |
|---|---|---|---|
| C01 | Single-key spend | [p2pk.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2pk.simf) | — |
| C02 | Public-key-hash spend | [p2pkh.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2pkh.simf) | — |
| C03 | Threshold multisignature | [p2ms.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2ms.simf) | — |
| C04 | Transfer with timeout | [transfer_with_timeout.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/transfer_with_timeout.simf) | — |
| C05 | Escrow with delay | [escrow_with_delay.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/escrow_with_delay.simf) | — |
| C06 | Hash-time-locked transfer | [htlc.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/htlc.simf) | — |
| C07 | Presigned vault | [presigned_vault.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/presigned_vault.simf) | — |
| C08 | Oracle-gated holding vault | [hodl_vault.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/hodl_vault.simf) | — |
| C09 | Last-will vault | [last_will.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/last_will.simf) | — |
| C10 | Hash-collision challenge | [reveal_collision.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/reveal_collision.simf) | — |
| C11 | Hash-fixed-point challenge | [reveal_fix_point.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/reveal_fix_point.simf) | — |
| C12 | Transaction-commitment spend | [ctv.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/ctv.simf) | — |
| C13 | Non-interactive fee bump | [non_interactive_fee_bump.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/non_interactive_fee_bump.simf) | — |
| C14 | All-outputs plus anyone-can-pay signature | [sighash_all_anyonecanpay.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/sighash_all_anyonecanpay.simf) | — |
| C15 | All-outputs plus any-previous-output signature | [sighash_all_anyprevout.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/sighash_all_anyprevout.simf) | — |
| C16 | All-outputs plus any-previous-output-and-script signature | [sighash_all_anyprevoutanyscript.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/sighash_all_anyprevoutanyscript.simf) | — |
| C17 | No-output signature | [sighash_none.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/sighash_none.simf) | — |
| C18 | Current-index-output signature | [sighash_single.simf](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/sighash_single.simf) | — |
| C19 | Collateral-backed options contract | [options.simf](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/simf/options.simf) | [options program](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/src/programs/options.rs) |
| C20 | Collateral offer with counterparty swap | [option_offer.simf](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/simf/option_offer.simf) | [option-offer program](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/src/programs/option_offer.rs) |
| C21 | Peer-to-peer lending | [lending.simf](https://github.com/BlockstreamResearch/simplicity-lending/blob/main/crates/contracts/simf/lending.simf) | [contract programs](https://github.com/BlockstreamResearch/simplicity-lending/tree/main/crates/contracts/src/programs/lending), [README](https://github.com/BlockstreamResearch/simplicity-lending/blob/main/README.md) |
| C22 | Two-outcome prediction market | [prediction_market.simf](https://github.com/Resolvr-io/deadcat/blob/master/src-tauri/crates/deadcat-sdk/contract/prediction_market.simf) | [contract design](https://github.com/Resolvr-io/deadcat/blob/master/src-tauri/crates/deadcat-sdk/simplicityhl-contract-design-doc.md) |
| C23 | Constant-product two-asset exchange | [pool contracts](https://github.com/0ceanSlim/anchor/tree/main/contracts), [full repository](https://github.com/0ceanSlim/anchor) | [protocol specification](https://github.com/0ceanSlim/anchor/blob/main/docs/spec.md) |
| C24 | Hash-based post-quantum signature verifier | [verifier repository](https://github.com/BlockstreamResearch/shrincs-simplicity-verifier) | [deployment description](https://blog.blockstream.com/blockstream-research-demonstrates-quantum-resistant-transaction-signing-on-liquid-using-simplicity-smart-contracts/) |

Excluded: overview-only product descriptions, roadmap ideas, and small arithmetic/data-shape examples without a contract-spending use case. The excluded entries either lack public implementation code or are not contract examples for this test set.
