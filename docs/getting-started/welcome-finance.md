# Welcome, Fintech Professionals & Architects

[Simplicity](../glossary.md#simplicity) is a [smart contract](../glossary.md#smart-contract) language for the [Liquid Network](../glossary.md#liquid) built around [covenants](../glossary.md#covenant): rules that govern exactly how, when, and by whom digital assets move, enforced by the blockchain itself rather than by a counterparty. People are already building programmable [vaults](../glossary.md#vault) with multi-party approval and time-locked withdrawals, atomic swaps, options, and collateralized loans this way: see [use cases](../../use-cases/) for real examples.

This is provided natively on Bitcoin's architecture. It enables sophisticated financial products on top of Bitcoin-like chains.

Two properties matter most for this audience: every program's execution cost is statically bounded and known before a transaction is broadcast (no surprise fees), and the language's formal semantics support machine-checked proofs of contract behavior.

Simplicity supports vaults with multi-party approval workflows, time-locked withdrawals, and complex recovery paths codified directly into the asset; atomic swaps that act as programmable limit orders, with partial fills and dynamic pricing and no settlement risk; and complex derivatives, such as covered call options or collateralized loans, settled directly on-chain without relying on trusted intermediaries or centralized clearinghouses.

## More integration features and options

The Simplicity Unchained project will bring Simplicity interpretation to Bitcoin mainnet via oracles and cosignatures, for cases where a native Simplicity integration isn't available.

[Oracles can integrate existing business logic](../../documentation/oracle/#oracles-for-business-logic-integration) and databases into blockchain applications built on Simplicity. Simplicity also plugs into existing Blockstream services like [Blockstream Enterprise](https://blockstream.com/enterprise/) and [AMP](https://blockstream.com/amp/).

## Where to go from here

* **Use cases:** [Simplicity use cases and demos](../../use-cases/), showing how complex financial applications are built natively on-chain.
* **Execution model:** [Simplicity and the UTXO model](../../documentation/execution-model) and how it enables decentralized, non-custodial transaction settlement.
* **Oracles:** How [oracles](../../documentation/oracle) securely feed external financial data into covenants.
* **Quickstart:** Deploy a first smart contract transaction with the [quickstart tutorial](../quickstart).
* **Example code:** [Basic contract examples](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples) and [more complex example contracts](https://github.com/BlockstreamResearch/simplicity-contracts), including state management and financial applications, demonstrate SimplicityHL syntax and features. The [SimplicityHL language documentation](https://docs.simplicity-lang.org/documentation/) covers the full reference.
* **Community:** Join the [Simplicity forum](https://community.simplicity-lang.org/), [Telegram group](https://t.me/simplicity_community), or the [weekly office hours calls](../../office-hours).
