# Simplex

Simplex is a development framework and orchestration tool for [SimplicityHL](../glossary.md#simplicityhl) smart contracts. It assumes a Rust development environment, and helps you create applications and tools in Rust to interact with the underlying contract.

Simplex defines and runs realistic smart contract integration tests in Rust. It runs the tests against a local instance of [`elementsd`](../glossary.md#elementsd), which provides a customizable [Liquid Network](../glossary.md#liquid)-like environment for test transactions, so the tests don't broadcast any transactions on Liquid testnet.

A Simplex project's `Simplex.toml` file (automatically created by `simplex init`, as described below) configures the details of this test environment.

## Installing Simplex

You can get Simplex from the [smplx repository](https://github.com/BlockstreamResearch/smplx), or use the auto-install script:

```bash
curl -L https://smplx.simplicity-lang.org | bash
simplexup
```

When Simplex is installed with `simplexup`, you can rerun `simplexup` at any time to upgrade to the most recent release.

## Rust SDK

Simplex includes a [Rust SDK](https://docs.rs/smplx-sdk) with modules that compile SimplicityHL programs, build [witnesses](../glossary.md#witness) and [transactions](../glossary.md#transaction), and execute programs locally or in on-chain transactions. Applications and integration tests can use it to construct and spend contract transactions.

## Using Simplex

The `simplex` command-line tool creates projects, builds contracts, and runs tests, as described below.

### Creating a project

Create a project in a new directory, then enter it:

```bash
simplex init my_contract
cd my_contract
```

Simplex prints `Config written to:` followed by the new `Simplex.toml` path. Choose a directory name that doesn't already exist. If `my_contract` already exists, `simplex init my_contract` reports `entity already exists`; choose another name.

The new directory contains `Cargo.toml` (already depending on `smplx-std`), `Simplex.toml`, `src/lib.rs` to let Rust code reference generated [artifacts](../glossary.md#artifacts), `.gitignore`, a starter contract at `simf/p2pk.simf`, and a test template at `tests/p2pk_test.rs`.

!!! warning "Initializing in place overwrites starter files"
    Running `simplex init` without a name writes these files into the current directory and overwrites existing files at those paths. Use it only in an empty directory. To add Simplex to an existing Rust project, create the starter project separately and merge the required files and dependency into your project.

Add or replace SimplicityHL source files in `simf/` as you go so Simplex can find them.

### Building artifacts

Run `simplex build` at the top-level directory of the project.

This process analyzes the SimplicityHL source code in `simf/` and creates corresponding Rust library files in `src/artifacts`, suitable for including from other Rust code. These library files define functions to build witnesses and blockchain transactions that spend from the individual SimplicityHL contract(s) within the Simplex project.

Whenever the SimplicityHL source code changes, re-run `simplex build` to regenerate the artifacts and keep them in sync with the contract's expectations.

???+ "SimplicityHL package dependencies"
    If your contract's `.simf` files import a separate SimplicityHL package (via `use` of an external crate, not just a local module), list it under `[dependencies]` in `Simplex.toml` and run `simplex install` to fetch it before building.

### Creating tests

Create `.rs` files in `tests/` containing your integration tests. Each such file defines a series of named integration tests as Rust functions, each with a prototype like this:

```rust
#[simplex::test]
fn test_name(context: simplex::TestContext) {
    // Test code goes here.
}
```

### Running tests

Run `simplex test` to execute your complete integration test suite against a local `elementsd`. Adding `-v` will display verbose output from the tests.

Pass one or more names to run only tests whose names match. Use `--target <name>` to run the tests in one file, where `<name>` is the file name in `tests/` without `.rs`.

### Persistent regtest instance

`simplex test` normally spins up and tears down its own `elementsd`/Electrs pair for each test. Run `simplex regtest` in a separate terminal to instead start a standalone, long-lived node pair, then point `simplex test` at it via the `[test.rpc]`/`[test.esplora]` entries in `Simplex.toml`. This is useful when you want to inspect chain state between test runs instead of starting from scratch every time.

By default, `simplex regtest` picks free ports and authenticates with the node's cookie, so the URLs and credentials change each time it starts. It prints the current values and then waits for Ctrl-C:

```text
======================================
Waiting for Ctrl-C...

RPC: http://127.0.0.1:<rpc port>
Esplora: http://127.0.0.1:<esplora port>
User: "<rpc user>", Password: "<rpc password>"

Signer: <signer address>
======================================
```

Copy the URLs, user, and password into `Simplex.toml`. The user and password are printed as quoted strings that you can paste as they are:

```toml
[test.esplora]
url = "http://127.0.0.1:<esplora port>"
network = "ElementsRegtest"

[test.rpc]
url = "http://127.0.0.1:<rpc port>"
username = "<rpc user>"
password = "<rpc password>"
```

When `[test.rpc]` is present, `network` must be `ElementsRegtest`. Any other value fails with ``Network name should be `ElementsRegtest` when RPC is specified, got: <network>``.

To keep the same values across restarts, set them under `[regtest]` instead. `rpc_port` and `esplora_port` each fix one port, and `rpc_user` and `rpc_password` replace cookie authentication when you set both:

```toml
[regtest]
rpc_port = 18443
esplora_port = 3000
rpc_user = "user"
rpc_password = "password"
```

At startup, `simplex regtest` sends [regtest](../glossary.md#regtest) coins to the wallet derived from the `mnemonic` under `[regtest]`. The tests sign with the wallet derived from the `mnemonic` under `[test]`. Both settings default to the same phrase, so if you change one, change the other to match.

### Fuzz tests

Simplex (0.1.0+) can also run *fuzz tests*, which check a contract's logic and invariants against many randomly generated inputs instead of one hand-built transaction. Fuzz tests run entirely locally and don't start or contact `elementsd`. Simplex itself runs the contract internally in a Simplicity bit machine environment.

A fuzz test is marked `#[simplex::fuzz]`, receives a `TestContext<FuzzMode>`, and runs a fuzz engine on a *scenario*: a template transaction together with the contracts that spend its inputs or lock its outputs. This test fuzzes the starter project's pay-to-public-key contract, which spends input 0 (0.2.0+). Build the [starter project's artifacts](#building-artifacts), then save it as `tests/p2pk_fuzz.rs` in the `my_contract` project created above:

```rust
use simplex::{FuzzMode, TestContext};

use simplex::fuzz::Scenario;
use simplex::transaction::{FinalTransaction, PartialInput, ProgramInput, ProgramSignature};

use simplex_my_contract::artifacts::p2pk::P2pkProgram;
use simplex_my_contract::artifacts::p2pk::derived_p2pk::{P2pkArguments, P2pkWitness};

#[simplex::fuzz]
fn p2pk_fuzz_test(context: TestContext<FuzzMode>) {
    let signer = context.get_default_signer();

    let public_key = signer.get_schnorr_public_key().serialize();
    let program = P2pkProgram::new(P2pkArguments { public_key }).as_ref().clone();

    // Ask the signer to replace each fuzzed `SIGNATURE` with a valid signature.
    let mut transaction = FinalTransaction::new();
    transaction.add_program_input(
        PartialInput::default(),
        ProgramInput::new(Box::new(program), P2pkWitness::default()),
        Some(ProgramSignature::new("SIGNATURE")),
    );

    let mut scenario = Scenario::new(transaction);
    // Keep the signer's public key fixed while fuzzing the witness.
    scenario
        .add::<P2pkProgram>("p2pk")
        .spends(0)
        .bind_arguments(move |arguments, _| arguments.public_key = public_key);

    context.engine(scenario).run();
}
```

`Scenario::add::<P>(name)` adds a contract to the scenario, and `spends(index)` and `locks(index)` name the transaction input it spends and the output it locks. For each case, the engine generates values for each contract's arguments and witness, builds the transaction, and executes it. `bind_arguments` and `bind_witness` set values from the case instead of generating them. In the example, `bind_arguments` keeps the public key equal to the test signer's.

Randomly generated values are almost never valid signatures, so a contract that checks a signature would reject nearly every case. `ProgramSignature::new("SIGNATURE")` asks the test signer to replace the witness value named `SIGNATURE` with a valid signature over each generated transaction.

By default, the engine expects every spend to be accepted, and a case fails if execution fails. To test that a contract rejects invalid spends, call `spec` on the engine with a closure that returns `Expect::Accept`, `Expect::Reject`, or `Expect::Any` for each case. `mutations` changes the transaction's amounts, assets, timelocks, or layout in half the cases, and the spec judges the mutated transaction. For each accepted spend, the engine also checks that the outputs the contract locks can't be redirected and that the spend depends on its signatures. `without_lock_check` and `without_auth_check` turn these checks off.

The default strategy draws integer values from a mix of uniformly random values, boundary values (such as 0, 1, powers of two and one less than them, and the type's maximum), integer literals that appear in the contract's source code or in the scenario's transaction (such as its amounts), plus or minus one, and indices up to the transaction's input or output count, whichever is larger. It also sometimes copies one generated value into another field of the same case, so comparisons between fields are exercised. These choices make the fuzzer more likely to find the specific values at which a contract's behavior changes. Call `random_strategy` on a contract in the scenario to draw its values uniformly at random instead, or `custom_strategy` to supply your own.

Run `simplex test --fuzz` to execute fuzz tests. Plain `simplex test` doesn't run them. The `[test.fuzz]` section of `Simplex.toml` sets the number of cases (`cases`), a fixed random seed (`seed`), and the network whose parameters the test transactions use (`network`). At the end of a run, Simplex prints a summary of the cases' verdicts, rejections, mutations, and checks. When a fuzz test finds a failing case, Simplex saves its seed and generated values in a `fuzz-failures/` directory, and later runs replay saved cases before generating new ones.

### Formatting SimplicityHL sources

Run `simplex fmt` (0.2.0+) to format the project's `.simf` files with `simfmt`, which `simplexup` installs alongside Simplex. With no file arguments, it formats the files that the `[build]` section of `Simplex.toml` selects. Pass one or more paths to format only those files.

Add `--check` to report files that need formatting without changing them, as in a CI job, and `--short` to list those files instead of showing the full diff. `simplex fmt` follows the `simfmt.toml` in the project, or the [default `simfmt` configuration](https://github.com/BlockstreamResearch/simfmt/blob/master/simfmt.toml) if there isn't one. Arguments after `--` are passed to `simfmt` unchanged.

If `simfmt` isn't installed next to `simplex`, the command fails with `could not run simfmt at '<path>': <error>`. Rerun `simplexup` to install it.

## Examples

[`BlockstreamResearch/smplx/examples`](https://github.com/BlockstreamResearch/smplx/tree/master/examples) contains sample Simplex projects demonstrating how to create integration and fuzz tests.

The current examples are:

* `examples/basic` (demonstrates a pay-to-public-key contract, called `p2pk.simf`, with both integration tests and fuzz tests)
<!-- * `examples/last_will` (demonstrates a recursive covenant with a timeout-based inheritance mechanism, called `last_will.simf`) -->

Each has a `README.md` file describing the project and how to invoke its Simplex test suite.

You can also experiment with Simplex online in your browser using the [Simplicity Codespace](https://github.com/codespaces/new/blockstream/simplicity-codespace).
