# txmanifest

`txmanifest` is a JSON-based file format for describing [Simplicity](../glossary.md#simplicity) [smart contracts](../glossary.md#smart-contract). It provides a reusable, standardized way to *teach wallets* how to describe and interact with a Simplicity contract on-chain. This reduces the need to build custom UI and [transaction](../glossary.md#transaction) logic for each contract/wallet pair.

When a wallet application imports a trusted [manifest](../glossary.md#manifest) file describing a contract, the wallet application can recognize instances of the described contract on the blockchain, how to describe those details to a user, and how to build new transactions that perform actions in that contract instance.

For smart contract developers, `txmanifest` provides a way to describe a contract once and achieve interoperability with a whole ecosystem of wallets.

For wallet developers, `txmanifest` provides a way to add UI and transaction functionality once and achieve interoperability with a whole ecosystem of smart contracts.

## Online documentation

The `txmanifest` format is a work in progress and hasn't yet been frozen as a released specification, but versions of it have been integrated with several [Liquid](../glossary.md#liquid) wallets. Detailed documentation for the `txmanifest` format is available in the [*txmanifest book*](https://stringhandler.github.io/tx_manifest_book/).

## Reference implementation

The [`txmanifest-wallet`](https://github.com/stringhandler/txmanifest-wallet/) project provides a reference implementation of `txmanifest` as a developer-oriented wallet application with a textual user interface.

You can use `txmanifest-wallet` to debug and experiment with manifest files describing new or existing Simplicity contracts. An interactive online demonstration of this tool, with sample manifests and contracts, is available in the [txw codespace](https://github.com/codespaces/new/stringhandler/txw-codespace).

## Security considerations

The `txmanifest` format doesn't include a means to confirm or verify the correctness of descriptions.

Trusting an inaccurate or deceptive manifest file can result in wallets misinterpreting the meaning or effect of transactions, and misdescribing them to users. This could allow users' [assets](../glossary.md#asset) to be lost or stolen because the users approve transactions with undesired or unintended effects, including transferring assets to an attacker's control.

For example, a manifest file could falsely state that sending an asset to a certain [address](../glossary.md#address) deposits it as collateral for a loan, which can purportedly be reclaimed by repaying the loan. In reality, the loan could have highly unfavorable terms that the wallet application fails to explain correctly, or the destination address could be some other form of contract that forfeits the user's deposit to an attacker with no further recourse.

!!! warning
    Users and wallets must only import manifest files from appropriately trusted sources, and not automatically accept manifest files posted online or sent to them by strangers.
