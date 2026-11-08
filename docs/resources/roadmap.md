# Simplicity Roadmap

For announcements on progress on this and other Simplicity and SimplicityHL work, you can join the [Simplicity Community Telegram group](https://t.me/simplicity_community).

## Upcoming SimplicityHL features

SimplicityHL continues to gain additional notation and convenience features. The `simc` compiler will be updated to support additional syntax for these features. SimplicityHL language enhancement priorities include

* Infix operators: familiar notations like `==`, `<`, `>`, `+`, `-`, `*`, `/`, `&`, `|` for comparisons, arithmetic, and logic operations
* More integer types: specific-width integers; signed integers (supporting negative numbers)
* `if` and `return` statements
* A more conventional loop syntax (for bounded loops)
* Modules/namespaces

## State management

Simplicity programs can track persistent state via cryptographic commitments. This provides proper support for general [covenants](../glossary.md#covenant) that need to keep track of arbitrary history as users interact with them over time. (You can see a brief demonstration of this approach in the [December 23, 2025 Office Hours session](https://youtu.be/ry2wQelP8Kc).)

[Covenants and state management](../documentation/state.md) describes this approach, with sample code. Library code is under development to support maintaining arbitrary quantities of state information (with selective revelation and efficient updates) via a [Merkle tree](../glossary.md#merkle-tree).

## Standard library

The [SimplicityHL standard library](../documentation/stdlib.md) is available. Planned additions include `load` and `store` functions for [state management](#state-management), so that programs can use the state commitment pattern without boilerplate.

## Developer tool improvements

Improvements are planned to various developer tools, including the existing [language server](https://github.com/distributed-lab/simplicityhl-lsp) for VSCode integration, and the `hal-simplicity` command-line tool.

## Type-based SimplicityHL

A future version of SimplicityHL using type theory foundations is in preparation. In the short term, `simc` will receive a new type inference engine based on this work, which will relax existing requirements for mandatory type annotations. Over time, extensions for dependent type mechanisms will be exposed in SimplicityHL.

## Simplicity Signet

The [Simplicity Signet](https://signet.simplicity-lang.org/) is a public [signet](../glossary.md#signet) (test network) that runs Bitcoin Inquisition with Simplicity enabled. It supports development with Simplicity on a Bitcoin chain without Elements extensions. Support for targeting the Signet is in progress in SimplicityHL and the other developer tools.

## AMP and LWK integrations

Integrations of Simplicity with [AMP](https://blockstream.com/amp/) and [LWK](https://github.com/Blockstream/lwk) are underway, in order to offer financial application developers more power when building on Liquid Network.

## Documentation updates

In addition to documentation on features mentioned above, significant new and updated documentation is in preparation, including material on design patterns and avoiding pitfalls in smart contract design.

## Simplicity Unchained

For blockchains where a native Simplicity [integration](../glossary.md#integration) isn't present, like the Bitcoin Mainnet, an [oracle](../glossary.md#oracle)-based Simplicity interpreter called Simplicity Unchained will offer Simplicity scripting support. The oracle can make statements confirming when contract conditions (expressed in Simplicity programs) have been met and thereby approve transactions permitted by those conditions. This indirectly brings the power and determinism of Simplicity scripting to other chains.

## Oracle tools

Tools and examples are being created for integrating other data sources into Simplicity contract logic via signed oracle statements. This can support a range of use cases, from price oracles to confirm off-chain asset price data, to importing data from financial companies' existing back-office databases, making them a source of truth for portions of contracts' logic.

## Sample applications

Prototypes of several real financial applications on Simplicity are being specified and implemented. Work in progress on some of these is available in [the `simplicity-contracts` repository on GitHub](https://github.com/BlockstreamResearch/simplicity-contracts).

## Ecosystem

Tools and standards for building financial applications to interact with Simplicity contracts, as well as for connecting existing wallet apps to contract flows, are in development. See "[Road to Ecosystem](../documentation/road-to-ecosystem.md)" for an overview of the requirements for safely connecting wallets.
