//! Export the checked-in transaction fixtures as static JSON the browser can fetch
//! same-origin, instead of every reader's browser needing to hit the live Esplora API
//! for the tutorial's own worked examples.
//!
//! Reuses `simplicityhl::elements` (the same consensus-transaction decoder
//! `run_program_with_tx` itself relies on) to derive each input's spent value/asset,
//! rather than re-deriving that from raw bytes by hand. Run via:
//!
//!     cargo run --manifest-path crates/simplicity-runner/Cargo.toml --bin export_tx_fixtures
//!
//! from the repo root. Output lands in `docs/assets/tx-fixtures/<txid>.json`, one file
//! per `tx-*.hex` fixture, in exactly the shape `js/explorer.ts`'s `LoadedTransaction`
//! expects, so the client only needs a plain `fetch` + `JSON.parse` for a preset txid —
//! no client-side transaction parsing at all.

use std::collections::HashMap;
use std::fs;
use std::path::Path;

use serde::Serialize;
use simplicityhl::elements;
use simplicityhl::elements::hex::FromHex;

#[derive(Serialize)]
struct TxInput {
    index: usize,
    txid: String,
    vout: u32,
    value: Option<u64>,
    asset: Option<String>,
    #[serde(rename = "isCoinbase")]
    is_coinbase: bool,
}

#[derive(Serialize)]
struct LoadedTransaction {
    txid: String,
    hex: String,
    #[serde(rename = "prevTxsHex")]
    prev_txs_hex: Vec<String>,
    inputs: Vec<TxInput>,
}

fn decode(hex: &str, label: &str) -> elements::Transaction {
    let bytes = Vec::<u8>::from_hex(hex.trim()).unwrap_or_else(|e| panic!("{label} is not valid hex: {e}"));
    elements::encode::deserialize(&bytes).unwrap_or_else(|e| panic!("{label} is not a valid Elements transaction: {e}"))
}

fn main() {
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let fixtures_dir = manifest_dir.join("tests/fixtures");
    // Two levels up from `crates/simplicity-runner/` is the repo root.
    let out_dir = manifest_dir
        .join("../..")
        .join("docs/assets/tx-fixtures");

    // Every `prev-*.hex` fixture, indexed by its own txid, exactly as `build_tx_env`
    // does in `lib.rs` — inputs are matched by txid, not by filename.
    let mut prev_by_txid: HashMap<elements::Txid, (String, elements::Transaction)> = HashMap::new();
    for entry in fs::read_dir(&fixtures_dir).expect("fixtures directory should exist") {
        let path = entry.expect("readable entry").path();
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
        if name.starts_with("prev-") && name.ends_with(".hex") {
            let hex = fs::read_to_string(&path).expect("readable fixture").trim().to_string();
            let tx = decode(&hex, &name);
            prev_by_txid.insert(tx.txid(), (hex, tx));
        }
    }

    fs::create_dir_all(&out_dir).expect("should be able to create docs/assets/tx-fixtures");

    let mut exported = 0;
    for entry in fs::read_dir(&fixtures_dir).expect("fixtures directory should exist") {
        let path = entry.expect("readable entry").path();
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
        let Some(stripped) = name.strip_prefix("tx-").and_then(|s| s.strip_suffix(".hex")) else {
            continue;
        };

        let hex = fs::read_to_string(&path).expect("readable fixture").trim().to_string();
        let tx = decode(&hex, &name);
        let txid = tx.txid().to_string();
        assert_eq!(
            txid, stripped,
            "{name} is named after a different txid than it actually decodes to"
        );

        let mut inputs = Vec::with_capacity(tx.input.len());
        let mut referenced_hex = Vec::new();
        for (index, input) in tx.input.iter().enumerate() {
            let outpoint = input.previous_output;
            // Elements represents a coinbase-like input with a null previous outpoint,
            // same convention as Bitcoin.
            let is_coinbase = outpoint.is_null();

            let (value, asset) = if is_coinbase {
                (None, None)
            } else {
                let (prev_hex, prev_tx) = prev_by_txid.get(&outpoint.txid).unwrap_or_else(|| {
                    panic!(
                        "{name} input {index} spends {}, but no matching prev-{}.hex fixture exists",
                        outpoint.txid, outpoint.txid
                    )
                });
                if !referenced_hex.contains(prev_hex) {
                    referenced_hex.push(prev_hex.clone());
                }
                let spent = prev_tx.output.get(outpoint.vout as usize).unwrap_or_else(|| {
                    panic!(
                        "{name} input {index} spends output {} of {}, which has only {} output(s)",
                        outpoint.vout,
                        outpoint.txid,
                        prev_tx.output.len()
                    )
                });
                (spent.value.explicit(), spent.asset.explicit().map(|a| a.to_string()))
            };

            inputs.push(TxInput {
                index,
                txid: outpoint.txid.to_string(),
                vout: outpoint.vout,
                value,
                asset,
                is_coinbase,
            });
        }

        let loaded = LoadedTransaction {
            txid: txid.clone(),
            hex,
            prev_txs_hex: referenced_hex,
            inputs,
        };

        let out_path = out_dir.join(format!("{txid}.json"));
        let json = serde_json::to_string_pretty(&loaded).expect("serializable");
        fs::write(&out_path, json).expect("should be able to write the fixture JSON");
        println!("wrote {}", out_path.display());
        exported += 1;
    }

    assert!(exported > 0, "no tx-*.hex fixtures found in {}", fixtures_dir.display());
}
