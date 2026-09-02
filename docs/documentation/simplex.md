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

### Persistent regtest instance

`simplex test` normally spins up and tears down its own `elementsd`/Electrs pair for each run. Run `simplex regtest` in a separate terminal to instead start a standalone, long-lived node pair, then point `simplex test` at it via the `[test.rpc]`/`[test.esplora]` entries in `Simplex.toml`. This is useful when you want to inspect chain state between test runs instead of starting from scratch every time.

## Examples

`BlockstreamResearch/smplx/examples` contains sample Simplex projects demonstrating how to create integration tests.

The current examples are

* `examples/basic` (demonstrates a pay-to-public-key contract, called `p2pk.simf`)
<!-- * `examples/last_will` (demonstrates a recursive covenant with a timeout-based inheritance mechanism, called `last_will.simf`) -->

Each has a `README.md` file describing the project and how to invoke its Simplex test suite.
