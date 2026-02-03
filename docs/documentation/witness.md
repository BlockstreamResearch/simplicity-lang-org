# Witnesses in SimplicityHL development

The [execution model](/documentation/execution-model) for Simplicity <glossary:contract>s allows the user who is proposing a <glossary:transaction> to provide input values to the contract. The meaning of these inputs is specific to an individual contract, but in general they help the contract to confirm that the proposed transaction is authorized according to the contract's rules. This is necessary because anyone can propose transactions to spend assets at any time, so a contract needs a clear way to distinguish which transactions are appropriate and which aren't.

The combination of inputs provided as part of a transaction is known as the *witness*. This term is adopted from its existing use in other kinds of Bitcoin transactions, and originally from a related meaning in computer science.

Among other things, a witness will usually contain digital signatures from some party or parties approving the proposed transaction. It might also include things like

* amounts (for example, how much of an asset is requested to be spent or transferred)
* oracle statements (confirming some fact about the outside world)
* values representing *choices* among several actions that can be taken at a certain moment (for example, whether a payment should proceed or be cancelled and refunded).

The witness is directly attached to the transaction and forms a part of it; if the transaction is confirmed, the witness data will be publicly visible on the blockchain as part of the confirmed transaction.

In an end-user application, witness data will typically be built by wallet or app software that understands how to interact with a certain contract on the user's behalf. During the contract development process, developers might build it manually.

