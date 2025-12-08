# Glossary

These are terms likely to appear within Simplicity documentation and other educational materials.

glossary:Address
:    An identifier to which <glossary:asset>s may be sent on a blockchain. Each address is associated with one or more scripts, such as Simplicity <glossary:contract>s, which control access to funds sent to that address. Given a Simplicity contract and an “unspendable <glossary:internal key>”, it is possible to derive a unique address for that contract, which refers to an instance of the program’s code.

glossary:Asset
:    A specific abstract or virtual possession whose ownership is tracked on a blockchain according to the blockchain's rules.
:    In Bitcoin, there is only one asset directly tracked on the blockchain, although there are indirect ways to represent ownership and transfer of others.  In Elements, <a href="https://elementsproject.org/features/issued-assets">anyone can create a new asset at any time</a>, and a single <glossary:transaction> can natively involve the transfer of multiple assets at once.  Simplicity allows <glossary:introspection> of <glossary:input> and <glossary:output> data in order to allow a program to determine which asset or assets are proposed to be transferred in a specific transaction, and where the assets are proposed to be sent. The program can then use this information to constrain the transaction according to its logic, such as by requiring certain assets to be sent only to a specific destination, or even requiring assets to be sent back to the same contract.
:    See also "<glossary:token>".

glossary:Bitcoin Script
:    A programming language included in Bitcoin since its inception, allowing some policies to be applied to an <glossary:output> of a <glossary:transaction>. Like Simplicity, intentionally not <glossary:Turing complete>; more limited than Simplicity, particularly with regard to <glossary:introspection> and <glossary:covenant>s. See also <glossary:Elements Script> (Also just "Script".)

glossary:CMR
:    Commitment Merkle Root.
:    A cryptographic representation of the identity of a specific Simplicity <glossary:contract> as a <glossary:Merkle tree>.  This provides a way to refer to that contract, and eventually to confirm that a partially revealed (pruned) contract posted on a blockchain was properly derived from a specified original contract.

glossary:Combinator
:    A low-level operation in Simplicity, the approximate equivalent of an opcode in <glossary:Bitcoin Script> and other low-level programming languages. Simplicity is designed using <a href="https://en.wikipedia.org/wiki/Combinatory_logic">combinatory logic</a>; a low-level Simplicity program is made up of a series of combinator invocations as well as invocations of <glossary:jet>s.

glossary:Contract
:    Sometimes used interchangeably with "program". Often, a specific instance of Simplicity code that can receive <glossary:asset>s on a blockchain and make decisions about how to dispose of those assets in accordance with its internal logic.
:    The broader concept of a <glossary:smart contract> might in turn refer either narrowly to a specific Simplicity program or broadly to a whole set of interactions and relationships realized through code, of which that Simplicity program could be only one component. In this view a smart contract as a whole potentially includes several Simplicity programs, possibly as well as other related technical arrangements.

glossary:Cost
:    In Simplicity blockchain integrations, a metric for the computational resources used in verifying a <glossary:transaction> that invokes a Simplicity <glossary:contract>. Cost is a measurement of CPU usage (to avoid multidimensional optimization problems, the other major resource, memory, is simply capped at a fixed value). Cost is converted to a minimimum weight that a transaction input must carry, which is then paid for via transaction <glossary:fee>s. See "<glossary:weight>" for more information.

glossary:Covenant
:    A covenant is a condition or behavior in a <glossary:contract> related to restrictions on the <glossary:output> destination to which an <glossary:asset> may be transferred.  Covenants allow a contract to enforce various rules that form useful building blocks for higher-level mechanisms and guarantees about contract behavior. Simplicity supports highly general covenant mechanisms by means of its <glossary:introspection> features. For example, covenants in Simplicity can enforce...
:    * rules like multi-step spending processes, or preprogrammed delays in spending under some circumstances
:    * rules providing for cases in which some assets must be refunded to or retained by the same contract
:    * requirements that some assets be sent only to specific recipients or other Simplicity contract instances
:    * policies authorizing progressively increasing <glossary:fee> amounts as a transaction involving the contract becomes older.

