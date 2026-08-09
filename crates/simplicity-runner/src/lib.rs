//! wasm-bindgen surface over SimplicityHL, so docs pages can compile and run
//! snippets in the reader's browser.
//!
//! Entry points, all taking a single source string:
//!
//! * [`check`] — parse and type-check only. Cheap enough to run on every keystroke,
//!   so it drives editor squiggles until the real LSP is wired up.
//! * [`run_program`] — compile, satisfy, and execute `fn main()` on the Simplicity
//!   bit machine in a dummy Elements environment. Captures `dbg!()` output so a
//!   lesson can show intermediate values rather than just pass/fail.
//! * [`run_program_with_tx`] — the same, but against an environment built from a real
//!   Elements transaction, so transaction-introspection jets return true values.
//!
//! The real work lives in [`check_core`] and [`run_core`]/[`run_with_tx_core`], which
//! return plain Rust structs and are covered by native `cargo test`. The
//! `#[wasm_bindgen]` functions are thin serialization shells so the pipeline can be
//! tested without a browser.

use std::cell::RefCell;
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;

use serde::Serialize;
use wasm_bindgen::prelude::*;

use simplicityhl::ast::ElementsJetHinter;
use simplicityhl::debug::DebugSymbols;
use simplicityhl::elements;
use simplicityhl::elements::hex::FromHex;
use simplicityhl::elements::taproot::ControlBlock;
use simplicityhl::error::{DiagnosticManager, Location, Severity};
use simplicityhl::simplicity::jet::elements::{ElementsEnv, ElementsUtxo};
use simplicityhl::simplicity::{BitMachine, Cmr};
use simplicityhl::tracker::DefaultTracker;
use simplicityhl::value::Value;
use simplicityhl::{dummy_env, Arguments, TemplateProgram, WitnessValues};

#[wasm_bindgen(start)]
fn start() {
    console_error_panic_hook::set_once();
}

/// Stand-in taproot control block, matching the one `dummy_env` uses.
///
/// The tutorial runs a program against a real transaction but not against that
/// transaction's real spend path — the reader's edited program has a different CMR than
/// whatever actually locked the coin. Jets reading the internal key, tapleaf version, or
/// tappath therefore return placeholder values.
const DUMMY_CONTROL_BLOCK: [u8; 33] = [
    0xc0, 0xeb, 0x04, 0xb6, 0x8e, 0x9a, 0x26, 0xd1, 0x16, 0x04, 0x6c, 0x76, 0xe8, 0xff, 0x47, 0x33,
    0x2f, 0xb7, 0x1d, 0xda, 0x90, 0xff, 0x4b, 0xef, 0x53, 0x70, 0xf2, 0x52, 0x26, 0xd3, 0xbc, 0x09,
    0xfc,
];

