# Welcome, Ethereum & Solidity Developers

## Welcome to the Bitcoin and Liquid ecosystem.

If you are coming from the EVM/Solidity world, you're already well-versed in digital assets, decentralized logic, and smart contract architecture. However, you might also be intimately familiar with the pain points of EVM: unpredictable gas spikes, reentrancy attacks, and the massive attack surface.

Simplicity offers a different, highly secure paradigm, closely integrated with Bitcoin's architecture.

Simplicity is a [smart contract](../glossary.md#smart-contract) language built specifically for [UTXO-based](../glossary.md#utxo) blockchains like the [Liquid Network](../glossary.md#liquid). Instead of interacting with a global, shared state via a central smart contract address, you will learn to build [covenants](../glossary.md#covenant): rules that strictly govern how a specific output can be spent and how state is securely passed from one UTXO to the next. This allows you to build familiar financial primitives, like Automated Market Makers (AMMs) or decentralized limit order books, within a Bitcoin-style UTXO architecture.

We know security is your top concern. Simplicity is fundamentally architected with absolute correctness in mind. Unlike Turing-complete languages, Simplicity uses no unbounded loops, meaning execution costs are strictly predictable and calculated before a transaction is ever broadcast. Furthermore, its mathematical foundation makes the language uniquely suited for formal verification. This design philosophy ensures a drastically reduced attack surface today, and lays the groundwork for a future where your smart contracts' behavior can be mathematically proven.

## Where to go from here:

* **Perform a live transaction:** Try our [quickstart tutorial](../quickstart/) to make your first Simplicity transaction in minutes.
* **Get introduced to Simplicity from the EVM perspective**: Map your knowledge to our environment by reading our dedicated, detailed [Introduction to Simplicity for EVM Developers](../documentation/simplicity-for-evm-developers), including frequently asked questions and a video presentation on the architectural differences.
* **See it in action:** Explore what's possible with [Simplicity use cases and demos](../../use-cases/), including how complex financial applications are built natively on-chain.
* **Shift your mental model:** Dive into the [UTXO execution model](../../documentation/execution-model) that structures Simplicity contracts and within which they execute on the blockchain. Understand how Simplicity enforces financial logic and spending conditions without global state or account balances.
* **Master state management:** Learn how to pass data from one transaction to another using [covenants and state management](../../documentation/state), the UTXO equivalent to updating contract storage.
* **Connect the outside world:** See how [oracles](../../documentation/oracles) help pass off-chain data into Simplicity contracts.
* **Learn the language:** Dig into <a href="https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples">simple contract source code</a> that demonstrates SimplicityHL language syntax and features, and <a href="https://github.com/BlockstreamResearch/simplicity-contracts">more complex example contracts</a> with frameworks for running demos. The <a href="https://docs.simplicity-lang.org/documentation/">SimplicityHL language documentation</a> is here when you need it.
* **Connect with the community:** Join our [Telegram group](https://t.me/simplicity_community) or [weekly office hours calls](../../office-hours) to discuss your projects and questions with other adopters and the Simplicity team.
