# Pitfalls

These pages describe mistakes to avoid when writing SimplicityHL contracts and the software that works with them. Some of the mistakes make a contract behave in unintended ways. Others can make the assets a contract holds unspendable, or let someone other than the intended parties take them.

* [Assets and amounts](pitfalls-assets.md): checking assets as well as amounts, asset ID byte order, asset supply, and zero-amount burns.
* [Fees](pitfalls-fees.md): who pays a contract's fees, and how a contract bounds them.
* [State and concurrency](pitfalls-state.md): contention for a shared UTXO, writing state the same way it's checked, and keeping assets with a contract through state updates.
* [Composability](pitfalls-composability.md): several contracts, or several copies of one contract, in the same transaction.
* [Other contract pitfalls](pitfalls-other.md): witness swiping, comparison and arithmetic jets, assets stuck in a contract, and checks before deploying.
* [Off-chain software](pitfalls-offchain.md): what indexers, wallets, and applications can rely on.

Timelock pitfalls, including the deprecated relative timelock jets, are covered on the [Timelocks](timelocks.md) page.
