# Oracles in Simplicity

[Smart contracts](../glossary.md#smart-contract) in Simplicity, like other on-chain smart contracts, can only directly access or observe [transaction](../glossary.md#transaction) data.

However, contracts often refer to off-chain facts, such as a market price or whether an event has happened.

* What is the price of Bitcoin in dollars (on a specified exchange)?
* What is the price of wheat in Euros (on a specified market with specified delivery terms)?
* Who won the 2026 Super Bowl?
* Did the insured party suffer a covered loss during the term of an insurance contract? If so, how large was that loss?

These facts can be communicated to a contract with the help of an *oracle*, which is simply a trusted party that can make a digitally signed statement that the contract will accept.

Any entity that all of the parties interested in a contract can trust, and that's willing to make digital signatures in a prearranged form, can be an oracle.

The oracle needs to publish a public key and a well-defined format or structure that its statements will follow. These technical details are then encoded into any contract that will rely on that oracle.

When the oracle makes a statement, it communicates the signed statement publicly, or to a party that relies on it. That party then provides the relevant signed oracle statement and signature *in the [witness](../glossary.md#witness)* to a transaction involving a Simplicity contract.

The Simplicity contract receives the signed statement and signature via the witness and can verify their correctness and make a decision based on the content of the oracle statement.

## Examples of oracle statements

For example, an oracle for a yes-or-no event might say:

> We will hash one of the following `u8` values

> `0` representing NO
>
> `1` representing YES
> 
> with SHA256 and we will then sign the result with BIP0340 with the key corresponding to public key `0x292cbaf344fc104ff2307cce72e84f13dbfeb6f603fe94938208c6150733b910`.

In this case the oracle could issue the signature `56c9b207945aca49302e26e0f68c7f28ce2801be1c8ed2eb0421d257ab6bf818be854a0a5d08a7346a6ec753c71aaf3c2ec346202ea061f32300f2da81493b40` (a BIP0340 signature of `SHA256(0x00)`) in case the underlying event turns out as NO.

Or a price oracle might say 

> We will construct an oracle statement by hashing a `Height` (representing a [Liquid Network](../glossary.md/#liquid) [block height](../glossary.md#height) followed by a `u32` (representing a number of U.S. dollars that were paid on an exchange for 1 BTC in the most recent exchange transaction) with SHA256. We will sign this statement with the BIP0340 key corresponding to `0x292cbaf344fc104ff2307cce72e84f13dbfeb6f603fe94938208c6150733b910`.

The oracle may then publish the values `(height, price, signature)`, representing an instance of such an oracle statement. For example, it might publish

> (`3793375, 70664, 0x63decfbfb76f4b549d840d9c1fc95bf2bbe4d82209cf03d27fd4aef7e92d8d20f6844076588058baf70f34ee7e7a7ac2b44d0db2e1be7a792a474cc1d0544a6f`)

attesting to a price of $70664 observed at the time of Liquid block 3793375.

!!! Note

    It's important for the oracle to clearly define the format of its statement, including the specific data types of the included values, in order to prevent any ambiguity about the oracle statement's meaning. For example, it must not be possible to reinterpret part of the block height as part of the price, or vice versa. This example avoids ambiguity by specifying that the height is a `Height` (32 bits) and that the price is a `u32` (32 bits). This makes it clear what each individual bit in the signed statement means.

Then a Simplicity witness using this statement might include

```json
{
    "oracle_height": {
        "value": "3793375",
        "type": "Height"
    },
    "oracle_price": {
        "value": "70664",
        "type": "u32"
    },
    "oracle_signature": {
        "value": "0x63decfbfb76f4b549d840d9c1fc95bf2bbe4d82209cf03d27fd4aef7e92d8d20f6844076588058baf70f34ee7e7a7ac2b44d0db2e1be7a792a474cc1d0544a6f",
        "type": "Signature"
    }
}
```

A SimplicityHL program that's run with this witness can verify it with

```rust
// Minimum required block height (= 2026-03-09).
// Block height is a 32-bit value.
assert!(jet::lt_32(3790000, witness::oracle_height));

// Hardcoded key of trusted signer
let oracle_pubkey: Pubkey = 0x292cbaf344fc104ff2307cce72e84f13dbfeb6f603fe94938208c6150733b910;

let ctx: Ctx8 = jet::sha_256_ctx_8_init();
let ctx1: Ctx8 = jet::sha_256_ctx_8_add_32(ctx, witness::oracle_height);
let ctx2: Ctx8 = jet::sha_256_ctx_8_add_32(ctx1, witness::oracle_price);
let overall_hash: u256 = jet::sha_256_ctx_8_finalize(ctx2);
jet::bip_0340_verify((oracle_pubkey, overall_hash), witness::oracle_signature);
```

Note that the program recomputes the SHA256 hash of the asserted data values, then checks that the provided oracle signature is a valid signature for that hash. If a party tried to submit a false or modified oracle statement, the oracle's signature wouldn't verify correctly.

The program can then use the validated `witness::oracle_price` value for other logic (for example, calculating a liquidation threshold or a pro-rated refund amount in our [Lending Protocol](../../use-cases/lending-protocol), or determining whether it exceeded a threshold for the conditions of a prediction contract).

A contract can also allow for multiple oracles by accepting any of several different public keys as trusted, providing a different verification path for each key.

## Prediction market example

Resolvr's [Deadcat project](https://github.com/Resolvr-io/deadcat/) includes an example of verifying oracle statements as part of a prediction market implementation. You can see the oracle statement verification logic itself in `verify_oracle_signature()` in [`prediction_market.simf`](https://github.com/Resolvr-io/deadcat/blob/master/src-tauri/crates/deadcat-sdk/contract/prediction_market.simf). A party claiming a redemption from the resolution of a prediction market position needs to provide a matching oracle statement to the contract.

## Oracles for business logic integration

In addition to financial applications like prediction markets and options contracts, oracles have applications for letting smart contracts "query" a company's databases or APIs. In this capacity, an internal oracle can bridge the gap between business systems and the blockchain by making signed statements about the results of API calls.

When a contract needs access to information kept in a database in order to make a decision, oracle mechanisms help work around [the fact that Simplicity contracts can't directly access off-chain data](../../documentation/execution-model).

For example, suppose you're creating an application which is only allowed to send withdrawals to explicitly pre-approved addresses. But the list of such addresses may live in a database, not on the blockchain. An internal oracle can help by (1) performing a database lookup, (2) combining the results with a current timestamp, and (3) digitally signing the results. If a specific address is approved for withdrawals, that oracle statement confirms this fact in a format that can then be provided to the smart contract. If it's not, the oracle statement won't be issued and the transaction won't be completed.

Any kind of business may find this useful for adding back-end business logic to a smart contract application (in exchange for imposing dependencies on transactions). It may be especially relevant to regulated entities building regulated financial products and services, where the creators may want to apply additional off-chain criteria for approval of some on-chain actions.

??? Example

    A user wants to withdraw assets from a smart contract to a user-specified address. The user has previously registered this address with a bank that created the contract and is using it to provide an on-chain service.

    The user's software contacts the bank and requests an oracle statement to confirm that this transaction is allowed. The bank's systems perform a database lookup, find that the address is approved, and sign a timestamped oracle statement saying so. Now the user's software can provide this oracle statement to the smart contract, along with other user authorization information, to let the contract know that it's allowed to process the withdrawal.

    If the address isn't found in the database, the bank's systems decline to issue the oracle statement, and instead let the user know what to do in order to get the address authorized to receive withdrawals.

For bidirectional communications between back-office business systems and a Simplicity smart contract, an indexing system can track on-chain transactions that affect smart contract state, and report the associated state updates to a traditional database.

## The oracle backend

At a technical level, issuing oracle statements for Simplicity contracts requires the following pieces:

* Generating a BIP0340 keypair
* An unambiguous format for structuring oracle statements
* Determining the underlying facts to which the oracle will attest
* Generating oracle statements based on the ascertained facts
* SHA256 hashing
* BIP0340 signing
* Publishing the oracle statements and associated signatures

SHA256 and BIP0340 should generally be used because they're most compatible with the rest of the ecosystem, and because Simplicity has built-in [jets](../glossary.md#jet) to help verify signatures made with them.

!!! Note

    Operating a public oracle that smart contracts rely on is a serious responsibility, and may expose the operator to attacks meant to steal its keys or induce it to issue false statements. Oracle operators' security and business continuity best practices are beyond the scope of this document.

## Timeouts

If an oracle completely ceases to operate, it might be impossible to resolve contracts that rely on that oracle's statements. So, many forms of contract that rely on oracles can benefit from a timeout mechanism as a fail-safe. The smart contract can provide a timeout path so that, after a significant period of time has passed after the contract should have been resolved, unclaimed funds can be claimed as a refund by their original senders, or to some predesignated beneficiary.

With this precaution in place, if a relevant oracle statement is never produced, funds are not locked inside the contract permanently. Without it, a risk exists of getting into a situation where nobody can authorize the release of the funds.
