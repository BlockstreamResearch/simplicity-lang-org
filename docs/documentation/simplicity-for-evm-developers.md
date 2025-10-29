# Simplicity for EVM Developers

Michael from [Boltz](https://boltz.exchange/) explaining EVM and Liquid differences

<div class="video-wrapper">
  <iframe width="825" height="540" src="https://www.youtube.com/embed/8Q1JPKvp7TE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Welcome, Solidity and EVM developers! You're used to a world of account-based models, Turing-complete languages, and sophisticated state management.

Simplicity, a new programming language from Blockstream Research, offers a fundamentally different approach, bringing high-assurance smart contracting to Bitcoin-style UTXO-based blockchains like Liquid.

While it operates on different principles, Simplicity aims to provide expressiveness **without sacrificing reliability**. Its design allows you to build sophisticated smart contracts and be confident in their outcomes.

This guide will help you navigate the key conceptual shifts as you transition into the Simplicity world.

## Key Differences: Simplicity vs. EVM/Solidity

| Aspect               | Simplicity (UTXO) | EVM / Solidity (Account) | Practical Migration Tip |
|-----------------------|------------------|--------------------------|--------------------------|
| **State Model**       | UTXO-based       | Account-based            | Replace global variables with UTXOs carrying contract data. To update state, consume the old UTXO and create a new one with the new state. |
| **Language**          | Simplicity (low-level, combinator-based) | Solidity (high-level, imperative) | Simplicity programs are pure, side-effect-free functions. Build logic by composing small operations instead of writing imperative code. Shift from “writing instructions” to “connecting transformations.” |
| **Turing Completeness** | No (bounded programs only) | Yes (limited by gas) | Rewrite loops as fixed-size unrolled logic; precompute where possible. |
| **Persistence**       | Stateless; data in UTXOs only | Contracts have permanent storage | Store state as commitments inside UTXOs. Carry forward data explicitly via transactions. |
| **Smart Contract Calls** | No native inter-contract calls | Inter-contract calls, libraries | Use transaction chaining to compose logic; each step handled by a different UTXO. |
| **Gas Model**         | Static resource bounds | Runtime gas estimation | Bounds (e.g. bit usage) are known at compile time → predictability. |
| **Determinism**       | Fully deterministic | Some non-deterministic values (`block.timestamp`) | Use pre-committed data and covenant-based enforcement. |
| **Security Model**    | No shared state; no reentrancy | Reentrancy, shared mutable state | No need for reentrancy guards; logic is isolated by design. |
| **Verification**      | Built-in formal verification support | Optional, often post-hoc | Simplicity enables **formal proofs of behavior upfront**. |
| **Deployment**        | Commit code hashes only | Deploy full code on-chain | Prepare full expressions off-chain; deploy only program commitments. |
| **Data Input/Output** | All inputs explicit | Calldata, storage reads | Define inputs/outputs clearly; all data must come via inputs/UTXOs. |
| **Oracles**           | Pre-committed or covenant-enforced | Chainlink & external calls | Use pre-signed data or UTXO conditions for oracle inputs. |

Simplicity and EVM differences

### Simplicity is so simple it fits on a T-shirt. Does that mean it's as limited as Bitcoin Script?

Absolutely not. While a complete description of Simplicity's core language does fit on a T-shirt, this simplicity refers to its foundational design and formal semantics, not its expressiveness.

Unlike Bitcoin Script, which is limited by design and lacks expressiveness for complex smart contracts, Simplicity aims to provide complete expressiveness for whatever computations you need. It is finitarily complete, meaning it can program all finite computations required for a powerful smart contract system. You can even verify Turing-complete off-chain computations on the main chain using Simplicity.

### Is Simplicity Turing-complete like EVM?

No, Simplicity is intentionally Turing-incomplete. This is a crucial design choice that sets it apart from languages like EVM. The reason for this is to enable static analysis.

Why Turing-incompleteness is a feature in Simplicity:

* Predictable Resource Costs: It allows you to determine how much any Simplicity program will cost to run before you stake your money on it. This prevents programs from consuming excessive memory or computation time, safeguarding against denial-of-service attacks. This contrasts with Ethereum's "out of gas" issues, where pre-paid fees can be lost if a program runs out of gas unexpectedly.  
* Guaranteed Termination: By disallowing unbounded loops and recursion, Simplicity ensures that all programs terminate. Bounded loops are achieved by unrolling the loop, with sub-expression sharing preventing unreasonable impacts on program size.  
* Enhanced Verifiability: The lack of Turing completeness contributes to the language's simplicity and analyzability, making it amenable to formal reasoning.

### How does Simplicity handle state, or does it have a global state like Ethereum?

Unlike EVM contracts that can access key-value data stores to maintain state across transactions, Simplicity has no state. Simplicity is a purely functional, expression-based language. Every Simplicity expression fundamentally denotes a function mapping input values to output values. It cannot directly express values; instead, it expresses constant functions that always produce the same output.

Simplicity operates within the Bitcoin UTXO (Unspent Transaction Output) model. In this model, funds are controlled by small programs. When you spend coins, you essentially provide evidence (witness data) that the program guarding those funds evaluates to true, allowing the transaction to proceed.

### How do I prove my Simplicity contract is correct? Do I write proofs in Simplicity itself?

You do not perform formal proofs in Haskell or Simplicity directly. Simplicity's formal specification and verification of its core language and semantics take place in the Coq proof assistant.

The proof process works as follows:

* Simplicity's semantics have a precise mathematical model defined in Coq, which allows for rigorous proofs of correctness.

* You can directly prove correctness properties about your specific smart contract written in Simplicity using formal methods within the Coq framework. This means you can formally verify every step.  

* This approach empowers users to create formal proofs of correctness for their smart contracts before deployment, addressing the immutability problem of blockchain smart contracts where mistakes cannot be corrected once deployed. For instance, you can prove that coins cannot be moved without a specific signature, or that a program won't exceed a memory threshold.  

* The Haskell implementation is primarily used for constructing and prototyping Simplicity programs. These programs are then the *subject* of formal proofs conducted in Coq. There is no formalized connection between the Haskell library and Simplicity's formal semantics in Coq, so the Haskell library is intended for experimental development, not production where formal proofs are critical.

### Simplicity is a low-level language. Will I be writing contracts directly in it, or is there a higher-level abstraction?

While Simplicity is an extremely low-level language, akin to assembler, you are not expected to write contracts directly in it for most applications.

Higher-level languages and tools are available:

* **SimplicityHL**: This is a developer-friendly "front-end" language that compiles down to Simplicity assembly. It has a syntax similar to Rust, abstracting away some of Simplicity's functional programming details to make it more accessible.

* **SimplicityHL web-IDE:** You can start experimenting with Simfony using the web IDE, which includes example programs.

* **Haskell Implementation**: This provides a way to construct Simplicity programs in a tagless-final style, which transparently handles sharing of subexpressions. The [`Haskell-Examples`](https://github.com/BlockstreamResearch/simplicity/tree/master/Haskell-Examples) folder in the Simplicity repository contains various Simplicity expressions written in Haskell.  

* **Future Higher-Level Languages**: The ultimate vision is for users to write contracts in various higher-level languages that then compile down to Simplicity code alongside proofs of their correct operation.

### What are 'Jets' and how do they make complex operations efficient?

**Jets are a key concept for efficiency and extensibility in Simplicity**.

* A jet is a single combinator that replaces a larger Simplicity expression, known as its "specification".  

* While the core Simplicity language is concise, complex programs built solely from its basic combinators could be kilobytes of code and take minutes to execute.  

* Jets solve this by allowing the Simplicity interpreter to evaluate the jet either by evaluating its Simplicity specification or by using optimized machine code (often C implementations) that has the same effect.  

* Crucially, these optimised implementations are formally proven equivalent to their Simplicity specifications in Coq. For example, the SHA-256 compression function and libsecp256k1 elliptic curve operations have been reimplemented and formally verified in Simplicity.  

* This approach opens a clear path for introducing new features and optimisations without constant soft forks. Simplicity's comprehensive "catalog of jets" includes cryptographic functions, arithmetic operations, and Bitcoin-related operations like timelocks.

### How does Simplicity handle inputs and external data, like signatures or transaction details?

Simplicity programs interact with data through explicit mechanisms:

* **Witness Combinators**: The `witness` combinator returns a value provided at evaluation time, serving as inputs to Simplicity programs. These are analogous to Bitcoin Script's input stack in its `sigScript` or SegWit's witness. Type inference ensures witness data only contains nominally useful data and prevents padding with unused bits.

* **Blockchain Primitives (Introspection)**: Simplicity includes primitive expressions that allow programs to read data from the transaction context where they are executed. This includes details about the transaction's inputs and outputs, locktime, and the commitment Merkle root of the program itself.  

* **Assertions**: The `assert` and `fail` expressions allow programs to halt execution if certain conditions are not met. This is similar to Bitcoin Script's `OP_VERIFY` or Ethereum's `STOP` opcode, validating checks like digital signature verification.

### How does Simplicity's program structure differ from Solidity, especially regarding privacy and efficiency?

Simplicity's structure is deeply rooted in functional programming and designed for efficiency and privacy:

* **Combinator-Based**: Simplicity expressions are constructed from a small set of basic combinators (like `comp`, `pair`, `witness`, `iden`, `unit`, `injl`, `injr`, `take`, `drop`, `case`) which build up expressions from smaller ones.  

* **Merkelized Abstract Syntax Trees (MASTs)**: Simplicity natively integrates MASTs. This means programs are arranged into trees, and only the portions necessary for redemption are revealed, pruning away unused parts. This increases privacy and decreases block space requirements.  

* Simplicity enables transparent sharing of identical subexpressions within a program. This allows complex logic, such as bounded loops, to be expressed more compactly. Even though shared subexpressions can make a program appear smaller than the work it performs, Simplicity’s static analysis ensures that all programs have a known upper bound on resource usage, maintaining predictable and safe execution limits.

### What's the type system like in Simplicity? Does it have rich data structures?

Simplicity's type system is fundamental and rigorously defined:

* **Strictly Typed**: Unlike Bitcoin’s existing scripting language, Simplicity enforces strict typing rules, which helps eliminate certain classes of bugs and vulnerabilities.  

* **Simple Type Forms**: All types in Simplicity are combinations of just three basic forms:
  * **Unit Type (1)**: Defines exactly one possible value, representing an "empty output"
  * **Product Type (A × B)**: Composes a pair of types using an "and" operation, similar to tuples or records
  * **Sum Type (A + B)**: Combines two types in an "or" operation, similar to `Either` types in functional languages or tagged unions.
* **Finite Types**: All types in Simplicity are finite. This means infinite or recursive types are not possible, ensuring termination and enabling rigorous analysis and verification.

* **No Function Types or Named Variables**: Simplicity has neither function types nor higher-order functions. It also has no named variables, relying on combinators to avoid binders and environments for bound variables.

* **Type Inference:** Simplicity uses first-order unification to perform type inference on Simplicity expressions, replacing any remaining type variables with the unit type. Because the types of pruned branches are discarded, the inferred types may end up smaller than in the originally committed program.

## Comparing Simplicity and Solidity Scripts

Here's an example that shows the differences between both languages. An oracle signs a message with the current block height and the current price. The block height is compared with a minimum height to prevent the use of old data. The transaction is timelocked to the oracle height, which means that the transaction becomes valid after the oracle height.

### Simplicity Example ([source](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/hodl_vault.simf))

```rust
fn checksig(pk: Pubkey, sig: Signature) {
    let msg: u256 = jet::sig_all_hash();
    jet::bip_0340_verify((pk, msg), sig);
}

fn checksigfromstack(pk: Pubkey, bytes: [u32; 2], sig: Signature) {
    let [word1, word2]: [u32; 2] = bytes;
    let hasher: Ctx8 = jet::sha_256_ctx_8_init();
    let hasher: Ctx8 = jet::sha_256_ctx_8_add_4(hasher, word1);
    let hasher: Ctx8 = jet::sha_256_ctx_8_add_4(hasher, word2);
    let msg: u256 = jet::sha_256_ctx_8_finalize(hasher);
    jet::bip_0340_verify((pk, msg), sig);
}

fn main() {
    let min_height: Height = 1000;
    let oracle_height: Height = witness::ORACLE_HEIGHT;
    assert!(jet::le_32(min_height, oracle_height));
    jet::check_lock_height(oracle_height);

    let target_price: u32 = 100000; // laser eyes until 100k
    let oracle_price: u32 = witness::ORACLE_PRICE;
    assert!(jet::le_32(target_price, oracle_price));

    let oracle_pk: Pubkey = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798; // 1 * G
    let oracle_sig: Signature = witness::ORACLE_SIG;
    checksigfromstack(oracle_pk, [oracle_height, oracle_price], oracle_sig);

    let owner_pk: Pubkey = 0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5; // 2 * G
    let owner_sig: Signature = witness::OWNER_SIG;
```

### Solidity Example

```javascript
pragma solidity ^0.8.0;

contract HodlVault {
    address public oracle;
    address payable public recipient;
    uint256 public priceThreshold; // e.g. $70,000 => 70000 * 1e8 if using 8 decimals
    uint256 public minBlockHeight;
    bool public claimed;

    event Claimed(address recipient, uint256 price, uint256 blockHeight);

    constructor(
        address _oracle,
        address payable _recipient,
        uint256 _priceThreshold,
        uint256 _minBlockHeight
    ) payable {
        oracle = _oracle;
        recipient = _recipient;
        priceThreshold = _priceThreshold;
        minBlockHeight = _minBlockHeight;
    }

    // Oracle-signed message format:
    // price: uint256 (e.g., 7000000000 for $70,000.0000)
    // blockHeight: uint256
    // v, r, s: ECDSA signature
    function claim(uint256 price, uint256 blockHeight, uint8 v, bytes32 r, bytes32 s) external {
        require(!claimed, "Already claimed");
        require(price >= priceThreshold, "Price below threshold");
        require(blockHeight >= minBlockHeight, "Oracle block too old");
        require(block.number >= blockHeight, "Timelock: wait for oracle block");

        // Reconstruct the message the oracle signed
        bytes32 message = keccak256(abi.encodePacked(price, blockHeight));
        bytes32 ethSignedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        address recovered = ecrecover(ethSignedMessage, v, r, s);
        require(recovered == oracle, "Invalid oracle signature");

        claimed = true;
        recipient.transfer(address(this).balance);
        emit Claimed(recipient, price, blockHeight);
    }
}
```
