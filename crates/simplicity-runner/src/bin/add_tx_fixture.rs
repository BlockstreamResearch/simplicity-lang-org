//! Fetch a transaction — and everything it spends from — off the Liquid testnet
//! explorer, and save it as fixture files in the layout `tests/fixtures/` and
//! `export_tx_fixtures` expect.
//!
//! Two modes:
//!
//!     cargo run --manifest-path crates/simplicity-runner/Cargo.toml --bin add_tx_fixture -- <txid>
//!
//! fetches one specific transaction — the normal way to proactively cache a new
//! example before committing it. With no argument:
//!
//!     cargo run --manifest-path crates/simplicity-runner/Cargo.toml --bin add_tx_fixture
//!
//! it scans every `docs/**/*.md` file for `txid="…"` fence attributes and fetches
//! whichever ones don't already have a fixture. This is CI's safety net for this
//! project's mostly-direct-to-`main` workflow: committing the fixture is still the
//! recommended path (deterministic, reviewable, no live dependency at build time), but
//! forgetting it shouldn't freeze deployment of the entire site over one example. See
//! the warning step in `.github/workflows/ci.yml`, which fires when this had to fetch
//! something that should have been committed instead.
//!
//! Decodes fetched hex with `simplicityhl::elements` (the same decoder
//! `export_tx_fixtures` and `run_program_with_tx` itself both rely on) to enumerate a
//! transaction's own inputs, rather than trusting a second, separate parse of the
//! explorer's JSON response — one consensus decoder, used everywhere transaction bytes
//! get interpreted in this crate.
//!
//! After this, regenerate the JSON the browser reads, and confirm any lesson
//! referencing the new txid actually compiles and runs as written:
//!
//!     cargo run --manifest-path crates/simplicity-runner/Cargo.toml --bin export_tx_fixtures
//!     cargo test --manifest-path crates/simplicity-runner/Cargo.toml

use std::collections::{BTreeSet, HashSet};
use std::path::{Path, PathBuf};
use std::{env, fs};

use simplicityhl::elements;
use simplicityhl::elements::hex::FromHex;

const API: &str = "https://blockstream.info/liquidtestnet/api";

fn fetch_hex(txid: &str) -> String {
    ureq::get(&format!("{API}/tx/{txid}/hex"))
        .call()
        .unwrap_or_else(|e| panic!("fetching {txid} from the explorer failed: {e}"))
        .into_string()
        .unwrap_or_else(|e| panic!("{txid}'s explorer response was not text: {e}"))
        .trim()
        .to_string()
}

fn decode(hex: &str, label: &str) -> elements::Transaction {
    let bytes = Vec::<u8>::from_hex(hex.trim()).unwrap_or_else(|e| panic!("{label} is not valid hex: {e}"));
    elements::encode::deserialize(&bytes)
        .unwrap_or_else(|e| panic!("{label} is not a valid Elements transaction: {e}"))
}

/// Fetch `txid`'s hex and save it, unless a fixture with this name already exists.
/// Returns `Some` only when it actually fetched something new.
fn save(fixtures_dir: &Path, filename: String, txid: &str, label: &str) -> (PathBuf, bool) {
    let path = fixtures_dir.join(filename);
    if path.exists() {
        println!("{} already present, leaving it alone", path.display());
        return (path, false);
    }
    println!("fetching {label} {txid}...");
    let hex = fetch_hex(txid);
    // Decode before writing: a truncated download or an unexpected explorer response
    // shape should fail loudly here, not surface later as a baffling wasm error.
    decode(&hex, &format!("{label} {txid}"));
    fs::write(&path, &hex).unwrap_or_else(|e| panic!("could not write {}: {e}", path.display()));
    println!("wrote {}", path.display());
    (path, true)
}

/// Fetch one transaction and every non-coinbase input it spends from. Returns whether
/// anything was actually fetched (as opposed to everything already being present).
fn add_one(fixtures_dir: &Path, txid: &str) -> bool {
    let (tx_path, mut fetched_anything) = save(fixtures_dir, format!("tx-{txid}.hex"), txid, "transaction");
    let tx = decode(&fs::read_to_string(&tx_path).expect("just wrote or already had this"), "the transaction");

    let mut seen = HashSet::new();
    for input in &tx.input {
        let outpoint = input.previous_output;
        if outpoint.is_null() || !seen.insert(outpoint.txid) {
            continue; // Coinbase-like input, or a previous transaction already handled.
        }
        let prev_txid = outpoint.txid.to_string();
        let (_, fetched) = save(
            fixtures_dir,
            format!("prev-{prev_txid}.hex"),
            &prev_txid,
            "an input's previous transaction",
        );
        fetched_anything |= fetched;
    }
    fetched_anything
}

/// Every `txid="…"` fence attribute anywhere under `docs/`, in the exact quoted form
/// `hooks/runnable.py`'s own meta-token parsing accepts. Deliberately a plain string
/// scan rather than a regex crate or a copy of that file's fence-boundary logic: a
/// 64-hex-character run right after `txid="` is unambiguous prose, and this only ever
/// needs to *find candidates to pre-fetch*, not authoritatively validate fence syntax
/// — `cargo test` still does that part.
fn referenced_txids(docs_dir: &Path) -> BTreeSet<String> {
    let mut found = BTreeSet::new();
    let mut stack = vec![docs_dir.to_path_buf()];
    while let Some(dir) = stack.pop() {
        for entry in fs::read_dir(&dir).unwrap_or_else(|e| panic!("reading {}: {e}", dir.display())) {
            let path = entry.expect("readable entry").path();
            if path.is_dir() {
                stack.push(path);
                continue;
            }
            if path.extension().and_then(|e| e.to_str()) != Some("md") {
                continue;
            }
            let content = fs::read_to_string(&path).unwrap_or_else(|e| panic!("reading {}: {e}", path.display()));
            let mut rest = content.as_str();
            while let Some(after_key) = rest.find("txid=\"") {
                rest = &rest[after_key + "txid=\"".len()..];
                let Some(end) = rest.find('"') else { break };
                let candidate = &rest[..end];
                if candidate.len() == 64 && candidate.chars().all(|c| c.is_ascii_hexdigit()) {
                    found.insert(candidate.to_lowercase());
                }
                rest = &rest[end..];
            }
        }
    }
    found
}

fn main() {
    let fixtures_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures");
    fs::create_dir_all(&fixtures_dir).expect("should be able to create tests/fixtures");

    match env::args().nth(1) {
        Some(txid) => {
            let txid = txid.trim().to_lowercase();
            assert!(
                txid.len() == 64 && txid.chars().all(|c| c.is_ascii_hexdigit()),
                "not a transaction id (expected 64 hex characters): {txid}"
            );
            add_one(&fixtures_dir, &txid);
            println!();
            println!("Next steps:");
            println!("  cargo run --manifest-path crates/simplicity-runner/Cargo.toml --bin export_tx_fixtures");
            println!("  cargo test --manifest-path crates/simplicity-runner/Cargo.toml");
        }
        None => {
            // Two levels up from `crates/simplicity-runner/` is the repo root.
            let docs_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../docs");
            let txids = referenced_txids(&docs_dir);
            println!("found {} distinct txid(s) referenced under docs/", txids.len());
            let mut any_fetched = false;
            for txid in &txids {
                any_fetched |= add_one(&fixtures_dir, txid);
            }
            if !any_fetched {
                println!("everything referenced was already cached — nothing fetched.");
            }
        }
    }
}
