# Witnesses in SimplicityHL development

The [execution model](./execution-model) for Simplicity <glossary:contract>s allows the user who is proposing a <glossary:transaction> to provide input values to the contract. The meaning of these inputs is specific to an individual contract, but in general they help the contract to confirm that the proposed transaction is authorized according to the contract's rules. This is necessary because anyone can propose transactions to spend assets at any time, so a contract needs a clear way to distinguish which transactions are appropriate and which aren't.

The combination of inputs provided as part of a transaction is known as the *witness*. This term is adopted from its existing use in other kinds of Bitcoin transactions, and originally from a related meaning in computer science.

Among other things, a witness will usually contain digital signatures from some party or parties approving the proposed transaction. It might also include things like

* amounts (for example, how much of an asset is requested to be spent or transferred)
* oracle statements (confirming some fact about the outside world)
* values representing *choices* among several actions that can be taken at a certain moment (for example, whether a payment should proceed or be cancelled and refunded).

The witness is directly attached to the transaction and forms a part of it; if the transaction is confirmed, the witness data will be publicly visible on the blockchain as part of the confirmed transaction.

In an end-user application, witness data will typically be built by wallet or app software that understands how to interact with a certain contract on the user's behalf. During the contract development process, developers might build it manually.

The rest of this document provides details about the means of creating witnesses and about the kinds of data that can be included inside them. Please note that this document is discussing "inputs" informally in the typical software development sense of <a href="https://en.wikipedia.org/wiki/Parameter_(computer_programming)">data provided to a function or program</a>, not the blockchain-specific sense of the specific <glossary:UTXO>s consumed by a transaction (which will also be details relevant to many contracts' logic).

## Command-line development with `.wit` files

The `<glossary:simc>` compiler is able to compile (in this context, "serialize") a witness using a contract-specific text file called a `.wit` file. The output is a base64 string which can then be provided to other tools like `hal-simplicity pset finalize` to be incorporated into a complete transaction.

The `.wit` file is formatted as a JSON file.  Each top-level entry in the file has a *name* which has two elements: `value` and `type`. The `value` and `type` are both strings containing Rust-like code for the data value and data type annotation for the entry. For example,

```json
{
    "amount": {
        "value": "100",
        "type": "u32"
    },
    "x": {
        "value": "3",
        "type": "u8"
    }
}
```

This witness provides two separate integer values, available to a SimplicityHL program as `witness::amount` and `witness::x`. The type annotations indicate that `witness::amount` is a 32-bit integer (`u32`) equal to `100`, while `witness::x` is an 8-bit integer (`u8`) equal to `3`.

Note that even numeric values are represented as JSON strings within the `.wit` file (`"value": "100"`, not `"value": 100`).

An important type very frequently used in witnesses is `Signature`, which represents a <a href="https://en.bitcoin.it/wiki/BIP_0340">BIP 0340-style digital signature</a>, the main kind of signature used in Simplicity programs.

```json
{
    "ALICE_SIG": {
        "value": "0x16f0f70b1aa9afaf1ee656a038d896c0b6199e33d5c2328fe5d7cc3f1b67af269ac6352f3486e552e966f62f7bcb75dbfa872920be00adb1c3a35d2f307f189c",
        "type": "Signature"
    },
    "BOB_SIG": {
                  
        "value": "0xcaa328e73c3a1c5bba7e606f5fdd9c993eba361c2cfb9beb3cc62f192b4d348913446d9f79ebbee8d15b83872db3903ad1b8ee2cc3cdc78c8d2f289ab7f1e8f0",
        "type": "Signature"
    }
}
```

This witness provides `witness::ALICE_SIG` and `witness::BOB_SIG`, representing two BIP 0340 signatures from two parties who are approving a proposed transaction. A SimplicityHL program will be able to use the `jet::bip_0340_verify()` <glossary:jet> in order to verify a signature over a specific provided `u256` value (or over a calculated SHA-256 hash output, or over `jet::sig_all_hash()`, which obtains the <glossary:sighash> for the currently proposed transaction itself when parties are signing to authorize the transaction directly).

SHA-256 hash outputs, which are ubiquitous in the Bitcoin ecosystem, can normally be represented with a `u256` value. Other built-in SimplicityHL types and alias types may also be used in witnesses, including `Pubkey` for <glossary:public key>s, `Distance` for timelock distances, and various others, but there's usually less reason to use these compared to integers and signatures.

Some more complex type system features that can be used in creating witness include arrays, `Option<>`, and `Either<>`.

* Arrays, defined as `[T; n]` where `T` is a type and `n` is an integer, provide a way to provide multiple values under the same name. `[u32; 16]` is an example type signature for an array of 16 `u32` values.

* Option types, defined as `Option<t>` where `T` is a type, provide a way to make an item *optional* in the witness file, so that a given transaction can either include that item or not. `Option<u32>` is an example type signature for a `u32` value that can either be provided or not. If it's provided, its value would appear in the witness as `"Some(12345)"`; if it's omitted it would appear as `"None"`.

* Variant (or "sum") types, defined as `Either<L, R>` where `L` and `R` are types, provide a way to make a *choice* in the witness file, so that a given transaction can include the data associated with one action or another action. This is the most common way for a contract to expose multiple alternative actions for parties to choose between. A SimplicityHL program can determine which of the two is present in a particular proposed transaction, using the `match` keyword in SimplicityHL. For contracts that offer more than two alternatives, multiple levels of `Either<>`, and of corresponding `match` statements, can be nested. The `htlc.simf` sample contract shows an example using `Either<>` and `match` to let a transaction `COMPLETE` or `CANCEL` the proposed transaction, while `escrow_with_delay.simf` similar lets the transaction either `TRANSFER` or `TIMEOUT`. In each case, the value appears in the `.wit` file as `"Left(...)"` if the first (left) alternative is chosen and as `"Right(...)"` if the second (right) alternative is chosen.

A future version of `simc` may be able to automatically generate an associated `.wit` file from a `.simf` source file by using the variable names and type annotations present in the source code. Currently, `.wit` files need to be written manually. You can use the details above to create them or follow examples of witness files corresponding to <a href="https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples">sample contracts in `SimplicityHL/examples`</a>.

## Compiling (serializing) `.wit` files with `simc`

As noted above, `simc` can produce a serialized base64 form of a `.wit` file to incorporate into a transaction. It does this automatically when run with two arguments (program source code and witness file):

```bash
$ simc p2ms.simf p2ms.wit
Program:
5lk2l5vmZ++dy7rFWgYpXOhwsHApv82y3OKNlZ8oFbFvgXmARacYEf5RB7X1tMEVAbpXAfNhcd45LjO88p6usCblccJ7lBgtPyYRQDJLGGIJJonwvxOqRTamOQiwbfM2EMA+InecBt8gyCoWRAoQY4oNggUIOOQKE2AACEGGHIMMFgFpHxOQKEGHG4AccgwVJ4CBOKD8JNwsUH1HCrYwEJFB+NQQDaBwIfhWmNBCBQgwzMAMAKwCD8UGCo/FYIBuC4IAwDxcBxkBxuQKDcam5BnGHHG5CHGHCxC1gOAIFBuQh+SRxhxxx+ShxhxwsgtoDiFAoTYAQIQKDcmjjcnBRm2ggDjpIoA5GA1gcBA4jA4zA5cgcvwOYMkUAclgcxY=
Witness:
+6WeUroyP8LKsSWJSZJX0XnFrMVODj5+L4RU4Bt2LWaeB93Pae1y5RHQUy0aWutmZutdEkTC6wIPvZCTFYvXt6U7fVasUVyOV5x8EOUdWjMv3vE6nglrfHOYEWbFuEU+qn+mp/FBWf+/e7qOOitBu0dmDQhILf5I14DoxcrM/XEg

```

The base64 value beginning `+6WeUroy...` is the complete serialized witness, incorporating all of the input values from `p2ms.wit`. By including both the program source code `p2ms.simf` and the witness file `p2ms.wit`, you allow the compiler to double-check that the required values were included. The [Quickstart tutorial](../getting-started/quickstart/) on this site also demonstrates this process, eventually attaching the witness to the transaction via `hal-simplicity` immediately before finalizing and submitting the transaction.

## Other tools for building witness data

In other development contexts, witness data doesn't necessarily need to be written to disk as part of a `.wit` file. The `rust-simplicity` library can be used to build a witness based on a Rust data structure containing the relevant values. If you're developing your Simplicity contract inside a Rust project and interacting with the contract (by creating transactions) from Rust code, you can easily write Rust functions to generate an appropriate witness and bypass the `.wit` file process entirely.

Several instances of this pattern can be found in <a href="https://github.com/BlockstreamResearch/simplicity-contracts/tree/main/crates/contracts/src">the examples in the `simplicity-contracts` repository</a>. Each contract there is accompanied by a `build_witness.rs` file defining what the witness consumed by that contract should look like. The details of each are different according to the structure of the required witness, but each ends with a definition like `pub fn build_x_witness()` to complete the witness-building process.

The <a href="https://github.com/Blockstream/lwk">Liquid Wallet Kit</a> SDK library ("`lwk`") is currently (January 2026) adding Simplicity support. This will also provide equivalent functionality for building Simplicity witnesses in various supported programming languages, again without explicitly creating a `.wit` file. For example, it will be possible to use `lwk` to create a witness from Rust, Python, or JavaScript. This document will be updated with more information once this integration is complete.
