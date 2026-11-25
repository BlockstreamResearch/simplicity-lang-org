# Pitfalls: Other contract pitfalls

## Witness swiping

If a [contract](../glossary.md#contract) requires a secret to be disclosed in order to take some action, the secret is published in the [witness](../glossary.md#witness) of the spending [transaction](../glossary.md#transaction). It's visible to anyone watching the mempool before that transaction confirms. If nothing else in the spending path binds the transaction to the person who found the secret, an observer can copy the secret into a competing transaction with a different destination and a higher [fee](../glossary.md#fee), and that transaction may confirm first.

For example, the [`reveal_collision.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/reveal_collision.simf) example pays out to anyone who supplies two different values with the same SHA-256 hash. It doesn't check any signature or constrain any [output](../glossary.md#output), so whoever first sees a valid collision in the mempool can claim the reward.

Requiring a signature with `jet::sig_all_hash` binds the witness to one transaction's [inputs](../glossary.md#input) and outputs, so a copied witness is only valid in the original transaction. A reward meant for whoever finds a secret can't use that defense directly, because the finder's key isn't known in advance; it needs a scheme in which the finder first commits to the secret and a destination in one transaction, and reveals the secret in a later one.

## Comparison and arithmetic jets

[SimplicityHL](../glossary.md#simplicityhl) doesn't have infix comparison or arithmetic operators. Comparisons are [jets](../glossary.md#jet), so the direction of a comparison depends entirely on the order of its arguments: `jet::le_64(a, b)` is true when `a` is less than or equal to `b`. A reversed comparison compiles and reads almost the same as a correct one:

```simplicityhl
// Requires `retained` to be at least `minimum`.
fn retains_minimum(minimum: u64, retained: u64) {
    assert!(jet::le_64(minimum, retained));
}

// Compiles, but requires the opposite.
fn retains_minimum_reversed(minimum: u64, retained: u64) {
    assert!(jet::le_64(retained, minimum));
}
```

Addition, subtraction, increment, and decrement jets return a flag together with the result, with the flag first: `jet::add_64` returns `(carry, sum)` and `jet::subtract_64` returns `(borrow, difference)`. If the flag is discarded, a result that doesn't fit wraps around:

```simplicityhl
fn not(bit: bool) -> bool {
    <u1>::into(jet::complement_1(<bool>::into(bit)))
}

fn checked_total(a: u64, b: u64) -> u64 {
    // Incorrect: `let (_, total): (bool, u64) = jet::add_64(a, b);`
    // turns an overflowing total into a small number.
    let (carry, total): (bool, u64) = jet::add_64(a, b);
    assert!(not(carry));
    total
}
```

A loop that sums amounts across inputs needs this check at every addition.

A helper's name doesn't guarantee its behavior. Projects that copy helpers such as `safe_add_64` between contracts can end up with copies that differ, for example one that checks the carry and one that discards it and lets an overflowing sum through, while every call site reads the same. Read each definition, or use a single shared one, such as `checked_add_64` in the [standard library](stdlib.md).

## Assets stuck in a contract

A contract's logic might have a situation in which some [asset](../glossary.md#asset) is permanently stuck in the contract and can't be recovered. The asset is then effectively burned.

Design or implementation flaws can cause this, when some combination of circumstances or actions creates conditions that the contract can't satisfy in order to make progress. Modeling the contract with a state diagram, and checking that every state transition corresponds exactly to specific code, helps find these.

Assets can also get stuck if an intended party disappears and doesn't complete a required action. Financial incentives may not be enough: parties can forget about the contract, lose control of the necessary [private keys](../glossary.md#private-key), or die.

Many contracts avoid these failures with a refund path behind a [timelock](../glossary.md#timelock), through which assets still held after some time can be reclaimed, often by the parties that sent them. A refund path must not be usable while someone is still legitimately waiting for the contract to make progress.

### Payments a contract doesn't expect

A contract can constrain the transactions that spend it, but not the transactions that pay it. Anyone can pay a [covenant](../glossary.md#covenant)'s [address](../glossary.md#address). On Liquid, the payment can be in any asset, and it can be [confidential](../glossary.md#confidential).

A [program](../glossary.md#program) that calls `unwrap_right` on the asset or amount from `jet::current_amount`, or on the result of `jet::current_asset`, fails on a confidential [UTXO](../glossary.md#utxo), so that path can't spend it. If every spending path does so, a confidential payment to the contract's address can never be spent. Similarly, if every path requires the contract's input to hold a particular asset, a payment in any other asset is stuck. A contract that has to read explicit amounts can include a path that doesn't, for example a key-authorized path that sends a UTXO's whole value to a fixed destination.

A second payment to the same address can also create a second instance of the covenant, with the risks described in [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints). Off-chain software sees these payments too; see [Unsolicited outputs at a contract's address](pitfalls-offchain.md#unsolicited-outputs-at-a-contracts-address).

## Before deploying

### Unspendable internal key

A [Taproot](../glossary.md#taproot) output can be spent with its [internal key](../glossary.md#internal-key) as well as by running its program. If the internal key is spendable, its holder can spend the output without satisfying any condition the program enforces. A covenant that relies on scriptPubKey hash equality carries the same key into every later output, so the key holder can take the funds at any point in the covenant's life. Use an unspendable internal key, as the glossary entry describes.

### Several instances in one transaction

Ask what a transaction could do if it spent two of this covenant's UTXOs at once: who would own them, and who could spend them. If a spender could take funds that aren't theirs, add one of the remedies in [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints).

### Every compiled branch

A contract's address fixes its spending paths, so they can't change once assets are sent to it. A path that the application doesn't expose, the indexer doesn't understand, and the tests don't cover is still available to anyone who reads the source. For every branch in the program, confirm that it's tested, that off-chain software handles the transactions it produces, and that the state it leaves behind has a way forward. Before deploying, remove any branch for which an answer is no.

### Compiler and library versions

The address commits to the compiled program, so recompiling the same source with a different `simc` release or library version can produce a different address. Nothing warns about this when compiling or funding. Record the exact versions a deployed contract was compiled with; see [Contract identity](overview.md#contract-identity).
