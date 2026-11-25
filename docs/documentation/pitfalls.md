# Pitfalls

These pages describe mistakes to avoid when writing [SimplicityHL](../glossary.md#simplicityhl) [contracts](../glossary.md#contract) and the software that works with them. Some of the mistakes make a contract behave in unintended ways. Others can make the [assets](../glossary.md#asset) a contract holds unspendable, or let someone other than the intended parties take them.

* [Assets and amounts](pitfalls-assets.md): checking assets as well as amounts, asset ID byte order, asset supply, and zero-amount burns.
* [Fees](pitfalls-fees.md): who pays a contract's [fees](../glossary.md#fee), and how a contract bounds them.
* [State and concurrency](pitfalls-state.md): contention for a shared [UTXO](../glossary.md#utxo), writing state the same way it's checked, and keeping assets with a contract through state updates.
* [Composability](pitfalls-composability.md): several contracts, or several copies of one contract, in the same [transaction](../glossary.md#transaction).
* [Other contract pitfalls](pitfalls-other.md): [witness](../glossary.md#witness) swiping, comparison and arithmetic [jets](../glossary.md#jet), assets stuck in a contract, and checks before deploying.
* [Off-chain software](pitfalls-offchain.md): what indexers, wallets, and applications can rely on.

Timelock pitfalls, including the deprecated relative timelock jets, are covered on the [Timelocks](timelocks.md) page.