/// A diagnostic anchored to a byte range in the source.
///
/// `start`/`end` are **byte** offsets, matching SimplicityHL's `Span`. Callers
/// targeting CodeMirror must convert to UTF-16 code-unit offsets if the source can
/// contain non-ASCII text; for ASCII-only snippets the two coincide.
#[derive(Debug, Serialize)]
pub struct Diag {
    pub severity: &'static str,
    pub message: String,
    pub start: Option<usize>,
    pub end: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct CheckResult {
    pub ok: bool,
    pub diagnostics: Vec<Diag>,
    /// Fallback prose for diagnostics with no span to attach to (`Location::File`,
    /// `Location::Global`), and for compile-stage errors that arrive pre-rendered.
    ///
    /// Note this is *message-only*: the single-file `TemplateProgram::new` path does
    /// not register sources with the driver, so ariadne emits no source excerpt or
    /// line/column info. That is fine here — `diagnostics` carries byte spans and the
    /// editor renders them inline, which beats ASCII carets in a browser.
    pub rendered: String,
}

#[derive(Debug, Serialize)]
pub struct RunResult {
    pub ok: bool,
    pub diagnostics: Vec<Diag>,
    pub rendered: String,
    /// Lines produced by `dbg!()` in program order.
    pub debug: Vec<String>,
    pub warnings: Vec<String>,
    /// Set when compilation succeeded but execution failed (a failed `assert!`,
    /// for instance). Compile failures are reported through `diagnostics`/`rendered`.
    pub error: Option<String>,
    /// Commitment Merkle Root, hex, present once the program compiles.
    pub cmr: Option<String>,
}

impl RunResult {
    /// A result for a program that never got as far as executing.
    fn failed(diagnostics: Vec<Diag>, rendered: String, cmr: Option<String>) -> Self {
        Self {
            ok: false,
            diagnostics,
            rendered,
            debug: Vec::new(),
            warnings: Vec::new(),
            error: None,
            cmr,
        }
    }
}

fn collect(diagnostics: &DiagnosticManager) -> Vec<Diag> {
    diagnostics
        .diagnostics()
        .iter()
        .map(|d| {
            let (start, end) = match d.location() {
                Location::Code(span) => (Some(span.start), Some(span.end)),
                Location::File(_) | Location::Global => (None, None),
            };
            Diag {
                severity: match d.severity() {
                    Severity::Error => "error",
                    Severity::Warning => "warning",
                },
                message: d.error().to_string(),
                start,
                end,
            }
        })
        .collect()
}

/// Parse and type-check `source` without executing it.
///
/// Goes through [`TemplateProgram::new`] rather than `CompiledProgram::new` because
/// the former surfaces a `DiagnosticManager` — keeping byte spans — while the latter
/// flattens everything to a `String` and loses them.
pub fn check_core(source: &str) -> CheckResult {
    match TemplateProgram::new(source, Box::new(ElementsJetHinter::new())) {
        Ok(template) => {
            // Parsing and analysis passed; `instantiate` runs the actual compile, which
            // is where remaining type errors surface. Warnings can be present on success.
            let diagnostics = collect(template.diagnostics());
            match template.instantiate(Arguments::default(), false) {
                Ok(_) => CheckResult {
                    ok: true,
                    diagnostics,
                    rendered: String::new(),
                },
                Err(rendered) => CheckResult {
                    ok: false,
                    diagnostics,
                    rendered,
                },
            }
        }
        Err(diagnostics) => CheckResult {
            ok: false,
            diagnostics: collect(&diagnostics),
            rendered: diagnostics.render_to_string(),
        },
    }
}

/// Which Elements environment a program executes against.
///
/// The environment cannot be built before compiling, because it needs the compiled
/// program's CMR, so this describes the intent and [`run_in`] resolves it afterwards.
pub enum EnvSpec<'a> {
    /// Placeholder transaction. Introspection jets return meaningless values.
    Dummy,
    /// A real transaction, so introspection jets return true values.
    Transaction {
        /// Consensus-encoded transaction being spent *from*, hex.
        tx_hex: &'a str,
        /// Consensus-encoded hex of every transaction referenced by an input of
        /// `tx_hex`. Order is irrelevant — they are matched by txid.
        ///
        /// Supplying whole previous transactions rather than parsed amounts is
        /// deliberate: a Liquid output may be blinded, in which case its value and asset
        /// exist only as commitments. Re-deriving `TxOut`s from raw bytes keeps blinded
        /// and unblinded inputs on one code path and cannot silently lose a commitment.
        prev_txs_hex: &'a [String],
        /// Which input of `tx_hex` the program is running for.
        input_index: u32,
        /// Genesis block hash of the network, hex. Read by `jet::genesis_block_hash`,
        /// and differs between Liquid mainnet and testnet.
        genesis_hash: &'a str,
    },
}

fn decode_tx(hex: &str, label: &str) -> Result<elements::Transaction, String> {
    let bytes = Vec::<u8>::from_hex(hex.trim())
        .map_err(|e| format!("{label} is not valid hex: {e}"))?;
    elements::encode::deserialize(&bytes)
        .map_err(|e| format!("{label} is not a valid Elements transaction: {e}"))
}

