# simplicity-runner

The SimplicityHL compiler, wrapped for the browser. This is what makes `simplicityhl,run`
fences on the docs site actually compile and execute, with no server involved.

A thin `wasm-bindgen` shell over the published `simplicityhl` crate — it does not vendor
the compiler itself. `Cargo.lock` is committed and is what pins the version readers get.

## Build

```bash
npm run build:wasm
```

Writes `docs/wasm/pkg/` — a ~13 KB JS loader and a ~2 MB `.wasm`. Both are **gitignored
build artifacts**, produced by CI on every deploy, so no binary accumulates in history.

That means a fresh clone has no compiler until you build one. `mkdocs serve` still works
and snippets still render, but pressing **Run** fails until you have run the command above
once. Re-run it after changing this crate or bumping `simplicityhl`.

Needs `wasm-pack` and the wasm target:

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

## Test

```bash
npm run test:snippets      # or: cargo test --manifest-path crates/simplicity-runner/Cargo.toml
```

`tests/docs_snippets.rs` is the one that matters. It walks every Markdown file under
`docs/`, pulls out the runnable fences, executes them, and checks each behaves as its
`expect=` flag claims. A page whose snippet stops compiling fails the build instead of
surprising a reader.

`tx` snippets run against checked-in fixtures in `tests/fixtures/` rather than the live
explorer, so the suite is deterministic and offline. To use a new transaction in a lesson,
drop in `tx-<txid>.hex` plus a `prev-<txid>.hex` for each input it spends — the test
refuses to silently skip a `tx` snippet it has no fixture for.

## Layout

| Path | |
| --- | --- |
| `src/lib.rs` | `run_program`, `run_program_with_tx`, `check`, plus the `*_core` functions the tests drive |
| `tests/docs_snippets.rs` | executes every runnable fence under `docs/` |
| `tests/transaction_env.rs` | introspection jets against a real transaction |
| `tests/fixtures/` | consensus-encoded transactions, hex |
