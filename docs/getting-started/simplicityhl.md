# Programming in SimplicityHL

## Introduction

SimplicityHL is a high-level functional language that compiles to Simplicity. This guide provides an overview of programming concepts.

---

## Your First Contract

### Hello Simplicity

```rust
fn main() {
    // This contract always succeeds
}
```

**What this means:**

- Every contract has a `main()` function
- if `main()` does not abort, it is considered to have succeeded; you can think
  of "did the function reach its end" as an implicit boolean return
- No side effects other than aborts and read-only access to witness data and the transaction environment
  (no state)

### Compiling Contracts

SimplicityHL compiles to Simplicity bytecode through several stages:

**Code reference:** [`SimplicityHL/src/compile.rs`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/src/compile.rs)

1. **Parse** - Source code to AST
2. **Type Check** - Verify types are correct
3. **Translate** - AST to Simplicity combinators

**Result:** A Simplicity program, identified by its unique 32-byte Commitment Merkle Root (CMR).
See "What is the CMR?" below for more information.

---

## Understanding the Contract Model

### How Contracts Execute

**On-chain:**
```
Transaction → Simplicity VM → Your Program + Witness → abort/pass
```

* **If aborts:** Transaction is rejected
* **Otherwise:** Transaction is valid

**No state:** Contracts are stateless - they validate only

**Total:** Every program runs in finite time for all inputs (and it is efficiently possible
to compute bounds on this time; see "Cost and Resource Bounds" below)

### Witness Data

**What is witness?**

Data provided when spending that the contract can access.

**Example:**
```rust
fn main() {
    let sig: Signature = witness::signature;
    // Use sig in validation
}
```

**Witness file format:**
```json
{
  "signature": {
    "value": "0x...",
    "type": "Signature"
  }
}
```

---

## Types in SimplicityHL

### Basic Types

```rust
// Unit type (empty)
let unit: () = ();

// Booleans
let flag: bool = true;

// Unsigned integers
let small: u8 = 255;
let medium: u16 = 65535;
let large: u32 = 4294967295;
let huge: u64 = 18446744073709551615;

// 256-bit values
let hash: u256 = 0xabc123...;

// Cryptographic types
let pubkey: Pubkey = 0x02...;
let sig: Signature = 0x...;
```

### Product Types (Tuples)

```rust
let pair: (u64, u64) = (100, 200);
let triple: (u64, u64, bool) = (1, 2, true);

// Destructuring
let (a, b): (u64, u64) = pair;
```

### Sum Types (Either)

```rust
// Either left or right
let choice: Either<u64, bool> = Left(42);
let other: Either<u64, bool> = Right(true);

// Pattern matching
match choice {
    Left(n: u64) => {
        // n is a u64
    },
    Right(b: bool) => {
        // b is a bool
    }
}
```

### Option Types

```rust
let maybe: Option<u64> = Some(42);
let nothing: Option<u64> = None;

match maybe {
    Some(value: u64) => {
        // Have a value
    },
    None => {
        // No value
    }
}
```

---

## Jets - Built-in Operations

### Cryptographic Jets

```rust
// BIP-340 Schnorr signature verification (from p2pk.simf)
jet::bip_0340_verify((pubkey, message), signature) -> bool

// SHA-256 hashing
jet::sha_256(data) -> u256

// Get transaction sighash
jet::sig_all_hash() -> u256
```

**From:** [`examples/p2pk.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2pk.simf)

**Implementation:** [`rust-simplicity/src/jet/`](https://github.com/BlockstreamResearch/rust-simplicity/tree/master/src/jet)

### Arithmetic Jets

```rust
// Addition
jet::add_64(a, b) -> u64

// Subtraction (with carry flag)
jet::subtract_64(a, b) -> (bool, u64)

// Multiplication
jet::multiply_64(a, b) -> u64

// Division with remainder
jet::div_mod_64(dividend, divisor) -> (quotient, remainder)
```

### Comparison Jets

```rust
// Equality
jet::eq_64(a, b) -> bool
jet::eq_256(hash1, hash2) -> bool

// Less than
jet::lt_64(a, b) -> bool

// Greater than
// Implement as: !jet::lt_64(a, b) && !jet::eq_64(a, b)
```

### Transaction Introspection Jets

```rust
// Get current input index
jet::current_index() -> u32

// Get input amount
jet::input_amount(index) -> Option<(Asset1, Amount1)>

// Get output amount
jet::output_amount(index) -> Option<(Asset1, Amount1)>

// Get output script hash
jet::output_script_hash(index) -> Option<u256>

// Check locktime
jet::check_lock_time(timestamp) -> ()
```

**These jets let contracts inspect the transaction they're validating.**

---

## Common Patterns

### Pattern: Signature Verification

```rust
fn main() {
    jet::bip_0340_verify((param::ALICE_PUBLIC_KEY, jet::sig_all_hash()), witness::ALICE_SIGNATURE)
}
```

**From:** [`examples/p2pk.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/p2pk.simf)

