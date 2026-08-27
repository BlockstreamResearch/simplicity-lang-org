//! Checks that `run_with_tx_core` builds an environment reflecting a real transaction.
//!
//! Fixtures are checked in rather than fetched, so CI neither depends on an explorer
//! being reachable nor changes behaviour when one is reorganised. The browser fetches the
//! same data live; this pins the semantics.
//!
//! Fixture: Liquid testnet `0440094a…f57c2`, chosen because it has two *unblinded* inputs
//! carrying different assets and amounts — so a test that confuses the inputs, or falls
//! back to the dummy environment, fails rather than coincidentally passing.

mod fixtures;

use fixtures::{
    EXAMPLE_INPUT_0_AMOUNT as INPUT_0_AMOUNT, EXAMPLE_INPUT_1_AMOUNT as INPUT_1_AMOUNT,
    EXAMPLE_TXID, GENESIS,
};
use simplicity_runner::run_with_tx_core;

fn tx_hex() -> String {
    fixtures::transaction(EXAMPLE_TXID).expect("example transaction fixture")
}

fn prev_txs() -> Vec<String> {
    let out = fixtures::previous_transactions();
    assert_eq!(out.len(), 2, "expected both previous transactions");
    out
}

fn run(source: &str, input_index: u32) -> simplicity_runner::RunResult {
    run_with_tx_core(source, &tx_hex(), &prev_txs(), input_index, GENESIS)
}

/// Extract the explicit amount of the current input, asserting it equals `expected`.
fn program_asserting_current_amount(expected: u64) -> String {
    format!(
        r"fn main() {{
    let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) = jet::current_amount();
    match amount {{
        Left(_: (u1, u256)) => panic!(),
        Right(explicit: u64) => assert!(jet::eq_64(explicit, {expected})),
    }};
}}"
    )
}

#[test]
fn reads_the_real_input_count() {
    // The dummy environment has exactly one input, so a program asserting two would pass
    // only against the real transaction.
    let result = run(
        "fn main() {\n    assert!(jet::eq_32(jet::num_inputs(), 2));\n}",
        0,
    );
    assert!(result.ok, "expected success, got {result:?}");
}

#[test]
fn current_index_follows_the_selected_input() {
    for index in [0u32, 1] {
        let source = format!(
            "fn main() {{\n    assert!(jet::eq_32(jet::current_index(), {index}));\n}}"
        );
        let result = run(&source, index);
        assert!(result.ok, "input {index}: expected success, got {result:?}");
    }
}

#[test]
fn current_amount_differs_per_input() {
    // The heart of it: selecting an input must change what the program sees.
    let first = run(&program_asserting_current_amount(INPUT_0_AMOUNT), 0);
    assert!(first.ok, "input 0: {first:?}");

    let second = run(&program_asserting_current_amount(INPUT_1_AMOUNT), 1);
    assert!(second.ok, "input 1: {second:?}");

    // And the values are genuinely distinct, so neither test above is vacuous.
    let crossed = run(&program_asserting_current_amount(INPUT_1_AMOUNT), 0);
    assert!(
        !crossed.ok,
        "input 0 must not report input 1's amount: {crossed:?}"
    );
}

#[test]
fn input_amount_can_address_any_input() {
    // `jet::input_amount(i)` reaches inputs other than the current one, which is why the
    // environment needs a UTXO for every input rather than only the selected one.
    let source = format!(
        r"fn main() {{
    let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) = unwrap(jet::input_amount(1));
    match amount {{
        Left(_: (u1, u256)) => panic!(),
        Right(explicit: u64) => assert!(jet::eq_64(explicit, {INPUT_1_AMOUNT})),
    }};
}}"
    );
    // Run it while the *current* input is 0.
    let result = run(&source, 0);
    assert!(result.ok, "expected success, got {result:?}");
}

#[test]
fn rejects_an_out_of_range_input() {
    let result = run("fn main() {\n    assert!(jet::eq_32(1, 1));\n}", 7);
    assert!(!result.ok);
    let message = format!("{:?}", result.rendered);
    assert!(
        message.contains("input 7 does not exist"),
        "expected a clear out-of-range message, got {result:?}"
    );
}

#[test]
fn rejects_malformed_transaction_hex() {
    let result = run_with_tx_core(
        "fn main() {\n    assert!(jet::eq_32(1, 1));\n}",
        "not hex at all",
        &[],
        0,
        GENESIS,
    );
    assert!(!result.ok);
    assert!(
        result.rendered.contains("not valid hex"),
        "expected a hex error, got {result:?}"
    );
}

#[test]
fn reports_a_missing_previous_transaction() {
    // Without the spent outputs there is no way to answer `jet::current_amount`, so this
    // must fail loudly rather than substituting a placeholder.
    let result = run_with_tx_core(
        "fn main() {\n    assert!(jet::eq_32(1, 1));\n}",
        &tx_hex(),
        &[],
        0,
        GENESIS,
    );
    assert!(!result.ok);
    assert!(
        result.rendered.contains("missing the previous transaction"),
        "expected a clear missing-prevout message, got {result:?}"
    );
}
