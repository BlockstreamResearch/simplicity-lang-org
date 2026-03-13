# Simplicity Roadmap

For announcements on progress on this and other Simplicity and SimplicityHL work, you can join the <a href="https://t.me/simplicity_community">Simplicity Community Telegram group</a>.

## Upcoming SimplicityHL features

SimplicityHL continues to gain additional notation and convenience features. The `simc` compiler will be updated to support additional syntax for these features. SimplicityHL language enhancement priorities include

* Infix operators: familiar notations like `==`, `<`, `>`, `+`, `-`, `*`, `/`, `&`, `|` for comparisons, arithmetic, and logic operations
* More integer types: specific-width integers; signed integers (supporting negative numbers)
* `if` and `return` statements
* A more conventional loop syntax (for bounded loops)
* Modules/namespaces
* Library functions

## State management

Simplicity programs can track persistent state via cryptographic commitments. This provides proper support for general covenants that need to keep track of arbitrary history as users interact with them over time. (You can see a brief demonstration of this approach in the <a href="https://youtu.be/ry2wQelP8Kc">December 23, 2025 Office Hours session</a>.) 

Documention and sample contracts demonstrating this are forthcoming. Library code is also under development to support maintaining arbitrary quantities of state information (with selective revelation and efficient updates) via a Merkle tree.

## Developer tool improvements

Improvements are planned to various developer tools, including the existing <a href="https://github.com/distributed-lab/simplicityhl-lsp">language server</a> for VSCode integration, the `hal-simplicity` command-line tool, and the <a href="https://ide.simplicity-lang.org/">Web IDE</a>. Enhancements to the web IDE contributed by the open source community will also be adopted.

## Type-based SimplicityHL

A future version of SimplicityHL using type theory foundations is in preparation. In the short term, `simc` will receive a new type inference engine in based on this work, which will relax existing requirements for mandatory type annotations. Over time, extensions for dependent type mechanisms will be exposed in SimplicityHL.

## Mutinynet integration

An integration of Simplicity in <a href="https://github.com/MutinyWallet/mutiny-net">Mutinynet</a>, a signet (test network) that remains architecturally closer to Bitcoin Core, is in progress. This will demonstrate the potential for development with Simplicity on a Bitcoin-like chain without Elements extensions.

## AMP and LWK integrations

Integrations of Simplicity with <a href="https://blockstream.com/amp/">AMP</a> and <a href="https://github.com/Blockstream/lwk">LWK</a> are underway, in order to offer financial application developers more power when building on Liquid Network.

## Documentation updates

In addition to documentation on features mentioned above, significant new and updated documentation is in preparation, including material on timelocks and on avoiding pitfalls in smart contract design.

## Simplicity Unchained

For blockchains where a native Simplicity integration isn't present, like the Bitcoin Mainnet, an oracle-based Simplicity interpreter called Simplicity Unchained will offer Simplicity scripting support. The oracle can make statements confirming when contract conditions (expressed in Simplicity programs) have been met and thereby approve transactions permitted by those conditions. This indirectly brings the power and determinism of Simplicity scripting to other chains.

## Oracle tools

Tools and examples are being created for integrating other data sources into Simplicity contract logic via signed oracle statements. This can support a range of use cases, from price oracles to confirm off-chain asset price data, to importing data from financial companies' existing back-office databases, making them a source of truth for portions of contracts' logic.

## Sample applications

Prototypes of several real financial applications on Simplicity are being specified and implemented. Work in progress on some of these is available in [the `simplicity-contracts` repository on GitHub](https://github.com/BlockstreamResearch/simplicity-contracts).

## Simplicity development framework

[A new tool called `simplex`](https://github.com/BlockstreamResearch/simplex), somewhat akin to `cargo` or `go`, will provide package management, development workflow, and test orchestration features. This integrated build system tool will provide a test framework support unit and integration tests, including running integration tests against a regtest environment to simulate the effects of multiple related transactions.
