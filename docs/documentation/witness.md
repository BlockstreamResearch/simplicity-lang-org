# Witnesses in SimplicityHL development

This document describes *witnesses*, which are transaction-time input data for a Simplicity contract provided by the user proposing the transaction. A witness explains what the user wants the contract to do, and convinces the contract that this action is authorized.

When you interact with a Simplicity [contract](../glossary.md#contract) on the blockchain, you'll need to build and attach witness data for each [transaction](../glossary.md#transaction).

## Witness overview

The [execution model](../execution-model) for Simplicity [contract](../glossary.md#contract)s allows the user who is proposing a [transaction](../glossary.md#transaction) to provide input values to the contract. Each contract expects different inputs, but in general they help confirm that the proposed transaction is authorized according to the contract's rules. This is necessary because anyone can propose transactions to spend assets at any time, so a contract needs a clear way to distinguish which transactions are appropriate and which aren't.

One can think of a Simplicity program as a function that deterministically answers "yes" or "no" to each proposed transaction. The input data for this function will be the specific transaction details, together with some user-supplied inputs which are collectively known as a *witness*. The form of the expected witness is determined in advance by the Simplicity program, just as any function definition determines what kind of input that function expects.

The term "witness" here is adopted from its existing use in other kinds of Bitcoin transactions, and originally from a related meaning in computer science.

Among other things, a witness will usually contain digital signatures from some party or parties approving the proposed transaction. It might also include things like

* amounts (for example, how much of an asset is requested to be spent or transferred)
* oracle statements (confirming some fact about the outside world)
* values representing *choices* among several actions that can be taken at a certain moment (for example, whether a payment should proceed or be cancelled and refunded).

The witness is directly attached to the transaction and forms a part of it; if the transaction is confirmed, the witness data will be publicly visible on the blockchain as part of the confirmed transaction.

In an end-user application, witness data will typically be built by wallet or app software that understands how to interact with a certain contract on the user's behalf. During the contract development process, developers might build it manually.

The rest of this document provides details about the means of creating witnesses and about the kinds of data that can be included inside them. Please note that this document is discussing "inputs" informally in the typical software development sense of [data provided to a function or program](https://en.wikipedia.org/wiki/Parameter_(computer_programming)), not the blockchain-specific sense of the specific [UTXO](../glossary.md#utxo)s consumed by a transaction (which will also be details relevant to many contracts' logic).

## Command-line development with `.wit` files

The [simc](../glossary.md#simc) compiler is able to compile (in this context, "serialize") a witness using a contract-specific text file called a `.wit` file. The output is a base64 string which can then be provided to other tools like `hal-simplicity pset finalize` to be incorporated into a complete transaction.

A `.wit` file is a JSON file consisting of key-value string pairs. Each entry name corresponds to a variable name expected by the SimplicityHL program, and the string value contains the Rust-like data representation:

```json
{
    "amount": "100",
    "x": "3",
    "yes_or_no": "false"
}
```

This witness provides two integer values, available to a SimplicityHL program as `witness::amount` and `witness::x`, and a boolean value available as `witness::yes_or_no`. The `simc` compiler infers the required type for each entry automatically from the program source code.

Note that all values, including numbers and booleans, are represented as JSON strings within the `.wit` file (`"100"`, not `100`; `"false"`, not `false`).

!!! note "Explicit type annotations (optional)"
    By default, `simc` infers types directly from your contract logic. If you want to explicitly declare or enforce a type for primitive values, tuples, arrays, alias types, or sum types in your `.wit` file, you can use an explicit type annotation syntax, providing a JSON object with `"type"` and `"value"` fields:

    ```json
    {
        "amount": {
            "value": "100",
            "type": "u32"
        },
        "when": {
            "value": "50",
            "type": "Distance"
        }
    }
    ```

    (Note: Custom `enum` types defined in your program **cannot** use explicit type annotations in a witness file; they must always be provided as bare variant strings.)

An important type very frequently used in witnesses is `Signature`, which represents a [BIP 0340-style digital signature](https://en.bitcoin.it/wiki/BIP_0340), the main kind of signature used in Simplicity programs.

```json
{
    "ALICE_SIG": "0x16f0f70b1aa9afaf1ee656a038d896c0b6199e33d5c2328fe5d7cc3f1b67af269ac6352f3486e552e966f62f7bcb75dbfa872920be00adb1c3a35d2f307f189c",
    "BOB_SIG": "0xcaa328e73c3a1c5bba7e606f5fdd9c993eba361c2cfb9beb3cc62f192b4d348913446d9f79ebbee8d15b83872db3903ad1b8ee2cc3cdc78c8d2f289ab7f1e8f0"
}
```

This witness provides `witness::ALICE_SIG` and `witness::BOB_SIG`, representing two BIP-0340 signatures from two parties approving a transaction. A SimplicityHL program can use `jet::bip_0340_verify()` to verify a signature over a provided `u256` value or over transaction details (a [sighash](../glossary.md#sighash)).

If you need hard-code a specific BIP-0340 public key in your contract or pass it in a witness, you can provide it as type `Pubkey`.

`.wit` files may be written manually during the contract development process or generated by wallet software or an SDK. You can find examples corresponding to sample contracts in [`SimplicityHL/examples`](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples).

## Compiling (serializing) `.wit` files with `simc`

`simc` produces a serialized base64 form of a `.wit` file to incorporate into a transaction. The witness file is specified with the `-w` option:

```bash
$ simc --json p2ms.simf -w p2ms.wit
{"program": "5lk2l5vmZ++dy7rFWgYpXOhwsHApv82y3OKNlZ8oFbFvgXmARacYEf5RB7X1tMEVAbpXAfNhcd45LjO88p6usCblccJ7lBgtPyYRQDJLGGIJJonwvxOqRTamOQiwbfM2EMA+InecBt8gyCoWRAoQY4oNggUIOOQKE2AACEGGHIMMFgFpHxOQKEGHG4AccgwVJ4CBOKD8JNwsUH1HCrYwEJFB+NQQDaBwIfhWmNBCBQgwzMAMAKwCD8UGCo/FYIBuC4IAwDxcBxkBxuQKDcam5BnGHHG5CHGHCxC1gOAIFBuQh+SRxhxxx+ShxhxwsgtoDiFAoTYAQIQKDcmjjcnBRm2ggDjpIoA5GA1gcBA4jA4zA5cgcvwOYMkUAclgcxY=", "witness": "+6WeUroyP8LKsSWJSZJX0XnFrMVODj5+L4RU4Bt2LWaeB93Pae1y5RHQUy0aWutmZutdEkTC6wIPvZCTFYvXt6U7fVasUVyOV5x8EOUdWjMv3vE6nglrfHOYEWbFuEU+qn+mp/FBWf+/e7qOOitBu0dmDQhILf5I14DoxcrM/XEg", ...}
```

By including both the program source code `p2ms.simf` and the witness file `p2ms.wit`, the compiler automatically verifies that all required witness values are present and match their expected types.

## Other tools for building witness data

Witness data doesn't necessarily need to be written to disk as a `.wit` file; it can be assembled in memory by client applications.

* **Rust Integration:** Developers using Rust can build witness structures directly. Tools like [Simplex](https://github.com/BlockstreamResearch/smplx) generate native Rust witness-building code directly from `.simf` files. Explicit witness-building examples are also available in [`simplicity-contracts`](https://github.com/BlockstreamResearch/simplicity-contracts/tree/main/crates/contracts/src).

* **Liquid Wallet Kit (LWK):** The [Liquid Wallet Kit](https://github.com/Blockstream/lwk) SDK ("`lwk`") allows building witnesses in Python, JavaScript, and Rust without creating intermediate `.wit` files.

## Types and Formatting

The compiler infers expected types directly from your SimplicityHL contract logic. The sections below describe how to format `.wit` string values for specific data literals.

### Primitive types

Primitive types include unsigned integers (`u1`, `u2`, `u4`, `u8`, `u16`, `u32`, `u64`, `u128`, `u256`) and booleans (`bool`). Integers can be provided in base 10 or hexadecimal (`0x` prefix).

**Contract expectation (`contract.simf`):**

```rust
let quantity: u16 = witness::QUANTITY;
let is_valid: bool = witness::YES_OR_NO;
```

**Witness file (`witness.wit`):**

```json
{
    "QUANTITY": "5",
    "YES_OR_NO": "true"
}
```

Some alias types like `Signature` and `Pubkey` are also written as scalar strings:

**Contract expectation (`contract.simf`):**

```rust
let sig: Signature = witness::ALICE_SIGNATURE;
```

**Witness file (`witness.wit`):**

```json
{
    "ALICE_SIGNATURE": "0x7eef1115a87adc14ff7d99aea2e9501bc27f6dcc05e4720de1212732158fd94ab82f219b8f54bc07c761b38cbbafee5bd0697481ac96b819768559e31e06fe40"
}
```

### Named enumeration types

Enumeration (`enum`) types declared in your `.simf` contract represent explicit, named choices. In the `.wit` file, an enum choice is passed directly as a string matching the variant name.

Enum values can be *unit variants* (simple names) or *compound variants* that carry path-specific argument data.

**Contract expectation (`contract.simf`):**

```rust
enum Action {
    Update,
    Claim(u64, u64),
}

fn main() {
    // ...
    let user_choice: Action = witness::ACTION;
    // ...
}
```

In this example, `Update` is a simple name, while `Claim` is a compound variant that wraps two additional values.

**Witness file choosing `Update` (`witness.wit`):**

```json
{
    "ACTION": "Action::Update"
}
```

**Witness file choosing `Claim` with parameters (`witness.wit`):**

```json
{
    "ACTION": "Action::Claim(17041427052385644731, 18305655359241496139)"
}
```

!!! warning
    Type annotations for `enum` values are forbidden inside `.wit` files. They *must* be bare value strings, and their types *must* be inferred by the compiler.

### Compound types

Tuples and arrays group multiple values into a single witness item.

* **Tuples `(T1, T2, ...)`:** Formatted as comma-separated values inside parentheses `(...)`.
* **Arrays `[T; n]`:** Formatted as comma-separated values inside square brackets `[...]`.

**Contract expectation (`contract.simf`):**

```rust
let mypair: (bool, u16) = witness::MYPAIR;
let four_sigs: [Signature; 4] = witness::FOUR_SIGS;
```

**Witness file (`witness.wit`):**

```json
{
    "MYPAIR": "(true, 376)",
    "FOUR_SIGS": "[0x8a3584f8..., 0xf74b3ca5..., 0xdf5dc2e2..., 0x29dbeab5...]"
}
```

Values inside tuples and arrays can be accessed in SimplicityHL via tuple destructuring (`let (a, b): (bool, u16) = witness::mypair;`) or array indexing (`witness::FOUR_SIGS[0]`).

### Tagged sum types

Tagged sum types express conditional data structures that are unwrapped inside the contract using `match` statements (which explicitly handle both possibilities) or `unwrap` macros (which assert that a specific expected version is present).

* **Option Types (`Option<T>`):** Represent optional witness data. Formatted as `"Some(...)"` or `"None"`.
* **Either Types (`Either<L, R>`):** Represent structural two-way choices. Formatted as `"Left(...)"` or `"Right(...)"`.

#### Example: `Option<T>`

**Contract expectation (`contract.simf`):**

```rust
let alice_sig: Option<Signature> = witness::MAYBE_ALICE_SIG;
let bob_sig: Option<Signature> = witness::MAYBE_BOB_SIG;
```

(The signatures' actual presence or absence could be handled later on in the contract with `match alice_sig` and `match bob_sig` statements.)

**Witness file (`witness.wit`):**

```json
{
    "MAYBE_ALICE_SIG": "Some(0x27fe61d4e263cb2732da0b9dcd8ed27f400a40d7959901fae7ccdda896373c0fa2ecfda7168f4a200ffa5d52d7b4463453aad9c95a3ba65bccd788a8e72eb07e)",
    "MAYBE_BOB_SIG": "None"
}
```

#### Example: `Either<L, R>`

While custom `enum` types are generally preferred for named contract actions, `Either` remains useful for generic structural branching.

**Contract expectation (`contract.simf`):**

```rust
let auth: Either<Signature, (Pubkey, u32)> = witness::SIGNATURE_OR_PUBKEY_AND_AMOUNT;
```

**Witness file taking the `Right` path (`witness.wit`):**

```json
{
    "SIGNATURE_OR_PUBKEY_AND_AMOUNT": "Right((0xd7a2a84507129b63908bc38d27bb96fa3a55536ad3b025b95205c4a8e92c9bd2, 52119))"
}
```

### More built-in types

Domain-specific [alias types](../../simplicityhl-reference/type_alias) are available for clarity, including, among others, `Pubkey`, `Signature`, and the four [timelock](../glossary.md#timelock) types `Distance`, `Duration`, `Height`, and `Time`. These names are capitalized in SimplicityHL signatures, and their parameter requirements are detailed in [the jet documentation](../jets).
