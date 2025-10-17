# What's a Jet?

A **Jet** in Simplicity is a **pre-defined, highly optimized function**, usually written in **C**, that can replace a more general (and slower) Simplicity expression.

This process accelerates computation without changing the underlying meaning, which is crucial for blockchain performance.

Think of a Jet as a shortcut:

- Without Jets: Simplicity executes everything step by step using combinators (correct but slow).
- With Jets: the same logic runs much faster, but the result is **provably identical**.

---

## Why are Jets Important?

- **Performance**: Blockchain validation must be fast. Jets dramatically reduce computation time.
- **Security**: Each Jet is rigorously specified and formally proven to behave exactly like its Simplicity equivalent.
- **Consensus Safety**: Jets have fixed, predictable costs to prevent denial-of-service attacks.
- **Scalability**: More complex smart contracts become feasible without compromising verification speed.

## Jet Creation Process

The development of a Jet follows a **rigorous, multi-stage pipeline** to ensure its correctness and safety.

---

### 1. Prototyping with Simplicity Combinators

The initial phase involves building the desired functionality using only the fundamental building blocks (combinators) of Simplicity.

This serves as a high-level, human-readable blueprint.

### 2. Formal Specification

The Jet's behavior is described with mathematical precision in **Rocq/Coq**.

This specification is the “source of truth” against which all implementations (C, Haskell, Rust) are verified.

### 3. Haskell Implementation

A reference implementation is written in **Haskell**, a functional programming language.

This version is easier to reason about and serves as an intermediate step before low-level coding.

### 4. Optimised Native Code Implementation

A highly efficient version of the Jet is coded in **C**.

This is the implementation that will be executed by the Liquid or Bitcoin client for maximum performance.

### 5. Benchmarking and Costing for Consensus

The computational resources (CPU time, memory) required by the C implementation are measured precisely.

This data is used to assign a fixed **cost/weight** to the Jet for consensus rules, preventing denial-of-service attacks.

### 6. Formal Proof of Equivalence

Using a proof assistant like **Coq**, a formal, machine-checked proof is constructed.

This proves that the optimized C implementation is semantically identical to the formal specification.

### 7. Integration and Standardisation

Once fully verified and benchmarked, the Jet is integrated into the **core Simplicity library** and considered for standardization, making it available for general use in Liquid and Bitcoin scripts.

### 8. Deployment

Newer Jets are deployed to a Bitcoin **testnet** for real-world testing.
