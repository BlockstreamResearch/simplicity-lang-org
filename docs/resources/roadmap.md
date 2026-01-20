# Simplicity Roadmap

For announcements on progress on this and other Simplicity and SimplicityHL work, you can join the <a href="https://t.me/simplicity_community">Simplicity Community Telegram group</a>.

## Upcoming SimplicityHL features

We're continuing to enhance the SimplicityHL language with additional notation and convenience features. The `simc` compiler will be updated to support additional syntax for these features. Our priorities for SimplicityHL language enhancements include

* Infix operators: familiar notations like `==`, `<`, `>`, `+`, `-`, `*`, `/`, `&`, `|` for comparisons, arithmetic, and logic operations
* More integer types: specific-width integers; signed integers (supporting negative numbers)
* `if` and `return` statements
* A more conventional loop syntax (for bounded loops)
* Modules/namespaces
* Library functions

## State management

We have developed a way to represent persistent state of a contract via cryptographic commitments, with associated tooling. This provides proper support for general covenants that need to keep track of arbitrary history as users interact with them over time. (You can see a brief demonstration of this approach in <a href="https://youtu.be/ry2wQelP8Kc">our December 23, 2025 Office Hours session</a>.) We will document this and provide sample contracts demonstrating it. We're also developing library code to support maintaining arbitrary quantities of state information (with selective revelation and efficient updates) via a Merkle tree.

## Developer tool improvements

We're working on improvements to developer tools, including the existing <a href="https://github.com/distributed-lab/simplicityhl-lsp">language server</a> for VSCode integration, the `hal-simplicity` command-line tool, and the <a href="https://ide.simplicity-lang.org/">Web IDE</a>. We're also planning to adopt some enhancements to these tools contributed by our open source community.

## Type-based SimplicityHL

A future version of SimplicityHL using type theory foundations is in preparation. In the short term, we'll adopt a new type inference engine in `simc` based on this work, which will relax existing requirements for mandatory type annotations. Over time, we'll also expose extensions for dependent type mechanisms in SimplicityHL.

## Mutinynet integration

We're working on an integration of Simplicity in <a href="https://github.com/MutinyWallet/mutiny-net">Mutinynet</a>, a signet (test network) that remains architecturally closer to Bitcoin Core. This will demonstrate the potential for development with Simplicity on a Bitcoin-like chain without Elements extensions.

## AMP and LWK integrations

We're working on integrations of Simplicity with <a href="https://blockstream.com/amp/">AMP</a> and <a href="https://github.com/Blockstream/lwk">LWK</a>, to give financial application developers more power when building on Liquid Network.

## Documentation updates

In addition to documentation on features mentioned above, we're preparing lots of new and updated documentation, including documentation on the Simplicity execution model, witnesses, a jets reference, a SimplicityHL language reference, a toolchain reference, introductions on timelocks and oracles, and material on avoiding pitfalls in smart contract design.

## Simplicity Unchained

For blockchains where a native Simplicity integration isn't present, like the Bitcoin Mainnet, we're developing an oracle-based Simplicity interpreter called Simplicity Unchained. The oracle can make statements confirming when contract conditions (expressed in Simplicity programs) have been met and thereby approve transactions permitted by those conditions. This indirectly brings the power and determinism of Simplicity scripting to other chains.

## Oracle tools

We're creating tools and examples for integrating other data sources into Simplicity contract logic via signed oracle statements. This can support a range of use cases, from price oracles to confirm off-chain asset price data, to importing data from financial companies' existing back-office databases, making them a source of truth for portions of contracts' logic.

## Sample applications

We're developing prototypes of several real financial applications on Simplicity, including collateralized lending mechanisms and options contracts. You can see work in progress on some of these at <https://github.com/BlockstreamResearch/simplicity-contracts>.

## Integrated build system and package manager

We're prototyping a tool, somewhat akin to `cargo` or `go`, providing package management, development workflow, and test orchestration features. This tool will provide a test framework support unit and integration tests, including running integration tests against a regtest environment to simulate the effects of multiple related transactions.