glossary:Elements
:    A blockchain software system derived from Bitcoin and developed primarily by Blockstream. Elements allows the creation of Bitcoin-like blockchains with enhanced functionality. It is the software architecture underlying the <glossary:Liquid> Network.

glossary:Elements Script
:    An extension of <glossary:Bitcoin Script> which includes several new opcodes for 64-bit arithmetic and transaction introspection (covenants). See <a href="https://github.com/ElementsProject/elements/blob/master/doc/tapscript_opcodes.md">tapscript_opcodes.md</a> in the Elements source tree. Still not Turing Complete or as expressive as Simplicity. (Also just "Script", when it is clear or irrelevant whether Bitcoin or Elements Script is meant.)

glossary:elements-cli
:    The standard command line user interface for creating and querying blocks, transactions, and other objects within a network based on <glossary:Elements>, including the <glossary:Liquid> Network.

glossary:elementsd
:    The software used to create an <glossary:Elements> network node, including a <glossary:Liquid> Network node, which maintains and verifies an up-to-date copy of the blockchain of the network in question.

glossary:Fee
:    Resources intentionally paid to miners as part of a <glossary:transaction> in order to compensate them for producing blocks. In Elements, block production is practically free so the fee market serves as an anti-denial-of-service measure and as a way to prioritize transactions for inclusion in blocks.

glossary:hal-simplicity
:    A software tool that provides various pieces of Simplicity-related functionality, including those needed to build Simplicity-related <glossary:transaction>s.

glossary:Height
:    (Also "block height".) The number of blocks that currently exist on a specific blockchain, or that existed as of a <glossary:transaction> of interest. Since blockchains normally add blocks at a predictable rate, the height can be used as a measurement of the current date and time, providing one mechanism for <glossary:contract>s to refer to and enforce conditions related to the dates before or after which certain events may or must occur. For example, Liquid mainnet block height 3634700 occurred at 2025-11-21 02:23:10 UTC, and Liquid adds blocks at a rate of 1 per minute, so we can refer the date 2026-05-01 by adding about 232000 minutes to this height, giving height 3866700 as a reference to a time a little later in the morning on that date.

glossary:Input
:    In Bitcoin or Elements, a funding source that contributes <glossary:asset>s to a particular <glossary:transaction>.

glossary:Internal key
:    In Taproot, every output can be spent in two ways: by signing a transaction with a public key, or by revealing a Script or Simplicity program embedded in the key as a Taproot commitment, along with a satisfying witness. The "internal key" is the component of a Taproot commitment which defines which party or parties is able to sign. Commonly, an unspendable key is used, such as 50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 (taken from <a href="https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki">BIP 0341</a>, which also specifes a method to blind this key for privacy reasons). This disables the key-spending path.
:    With Simplicity contracts, the typical construction is to use a Taproot tree with an unspendable internal key and a single leaf denoting the program, or two leaves denoting the program and its state commitment.
:    Changing the internal key or state commitment changes the <glossary:address> of the program without changing its code.

glossary:Introspection
:    In Simplicity, the ability for a <glossary:contract> to examine the details of the context of a proposed <glossary:transaction> (via introspection <glossary:jet>s) in order to make decisions about whether to approve the transaction, particularly the control of <glossary:output>s in order to enforce "<glossary:covenant>" conditions.

glossary:Jet
:    An optimized native-code implementation of a Simplicity expression, such as arithmetic, logic, bit manipulations, or cryptographic operations. Jets are faster and therefore have a lower <glossary:cost> than their equivalent Simplicity code. Validating nodes are assumed to be executing the optimized code rather than their Simplicity specification, justifying this cost reduction.
:    The list of jets and their specific behaviors is fixed at the time of integration of Simplicity into a particular blockchain.  In the <glossary:Elements> integration, there are 471 jets.