/// Build an Elements environment that mirrors a real transaction.
fn build_tx_env(
    tx_hex: &str,
    prev_txs_hex: &[String],
    input_index: u32,
    genesis_hash: &str,
    script_cmr: Cmr,
) -> Result<ElementsEnv<Arc<elements::Transaction>>, String> {
    let tx = decode_tx(tx_hex, "the transaction")?;

    if tx.input.is_empty() {
        return Err("the transaction has no inputs".to_string());
    }
    if input_index as usize >= tx.input.len() {
        return Err(format!(
            "input {input_index} does not exist; the transaction has {} input(s)",
            tx.input.len()
        ));
    }

    let mut prev_by_txid = HashMap::new();
    for (i, hex) in prev_txs_hex.iter().enumerate() {
        let prev = decode_tx(hex, &format!("previous transaction {i}"))?;
        prev_by_txid.insert(prev.txid(), prev);
    }

    // The bit machine needs the spent output for *every* input, not just the one being
    // run: jets like `jet::input_amount(i)` can address any of them.
    let mut utxos = Vec::with_capacity(tx.input.len());
    for (i, input) in tx.input.iter().enumerate() {
        let outpoint = input.previous_output;
        let prev = prev_by_txid.get(&outpoint.txid).ok_or_else(|| {
            format!(
                "missing the previous transaction for input {i} ({}); it is needed to \
                 know what that input is spending",
                outpoint.txid
            )
        })?;
        let spent = prev.output.get(outpoint.vout as usize).ok_or_else(|| {
            format!(
                "input {i} spends output {} of {}, which has only {} output(s)",
                outpoint.vout,
                outpoint.txid,
                prev.output.len()
            )
        })?;
        utxos.push(ElementsUtxo {
            script_pubkey: spent.script_pubkey.clone(),
            asset: spent.asset,
            value: spent.value,
        });
    }

    let genesis = elements::BlockHash::from_str(genesis_hash.trim())
        .map_err(|e| format!("genesis block hash is not a valid hash: {e}"))?;

    // The tutorial does not model the taproot spend path, so the control block is a
    // stand-in borrowed from `dummy_env`. Jets reading the internal key, tapleaf version,
    // or tappath therefore still return placeholder values; everything reading the
    // transaction itself is real.
    let control_block = ControlBlock::from_slice(&DUMMY_CONTROL_BLOCK)
        .map_err(|e| format!("internal error building the control block: {e}"))?;

    Ok(ElementsEnv::new(
        Arc::new(tx),
        utxos,
        input_index,
        script_cmr,
        control_block,
        None,
        genesis,
    ))
}

/// Compile, satisfy, and execute `fn main()` against a dummy Elements environment.
///
/// Transaction-introspection jets will not behave as they would on-chain; use
/// [`run_with_tx_core`] when that matters.
pub fn run_core(source: &str) -> RunResult {
    run_in(source, &EnvSpec::Dummy)
}

/// Compile, satisfy, and execute `fn main()` against a real transaction.
pub fn run_with_tx_core(
    source: &str,
    tx_hex: &str,
    prev_txs_hex: &[String],
    input_index: u32,
    genesis_hash: &str,
) -> RunResult {
    run_in(
        source,
        &EnvSpec::Transaction {
            tx_hex,
            prev_txs_hex,
            input_index,
            genesis_hash,
        },
    )
}

fn run_in(source: &str, spec: &EnvSpec) -> RunResult {
    let template = match TemplateProgram::new(source, Box::new(ElementsJetHinter::new())) {
        Ok(template) => template,
        Err(diagnostics) => {
            return RunResult::failed(collect(&diagnostics), diagnostics.render_to_string(), None)
        }
    };
    let diagnostics = collect(template.diagnostics());

    // `true` requests debug symbols, without which `dbg!()` output cannot be resolved
    // back to source names by the tracker.
    let compiled = match template.instantiate(Arguments::default(), true) {
        Ok(compiled) => compiled,
        Err(rendered) => return RunResult::failed(diagnostics, rendered, None),
    };

    let script_cmr = compiled.commit().cmr();
    let cmr = Some(script_cmr.to_string());
    let debug_symbols: DebugSymbols = compiled.debug_symbols().clone();

    // Built here rather than up front because it needs the compiled program's CMR, which
    // `jet::script_cmr` reads back.
    let env = match spec {
        EnvSpec::Dummy => dummy_env::dummy(),
        EnvSpec::Transaction {
            tx_hex,
            prev_txs_hex,
            input_index,
            genesis_hash,
        } => match build_tx_env(tx_hex, prev_txs_hex, *input_index, genesis_hash, script_cmr) {
            Ok(env) => env,
            // A malformed transaction is not the reader's program being wrong, so report
            // it as an execution-environment error rather than a compile diagnostic.
            Err(error) => return RunResult::failed(diagnostics, error.clone(), cmr),
        },
    };

    // The tutorial has no witness-editing UI yet, so only programs whose witnesses are
    // fully determined can run. A program declaring unsatisfied witnesses fails here
    // with a message naming them, which is the correct thing to show the reader.
    let satisfied = match compiled.satisfy(WitnessValues::default()) {
        Ok(satisfied) => satisfied,
        Err(error) => return RunResult::failed(diagnostics, error, cmr),
    };

    // RefCell because the tracker takes `FnMut` sinks that borrow these, and we still
    // need to read them back after the tracker is dropped.
    let debug = RefCell::new(Vec::<String>::new());
    let warnings = RefCell::new(Vec::<String>::new());

    let run = || -> Result<(), String> {
        let mut tracker = DefaultTracker::build(&debug_symbols, Box::new(ElementsJetHinter::new()))
            .with_debug_sink(|text: &str, value: &Value| {
                debug.borrow_mut().push(format!("{text}: {value}"));
            })
            .with_warning_sink(|text: &str| {
                warnings.borrow_mut().push(text.to_string());
            });

        let pruned = satisfied.redeem().prune(&env).map_err(|e| e.to_string())?;
        let mut mac = BitMachine::for_program(&pruned).map_err(|e| e.to_string())?;
        mac.exec_with_tracker(&pruned, &env, &mut tracker)
            .map(|_| ())
            .map_err(|e| e.to_string())
    };

    let error = run().err();
    RunResult {
        ok: error.is_none(),
        diagnostics,
        rendered: String::new(),
        debug: debug.into_inner(),
        warnings: warnings.into_inner(),
        error,
        cmr,
    }
}

