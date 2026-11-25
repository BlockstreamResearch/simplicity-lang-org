# Pitfalls: Assets and amounts

On [Liquid](../glossary.md#liquid), every [output](../glossary.md#output) holds an amount together with the [asset](../glossary.md#asset) it's denominated in. An output holding `0.0001` might hold 0.0001 Liquid bitcoin (LBTC), 0.0001 USDT, or 0.0001 of any other asset.

!!! warning "This page only applies to Elements"
    Bitcoin outputs hold only an amount of bitcoin, so this page only applies to chains based on [Elements](../glossary.md#elements), such as Liquid.

Anyone can issue a new asset at any time, for the cost of the [fee](../glossary.md#fee) on an ordinary [transaction](../glossary.md#transaction). A newly issued asset doesn't have any value unless a [contract](../glossary.md#contract) gives it a meaning, or someone off-chain promises to redeem or exchange it.

A single contract can handle several assets. The [lending contract](https://github.com/BlockstreamResearch/simplicity-lending) handles a collateral asset and a principal asset, for example. Contracts have to prevent one asset from being substituted for another:

* A contract that expects a payment in a certain asset must check that the relevant [input](../glossary.md#input) or output is denominated in that asset.
* A contract must check its outputs so that a worthless asset can't take the place of a valuable one.
* A contract that gives different assets different roles must check that the roles haven't been exchanged, such as a collateral payment made in the principal asset, or a user receiving a [token](../glossary.md#token) in place of a payment.

Amounts and destinations need the same care. Checking that a [covenant](../glossary.md#covenant) reappears in an expected output isn't enough. The contract also has to check that the output still holds the required amount of the required asset. Otherwise a transaction can, for example, swap the covenant's holdings into the fee output and leave the covenant with the amount that should have been the fee. Destination checks alone don't detect this.

If a covenant cares about an output at all, it usually needs to constrain:

* the output's asset ID, or tie it to another specific asset,
* the output's amount, or tie it to another calculated amount or range, and
* the output's destination, unless the spender is meant to choose it, as with a withdrawal.

## Asset checks in SimplicityHL

`jet::current_amount` and `jet::output_amount` each return a pair of an `Asset1` and an `Amount1` (`jet::output_amount` wraps it in an `Option`). Discarding the asset half of the pair with `_` leaves a comparison between two bare integers, and the [program](../glossary.md#program) never checks which asset either is denominated in:

```simplicityhl
// Incorrect: the asset of each side is discarded.
let (_, a): (Asset1, Amount1) = jet::current_amount();
let remaining: u64 = unwrap_right::<(u1, u256)>(a);
let (_, b): (Asset1, Amount1) = unwrap(jet::output_amount(0));
let retained: u64 = unwrap_right::<(u1, u256)>(b);
assert!(jet::le_64(remaining, retained));
```

Because anyone can issue an asset, a spender can supply an input carrying any amount of a self-issued asset. The assertion above is then satisfied by returning worthless units to the covenant, while the valuable asset leaves through another output.

Bind both halves of each pair, and compare the assets before comparing the amounts:

```simplicityhl
let (asset_in, a): (Asset1, Amount1) = jet::current_amount();
let remaining: u64 = unwrap_right::<(u1, u256)>(a);
let (asset_out, b): (Asset1, Amount1) = unwrap(jet::output_amount(0));
let retained: u64 = unwrap_right::<(u1, u256)>(b);

let asset_in_explicit: u256 = unwrap_right::<(u1, u256)>(asset_in);
let asset_out_explicit: u256 = unwrap_right::<(u1, u256)>(asset_out);
assert!(jet::eq_256(asset_in_explicit, asset_out_explicit));

assert!(jet::le_64(remaining, retained));
```

A contract that must hold one particular asset can compare against a fixed asset ID instead of against another part of the transaction. Pass the asset ID in as a [parameter](../glossary.md#parameter) at compile time, in [internal byte order](#asset-ids-in-internal-byte-order):

```simplicityhl
assert!(jet::eq_256(asset_in_explicit, param::ASSET_ID));
```

!!! warning "`jet::lbtc_asset` is the mainnet ID on every network"
    `jet::lbtc_asset` returns a constant, the Liquid mainnet LBTC asset ID, whichever chain the program runs on. On Liquid testnet the [policy asset](../glossary.md#policy-asset) is test Liquid bitcoin (tLBTC), and on a local [regtest](../glossary.md#regtest) network, including the one [Simplex](../glossary.md#simplex) tests run on, it's that network's own policy asset. A contract that requires an asset to equal `jet::lbtc_asset()` rejects every spend on those networks, so use it only in a contract meant for Liquid mainnet alone.

The comparison and the amounts can be factored into a single function, so that the amounts are only reachable through the check:

```simplicityhl
// Confirm that two (asset, amount) pairs are denominated in the same asset,
// and return their explicit amounts.
// Panics if either asset or either amount is confidential.
fn same_asset(x: (Asset1, Amount1), y: (Asset1, Amount1)) -> (u64, u64) {
    let (x_asset, x_amount): (Asset1, Amount1) = x;
    let (y_asset, y_amount): (Asset1, Amount1) = y;
    let x_asset_id: u256 = unwrap_right::<(u1, u256)>(x_asset);
    let y_asset_id: u256 = unwrap_right::<(u1, u256)>(y_asset);
    assert!(jet::eq_256(x_asset_id, y_asset_id));
    (unwrap_right::<(u1, u256)>(x_amount), unwrap_right::<(u1, u256)>(y_amount))
}
```

A caller then reads both amounts in one line, with no way to obtain them while skipping the asset comparison:

```simplicityhl
let (remaining, retained): (u64, u64) =
    same_asset(jet::current_amount(), unwrap(jet::output_amount(0)));
```

Functions are inlined when they're compiled, so the helper costs the same as writing the comparison out in place. It panics on a [confidential](../glossary.md#confidential) asset or amount, which is the appropriate default for a contract that performs arithmetic on amounts. If every spending path panics this way, though, a confidential payment to the contract can never be spent; see [Payments a contract doesn't expect](pitfalls-other.md#payments-a-contract-doesnt-expect). State that constraint in the function's own documentation, so that a spender doesn't have to discover it.

The [standard library](stdlib.md) also has getters that return an asset ID and an amount together, such as `get_explicit_input_asset_id_with_amount`.

A `_` in the asset position of an `(Asset1, Amount1)` destructuring marks the point where an amount loses its denomination, so it's a useful pattern to search for when reviewing a contract. Treat each one as a bug unless the program checks that asset some other way, such as by comparing it with a fixed asset ID. Even the current input's asset can be substituted, because anyone can pay the contract's address in an asset of their choosing.

An amount check repeated across several inputs can also let a spender take more than intended; see [Composability](pitfalls-composability.md).

??? note "Confidential transactions"
    A [Simplicity](../glossary.md#simplicity) program can't read the amount or asset of a confidential input or output directly. A contract that calculates with amounts or assets, such as a price, an interest payment, or a running balance, typically requires the inputs and outputs it inspects to be explicit. For what happens to a confidential payment to such a contract, see [Payments a contract doesn't expect](pitfalls-other.md#payments-a-contract-doesnt-expect).

    A contract that passes its whole balance to a beneficiary without calculating anything doesn't need to read amounts or assets, so it can work with confidential inputs and outputs. It can't check that the beneficiary's output receives the whole balance, though, so something else has to stop a spender from diverting value to other outputs, such as a requirement that the beneficiary sign the spend.

## Asset IDs in internal byte order

[Jets](../glossary.md#jet) such as `jet::current_asset` and `jet::output_asset` return an asset ID in internal byte order, the reverse of the display order that block explorers, [Esplora](../glossary.md#esplora) and [PSET](../glossary.md#pset) JSON show; see the [policy asset](../glossary.md#policy-asset) glossary entry. An asset ID written into a [SimplicityHL](../glossary.md#simplicityhl) program, or into its parameters, must be in internal byte order, or no asset ever matches it.

For a contract that accepts only tLBTC, the arguments file for an `ASSET_ID` parameter must contain the internal byte order:

```json
{
    "ASSET_ID": "0x499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14"
}
```

The value Esplora shows, `0x144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49`, compiles without error, but a contract using it rejects every spend. If the contract can only release assets through that check, the assets it holds become unspendable.

To convert an asset ID from display order to internal byte order:

```bash
python3 -c 'import sys; print(bytes.fromhex(sys.argv[1])[::-1].hex())' 144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49
```

The policy asset glossary entry lists the LBTC and tLBTC asset IDs in both orders. A comparison between two asset jets, such as `jet::current_asset` and `jet::output_asset`, isn't affected, because both values are in internal byte order.

Hashes of an output's `scriptPubKey` have the opposite byte-order issue: the jets return them unreversed, while the Electrum protocol reverses them. See [byte order](destinations.md#byte-order) on the destinations page.

## Asset supply

A contract that treats an asset as a capability, such as a token that authorizes an action or that's burned to redeem a claim, usually assumes that only one unit of it exists. The contract can't check that assumption. An asset's total supply, and whether more of it can be issued, are properties of the issuance that created it, and the issuance jets only read issuances in the transaction being validated. At spend time, one unit of a one-of-a-kind asset looks the same as one unit of an asset with a supply of 1,000.

For example, consider a two-party contract in which one party issues both parties' tokens, and one of those tokens authorizes seizing the other party's collateral. The issuer can issue two units of that token, send one to the other party, and keep the other to exercise the authorization later. The other party's unit is a valid unit of the asset, but it isn't the only one.

The supply assumption has to be enforced outside the contract that relies on it:

* by an issuance covenant that constrains the issued amount, sends all of it to a single output, and either creates no reissuance token or locks the reissuance token so that it can't be used, or
* by off-chain software that reads the issuance transaction before anyone commits assets to the contract, and that checks the same things: the issued amount, that exactly one output carries all of it, and that any reissuance token the issuance created can't be used.

The contract's documentation should state which parameters the contract assumes identify one-of-a-kind assets.

## Zero-amount burns

Elements doesn't allow a spendable output with an explicit amount of zero, but it does allow an unspendable one, such as an `OP_RETURN` output. Anyone can create an `OP_RETURN` output carrying zero units of any asset without holding any of it, because zero units in and zero units out balance. A transaction that tries to create a *spendable* zero-amount output is rejected with `bad-txns-in-ne-out, value in != value out`, even when its inputs and outputs balance.

A contract that checks a burn by its asset and its destination alone accepts such an output as a burn, so a spender can redeem without holding any of the token. Check the amount too, and require it to equal the number of units the transaction is redeeming. In this example, `units_redeemed` is that number, for example read from the [witness](../glossary.md#witness), and `assert_output_is_op_return` comes from the [standard library](stdlib.md):

```simplicityhl
let (asset, amount): (Asset1, Amount1) = unwrap(jet::output_amount(0));
let burned_asset: u256 = unwrap_right::<(u1, u256)>(asset);
let burned: u64 = unwrap_right::<(u1, u256)>(amount);
assert!(jet::eq_256(burned_asset, param::TOKEN_ASSET));
// Without this check, a burn of 0 units is accepted.
assert!(jet::eq_64(burned, units_redeemed));
// Output 0 must be unspendable.
assert_output_is_op_return(0);
```

Compute any payout from the same `units_redeemed` value, so that the amount burned and the amount paid can't disagree.