glossary:Liquid
:    A specific <glossary:Elements>-based network, the <a href="https://liquid.net/">Liquid Network</a>, that is the first blockchain to have native support for Simplicity. Most Simplicity examples as of 2025 assume that a program is running on the Liquid mainnet or Liquid testnet, although other integrations are planned.

glossary:Merkle tree
:    A cryptographic mechanism for representing a potentially large amount of data concisely in a way that ensures that none of the data can be changed (a “commitment”). The Merkle tree also allows that data to be revealed selectively, so that some portions can be disclosed and verified, while continuing to hide other portions. A Merkle tree is represented by its root, which is a single cryptographic hash that commits to every object in the tree.
:    A Merkle tree is used in creating an <glossary:address> for a Simplicity program, as well as in enabling <glossary:pruning> of that program when it is run. See also <glossary:CMR> (the root of a Merkle tree describing a specific Simplicity program).

glossary:Multisig
:    A transaction architecture (or other application of digital signatures) in which a specified number or combination of signatures from several distinct signing keys is required in order to approve a <glossary:transaction> or other event or statement.  Often specified as k-of-n multisig, e.g. a 7-of-10 multisig design would require that any 7 of 10 specified entities provide their approval in order for a transaction as a whole to go ahead.
:    This can be used as a precaution to mitigate the impact of mistakes, compromise, or misbehavior by individual signers or groups of signers, much as an offline action or transaction could require prior approval by multiple distinct parties.
:    Outside of the blockchain space, the term "threshold signature" is more commonly used, while "multisignature" is reserved for the case when all signers are required to generate a signature.

glossary:Node
:    An entity that participates in the verification of <glossary:transaction>s on a blockchain. In most blockchains, anyone can operate a node just by running a copy of the blockchain's verification software. The node will typically download a complete copy of the blockchain data.
:    Nodes typically validate all transactions in all blocks, including any Scripts or Simplicity programs that appear in them. Sometimes the term "full node" to emphasize that all parts of all transactions are validated. An "archival node" refers to a full node which retains all data after it has been verified.
:    You can run your own local <glossary:Liquid> (mainnet or testnet) node with the <glossary:elementsd> software.

glossary:Oracle
:    An entity that is trusted (in the Simplicity context, by users of a <glossary:contract>) to make accurate digitally-signed statements about some fact or situation that exists outside of a blockchain, such as a current market price, or whether or not some real-world event has occurred as of a specified date.
:    Oracle statements intended for use in conjunction with blockchains can often include a specific block <glossary:height> to indicate the time as of which the oracle certifies that its statement was true.  Most kinds of oracle statements should include some form of dating mechanism for confirming whether the statement is still recent, so that old oracle statements can't be misleadingly reused in the future.  For example, a price oracle would normally say something more like "We observed wheat for delivery in December 2025 trade for USD 5.2225 per bushel on 2025-11-25" (though in a more machine-readable form) rather than "The price of wheat is USD 5.2225 per bushel" (as this statement is not true in general).  On a blockchain the oracle could likely express this statement in terms of block <glossary:height>s.
:    Relying on an oracle creates some risks, both that the oracle may appear to issue an inaccurate statement (for example, due to loss of control over its private key), and that the oracle may cease to operate eventually (for example, due to a bankruptcy of a company that was operating it) and fail to make expected statements after a certain point in time.  Some of these risks could be reduced by requiring a quorum of several oracles (like a <glossary:multisig> mechanism), albeit at the cost of needing to ensure the existence of more oracle operators.

glossary:Output
:    In Bitcoin or <glossary:Elements>, a funding destination that receives a quantity of an <glossary:asset> from a particular <glossary:transaction> and that specifies an associated future condition for subsequent transfer (or “redemption”) of that asset. The conditions associated with an output are ultimately enforced by the logic of <glossary:Bitcoin Script> or <glossary:Simplicity> programs.
: An unspent output is a <glossary:UTXO>.

glossary:Parameter
:    (1) A value (e.g. a trusted public key) attached to an instance of a <glossary:SimplicityHL> <glossary:contract> at compile-time.
:    (2) A value attached to a Bitcoin or <glossary:Elements> <glossary:transaction>.

