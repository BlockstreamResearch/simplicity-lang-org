# Welcome, Ethereum & Solidity Developers

Simplicity is a [smart contract](../glossary.md#smart-contract) language built for [UTXO-based](../glossary.md#utxo) blockchains like the [Liquid Network](../glossary.md#liquid), which puts it closer to Bitcoin Script than to the EVM's account model. Instead of a contract address holding shared, global state, you build [covenants](../glossary.md#covenant): rules that govern how a specific output can be spent and how state is passed from one UTXO to the next. Primitives like AMMs and limit order books are buildable this way, just structured differently than their EVM equivalents.

The architectural differences from Solidity that matter most: no global state, no reentrancy (there's no shared state to re-enter), and no unbounded loops. Every program's execution cost is statically bounded and known before a transaction is ever broadcast. The language's formal semantics also make it suitable for machine-checked proofs of contract behavior.

## Where to go from here

* **Quickstart:** Make a first Simplicity transaction with the [quickstart tutorial](../quickstart/).
* **Simplicity for EVM developers:** [Introduction to Simplicity for EVM Developers](../documentation/simplicity-for-evm-developers) maps EVM concepts to Simplicity, with FAQs and a video on the architectural differences.
* **Use cases:** [Simplicity use cases and demos](../../use-cases/), including complex financial applications built natively on-chain.
* **Execution model:** [The UTXO execution model](../../documentation/execution-model) that structures Simplicity contracts, including how spending conditions are enforced without global state or account balances.
* **Covenants and state:** [Covenants and state management](../../documentation/state), the UTXO equivalent of updating contract storage.
* **Oracles:** How [oracles](../../documentation/oracle) pass off-chain data into Simplicity contracts.
* **Example code:** [Basic contract examples](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples) and [more complex example contracts](https://github.com/BlockstreamResearch/simplicity-contracts) demonstrate SimplicityHL syntax and features. The [SimplicityHL language documentation](https://docs.simplicity-lang.org/documentation/) covers the full reference.
* **Community:** Join the [Simplicity forum](https://community.simplicity-lang.org), [Telegram group](https://t.me/simplicity_community), or the [weekly office hours calls](../../office-hours).
