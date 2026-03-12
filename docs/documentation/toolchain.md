# SimplicityHL toolchain

The SimplicityHL toolchain consists of the command-line tools `simc` (the SimplicityHL compiler) and `hal-simplicity` (a multipurpose command-line utility for inspecting and creating objects relevant to Simplicity programs and on-chain transactions).

!!! Note

    The toolchain is useful for learning about Simplicity and SimplicityHL and for testing and debugging purposes. However, **most application developers will use a workflow that does not emphasize the use
    of these tools**.

    A typical smart contract development workflow is focused on a
    high-level language (usually Rust) in which application software is
    developed alongside the SimplicityHL contract in a single project. See
    [simplicity-contracts](https://github.com/BlockstreamResearch/simplicity-contracts)
    for examples of such projects. In this workflow, SimplicityHL programs
    are compiled, addresses are derived, and witnesses and transactions
    are built from within Rust applications using other libraries and
    tooling, not `simc` and `hal-simplicity`. (The other libraries and
    tooling share some of their code with these command-line tools.)

    The [Liquid Wallet Kit
    (LWK)](https://docs.liquid.net/docs/lwk-overview-and-examples)
    also provides tools for building witnesses and transactions from
    high-level languages other than Rust, facilitating an analogous
    workflow for those languages.

## Typical workflow

**As noted above, most SimplicityHL developers will use a different workflow using other tools.**

The most basic workflow for on-chain transactions with the command-line toolchain is:

*Commit-time* (that is, when sending assets *to* the contract):

1. compile the program with `simc` and note the compiled program data
2. derive the on-chain destination address of the compiled program with `hal-simplicity simplicity info` (optionally including `-s` to commit to 256 bits of specified state data)
3. send assets to the calculated on-chain address

*Redeem-time* (that is, when spending assets *from* the contract):

1. update the `.wit` file with the witness data for the redemption transaction
2. compile the program with `simc` and note the compiled program data and serialized witness data
3. create a skeleton [PSET](../glossary.md#pset) with `hal-simplicity simplicity pset create`, indicating the [UTXO](../glossary.md#utxo) to be spent
4. attach more details about the UTXO to be spent to the PSET with `hal-simplicity simplicity pset update-input`
5. attach the compiled program and serialized witness data to the PSET with `hal-simplicity simplicity pset finalize`
6. convert the PSET to a serialized transaction with `hal-simplicity simplicity pset extract`
7. submit the resulting transaction on the blockchain

You can see a complete worked example of the actions above, both commit-time and redeem-time, in the old [bash quickstart](../../getting-started/bash-quickstart), which is no longer suggested for most beginning users.

## simc

Install with: `cargo install simplicityhl`

```
Compile the given SimplicityHL program and print the resulting Simplicity base64 string.

Usage: simc [OPTIONS] <PROGRAM_FILE> [WITNESS_FILE]

Arguments:
  <PROGRAM_FILE>  SimplicityHL program file to build
  [WITNESS_FILE]  File containing the witness data

Options:
      --debug  Include debug symbols in the output
      --json   Output in JSON
```

The compiled program, and optionally the serialized witness file, are printed in base64 format on the standard output together with section headers. The base64 form of the program is a representation of its low-level Simplicity code, and could be considered the "binary".

If the option `--json` is provided, produce JSON output instead. The JSON object fields `program` and `witness` contain the base64-encoded compiled program and base64-encoded serialized witness, respectively.

The compiled program is needed in order to derive addresses and parameters at commit-time (that is, when sending assets *to* the contract). The witness is additionally needed in order to derive addresses and parameters at redeem-time (that is, when spending assets *from* the contract). A [covenant](../glossary.md#covenant) is used in both ways at once, as it may be both the origin and the destination of assets inside the same transaction.

## hal-simplicity

Install with: `cargo install hal-simplicity`

`hal-simplicity` is based on [`hal-elements`](https://github.com/ElementsProject/hal-elements) and also includes the subcommands from `hal-elements`. A future release may merge both tools into one.

The `hal-simplicity` subcommands that differ from `hal-elements` are `hal-simplicity simplicity info`, `hal-simplicity simplicity pset`, and `hal-simplicity-simplicity sighash`.

These are used, respectively, for constructing *on-chain addresses*, *transactions*, and *signatures* for use with Simplicity programs.

Some additional information and sample invocations appears in the [`hal-simplicity` README file](https://github.com/BlockstreamResearch/hal-simplicity/blob/master/README.md).

### hal-simplicity simplicity info

```
Parse a base64-encoded Simplicity program and decode it

USAGE:
    hal-simplicity simplicity info [FLAGS] [OPTIONS] <program> [witness]

FLAGS:
    -r, --elementsregtest    run in elementsregtest mode
    -h, --help               Prints help information
        --liquid             run in liquid mode
    -v, --verbose            print verbose logging output to stderr
    -y, --yaml               print output in YAML instead of JSON

OPTIONS:
    -s, --state <state>    32-byte state commitment to put alongside the program when generating addresess (hex)

ARGS:
    <program>    a Simplicity program in base64
    [witness]    a hex encoding of all the witness data for the program
```

The optional state commitment via `-s` is noteworthy here, as it is needed to derive an address reflecting a commitment to contract [state](../state) information. Without `-s`, no state commitment is included.

The output is a JSON object which contains some of the following fields (most of them only in case a witness was provided):

* `jets`: currently always `core`.

* `commit_base64`: the base64 low-level Simplicity program (as provided as input).

* `commit_decode`: a representation of the low-level Simplicity code as a sequence of [combinator](../glossary.md#combinator) and [jet](../glossary.md#jet) invocations. This is one practical way to visualize what low-level Simplicity code looks like.

* `type_arrow`: currently always `1 → 1`.

* `cmr`: the [CMR](../glossary.md#cmr) of the program.

* `liquid_address_unconf`: the [Liquid](../glossary.md#liquid) on-chain address of the program, in unconfidential format

* `liquid_testnet_address_unconf`: the [Liquid](../glossary.md#liquid) Testnet on-chain address of the program, in unconfidential format

* `is_redeem`: whether a witness was provided (for redeem-time) or not (for commit-time)

* `redeem_base64`: a redemption-time version of the program with pruning performed (removing unused program branches) and witness data attached

* `witness_hex`: the serialized witness data in hex (rather than base64) format

* `amr`: annotated Merkle root (internal cryptographic parameter)

* `ihr`: identity hash of the root (internal cryptographic parameter)

### hal-simplicity simplicity pset

This tool is used in the redemption phase to create a transaction capable of claiming existing on-chain assets from [UTXOs](../glossary.md#utxo) that are controlled by a specified Simplicity program. The transaction is created in [PSET](../glossary.md#pset) format by sequentially attaching multiple forms of required information to a skeleton transaction.

```
manipulate PSETs for spending from Simplicity programs

USAGE:
    hal-simplicity simplicity pset [FLAGS] <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -v, --verbose    print verbose logging output to stderr

SUBCOMMANDS:
    create          create an empty PSET
    extract         extract a raw transaction from a completed PSET
    finalize        Attach a Simplicity program and witness to a PSET input
    run             Run a Simplicity program in the context of a PSET input.
    update-input    Attach UTXO data to a PSET input
```

#### hal-simplicity simplicity pset create

This command creates a new empty PSET. It needs to know where the asset to be spent is coming from, and where it should be sent to.

The first argument is a JSON string consisting of a list of *outpoints*, each a JSON object containing a `txid` and a `vout`, like this:

```json
[
  {
    "txid": "<id>",
    "vout": <index>
  },
  {
    "txid": "<id2>",
    "vout": <index2>
  },
  {
    "txid": "<id3>",
    "vout": <index3>
  }
]
```

where each `<txid>` is a txid in hex form and each `<index>` is an integer index.

The second argument is a JSON string consisting of a list of JSON objects mapping *destination addresses to assets and amounts*, where each destination address is an on-chain address and each amount is a floating-point value. The assets are specified as 64-character hexadecimal values (Liquid asset IDs). One of the JSON objects can also optionally contain a mapping from the string `fee` to an amount, indicating payment of a fee.

```json
[
  {
    "address": "<addr>",
    "asset": "<assetid>",
    "amount": <amt>
  },
  {
    "fee": <feeamt>
  }
]
```

where `<addr>` is a destination address, `<assetid>` is a hexadecimal Liquid asset ID, `<amt>` is a floating-point amount, and `<feeamt>` is a floating-point amount.

If the asset is not specified, it is assumed by default to be the asset corresponding to Liquid Bitcoin (LBTC). Network fees are currently always automatically paid in LBTC.

The output of the command is a JSON object whose attribute `pset` contains the new PSET in base64 format.

#### hal-simplicity simplicity pset update-input

This command modifies an existing PSET by attaching required redeem-time details to an input that is a [UTXO](../glossary.md#utxo) controlled by a Simplicity program.

`hal-simplicity simplicity pset update-input <pset> <inputindex> -i <hex>:<asset>:<value> -c <cmr> -p <internalkey>`

where `<pset>` is the existing base64-encoded PSET to modify, `<inputindex>` is the index of the input to modify, `<hex>` is the scriptPubKey of the input, `asset` is the Liquid asset ID of the input, `value` is the numerical amount of the input, `<cmr>` is the [CMR](../glossary.md#cmr) of the program to spend from, and `-p` is the program's internal key (commonly the fixed value `50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0` by default).

The output of the command is a JSON object whose attribute `pset` contains the updated PSET in base64 format.

#### hal-simplicity simplicity pset finalize

This command attaches a Simplicity program and witness data to a PSET for redemption purposes.

`hal-simplicity simplicity pset finalize <pset> <inputindex> <program> <witness>`

where `<pset>` is the existing base64-encoded PSET to modify, `<inputindex>` is the index of the input to modify, `<program>` is the base64-encoded low-level Simplicity program, and `<witness>` is the serialized witness data.

The output of the command is a JSON object whose attribute `pset` contains the updated PSET in base64 format.

#### hal-simplicity simplicity pset run

`hal-simplicity simplicity pset run <pset> <inputindex> <program> <witness>`

This command simulates running a Simplicity program in the context of a transaction built up as a PSET. You can see whether the transaction succeeds and some the details of individual jet invocations, their inputs, and their outputs. This helps with debugging to confirm whether a program will complete successfully and approve a transaction, as well as understanding why it accepted or rejected a specific proposed transaction. The command has the same arguments as `hal-simplicity simplicity pset finalize` but *runs* the program in the context of the resulting transaction, instead of outputting a PSET representing that transaction. The output is a list of events in the execution of the program.

#### hal-simplicity simplicity pset extract

`hal-simplicity simplicity pset extract <pset>`

where `<pset>` is the existing base64-encoded PSET to transform into a broadcastable transaction.

This command serializes a PSET in a hexadecimal form suitable for submission to the blockchain. The output is the complete hex data for the new transaction.

### hal-simplicity simplicity sighash

Generate (or validate) signatures over Simplicity transactions using a private key.

```
    hal-simplicity simplicity sighash [FLAGS] [OPTIONS] <tx> <input-index> <cmr> [--] [control-block]

FLAGS:
    -r, --elementsregtest    run in elementsregtest mode
    -g, --genesis-hash       genesis hash of the blockchain the transaction belongs to (hex)
    -h, --help               Prints help information
        --liquid             run in liquid mode
    -v, --verbose            print verbose logging output to stderr
    -y, --yaml               print output in YAML instead of JSON

OPTIONS:
    -i, --input-utxo <input-utxo>...    an input UTXO, without witnesses, in the form <scriptPubKey>:<asset ID or
                                        commitment>:<amount or value commitment> (should be used multiple times, one for
                                        each transaction input) (hex:hex:BTC decimal or hex)
    -p, --public-key <public-key>       public key which is checked against secret-key (if provided) and the signature
                                        (if provided) (hex)
    -x, --secret-key <secret-key>       secret key to sign the transaction with (hex)
    -s, --signature <signature>         signature to validate (if provided, public-key must also be provided) (hex)

ARGS:
    <tx>               transaction to sign (hex)
    <input-index>      the index of the input to sign (decimal)
    <cmr>              CMR of the input program (hex)
    <control-block>    Taproot control block of the input program (hex)
```

In signing applications, the basic syntax is

`hal-simplicity simplicity sighash <pset> <index> <cmr> -x <privkey>`

where `<pset>` is the base64-encoded PSET containing the transaction to be signed, `<index>` is the numeric input index, `<cmr>` is the CMR of the Simplicity program that controls the UTXO, and `privkey` is the hex-encoded private key with which the signature should be made.

The output is a JSON object containing signature details, in which the `signature` attribute contains a signature suitable for inclusion in a Simplicity program's witness data. Note that the version of the signature used in a `.wit` must begin with `0x` before the hexadecimal signature.

`hal-simplicity simplicity sighash` can also *verify* signatures that have already been created, if the expected public key is specified with `-p` and the existing signature with `-s`.