glossary:Private key
:    In public-key cryptography, a secret numeric value corresponding to a specific <glossary:public key>.  The possessor of the private key can use it to create digital signatures indicating agreement with specific assertions, such as proposed Bitcoin or <glossary:Elements> transactions, or <glossary:oracle> assertions.  Anyone can verify those digital signatures using the corresponding public key.

glossary:Program
:    Sometimes used interchangeably with "contract".  A specific instance of <glossary:Simplicity> code that can receive <glossary:asset>s on a blockchain and make decisions about how to dispose of those assets in accordance with its internal logic.
:    A program’s creator could choose to publish its code (outside of a blockchain) in order to allow other people to learn of its existence and interact with it. A reference to the program’s address appears on a blockchain when a <glossary:transaction> includes an <glossary:output> controlled by the program. A copy of the program’s code (in pruned form) appears on the blockchain only when a later transaction spends such an output.

glossary:Pruning
:    A transformation of a <glossary:Simplicity> program before publication as part of a <glossary:transaction>, so that the modified program includes only the code paths that actually executed as part of that transaction. This specifically applies to conditional branches (<glossary:SimplicityHL> `match` statement; <glossary:Simplicity> `case` <glossary:combinator>) where only one path of several will be used in any specific instance. This pruning process means that, for example, a contract that supports several different outcome scenarios, with code logic for each of them, will not be published in full as part of any specific transaction. Instead, only the relevant portion of the contract will be published.
:    The pruning mechanism typically reduces the amount of data that must be stored on the blockchain, which miners and other <glossary:node> operators consider important. It can also provide a degree of privacy by not unnecessarily publicly revealing the details of what would have happened in some counterfactual scenarios (although this is only relevant to applications in which the contract logic is not made available to the general public, and in which a specific instance of contract is used infrequently enough that some of its outcomes never occur at all).
:    This can be compared to a legal contract with various chapters covering various contingencies. When a particular contingency does not occur, the chapters related to it do not have to be considered in connection with enforcing the contract's terms, and their details do not have to be cited or consulted. This could relate, for example, to a power that some party possessed but did not invoke on some occasion.
:    <glossary:Taproot> also includes its own pruning mechanism, but references to pruning in Simplicity documentation typically relate to Simplicity pruning rather than Taproot pruning.

glossary:PSET
:    Partially-Signed Elements Transaction.
:    The <glossary:Elements> equivalent of a PSBT (Partially-Signed Bitcoin Transaction), an object representing an incomplete <glossary:transaction> that is still in the process of being created by having additional parameters and data attached to it. When the PSET is complete, it will be finalized, yielding a complete transaction that can be submitted to the blockchain for inclusion in a block. A PSET is useful for incremental creation by software and can also be circulated to one or more external prospective signers for signature with their <glossary:private key>s.

glossary:Public key
:    In public-key cryptography, a public numeric value to which a specific <glossary:private key> corresponds.  Anyone can use the public key to verify the authenticity of statements that have purportedly been signed by the possessor of the private key.

glossary:Recursive covenant
:    A <glossary:covenant> that, in at least some circumstances, requires an <glossary:asset> to be sent back to the same contract, or to a <glossary:contract> that continues to enforce a particular rule on downstream <glossary:transaction>s.

glossary:simc
:    Blockstream's Simplicity compiler, which translates <glossary:SimplicityHL> to <glossary:Simplicity>, as well as serializing <glossary:witness>es for inclusion on a blockchain.

glossary:Simplicity
:    A financial programming language for high-assurance <glossary:smart contract> and financial instrument development. A low-level language created by Blockstream and natively available on the <glossary:Liquid> Network, Simplicity makes it easier and safer to write complex conditions and behaviors for automated provision of financial services.
:    Simplicity occupies a similar role to <glossary:Bitcoin Script>, operating in a comparable context to it, while providing greater functionality and making practical the development of significantly more sophisticated on-chain smart contract logic.
:    Developers ordinarily don't write programs in Simplicity directly, instead writing in SimplicityHL.

