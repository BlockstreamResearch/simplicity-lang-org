# Witnesses in SimplicityHL development

This document describes *witnesses*, which are transaction-time input data for a Simplicity contract provided by the user proposing the transaction. A witness explains what the user wants the contract to do, and convinces the contract that this action is authorized.

When you interact with a Simplicity [contract](../glossary.md#contract) on the blockchain, you'll need to build and attach witness data for each [transaction](../glossary.md#transaction).

The [execution model](../execution-model) for Simplicity [contract](../glossary.md#contract)s allows the user who is proposing a [transaction](../glossary.md#transaction) to provide input values to the contract. Each contract expects different inputs, but in general they help confirm that the proposed transaction is authorized according to the contract's rules. This is necessary because anyone can propose transactions to spend assets at any time, so a contract needs a clear way to distinguish which transactions are appropriate and which aren't.

One can think of a Simplicity program as a function that deterministically answers "yes" or "no" to each proposed transaction. The input data for this function will be the specific transaction details, together with some user-supplied inputs which are collectively known as a *witness*. The form of the expected witness is determined in advance by the Simplicity program, just as any function definition determines what kind of input that function expects.

The term "witness" here is adopted from its existing use in other kinds of Bitcoin transactions, and originally from a related meaning in computer science.

Among other things, a witness will usually contain digital signatures from some party or parties approving the proposed transaction. It might also include things like

* amounts (for example, how much of an asset is requested to be spent or transferred)
* oracle statements (confirming some fact about the outside world)
* values representing *choices* among several actions that can be taken at a certain moment (for example, whether a payment should proceed or be cancelled and refunded).

The witness is directly attached to the transaction and forms a part of it; if the transaction is confirmed, the witness data will be publicly visible on the blockchain as part of the confirmed transaction.

In an end-user application, witness data will typically be built by wallet or app software that understands how to interact with a certain contract on the user's behalf. During the contract development process, developers might build it manually.

Please note that this document is discussing "inputs" informally in the typical software development sense of [data provided to a function or program](https://en.wikipedia.org/wiki/Parameter_(computer_programming)), not the blockchain-specific sense of the specific [UTXO](../glossary.md#utxo)s consumed by a transaction (which will also be details relevant to many contracts' logic).

For the practical mechanics of building `.wit` files, compiling them with `simc`, and formatting every SimplicityHL type as a witness value, see the [`.wit` file reference](witness-format.md).
