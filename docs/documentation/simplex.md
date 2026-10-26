# Simplex

Simplex is a development framework and orchestration tool for SimplicityHL smart contracts. It assumes a Rust development environment, and helps you create applications and tools in Rust to interact with the underlying contract.

Simplex facilitates creating and running realistic smart contract integration tests, providing a straightforward way to define and run a suite of such tests in Rust. It automatically runs tests against a local instance of `elementsd`, creating a customizable [Liquid Network](../glossary.md#liquid)-like environment for test transactions. Thus, tests can be run without broadcasting transactions publicly on Liquid testnet.

A Simplex project's `Simplex.toml` file (automatically created by `simplex init`, as described below) configures the details of this test environment.

## Installing Simplex

You can get Simplex from [https://github.com/BlockstreamResearch/smplx](https://github.com/BlockstreamResearch/smplx), or use the auto-install script:

```bash
curl -L https://smplx.simplicity-lang.org | bash
simplexup
```

When Simplex is installed with `simplexup`, you can rerun `simplexup` at any time to upgrade to the most recent release.

## Using Simplex

### Creating a project

Run `simplex init` at the top-level directory of the project. This is ordinarily the same as the top-level directory of the associated Rust project (where the `Cargo.toml` file is found).

This step will add a complete starter project in place: `Cargo.toml` (already depending on `smplx-std`), `Simplex.toml`, `src/lib.rs` to let Rust code reference generated [artifacts](../glossary.md#artifacts), and starter contracts and tests.

Add or replace SimplicityHL source files in `simf/` as you go so Simplex can find them.

### Building artifacts

Run `simplex build` at the top-level directory of the project.

This process analyzes the SimplicityHL source code in `simf/` and creates corresponding Rust library files in `src/artifacts`, suitable for including from other Rust code. These library files define functions to build [witnesses](../glossary.md#witness) and blockchain [transactions](../glossary.md#transaction) to drive the individual SimplicityHL contract(s) within the Simplex project.

Whenever the SimplicityHL source code changes, re-run `simplex build` to regenerate the artifacts and keep them in sync with the contract's expectations.

???+ "SimplicityHL package dependencies"
    If your contract's `.simf` import a separate SimplicityHL package (via `use` of an external crate, not just a local module), list it under `[dependencies]` in `Simplex.toml` and run `simplex install` to fetch it before building.

### Creating tests

Create `.rs` files in `tests/` containing your integration tests. Each such file defines a series of named integration tests as Rust functions, each with a prototype like

```rust
#[simplex::test]
fn test_name(context: simplex::TestContext) -> anyhow::Result<()> {
    // Test code goes here.
    Ok(())
}
```

### Running tests

Run `simplex test` to execute your complete integration test suite against a local `elementsd`. Adding `-v` will display verbose output from the tests.

Pass a name to run just one file's tests.

### Fuzz tests

Since Simplex 0.1.0, *fuzz tests* can check a contract's logic and invariants against many randomly generated inputs instead of one hand-built transaction. Fuzz tests run entirely locally and don't start or contact `elementsd`. Simplex itself runs the contract internally in a Simplicity bit machine environment.

A fuzz test is marked `#[simplex::fuzz]`, receives a `TestContext<FuzzMode>`, and runs a fuzz engine for one contract, named by the program, arguments, and witness types that `simplex build` generated for it:

```rust
#[simplex::fuzz]
fn fuzz_test_name(context: simplex::TestContext<simplex::FuzzMode>) -> anyhow::Result<()> {
    context
        .engine::<MyContractProgram, MyContractArguments, MyContractWitness>()
        .run();

    Ok(())
}
```

For each case, the engine generates values for the contract's arguments and witness, compiles the contract with those arguments, spends it in a test transaction, and executes it. By default, a case fails if execution fails. A custom check can instead expect a particular failure, such as a failed `assert!`, or test any other property of the transaction, arguments, witness, and execution result.

As with integration tests, both positive and negative expected results may be useful. Tests may check the contract's ability both to allow valid transactions and to reject invalid transactions.

The default strategy draws integer values from a mix of uniformly random values, boundary values (such as 0, 1, powers of two and one less than them, and the type's maximum), and integer literals that appear in the contract's source code, plus or minus one. It also sometimes copies one generated value into another field of the same case, so comparisons between fields are exercised. These choices make the fuzzer more likely to find the specific values at which a contract's behavior changes. A purely random strategy is also available.

Randomly generated values are almost never valid signatures, so a contract that checks a signature would reject nearly every case. A fuzz test can ask the test signer to replace a named witness value, such as `SIGNATURE`, with a valid signature over each generated transaction. [`examples/basic/tests/basic_fuzz.rs`](https://github.com/BlockstreamResearch/smplx/blob/master/examples/basic/tests/basic_fuzz.rs) shows this for a pay-to-public-key contract.

Run `simplex test --fuzz` to execute fuzz tests. Plain `simplex test` doesn't run them. The `[test.fuzz]` section of `Simplex.toml` sets the number of cases (`cases`), a fixed random seed (`seed`), and the network whose parameters the test transactions use (`network`). When a fuzz test finds a failing case, Simplex saves its seed and generated values in a `fuzz-failures/` directory, and later runs replay saved cases before generating new ones.

### Persistent regtest instance

`simplex test` normally spins up and tears down its own `elementsd`/Electrs pair for each run. Run `simplex regtest` in a separate terminal to instead start a standalone, long-lived node pair, then point `simplex test` at it via the `[test.rpc]`/`[test.esplora]` entries in `Simplex.toml`. This is useful when you want to inspect chain state between test runs instead of starting from scratch every time.

## Examples

[`BlockstreamResearch/smplx/examples`](https://github.com/BlockstreamResearch/smplx/tree/master/examples) contains sample Simplex projects demonstrating how to create integration tests.

The current examples are

* `examples/basic` (demonstrates a pay-to-public-key contract, called `p2pk.simf`, with both integration tests and fuzz tests)
<!-- * `examples/last_will` (demonstrates a recursive covenant with a timeout-based inheritance mechanism, called `last_will.simf`) -->

Each has a `README.md` file describing the project and how to invoke its Simplex test suite.

You can also experiment with Simplex online in your browser using the [Simplicity Codespace](https://github.com/codespaces/new/blockstream/simplicity-codespace).
