# Pitfalls: Composability

[Contracts](../glossary.md#contract) that are individually correct can accept transactions they should reject when more than one of them runs in the same [transaction](../glossary.md#transaction). A spender can then take more than intended.

A [Simplicity](../glossary.md#simplicity) [program](../glossary.md#program) is attached to a [UTXO](../glossary.md#utxo), and a single transaction can spend several UTXOs, so it can run several programs at once. The transaction model doesn't give any program exclusive access to any [input](../glossary.md#input) or [output](../glossary.md#output): every program in a transaction can see every input and every output. Several programs can therefore count the same event or the same output.

For example, a contract that releases a locked [asset](../glossary.md#asset) when a [token](../glossary.md#token) is redeemed often checks that the token is burned, meaning sent to a deliberately unspendable output. If two such contracts run in the same transaction, both see the same burn, and one token releases two locked amounts.

Consider a prediction market in which each winning share is backed by one unit of collateral in its own UTXO. A `REDEEM_YES` path releases that collateral to whoever burns a `YES` token, given an [oracle](../glossary.md#oracle) statement that the market resolved as YES. The erroneous path checks only this:

```text
REDEEM_YES: my input holds one unit of collateral, output 0 sends a YES token
  to a deliberately unspendable destination, and oracle_statement is a validly
  signed statement that this market resolved as YES.
```

This transaction satisfies the check for both input 0 and input 1:

| Input | Contents | [Witness](../glossary.md#witness) |
| --- | --- | --- |
| 0 | 1 unit of collateral, locked by the market | `REDEEM_YES`, oracle statement |
| 1 | 1 unit of collateral, locked by the market | `REDEEM_YES`, oracle statement |
| 2 | 1 `YES` token | |
| 3 | Liquid bitcoin (LBTC) for the [fee](../glossary.md#fee) | |

| Output | Contents |
| --- | --- |
| 0 | 1 `YES` token, to an unspendable destination |
| 1 | 2 units of collateral, to the claimant |
| 2 | Fee |

Each copy of the program counts the same burn as authorizing its own release, and neither copy checks for the other. Because the check doesn't require a positive amount, it also accepts a burn of 0 `YES` tokens; see [Zero-amount burns](pitfalls-assets.md#zero-amount-burns).

## Shared outputs and amount constraints

Double-counting also arises when the repeated check concerns an amount rather than an event. A [recursive covenant](../glossary.md#recursive-covenant) commonly requires that most of its balance return to a copy of itself, by comparing its own input amount against the amount of one specific output:

```simplicityhl
// `not` is the standard library's logical NOT. `remaining` is this input's
// amount and `retained` is output 0's amount, read as in Assets and amounts.
// `difference` is the amount that must be retained.
let (borrow, difference): (bool, u64) = jet::subtract_64(remaining, param::ALLOWANCE);
assert!(not(borrow));
assert!(jet::le_64(difference, retained));
```

Every input running this program compares its own `remaining` against the same output. For two such UTXOs holding `R1` and `R2` spent in one transaction, the only requirement on the shared output is that it retain `max(R1, R2) - ALLOWANCE`, although `R1 + R2` was contributed. The spender takes the smaller input in full, plus one allowance from the larger.

The second UTXO doesn't have to be created deliberately. Anyone can pay to a [covenant](../glossary.md#covenant)'s [address](../glossary.md#address), so adding funds to a contract by sending it a second payment, rather than by spending its existing UTXO through the covenant, is enough to set this up.

Several remedies are available. They differ in whether the contract can still be spent alongside an outside fee input, and whether its instances can be combined.

### Exclusivity

Requiring exclusivity prevents a second copy from running alongside:

```simplicityhl
assert!(jet::eq_32(jet::num_inputs(), 1));
```

This is the simplest option to write. It also forbids an outside fee input, so the contract pays every fee out of its own balance; see [Contracts that require a single input](pitfalls-fees.md#contracts-that-require-a-single-input).

A single-input spend can't produce outputs holding more of the covenant's asset than its one input held, so under this restriction the balance of an existing instance can only decrease, and no transaction adds funds to one. Paying the covenant's address again creates a second instance with its own [timelock](../glossary.md#timelock) rather than adding to the first, and the two can never be combined afterward.

Whether that matters depends on what the contract promises. A contract whose limit is meant per UTXO can state the behavior and stop there. A contract whose limit is meant to apply across the whole balance needs aggregation or a separate deposit path.

### Spending only from input 0

Requiring the contract to be spent only from input 0 gives the same exclusivity while still admitting outside fee inputs:

```simplicityhl
assert!(jet::eq_32(jet::current_index(), 0));
```

Two copies can't both be input 0, so at most one copy runs, while any number of other inputs, such as a wallet's fee coins, remain allowed. The check runs in constant time and also excludes distinct instances of the contract. The cost is composability: two contracts that both claim input 0 can never be spent in the same transaction, so instances can't be batched, and the contract can't be combined with another protocol that uses the same convention. Transaction builders also have to place the contract's input first.

### Rejecting other copies

Where the contract must be combinable with other contracts, it can instead reject any *other* input whose scriptPubKey hash equals `jet::current_script_hash()`, checked with `jet::input_script_hash` in a `for_while` loop. A loop's bound is set by the width of its counter type, for example 16 iterations for a `u4` counter, so the contract has to assert that `jet::num_inputs()` is within the bound rather than loop over every input a transaction could have. This check excludes only identical copies. Instances with distinct scriptPubKeys, such as instances in different states, can still run together.

### Aggregation

Aggregating preserves multi-input spends: iterate over the transaction's inputs with `for_while`, sum the amounts of every input whose scriptPubKey hash matches `jet::current_script_hash()`, and compare the shared output against that total. This costs extra program size and witness data, and a [confidential](../glossary.md#confidential) payment to the address can make the loop's `unwrap_right` fail; see [Payments a contract doesn't expect](pitfalls-other.md#payments-a-contract-doesnt-expect). It also rate-limits deposits, because a newly deposited UTXO is subject to whatever timelock the spending path enforces before it can be combined with the others.

### A separate deposit path

A separate deposit path is a distinct branch, selected by the witness, which permits several inputs on the condition that their combined value returns to the covenant. Since a deposit isn't a withdrawal, this path can skip the rate limit that the withdrawal path enforces, which aggregation on its own can't do. Bounded to a fixed number of inputs, it doesn't need a loop: it uses `jet::current_index` to identify which input is executing and `jet::add_64` with a carry check to total them. The extra branch makes the program harder to review.

### When a shared output lets funds be taken

A shared output doesn't always let a spender take funds that aren't theirs. Which case applies decides whether a finding in review means funds can be stolen, or only that the design is untidy. Each executing input requires the shared output to hold at least its own amount, less whatever its path lets the spender withdraw. The shared output must therefore be at least the largest single input less that input's withdrawal, and extraction is bounded by the sum of the *other* inputs plus one withdrawal.

That bound means a *deposit*-shaped path, on its own, doesn't let anyone take funds that aren't theirs. If the covenant requires `output == own_input + contributed`, an attacker who creates the second UTXO can never extract more than they put in, because the output they must leave behind is already at least as large as the largest balance present. Such a path can look alarming in review and be harmless.

The same shape lets a spender take other parties' funds when either of two conditions holds:

* The attacker doesn't own any of the inputs. If several of the covenant's own UTXOs already exist, because the covenant has no state and so one address accumulates them, or because anyone may pay the address, then everything except the largest balance can be extracted in one transaction, and the attacker doesn't contribute any input.
* The path doesn't require any authorization. A permissionless state-advancing branch, included so that anyone may add funds to the covenant, lets anyone perform that extraction.

A fee-accumulating covenant with a stateless address and an unauthenticated deposit branch meets both conditions at once, and is the worst case: an attacker without any key, token, or stake takes everything except the largest balance in a single transaction.

Giving a covenant [state](state.md), so that instances in different states have distinct scriptPubKey hashes, prevents this kind of extraction between those instances. That's a further reason to prefer state over a single shared address even when the contract has no other need for it. Anyone can still pay the current state's address and create a sibling in the same state, so siblings still need one of the remedies above.
