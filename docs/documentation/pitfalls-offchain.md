# Pitfalls: Off-chain software

Indexers, wallets, block explorers, and applications read a [contract](../glossary.md#contract)'s [transactions](../glossary.md#transaction) from the chain. This page covers what that software can and can't rely on.

## Fields the contract doesn't constrain

Apart from the consensus rules, a contract's assertions are the only constraints on a transaction that spends it. Whoever builds the transaction chooses everything else, including the parts an indexer, wallet, block explorer, or application reads. Constraining `jet::output_script_hash(0)` doesn't say anything about what appears at other indices, and the spender chooses the order of [outputs](../glossary.md#output).

An indexer that classifies a spend by the transaction's shape, such as how many outputs it has, which of them are null-data outputs, or what sits at index 2, lets the spender choose the classification. Where the contract pins those positions, the classification is reliable. Where it doesn't, a spender can shape a transaction so that indexers and block explorers report an outcome that didn't happen. This misleads users without taking anyone's funds, so a review that only asks whether funds can be stolen tends to miss it.

Classify spends by something the contract constrains: the branch taken, the state transition, or the scriptPubKey hash recomputed from the contract and its expected next state. Derive the parser from the contract's own layout rather than from observed transactions, so that after a change to the contract, the parser rejects transactions it doesn't recognize instead of misclassifying them. Treat an unrecognized spend as an error, rather than letting it fall through to a default case.

## Unsolicited outputs at a contract's address

Anyone can create outputs at a contract's [address](../glossary.md#address) at any time, in any amount. On Liquid, they can hold any [asset](../glossary.md#asset), and with an asset the sender issued for the purpose, each one costs only an ordinary transaction [fee](../glossary.md#fee). Software that finds a contract's [UTXOs](../glossary.md#utxo) by address alone sees whatever a stranger chooses to put there.

An indexer, wallet, or application that tracks a contract needs to allow for this:

* Check the asset and amount of every UTXO at the address, and ignore UTXOs that the contract doesn't use.
* On Liquid, treat a [confidential](../glossary.md#confidential) UTXO that can't be unblinded as unknown. If the contract can't spend confidential [inputs](../glossary.md#input), ignore such a UTXO, since it can't be part of the contract's working balance.
* Follow each UTXO of a contract with [state](state.md) back through its spending transactions to a known creation, to tell which UTXOs belong to a particular instance's history (its lineage). Anyone can compute the address of any state and pay to it, which creates a separate instance that starts in that state without going through any of the contract's transitions.
* Track instances by outpoint where possible, rather than by listing the address, so that a large number of unsolicited UTXOs doesn't slow down lookups or hide the real ones.

Lineage shows whether a UTXO is part of an instance's history, not whether it's legitimate. Two kinds of legitimate payment also lack lineage: the creator topping up the contract by paying its address again, and a party paying an earlier state's address to undo a transaction. An unsolicited instance is often spendable on exactly the same terms as the original. Paying an allowance [covenant](../glossary.md#covenant)'s address creates a second allowance with its own [timelock](../glossary.md#timelock), which the beneficiary can also claim. Paying the address of a prediction market's "resolved as NO" state creates a UTXO that holders of `NO` [tokens](../glossary.md#token) can claim, whatever the [oracle](../glossary.md#oracle) reported.

Which UTXOs software should count depends on the question it answers:

* To report an instance's history, such as what the oracle reported, how much the creator deposited, or how much of an allowance remains, count only the instance's lineage.
* To show a user what they can claim, include every UTXO at the address that the user can spend, as a Bitcoin wallet shows a payment from an unknown sender. Show unsolicited instances separately from the original, since their origin is unknown.

Before offering to claim an unsolicited instance, check what the claim consumes and what it returns. A claim that burns a token gives up the same token whichever instance pays out, so an unsolicited instance that pays less per token is a worse trade than the original. An instance holding less than the fee to claim it isn't worth claiming, and anyone who wants to waste users' fees can create many of those. Claiming an unsolicited instance in the same transaction as the original links the two publicly, and runs into the double-counting described in [Shared outputs and amount constraints](pitfalls-composability.md#shared-outputs-and-amount-constraints) unless the contract handles several instances.

An application that picks a UTXO by address without these checks can build a spend against an unsolicited UTXO: one that fails because the UTXO holds the wrong asset, or one that spends something other than what the user intended. A contract that accepts another UTXO's scriptPubKey hash as evidence of that UTXO's state has the same problem on-chain. A stranger can pay the address of any state, so a matching hash shows only that a UTXO exists in that state, not that it got there through the contract's own transitions.