The rest of this document provides details about the means of creating witnesses and about the kinds of data that can be included inside them. Please note that this document is discussing "inputs" informally in the typical software development sense of <a href="https://en.wikipedia.org/wiki/Parameter_(computer_programming)">data provided to a function or program</a>, not the blockchain-specific sense of the specific <glossary:UTXO>s consumed by a transaction (which will also be details relevant to many contracts' logic).

## Command-line development with `.wit` files

The <glossary:simc> compiler is able to compile (in this context, "serialize") a witness using a contract-specific text file called a `.wit` file. The output is a base64 string which can then be provided to other tools like `hal-simplicity pset finalize` to be incorporated into a complete transaction.

The `.wit` file is formatted as a JSON file. Each top-level entry in the file has a *name* which has two elements: `value` and `type`. The entry name is used in the SimplicityHL program as a variable name to refer to this specific entry. The `value` and `type` are both strings containing Rust-like code for the data value and data type annotation for the entry. For example,

```json
{
    "amount": {
        "value": "100",
        "type": "u32"
    },
    "x": {
        "value": "3",
        "type": "u8"
    },
    "yep_or_nope": {
        "value": "false",
        "type": "bool"
    }
}
```

This witness provides two separate integer values, available to a SimplicityHL program as `witness::amount` and `witness::x`, and a boolean value available as `witness::yep_or_nope`. The witness file indicates that `witness::amount` is a 32-bit integer (`u32`) equal to `100`, while `witness::x` is an 8-bit integer (`u8`) equal to `3`, and `witness:yep_or_nope` is a boolean (`bool`) equal to `false`.

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

SHA-256 hash outputs, which are ubiquitous in the Bitcoin ecosystem, can normally be represented with a `u256` value. For more information on data types that can be used in `.wit` files, see the section on types below.

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

The base64 value beginning `+6WeUroy...` is the complete serialized witness, incorporating all of the input values from `p2ms.wit`. By including both the program source code <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2ms.simf">`p2ms.simf`</a> and the witness file <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2ms.wit">`p2ms.wit`</a>, you allow the compiler to double-check that the required values were included. The [Quickstart tutorial](/getting-started/quickstart/) on this site also demonstrates this process, eventually attaching the witness to the transaction via `hal-simplicity` immediately before finalizing and submitting the transaction.

## Other tools for building witness data

In other development contexts, witness data doesn't necessarily need to be written to disk as part of a `.wit` file. The `rust-simplicity` library can be used to build a witness based on a Rust data structure containing the relevant values. If you're developing your Simplicity contract inside a Rust project and interacting with the contract (by creating transactions) from Rust code, you can easily write Rust functions to generate an appropriate witness and bypass the `.wit` file process entirely.

Several instances of this pattern can be found in <a href="https://github.com/BlockstreamResearch/simplicity-contracts/tree/main/crates/contracts/src">the examples in the `simplicity-contracts` repository</a>. Each contract there is accompanied by a `build_witness.rs` file defining what the witness consumed by that contract should look like. The details of each are different according to the structure of the required witness, but each ends with a definition like `pub fn build_x_witness()` to complete the witness-building process.

Currently, these other tools often use syntax closely related to that in a `.wit` file, so the syntax and data types described in the current document may be relevant even if you are building a witness in a different environment or with different tools.

The <a href="https://github.com/Blockstream/lwk">Liquid Wallet Kit</a> SDK library ("`lwk`") is currently (January 2026) adding Simplicity support. This will also provide equivalent functionality for building Simplicity witnesses in various supported programming languages, again without explicitly creating a `.wit` file. For example, it will be possible to use `lwk` to create a witness from Rust, Python, or JavaScript. This document will be updated with more information once this integration is complete.

## Types

Above, we alluded to how the basic types used in `.wit` files are mainly unsigned integers, always indicating the bit width of the integer (`u1`, `u2`, `u4`, `u8`, `u16`, `u32`, `u64`, `u128`, `u256`). Integer constants are provided in base 10 (like `"1729"`) or hexadecimal with a leading `0x` (like `"0xcafe1234"`).

??? "Expand for `u16` example"
    ```json
    {
        "QUANTITY": {
            "value": "5",
            "type": "u16"
        }
    }
    ```

The `bool` type is also available for boolean values (constants `"true"` and `"false"`).

??? "Expand for `bool` example"
    ```json
    {
        "YES_OR_NO": {
            "value": "true",
            "type": "bool"
        }
    }
    ```

Some aliases are built-in to refer to values that are expected to be passed to specific jets. The most-used example of this is `Signature`, noted above, which is a more specific way of referring to a `u256` value when that value represents a <a href="https://en.bitcoin.it/wiki/BIP_0340">BIP 0340-style digital signature</a>.

??? "Expand for `Signature` example"
    ```json
    {
        "ALICE_SIGNATURE": {
            "value": "0x7eef1115a87adc14ff7d99aea2e9501bc27f6dcc05e4720de1212732158fd94ab82f219b8f54bc07c761b38cbbafee5bd0697481ac96b819768559e31e06fe40",
            "type": "Signature"
        }
    }
    ```

Several other jet-specific types are available, and are briefly discussed in the next section; you normally don't need to use these at all unless you're calling their specific associated jets.

Some more complex type system features that can be used in creating witnesses include tuples, arrays, `Option<>`, and `Either<>`.

* Tuples, defined as `(T1, T2, T3, ...)` where `T1`, `T2`, `T3`, etc., are types, provide a way to combine pairs or triples or larger sequences of possibly-unlike values into a single value, which can then be unwrapped inside a program. 

??? "Expand for example of tuple of `bool` and `u16`"
    ```json
    {
        "mypair": {
            "value": "(true, 376)",
            "type": "(bool, u16)"
        }
    }
    ```

    This pair could be accessed in a SimplicityHL program like

    ```rust
    let (yes_or_no, x): (bool, u16) = witness::mypair;
    ```

* Arrays, defined as `[T; n]` where `T` is a type and `n` is an integer, provide a way to provide multiple values of the same type under the same name. These values can then be accessed by numeric index. `[u32; 16]` is an example type signature for an array of 16 `u32` values.

??? "Expand for example of array of `Signature`s"
    ```json
    {
        "FOUR_SIGS": {
            "value": "[0x8a3584f8f0e20430055a5556c2024d473a89dc45c46f1b5ae1833dbbc2f91796079bde85b565d0852e781566b25279f7d032fec81ed47d2c0226595aba1eb3f4, 0xf74b3ca574647f8595624b129324afa2f38b598a9c1c7cfc5f08a9c036ec5acd3c0fbb9ed3dae5ca23a0a65a34b5d6cccdd6ba248985d6041f7b21262b17af6f, 0xdf5dc2e239d42bca8b38502c242a790c777293d4cab7446aac1eae818f030913ef7440b79b5f104853b0b32aa71dd806c5b48f18e6fc4c336baf3c222932e6f3, 0x29dbeab5628ae472bce3e08728ead1997ef789d4f04b5be39cc08b362dc229f553fd353f8a0acffdfbddd471d15a0dda3b306842416ff246bc07462e5667eb89]",
            "type": "[Signature; 4]"
        }
    }
    ```

    The first of these signatures could be accessed in a SimplicityHL program as `witness::FOUR_SIGS[0]`, the second as `witness::FOUR_SIGS[1]`, and so on.

* Option types, defined as `Option<T>` where `T` is a type, provide a way to make an item *optional* in the witness file, so that a given transaction can either include that item or not. `Option<u32>` is an example type signature for a `u32` value that can either be provided or not. If it's provided, its value would appear in the witness as `"Some(12345)"`; if it's omitted it would appear as `"None"`. The SimplicityHL program can use the `match` statement to determine whether or not the optional value was provided in the witness. The <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/escrow_with_delay.simf">`escrow_with_delay.simf`</a> sample contract shows an example using `Option<>` and `match` to provide two out of the three values within an array.

??? "Expand for example of two optional `Signatures`, one provided and one absent"
    ```json
    {
        "MAYBE_ALICE_SIG": {
            "value": "Some(0x27fe61d4e263cb2732da0b9dcd8ed27f400a40d7959901fae7ccdda896373c0fa2ecfda7168f4a200ffa5d52d7b4463453aad9c95a3ba65bccd788a8e72eb07e)",
            "type": "Option<Signature>"
        },
        "MAYBE_BOB_SIG": {
            "value": "None",
            "type": "Option<Signature>"
        }
    }
    ```

    A SimplicityHL program would access each of these values with a `match` statement having two branches (one for the `Some()` case and one for the `None` case).

* Variant (or "sum") types, defined as `Either<L, R>` where `L` and `R` are types, provide a way to make a *choice* in the witness file, so that a given transaction can include the data associated with one action or another action. **This is the most common way for a contract to expose multiple alternative actions for parties to choose between.** A SimplicityHL program can determine which of the two is present in a particular proposed transaction, using the `match` keyword in SimplicityHL; thus, the party constructing the witness can choose what "form" of the witness to provide in order to trigger the desired action. For contracts that offer more than two alternatives, multiple levels of `Either<>`, and of corresponding `match` statements, can be nested. The <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/htlc.simf">`htlc.simf`</a> sample contract shows an example using `Either<>` and `match` to let a transaction `COMPLETE` or `CANCEL` the proposed transaction, while <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/escrow_with_delay.simf">`escrow_with_delay.simf`</a> similarly lets the transaction either `TRANSFER` or `TIMEOUT`. In each case, the value appears in the `.wit` file as `"Left(...)"` if the first (left) alternative is chosen and as `"Right(...)"` if the second (right) alternative is chosen.

??? "Expand for examples"
    This example is used in <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/presigned_vault.simf">`presigned_vault.simf`</a> to allow exactly one of two different signatures to be provided (while indicating *which* signature was provided, and where different code paths are triggered depending on which one was given).

    ```json
    {
        "HOT_OR_COLD": {
            "value": "Left(0xedb6865094260f8558728233aae017dd0969a2afe5f08c282e1ab659bf2462684c99a64a2a57246358a0d632671778d016e6df7381293dd5bb9f0999d38640d4)",
            "type": "Either<Signature, Signature>"
        }
    }
    ```

    Note again that the SimplicityHL program consuming this learns which of the two signatures was provided, using a `match`. The two types could also be very different, reflecting different information requirements for two different code paths:

    ```json
    {
        "SIGNATURE_OR_PUBKEY_AND_AMOUNT": {
            "value": "Left(0xaac12e03b2d00fcbfd5c586f1b863adc7ea37654417d4edfd8d2737a20e691e1727907883a7739726e36568fba600218be50a2369bca3d246f726febd07e52c8)",
            "type": "Either<Signature, (Pubkey, u32)>"
        }
    }
    ```

    or

    ```json
    {
        "SIGNATURE_OR_PUBKEY_AND_AMOUNT": {
            "value": "Right((0xd7a2a84507129b63908bc38d27bb96fa3a55536ad3b025b95205c4a8e92c9bd2, 52119))",
            "type": "Either<Signature, (Pubkey, u32)>"
        }
    }
    ```

    Notice that the first of these witnesses provides only a `Signature`, while the second provides only a `(Pubkey, u32)` tuple.

### More built-in types

Other built-in SimplicityHL types and alias types may also be used in witnesses, including `Pubkey` for <glossary:public key>s, `Distance` for timelock distances, and various others, but there's usually less frequent reason to use these compared to integers and signatures. The complete list of available built-in type aliases and their type definitions is <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/master/src/types.rs#L815">available in the SimplicityHL source code</a>, but you should generally only use these when passing them as parameters to a specific jet that expects them. These types' names are always capitalized in SimplicityHL code, like `Signature`, `Pubkey`, `Distance`, `Duration`.

The type signatures of the <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/c412dfc684a47c9f430195c20d5a906294b27575/src/jet.rs#L32">inputs</a> and <a href="https://github.com/BlockstreamResearch/SimplicityHL/blob/c412dfc684a47c9f430195c20d5a906294b27575/src/jet.rs#L533">outputs</a> to each jet are specified in the jet implementation and will be provided as an integral part of the jet documentation.

<!-- The complete list of builtin type aliases as of 2026-01-28 is

* Ctx8
* Pubkey
* Message
* Message64
* Signature
* Scalar
* Fe
* Ge
* Gej
* Point
* Height
* Time
* Distance
* Duration
* Lock
* Outpoint
* Confidential1
* ExplicitAsset
* Asset1
* ExplicitAmount
* Amount1
* ExplicitNonce
* Nonce
* TokenAmount1

but some of these are impossible to explain without the context of the individual jet that consumes them, which is often very technical and not relevant to most contract development.
-->
