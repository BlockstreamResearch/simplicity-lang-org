# Simplicity Roadmap

The primary objective for the current development cycle is to prepare Simplicity for execution on a Bitcoin test network. Achieving this objective requires finalising the set of jets, establishing a complete cost model, and implementing state storage for advanced contract functionality.

### Bitcoin Testnet Integration

Work will continue towards producing a testnet-mergeable integration branch of bitcoin-core. Tasks include:

* Porting `libsimplicity` into the integration branch.
* Ensuring all jets are fully implemented and functioning.
* Assigning execution costs to each jet.

### State Storage in Simplicity

Implementation of UTXO-committed state storage is planned to support advanced contract use cases, including covenants and vaults. This requires:

* Defining the state storage API and on-chain commitment structure.
* Producing reference examples demonstrating stateful contracts.
* Documenting usage patterns for developers.
* Implementation in SimplicityHL

### Path to Testnet Deployment

The following sequence outlines the progression towards a Bitcoin testnet release:

1. Completion of jet implementation and cost assignments.
2. Availability of the signet-mergeable integration branch.
3. Implementation of state storage, enabling contracts such as covenants and vaults.
4. Deployment of Simplicity on Bitcoin testnet.
