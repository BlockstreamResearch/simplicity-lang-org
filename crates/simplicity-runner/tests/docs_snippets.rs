//! Executes every runnable snippet under `docs/` and checks it behaves as the page
//! claims.
//!
//! A page that ships a snippet which no longer compiles is worse than no page, and
//! the reader is the one who finds out. This test makes that a build failure instead.
//!
//! Snippets declare their expected outcome in the fence meta:
//!
//! ```text
//! ```simplicityhl,run                        -> must compile and succeed (the default)
//! ```simplicityhl,run expect=compile-error    -> must fail to compile
//! ```simplicityhl,run expect=run-error        -> must compile, then fail at runtime
//! ```
//!
//! `hooks/runnable.py` ignores `expect`; it exists for this harness and as documentation
//! of authorial intent.

mod fixtures;

use std::fs;
use std::path::{Path, PathBuf};

use simplicity_runner::{run_core, run_with_tx_core};

#[derive(Debug, PartialEq, Eq)]
enum Expect {
    Ok,
    CompileError,
    RunError,
}

#[derive(Debug)]
struct Snippet {
    file: String,
    /// 1-based line of the opening fence, so a failure message points at the source.
    line: usize,
    expect: Expect,
    code: String,
    /// Set for `tx` snippets: the transaction the lesson runs against, and which input.
    ///
    /// These are executed here against a checked-in fixture rather than being skipped —
    /// a lesson whose behaviour depends on a transaction is exactly the kind that rots
    /// silently, and the reader would be the one to find out.
    tx: Option<(String, u32)>,
}

fn docs_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../docs")
        .canonicalize()
        .expect("the docs directory should exist relative to this crate")
}

fn markdown_files(dir: &Path, out: &mut Vec<PathBuf>) {
    for entry in fs::read_dir(dir).expect("readable directory") {
        let path = entry.expect("readable entry").path();
        if path.is_dir() {
            markdown_files(&path, out);
        } else if matches!(
            path.extension().and_then(|e| e.to_str()),
            Some("md") | Some("mdx")
        ) {
            out.push(path);
        }
    }
}

/// Pull runnable fences out of one markdown file.
///
/// Kept deliberately literal rather than pulling in a markdown parser: the fence syntax
/// this needs to recognise is exactly the syntax `hooks/runnable.py` recognises, and two
/// independent parsers would be free to disagree.
fn extract(path: &Path) -> Vec<Snippet> {
    let text = fs::read_to_string(path).expect("readable markdown");
    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("<unknown>")
        .to_string();

    let mut snippets = Vec::new();
    let mut lines = text.lines().enumerate();

    while let Some((index, line)) = lines.next() {
        let trimmed = line.trim_start();
        let Some(info) = trimmed.strip_prefix("```") else {
            continue;
        };
        // The fence's own indentation must be stripped from its body too, so that nested
        // fences (inside a <details> block, say) keep their original text.
        let indent = line.len() - trimmed.len();

        let mut body = String::new();
        for (_, content) in lines.by_ref() {
            if content.trim_start().starts_with("```") {
                break;
            }
            let content = if content.len() >= indent {
                &content[indent..]
            } else {
                content.trim_start()
            };
            body.push_str(content);
            body.push('\n');
        }

        let info_lower = info.to_lowercase();
        let language = info_lower.split([',', ' ']).next().unwrap_or("");
        if !matches!(language, "simplicityhl" | "simf") {
            continue;
        }
        // Only `run` fences are executed. A plain ```simplicityhl fence is illustrative
        // (a fragment, a solution shown for reading) and is not required to compile.
        if !info_lower
            .split([',', ' '])
            .any(|token| token.trim() == "run")
        {
            continue;
        }

        let expect = if info_lower.contains("expect=compile-error") {
            Expect::CompileError
        } else if info_lower.contains("expect=run-error") {
            Expect::RunError
        } else {
            Expect::Ok
        };

        // A `tx` fence names its transaction with `txid="…"` and optionally an input with
        // `input=N`. Both are read off the raw info string rather than the lowercased
        // copy, since a txid is hex and case-insensitive but cleaner kept as written.
        let tx = info_lower.split([',', ' ']).any(|t| t.trim() == "tx").then(|| {
            let txid = extract_value(info, "txid").unwrap_or_default().to_lowercase();
            let input = extract_value(info, "input")
                .and_then(|v| v.parse::<u32>().ok())
                .unwrap_or(0);
            (txid, input)
        });

        snippets.push(Snippet {
            file: name.clone(),
            line: index + 1,
            expect,
            code: body,
            tx,
        });
    }

    snippets
}

