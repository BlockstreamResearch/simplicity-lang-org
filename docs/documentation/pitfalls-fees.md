# Pitfalls: Fees

Every change to a [contract](../glossary.md#contract)'s state is a [transaction](../glossary.md#transaction), and every transaction pays a [fee](../glossary.md#fee). A contract either lets the fee come out of its own [assets](../glossary.md#asset) or requires the party advancing it to pay, and it needs logic that enforces whichever choice it makes.

On [Liquid](../glossary.md#liquid), fees are paid in the network's [policy asset](../glossary.md#policy-asset): Liquid bitcoin (LBTC) on Liquid mainnet and test Liquid bitcoin (tLBTC) on Liquid testnet. Each fee is an explicit fee output in the policy asset. On Bitcoin, the fee is whatever the inputs hold beyond what the outputs claim, and there isn't any fee output. A contract that's meant to pay its own fees has to hold some of the policy asset, even if it otherwise deals only in other assets.

A contract that pays its own fees should:

* bound the fee, so that a spender can't spend the contract's assets on an excessive fee (see [Bounding the fee output](#bounding-the-fee-output)), and
* allow for running out of the policy asset. If the contract also accepts an outside fee [input](../glossary.md#input), it can't get stuck when its own balance runs low; see [Who can pay the fee](#who-can-pay-the-fee).

Requiring the party that advances the contract to pay is more common. A contract that does so should:

* prevent its own assets from going to the fee,
* leave room for the spender's change, so that an input added to pay the fee doesn't lose its whole value, and
* give the party that's expected to advance it enough incentive to do so, including enough to pay the fee.

The [`last_will.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/last_will.simf) example misses the first two. It also lets the fee come out of its own assets without any bound. Its refresh path requires exactly two [outputs](../glossary.md#output), with output 0 returning to the [covenant](../glossary.md#covenant) and output 1 paying the fee, but it doesn't constrain either amount. Whoever holds the hot key can refresh the covenant with almost nothing in output 0 and the rest in the fee. A wallet input added to pay the fee doesn't have any output for its change, so its value goes to the covenant or to the fee.

## Who can pay the fee

What a contract allows in its spending transaction decides whether anyone other than the contract can contribute to the fee.

### Contracts that require a single input

A contract that requires a single input, for example with `assert!(jet::eq_32(jet::num_inputs(), 1))` (one of the remedies in [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints)), pays every fee out of its own balance, because there isn't any other input for the fee to come from.

* The contract can't advance when the fee is larger than the spending path can spare. In an allowance-style covenant that pays out a fixed amount per period, a withdrawal fails once the fee exceeds that amount, and a final withdrawal fails once the fee exceeds the remaining balance. A remainder smaller than any workable fee is stranded permanently.
* The spender's wallet chooses the fee rate at spend time, so a margin that's comfortable when the contract is written can disappear in a fee spike. On a chain whose blocks fill up, the contract can be stuck until fees fall.
* The party advancing the contract pays the fee out of what it receives, so its incentive shrinks as fees rise.
* If the spending transaction is replaceable, a replacement at a higher fee can't add an input either, so the extra fee has to come out of an output in the policy asset. If the contract pins every such output amount exactly, a replacement can't raise the fee. On Liquid, a transaction is replaceable if it signals so, for example with an input whose sequence number is `0xfffffffd` or less. For a single-input contract, that's the contract's own input, and an input with a relative timelock always signals.
* Child-pays-for-parent works whether or not the transaction is replaceable: whoever receives an output of the stuck transaction that can be spent immediately can spend it while it's unconfirmed, in a transaction whose fee covers both. That child transaction isn't constrained by the contract, so it can add inputs. On Liquid, only a fee in the policy asset counts, so a child that spends a payout in another asset needs a policy-asset input of its own. The covenant's continuing output can't serve this purpose without satisfying the covenant again, so the contract needs at least one output that goes to a party who can spend it freely, typically the spender's payout.

### Contracts that allow other inputs

A contract that allows other inputs lets a wallet pay the fee and keeps the contract's balance intact, but it takes on other obligations.

* Other copies of the same contract can now run in the same transaction, and a spender can then take more than intended. Requiring the contract to be spent only from input 0 prevents this while still allowing a wallet's fee inputs; [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints) describes this and the other remedies.
* Any check that loops over inputs has to select the contract's own inputs by scriptPubKey hash before reading their amounts. Summing every input's amount counts the wallet's fee input as contract funds, so any limit the contract computes from the total comes out wrong. Reading every input's amount with `unwrap_right` makes the [program](../glossary.md#program) fail as soon as the wallet's input is [confidential](../glossary.md#confidential), which wallet coins on Liquid usually are, and the spend is rejected.

### When a wallet can't contribute

A wallet can be unable to help even when the contract allows other inputs and the wallet holds funds:

* On Liquid, a wallet that doesn't hold any of the policy asset can't contribute.
* A contract that fixes the number of outputs and the role of each leaves the wallet's change nowhere to go.
* A transaction builder that sets a single sequence number for every input gives the fee input the contract's relative [timelock](../glossary.md#timelock) too, measured from the fee input's own confirmation. For a freshly received coin, that delays the spend by up to the full timelock; see [Timelocks in transactions with several inputs](timelocks.md#timelocks-in-transactions-with-several-inputs).
* If the contract requires a signature over the whole transaction, such as one made with `jet::sig_all_hash`, the fee input has to be in place before the authorized party signs. When the signer and the fee payer are different parties, they have to coordinate. Signing a message that leaves other inputs uncommitted avoids that, but then anyone who sees the transaction can change what the signature doesn't cover; see [Witness swiping](pitfalls-other.md#witness-swiping).
* A wallet sets aside an estimated fee before it builds a transaction. A conservative or spiking estimate can lead it to conclude that the contract can't spare the fee and that it must add an input of its own, which then runs into one of the limits above, even though the fee actually needed would have fit. For a single-input contract, the same wallet can therefore refuse a spend at one moment and build it a little later.

## Bounding the fee output

On Liquid, `jet::output_is_fee` reports whether an output is a fee output. It doesn't report anything about the amount. A contract that pays its own fee has to bound the amount separately:

```simplicityhl
// Output 1 must be a fee output, in the policy asset, of at most MAX_FEE.
assert!(unwrap(jet::output_is_fee(1)));
let (fee_asset, fee_amount): (Asset1, Amount1) = unwrap(jet::output_amount(1));
let fee_asset_id: u256 = unwrap_right::<(u1, u256)>(fee_asset);
let fee: u64 = unwrap_right::<(u1, u256)>(fee_amount);
assert!(jet::eq_256(fee_asset_id, param::POLICY_ASSET));
assert!(jet::le_64(fee, param::MAX_FEE));
```

`POLICY_ASSET` must be in internal byte order; see [Asset IDs in internal byte order](pitfalls-assets.md#asset-ids-in-internal-byte-order).

The bound applies to one output. Fix the number of outputs and constrain each of the others, so that no other output, including a second fee output, can carry value the contract doesn't account for. A fixed maximum can also make every spend fail during a fee spike, until fees fall; see [Who can pay the fee](#who-can-pay-the-fee).