glossary:SimplicityHL
:    A high-level programming language with a Rust-like syntax that was created in conjunction with <glossary:Simplicity> to facilitate writing Simplicity programs.  SimplicityHL compiles to Simplicity, which is actually run by miners or other blockchain <glossary:node> operators.

glossary:simply
:    An alternative <glossary:SimplicityHL> compiler maintained by Starkware.

glossary:Smart contract
:    A mechanism by which computer code directly specifies and determines the conditions for disposition of <glossary:asset>s (particularly tokenized assets on a blockchain). Analogized to a contract in the legal sense because it may represent an understanding and agremeent between parties that governs a part of their future behavior or the results of that behavior. Unlike a traditional offline contract, the smart contract is not drafted in natural language and is not interpreted or enforced by human beings.
:    See also <a href="https://en.wikipedia.org/wiki/Smart_contract">smart contract</a> on Wikipedia.
:    Some sources may use “smart contract” to refer to the overall combination of technologies and protocols that govern or realize a particular commercial relationship or interaction, of which an individual Simplicity program might be only one component. In general, there might be several related Simplicity programs that form part of an overall smart contract system or arrangement.

glossary:Token
:    An <glossary:asset> on a blockchain which represents a specific right, claim, or ability, often due to agreement by particular organizations to accept it for a specific purpose, or references in <glossary:smart contract>s that cause its possession or transfer to have a specific effect. (Sometimes, a monetary or financial asset whose ownership is tracked on a blockchain, such as a virtual currency.)

glossary:Transaction
:    A payment or proposed payment on a blockchain that confirms the transfer of certain specified <glossary:asset>s, setting new conditions for the future transfer of those assets.
:    <glossary:Simplicity> transactions involve claiming assets from <glossary:smart contract>s, by including contract and <glossary:witness> data that confirms that a specific contract that controlled those assets agrees to the transfer of those assets on a certain occasion in a specified context.
:    Simplicity transactions are validated by full <glossary:node>s according to consensus rules that are extended to include details of Simplicity and its integration into a particular blockchain. The full nodes must run a pruned Simplicity program when it is proposed for inclusion in a block in order to confirm both that the referenced program has proper authority to approve the transaction, and that it actually does approve it.

glossary:Turing complete
:    In computer science, Turing completeness is a phenomenon where a very large number of models of computing devices or systems all turn out to be equivalent in power (ultimately able to perform exactly the same computations, albeit with what could be seen as different degrees of efficiency). Neglecting some details of the computer science formalism, most programming languages and computing devices approximate Turing completeness, and so are informally called Turing complete.
:    Some programming languages, including <glossary:Bitcoin Script> and <glossary:Simplicity>, are intentionally not Turing complete; they are simpler and intentionally cannot perform certain computations, including those that under some circumstances never complete. Bitcoin Script and Simplicity programs, by contrast, are mathematically guaranteed to finish running within a finite (in fact, predictable) amount of time.
:    By giving up some amount of expressive power, Simplicity also improves predictability of a program’s behavior. Unlike Turing-complete languages, Simplicity programs can conceivably have aspects of their behavior automatically analyzed in a way that is always valid for every input. We also ensure that Simplicity programs never “get stuck” and fail to decide on an answer for whether a transaction is approved.
:    This means that Simplicity does not include loops or recursion, and SimplicityHL cannot perform an unbounded loop (such as a while loop, as in other programming languages). SimplicityHL provides bounded looping mechanisms: if a program contains a loop, the maximum number of loop iterations must be known in advance, and the built-in `for_while` function can only repeat a given loop up to 65535 times.
:    These limitations aid the analysis of the correctness of Simplicity and SimplicityHL programs’ behavior, while still permitting the implementation of complex and useful smart contract functionality.