/// Pull `key="value"` (or bare `key=value`) out of a fence info string.
fn extract_value<'a>(info: &'a str, key: &str) -> Option<&'a str> {
    let at = info.find(&format!("{key}="))?;
    let rest = &info[at + key.len() + 1..];
    Some(match rest.strip_prefix('"') {
        Some(quoted) => quoted.split('"').next().unwrap_or(""),
        None => rest.split([',', ' ']).next().unwrap_or(""),
    })
}

#[test]
fn every_runnable_snippet_behaves_as_documented() {
    let mut files = Vec::new();
    markdown_files(&docs_dir(), &mut files);
    files.sort();
    assert!(!files.is_empty(), "found no markdown to check");

    let mut snippets = Vec::new();
    for file in &files {
        snippets.extend(extract(file));
    }
    assert!(
        !snippets.is_empty(),
        "found no runnable snippets; has the fence syntax changed?"
    );

    let previous = fixtures::previous_transactions();
    let mut failures = Vec::new();
    let mut tx_snippets = 0;

    for snippet in &snippets {
        let result = match &snippet.tx {
            None => run_core(&snippet.code),
            Some((txid, input)) => {
                let Some(tx_hex) = fixtures::transaction(txid) else {
                    // Refuse to silently skip: an unverified tx snippet is exactly the
                    // kind that rots. Adding a fixture is one file drop.
                    failures.push(format!(
                        "{}:{} is a `tx` snippet for txid `{}`, but no fixture exists.\n\
                         Add crates/simplicity-runner/tests/fixtures/tx-{}.hex (and any \
                         prev-<txid>.hex it spends) so this snippet is verified offline.",
                        snippet.file, snippet.line, txid, txid
                    ));
                    continue;
                };
                tx_snippets += 1;
                run_with_tx_core(&snippet.code, &tx_hex, &previous, *input, fixtures::GENESIS)
            }
        };
        // Compilation is what produces diagnostics; `error` is set only once the program
        // has been compiled and then failed during execution.
        let compiled = result.ok || result.error.is_some();

        let matched = match snippet.expect {
            Expect::Ok => result.ok,
            Expect::CompileError => !compiled,
            Expect::RunError => compiled && !result.ok,
        };

        if !matched {
            failures.push(format!(
                "{}:{} expected {:?} but got ok={} error={:?} rendered={:?} diagnostics={:?}\n--- source ---\n{}",
                snippet.file,
                snippet.line,
                snippet.expect,
                result.ok,
                result.error,
                result.rendered,
                result
                    .diagnostics
                    .iter()
                    .map(|d| d.message.as_str())
                    .collect::<Vec<_>>(),
                snippet.code,
            ));
        }
    }

    assert!(
        failures.is_empty(),
        "{} of {} snippets did not behave as documented ({} ran against a real transaction):\n\n{}",
        failures.len(),
        snippets.len(),
        tx_snippets,
        failures.join("\n\n")
    );

    // Guard against the `tx` flag silently ceasing to parse. Without this, a change to the
    // fence syntax would quietly downgrade every transaction lesson to the dummy
    // environment and the suite would still pass.
    assert!(
        tx_snippets > 0,
        "no snippets ran against a real transaction; has the `tx` fence flag stopped parsing?"
    );
}