**Use case:** Single-signature contract (P2PK)

### Pattern: Absolute Time Lock

```rust
fn main() {
    // Can only spend after Jan 1, 2025
    jet::check_lock_time(1735689600);
}
```

**Use case:** Timelocked payments, vesting

### Pattern: Relative Time Lock

```rust
fn main() {
    let timeout: Distance = 1000;
    jet::check_lock_distance(timeout);
}
```

**From:** [`examples/escrow_with_delay.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/escrow_with_delay.simf)

**Use case:** Refunds after timeout

### Pattern: Signature Check Helper

```rust
fn checksig(pk: Pubkey, sig: Signature) {
    let msg: u256 = jet::sig_all_hash();
    jet::bip_0340_verify((pk, msg), sig);
}

fn main() {
    let pk: Pubkey = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798;
    checksig(pk, witness::signature);
}
```

**From:** [`examples/escrow_with_delay.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/escrow_with_delay.simf)

**Use case:** Reusable signature verification

---

## Working with Transaction Data

### The Transaction Environment

When your contract executes, it has access to the transaction via jets.

**Code reference:** [`rust-simplicity/src/jet/elements/environment.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/jet/elements/environment.rs)

**Available data:**

- Input amounts and assets
- Output amounts and assets
- Output script hashes (where money goes)
- Current input index
- Block time (for locktimes)
- Genesis hash

### Transaction Introspection Example

**Contracts can inspect transaction data:**

**From examples like CTV (CheckTemplateVerify) and vault contracts:**

- Check output script hashes
- Verify output amounts
- Validate asset types
- Enforce spending conditions

**See:** [`examples/ctv.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/ctv.simf) for covenant patterns

---

## Understanding Commitment Merkle Roots (CMRs)

### What is the CMR?

A CMR (Commitment Merkle Root) is a 32-byte hash that uniquely identifies your Simplicity program.

**Properties:**

- Same code = same CMR (deterministic)
- Different code = different CMR (cryptographically binding)
- CMR commits to entire program structure, **excluding** witness data and program data attached to the `disconnect` combinator
- Same CMR = same contract = same address

**Code reference:** [`rust-simplicity/src/merkle/cmr.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/merkle/cmr.rs)

**How it's computed:**

1. Each Simplicity combinator has a tag
2. Combinators form a Merkle tree
3. CMR is the root hash

---

## From Contract to Address

### The Taproot Construction

**Code reference:** [`rust-simplicity/src/policy/sighash.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/policy/sighash.rs)

```
Your Contract (.simf)
        ↓ Compile
    Simplicity Bytecode (identified by its CMR)
        ↓ Create Taproot Tree
    Merkle Root
        ↓ Combine with Internal Key
    Taproot Output Key
        ↓ Encode
    P2TR Address (tex1p...)
```

**Internal Key:** A provably unspendable public key (NUMS point)

**Standard:** `50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0`

**Why unspendable:** If you used a real key, you could spend via keypath, bypassing the contract.

---

## Sighash Explained

### What Gets Signed

When spending a Simplicity contract, signatures commit to a **sighash**. A sighash commits to
an arbitrary set of transaction data; typically users want to use the `SIGHASH_ALL` sighash
which commits to the entire transaction and its inputs.

