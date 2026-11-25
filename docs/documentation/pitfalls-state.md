# Pitfalls: State and concurrency

A [contract](../glossary.md#contract) that carries [state](state.md) from one [transaction](../glossary.md#transaction) to the next has to allow for many parties acting on it at once, write each new state exactly as it later checks it, and keep its [assets](../glossary.md#asset) with it through every update.

## Contention for a shared UTXO

A [recursive covenant](../glossary.md#recursive-covenant) that holds a shared balance exists as one [UTXO](../glossary.md#utxo) at a time. Each spend consumes that UTXO and creates its successor, so spends of the contract form a single sequence. When many parties are entitled to act on the contract at around the same time, they contend for that one UTXO.

Consider a prediction market that keeps its reserve in a single [covenant](../glossary.md#covenant) UTXO. When the market resolves, hundreds of holders of winning [tokens](../glossary.md#token) may each be entitled to redeem their tokens for a share of the reserve. Each holder builds a transaction that spends the current reserve UTXO, pays out the holder's share, and returns the rest to a new copy of the covenant. Only one of those transactions can be mined. The others spend an [output](../glossary.md#output) that no longer exists, so they're invalid and don't confirm. They don't cost their senders any [fee](../glossary.md#fee), but each sender has to find the new reserve UTXO and build the claim again, and most of them lose the next round too.

The contract's rules hold throughout, and every claimant can redeem eventually. The cost is in time and in off-chain software:

* Claims proceed one at a time. If each claimant waits for the previous claim to confirm, the contract processes about one claim per block. On [Liquid](../glossary.md#liquid), with one-minute blocks, 300 claims take about five hours. On Bitcoin they take about two days. Claimants who retry by hand, or who check back only occasionally, stretch this further.
* A claimant can build on an unconfirmed predecessor by spending its output from the mempool. [Node](../glossary.md#node) policy limits how long a chain of unconfirmed transactions can grow (25 transactions by default), and a claimant whose view of the mempool differs from a miner's can build on the wrong predecessor.
* Wallets and indexers have to follow the covenant from one UTXO to the next instead of storing a fixed outpoint. [Esplora](../glossary.md#esplora)'s `/tx/{txid}/outspend/{vout}` endpoint returns the transaction that spent an output, which is enough to walk the chain to its current tip, at the cost of one request per spend, repeated whenever a claim fails.
* A claim has to remain valid when it's rebuilt against a different UTXO. If the claimant's signature commits to the covenant [input](../glossary.md#input), for example through `jet::sig_all_hash`, every retry needs a new signature, so the claimant's wallet has to stay online until the claim confirms.
* A user whose claim lost the contention sees a failed transaction, even though the user's entitlement is unchanged. Applications need to explain this and retry automatically.

The same contention affects any covenant that several parties can update independently, such as a [vault](../glossary.md#vault) with several authorized withdrawers, a pool that accepts deposits from anyone, or an auction that accepts bids. A contract in which only one party can act at each stage doesn't have this problem.

The first three mitigations below have to be chosen when the contract is designed. A liquidity provider works with any contract.

### Batching

A contract can allow one transaction to process many claims. The reserve UTXO is spent once, the contract computes the total payout from the total amount of tokens burned, and it requires the continuing output to hold the reserve minus that total. A coordinator collects claims from many holders into one [PSET](../glossary.md#pset) and broadcasts them together. Each holder signs with a [sighash](../glossary.md#sighash) type that covers only that holder's token input and payout output, so the coordinator can't redirect anyone's payout. As long as the contract also accepts a single claim, a holder who doesn't want to wait for a batch can still claim alone.

### Splitting the reserve

The reserve can be held as several UTXOs, each a separate instance of the covenant, so that claims against different instances can confirm in the same block. The contract then has to prevent a single transaction from spending several instances against one shared output, as described in [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints). Each instance also has to be able to pay any single claim, or the contract has to let one claim draw on several instances.

### Separate backing for each claim

Where each token is backed by a fixed amount of collateral, the collateral can be locked in its own UTXO when the token is issued. Redemption then spends a backing UTXO that no one else is likely to choose at the same moment. This is the design in the `REDEEM_YES` example under [Composability](pitfalls-composability.md), where one burned token can release two units of collateral unless the contract prevents it. It also multiplies the number of UTXOs and the size of each issuance transaction.

### Liquidity provider

A third party can buy winning tokens from holders at a small discount, paying in Liquid bitcoin (LBTC) in an atomic swap: the holder's tokens and the provider's payment move in the same transaction, which doesn't spend the contract at all. Holders receive most of their entitlement immediately, and the provider redeems the tokens at its own pace, in batches where the contract allows them. The discount pays the provider for the delay and the indexing work. The contract's creator can run such a service, as can anyone else. Neither side has to trust the other, provided that the swap is atomic and the contract's own redemption path stays usable, which also limits the discount to what holders are willing to pay to avoid waiting. A service where holders send their tokens first and are paid later, or where the service is the only practical way to redeem, makes holders depend on its operator.

## State written differently from how it's checked

A state-carrying covenant holds two expressions for the same quantity: one that *writes* the next state, and one that later *checks* it. Those two expressions must return the same value for every input.

Integer division breaks this quietly, because `floor` isn't additive:

```text
floor(a/n) + floor(b/n)  !=  floor((a+b)/n)      whenever the remainders sum to n or more
```

"Apply a rounded delta to the old value" and "recompute from the new state variable" are therefore different functions, even though they describe the same intent. A covenant that writes state the first way and verifies it the second way accepts its own updates for a while, and then rejects every spend.

Consider a loan covenant that releases collateral in proportion to the debt repaid. It stores the remaining debt in a state slot, and on each spend it re-derives how much collateral should still be held. The example uses `mul_div_64`, `safe_add_64` and `safe_sub_64` from the [standard library](stdlib.md), and the input helpers from the [lending contract](https://github.com/BlockstreamResearch/simplicity-lending)'s `helper.simf`:

```simplicityhl
// Verifier: the invariant this covenant maintains.
fn collateral_for(repaid: u64) -> u64 {
    mul_div_64(repaid, COLLATERAL, TOTAL_DEBT)   // floor division
}

fn validate_collateral_input(input_index: u32, current_debt: u64) -> u64 {
    let (asset, held): (u256, u64) = get_input_explicit_asset_and_amount(input_index);
    let repaid: u64 = safe_sub_64(TOTAL_DEBT, current_debt);

    check_assets_eq(asset, COLLATERAL_ASSET_ID);
    // held + already-released == the original collateral
    check_asset_amounts_eq(safe_add_64(held, collateral_for(repaid)), COLLATERAL);

    held
}
```

A common way to write the producer is to round the increment:

```simplicityhl
// Incorrect: rounds the delta, so the result drifts away from the invariant above.
let to_release: u64 = collateral_for(amount_repaid);
let new_held: u64 = safe_sub_64(held, to_release);
```

Each spend loses up to one unit of agreement with `validate_collateral_input`. After enough spends the stored collateral is one unit higher than the invariant allows, so the next spend's own input check fails. If every spending path runs this input check, as in the lending contract, every path fails with it, including the paths that exist to recover the funds. The collateral is permanently unspendable.

The producer must instead be derived from the new state:

```simplicityhl
// Correct: a difference of two absolute values, both computed by the verifier's own function.
let repaid_after: u64 = safe_add_64(repaid_before, amount_repaid);
let released_before: u64 = collateral_for(repaid_before);
let released_after:  u64 = collateral_for(repaid_after);
let to_release: u64 = safe_sub_64(released_after, released_before);
let new_held: u64 = safe_sub_64(held, to_release);
```

Now `new_held + collateral_for(repaid_after) == COLLATERAL` holds by construction, for every schedule of repayments, because both sides are built from the same `collateral_for`. In the correct version the per-spend release amount varies (27, 27, 27, 28, 27, and so on), where the incorrect version releases the same amount every time.

The rule generalizes past division to any operation that isn't additive over the update: **in a covenant, derive each checked quantity from the new state, using the same function the verifier uses.** State kept as a running total can drift out of agreement with the predicate that guards it.

Two consequences need separate checks:

* A percentage taken with `floor` *per transaction* can be driven to zero by splitting the payment into small enough increments. A 10% fee on amounts below 10 units is no fee at all, repeatable indefinitely.
* An aggregate recomputed later from a total won't equal the sum of incrementally rounded parts, so a covenant that reconstructs "how much has been paid so far" can compute a total that its own balance contradicts. If that total selects a branch, such as whether a vault is finished, the contract can become unable to reach its terminal state.

A state diagram doesn't catch any of this: the state machine is correct and every transition exists. Only the arithmetic drifts. To catch it, write the producer and the verifier next to each other and confirm they're the same expression, and test more than two consecutive transitions with amounts that don't divide evenly. With drift of one unit per transition, the first rejected spend is often the third, after the second has already written the bad state.

## Output constraints in state updates

A state update is an on-chain transaction, and that transaction specifies a destination for every asset the [program](../glossary.md#program) controls. A program therefore has to constrain the destinations of its assets, or a spender can send them anywhere.

For example, consider a contract that holds 0.10 LBTC as a vault, and that records in its state when a required event has happened, such as a signature from Alice approving a withdrawal. The state-update path must assert all of the following:

* The event did happen: a [witness](../glossary.md#witness) contains a valid, fresh signature from Alice.
* The output state corresponds to the input state, except for the intended update.
* **The transaction's outputs send the contract's LBTC, less any fee the contract permits, to a copy of the same contract.** See [Fees](pitfalls-fees.md).