glossary:UTXO
:    Unspent Transaction Output.
:    A statement, registered on a blockchain, that the owner of some <glossary:asset> has authorized its transfer under certain conditions (a transaction), when that asset has not yet been claimed (spent) by a subsequent <glossary:transaction>.
:    Specifically, UTXOs are those outputs of prior transactions that have not yet been claimed as inputs of any subsequent transaction.
:    UTXOs represent assets that are available to a particular recipient or recipients (whether an individual, program, organization, or an entity described by some set of conditions).  Most UTXOs specify that they can be claimed by the owner of a specific private key (which is the simplest sense of what it means for a private key to "own" or "control" assets on a blockchain).  However, significantly more detailed conditions can be applied (whether by means of <glossary:Bitcoin Script> programs, or, in blockchains with Simplicity integration, Simplicity programs).
:    Assets that are controlled by a Simplicity contract exist on the blockchain in the form of UTXOs referencing those assets where the recipient, or authorized spender, is an address of that Simplicity contract.
:    Claiming assets from a Simplicity contract is done by creating a new transaction which asserts that those assets should be sent to a new recipient address or addresses. The new transaction references outputs of one or more existing UTXOs in order to consume them as its inputs. This new transaction will only be valid, and hence will only be recorded on the blockchain, if the Simplicity contract's logic approves it, within the specific additional context of that transaction (e.g. <glossary:input>s, <glossary:output>s, block <glossary:height>, and <glossary:witness>).
:    UTXOs are also one means of storing state information directly on the blockchain, by encoding the relevant information within some UTXO parameter.
:    Once a particular UTXO has successfully been spent (used as the input of a new transaction recorded on the blockchain), it is no longer considered a UTXO, because it is no longer available to be spent by other transactions.

glossary:Weight
:    A measure of the quantity of resources consumed by a proposed <glossary:transaction> as a means of determining the <glossary:fee> that must be paid to miners. Roughly equivalent to the transaction's size when encoded on the wire.
:    Traditional Bitcoin transaction weight was <a href="https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki">introduced in BIP 0141</a> as part of the SegWit mechanism, to replace "size" with a more flexible metric. In <a href="https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki">BIP 0341</a> the concept of a "budget" was introduced, in which each transaction has a minimum weight associated with it, depending on its number of signature checks, to ensure that the weight metric accounts for the CPU resources demanded of nodes. (It is important to collapse all resource requirements into a single metric so miners do not need to do multidimensional optimization, which is NP-complete.) Simplicity extends this concept: each program has a <glossary:cost> to execute which contributes to the total budget of any transaction it appears in.
:    In BIP 0342, the budget for a signature check is typically covered by the weight of the signature itself. However, in Simplicity, many jets have a much smaller encoding than the weight implied by their cost. As a result, transactions involving more computationally-intensive Simplicity programs may be expected to pad the transactions to a larger size (and hence a larger weight) in order to meet the budget requirements.

glossary:Witness
:    An input provided to a specific program on a specific occasion to help it confirm that it should authorize a <glossary:transaction>, including the evidence that justifies why the transaction is a legitimate one according to the rules of the smart contract. This may include digital signatures from parties that are participating in the contract in some way, or from <glossary:oracle>s that are making assertions about information or events outside of the blockchain. The format and contents of a witness, as well as the interpretation of those contents, are specified by the program that consumes it.
:    A witness must be serialized (converted into a sequence of bytes) and attached to a transaction so that verifiers have access to the witness data in order to confirm that a specific program approves a specific transaction when run with a specific input.
:    The witness data is constructed by whoever proposes the transaction, but some portions of its contents will often be provided by other parties (to confirm their own approvals on the transaction, for example). This process is specific to an individual Simplicity program; it will probably be performed in real deployments by "driver" software, within wallets or other client applications, that understands what each program expects in its input and helps to create an appropriate input.
:    In computer science, a witness is a specific example that allows a program to confirm that some set of conditions is, or can be, satisfied. In the Simplicity context, those conditions are the rules allowing assets to be transferred by the contract, and the witness input allows the program to confirm that those rules were met with respect to a proposed transaction.