fn to_js<T: Serialize>(value: &T) -> JsValue {
    serde_wasm_bindgen::to_value(value).expect("result types are plain data and always serialize")
}

/// See [`check_core`].
#[wasm_bindgen]
pub fn check(source: &str) -> JsValue {
    to_js(&check_core(source))
}

/// See [`run_core`].
#[wasm_bindgen]
pub fn run_program(source: &str) -> JsValue {
    to_js(&run_core(source))
}

/// See [`run_with_tx_core`].
#[wasm_bindgen]
pub fn run_program_with_tx(
    source: &str,
    tx_hex: &str,
    prev_txs_hex: Vec<String>,
    input_index: u32,
    genesis_hash: &str,
) -> JsValue {
    to_js(&run_with_tx_core(
        source,
        tx_hex,
        &prev_txs_hex,
        input_index,
        genesis_hash,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runs_a_passing_program() {
        let result = run_core(
            r"fn main() {
    let ab: u16 = <(u8, u8)>::into((0x10, 0x01));
    assert!(jet::eq_16(ab, 0x1001));
}",
        );
        assert!(result.ok, "expected success, got {result:?}");
        assert!(result.error.is_none());
        assert!(result.cmr.is_some(), "a compiled program has a CMR");
    }

    #[test]
    fn reports_a_failing_assert_at_runtime() {
        // Compiles fine; the assertion is what fails, so this must surface through
        // `error` rather than `diagnostics`.
        let result = run_core("fn main() {\n    assert!(jet::eq_32(1, 2));\n}");
        assert!(!result.ok);
        assert!(result.error.is_some(), "got {result:?}");
        assert!(
            result.diagnostics.is_empty(),
            "a runtime failure is not a diagnostic: {result:?}"
        );
    }

    #[test]
    fn reports_a_type_error_with_a_span() {
        let source = "fn main() {\n    let x: u32 = true;\n}";
        let result = check_core(source);
        assert!(!result.ok);
        let spanned = result
            .diagnostics
            .iter()
            .find(|d| d.severity == "error" && d.start.is_some());
        let Some(diag) = spanned else {
            panic!("expected a spanned error, got {result:?}");
        };
        // The span must actually address the source, or the editor cannot squiggle it.
        let (start, end) = (diag.start.unwrap(), diag.end.unwrap());
        assert!(start <= end && end <= source.len(), "bad span: {diag:?}");
    }

    #[test]
    fn captures_dbg_output() {
        // `dbg!` returns its argument (like Rust's), so it sits in expression position
        // rather than as a bare statement.
        let result = run_core(
            r"fn main() {
    let x: u32 = dbg!(42);
    assert!(jet::eq_32(x, 42));
}",
        );
        assert!(result.ok, "expected success, got {result:?}");
        assert!(
            !result.debug.is_empty(),
            "dbg!() should reach the debug sink: {result:?}"
        );
    }

    #[test]
    fn array_fold_example_runs() {
        // Straight from SimplicityHL's examples/array_fold.simf — a realistic lesson.
        let result = run_core(
            r"fn sum(elt: u32, acc: u32) -> u32 {
    let (_, acc): (bool, u32) = jet::add_32(elt, acc);
    acc
}

fn main() {
    let arr: [u32; 7] = [1, 2, 3, 4, 5, 6, 7];
    let sum: u32 = array_fold::<sum, 7>(arr, 0);
    assert!(jet::eq_32(sum, 28));
}",
        );
        assert!(result.ok, "expected success, got {result:?}");
    }

    #[test]
    fn syntax_error_does_not_panic() {
        let result = check_core("fn main( {");
        assert!(!result.ok);
        assert!(
            !result.diagnostics.is_empty() || !result.rendered.is_empty(),
            "a syntax error must produce something to show the reader"
        );
    }
}
