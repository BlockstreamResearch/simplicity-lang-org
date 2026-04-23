# Development ecosystem and wallet integration

A Simplicity contract enforces financial logic through on-chain transactions, but it is only one piece of a complete financial application. By itself, a contract lacks a user interface or discovery mechanism. To make a Simplicity contract useful, other software, such as a dedicated native app, a web app, or a wallet taught to interact with the contract, needs to be provided.

These supporting applications need to handle integration tasks such as

* **Discovery and validation**: finding active instances of a contract on the blockchain and validating that they have the intended or desired functionality
* **State and actions**: determining the current contract state and the actions a user can take
* **Transaction building**: creating transactions that send or claim assets, or that update a contract's state
* **User interface**: representing the above information in a meaningful way for an end user

Because Simplicity and Elements are open source, developers have the flexibility to create tools that facilitate these actions in a variety of development environments.

## Tooling (contract compilation and transaction generation)

### Command line

We have [command-line tools for developing, testing, and exploration](../toolchain/) (`simc` and `hal-simplicity`).

### SimplicityHL, rust-simplicity, and Simplex

Our recommended development environment for building production applications that directly interact with Simplicity contracts is based on Rust. Three projects are most relevant to Rust developers.

* The [SimplicityHL](https://github.com/BlockstreamResearch/SimplicityHL) project includes a Rust library that lets you compile SimplicityHL to low-level Simplicity from inside a Rust program. The compilation logic is the same as in the `simc` compiler, but doesn't require a command-line invocation.

* The [`rust-simplicity`](https://github.com/BlockstreamResearch/rust-simplicity) library provides low-level functionality related to building witnesses and transactions. It can also derive on-chain addresses from a compiled Simplicity program.

* The [Simplex](https://github.com/BlockstreamResearch/smplx) orchestration tool can automatically generate code artifacts in Rust, compatible with `rust-simplicity`, that provide basic witness and transaction-building logic for a specified SimplicityHL program. It also provides other useful project management functionality such as dependency management and a test framework.

### LWK

The [Liquid Wallet Kit (LWK)](https://github.com/Blockstream/lwk/) provides higher-level functionality in Rust, with bindings also available for several other languages. Simplicity features are still being added in LWK as of April 2026, but are available as an alpha release behind the LWK compile-time feature `simplicity` (build with `cargo build --features simplicity`, `just build-bindings-lib-simplicity`, or `just python-build-bindings-simplicity`).

You can use LWK to build a complete wallet or blockchain app that interacts with Liquid Network, including interfacing with Simplicity contracts. LWK can also deal with storing digital assets' private keys directly in-app, and can generate addresses from a supplied seed. LWK's Simplicity support includes higher-level abstractions for transaction building for both commit and redeem transactions.

LWK can generate native apps or provide JavaScript bindings, with a WASM compile target, for building web apps.

A sample web app built in JavaScript using LWK's WASM target to generate Simplicity transactions is the [lending contract demo](https://demolending.distributedlab.com/). Its source code is available at [`BlockstreamResearch/simplicity-lending`](https://github.com/BlockstreamResearch/simplicity-lending).

## Tooling (blockchain indexing and discovery)

The main API for discovering and analyzing transactions on an Elements blockchain, including to determine smart contract state, is [Esplora](https://github.com/Blockstream/esplora). You can use Blockstream's public Esplora instance or run your own Esplora service.

If you'd like to run your own Liquid Network node, you can do so with a local instance of [Elements](https://github.com/ElementsProject/elements). The local storage footprint of a Liquid node, as of April 2026, is about 50 gigabytes.

## About transaction-building for interacting with Simplicity contracts

Sending an [asset](../glossary.md#asset) to a Simplicity [smart contract](../glossary.md#smartcontract) requires calculating the appropriate on-chain address for the contract, possibly including a [state commitment](./state.md) representing the contract's new state. This is called a *commit* transaction.

Determining the appropriate address for a commit transaction may involve moderately complex logic, including [Taproot](../glossary.md#taproot) details (creating a P2TR address where the Simplicity program and state are committed in the Taptree). If the contract does not require updated state commitments, the address of a particular instance of a particular contract will not change from transaction to transaction, and so can be hard-coded or provided by an external tool. The overall form of the commit transaction simply looks like any other P2TR transaction; Simplicity-specific transaction-building logic may not be required.

Claiming an asset from a UTXO controlled by a Simplicity contract is called a *redeem* transaction. It requires building a complete transaction with witness data, control block, and possibly appropriate signatures. Simplicity-specific transaction-building logic is usually required for such a transaction.

A [covenant](../glossary.md#covenant) transaction, in which assets controlled by a contract are sent back to a version of that same contract, generally includes *both* redeem and commit halves in the same transaction.

If an application needs signatures from an existing wallet, a [PSET](../glossary.md#pset) representing a redeem transaction can be built by Simplicity-aware software, and external software can produce an appropriate signature over the proposed PSET transaction. These signatures can be inserted into the [witness](../glossary.md#witness) witness data.

## Wallet connect mechanisms

An official wallet connect standard (e.g., via WebSockets) is currently in development to connect external wallets with Simplicity clients. We expect to release this standard in June 2026.
