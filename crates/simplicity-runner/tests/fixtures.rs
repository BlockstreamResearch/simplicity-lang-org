//! Shared access to the checked-in transaction fixtures.
//!
//! Fixtures rather than live explorer calls, so the suite is deterministic and runs
//! offline. The browser fetches the same transactions live; these pin the semantics.
//!
//! Layout of `tests/fixtures/`:
//!
//! * `tx-<txid>.hex`   — a transaction a lesson runs against
//! * `prev-<txid>.hex` — a transaction spent by one of those inputs
//!
//! All `prev-` files are handed to every run. Extra ones are harmless because inputs are
//! matched by txid, which keeps adding a new example to one file drop per transaction.

#![allow(dead_code)] // Each integration test binary uses a different subset.

use std::fs;
use std::path::{Path, PathBuf};

/// Genesis block hash of Liquid testnet, as read by `jet::genesis_block_hash`.
pub const GENESIS: &str = "a771da8e52ee6ad581ed1e9a99825e5b3b7992225534eaa2ae23244fe26ab1c1";

pub fn dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures")
}

/// Consensus-encoded hex of the fixture transaction with this txid.
///
/// Returns `None` when no fixture exists, which lets a caller report *which* transaction
/// needs adding rather than failing obscurely.
pub fn transaction(txid: &str) -> Option<String> {
    let path = dir().join(format!("tx-{txid}.hex"));
    fs::read_to_string(path).ok().map(|s| s.trim().to_string())
}

/// Every previous transaction available, for use as `prev_txs_hex`.
pub fn previous_transactions() -> Vec<String> {
    let mut out = Vec::new();
    let entries = fs::read_dir(dir()).expect("fixtures directory should exist");
    for entry in entries {
        let path = entry.expect("readable entry").path();
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        if name.starts_with("prev-") && name.ends_with(".hex") {
            out.push(
                fs::read_to_string(&path)
                    .expect("readable fixture")
                    .trim()
                    .to_string(),
            );
        }
    }
    out.sort();
    out
}

/// The transaction the tutorial uses as its worked example.
///
/// Two *unblinded* inputs carrying different assets and amounts, so a bug that confuses
/// the inputs — or silently falls back to the dummy environment — shows up as a failure
/// rather than passing by coincidence.
pub const EXAMPLE_TXID: &str = "0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2";
pub const EXAMPLE_INPUT_0_AMOUNT: u64 = 1;
pub const EXAMPLE_INPUT_1_AMOUNT: u64 = 875_421;