**Code reference:** [`rust-simplicity/src/policy/sighash.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/policy/sighash.rs#L83-L94)

**`SIGHASH_ALL` includes:**

- All transaction inputs
- All transaction outputs
- Locktime
- Sequence numbers
- Genesis hash (which acts as a network identifier)
- Spent UTXO data

**Computation:**
```rust
let tx_env = ElementsEnv::new(
    transaction,
    utxos,
    input_index,
    cmr,
    control_block,
    None,
    genesis_hash
);

let sighash: [u8; 32] = tx_env.c_tx_env().sighash_all();
```

**In your contract:**
```rust
let msg: u256 = jet::sig_all_hash();  // Gets the sighash
```

**Why include the genesis hash?**

Liquid Testnet:
```
a771da8e52ee6ad581ed1e9a99825e5b3b7992225534eaa2ae23244fe26ab1c1
```

Liquid Mainnet:
```
1466275836220db2944ca059a3a10ef6fd2ea684b0688d2c3792968888a206003
```

Including the genesis hash in the signature hash ensures that a given signature can
only work on the network it is intended for, preventing confusion between blockchains
(such as a test network and a production network).

---

## Witness Structure

### How Witness Data Works

**Code reference:** [`rust-simplicity/src/node/redeem.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/node/redeem.rs)

**When spending, the witness contains:**

```
witness = [
  [0] witness_bytes    ← Your witness data (sigs, values, etc.)
  [1] program_bytes    ← Simplicity program bytecode
  [2] cmr_bytes        ← 32-byte CMR
  [3] control_block    ← Taproot proof + internal key info
]
```

**Encoding:**
```rust
let (program_bytes, witness_bytes) = redeem_node.encode_to_vec();

tx.input[0].witness = TxInWitness {
    script_witness: vec![
        witness_bytes,
        program_bytes,
        cmr.as_ref().to_vec(),
        control_block.serialize(),
    ],
    ...
};
```

**Size limits:** Larger witness = more cost. Simplicity has budget constraints based on witness size.

---

## Cost and Resource Bounds

### Understanding Cost

**Cost** = computational work to execute your program

**Code reference:** [`rust-simplicity/src/analysis.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/analysis.rs)

**Limits:**

- Maximum cost: `2^20` (1,048,576) weight units
- Exceeding this makes transaction invalid

**Tools can check contract cost** and show resource usage statistics.

### Budget and Padding

**Budget** depends on witness size:
```
available_budget = f(witness_size)
```

If witness is large, you may need **padding** to satisfy budget constraints.

**Code reference:** [`rust-simplicity/src/analysis.rs`](https://github.com/BlockstreamResearch/rust-simplicity/blob/master/src/analysis.rs)

```rust
if let Some(padding) = bounds.cost.get_padding(&script_witness) {
    script_witness.push(padding);
}
```

Development tools handle padding automatically.

---

## Advanced Programming

### Using Parameters

**Compile-time parameters:**

```rust
fn main() {
    let threshold: u64 = param::THRESHOLD;
    let amount: u64 = witness::amount;

    assert!(amount >= threshold);
}
```

**Provide at compile time:**
```json
{
  "THRESHOLD": 100000
}
```

---

## Testing Contracts

### Local Execution

**Development tools allow testing contracts locally before deployment.**

**Features:**

- Execution trace
- Jet calls with inputs/outputs
- Debug output from `dbg!()` statements

**See:** [CLI Guide](cli.md) for testing workflows

---

## Common Errors

### 1. Type Mismatches

**Error:**
```
Expected type u64 but got u256
```

**Solution:** Use explicit type casting or correct type.

### 2. Cost Exceeds Limits

**Error:**
```
Program cost exceeded maximum
```

**Solution:**

- Simplify logic
- Reduce jet calls
- Optimize program structure

### 3. Witness Type Mismatch

**Error:**
```
Witness 'signature' was declared with type Signature but assigned value is of type u256
```

**Solution:** Ensure witness file types match contract declarations.

---

## Development Tools

### simply

**Installation:**
```bash
cargo install --git https://github.com/starkware-bitcoin/simply simply
```

**Testing capabilities:**

**Build contracts:**
```bash
simply build --entrypoint contract.simf
```
Shows cost, memory usage, and compilation success.

**Run contracts locally:**
```bash
simply run --entrypoint contract.simf --logging debug
```
Executes contract with BitMachine, shows:

- Execution trace
- Jet calls with inputs/outputs
- Debug output

**Test suites:**
```bash
simply test
```
Finds and runs all `test_*` functions in your `.simf` files.

**Deploy contracts:**
```bash
simply deposit --entrypoint contract.simf
```
Generates P2TR address for funding.

```bash
simply withdraw --entrypoint contract.simf --txid <txid> --destination <address>
```
Builds and broadcasts spending transaction.

**See:** [CLI Guide](cli.md) for complete workflow

---


