# Adding a runnable snippet

Pages under `docs/` can include SimplicityHL code the reader can edit and run in their
browser. This is a how-to guide for authoring one, not an explanation of how the feature
is built; see `crates/simplicity-runner/README.md` for that.

## The fence syntax

Tag a `simplicityhl` fence with `run` and it becomes an editable, runnable snippet
instead of a plain code block:

````markdown
```simplicityhl,run
fn main() {
    assert!(jet::eq_32(2, 2));
}
```
````

Other flags, comma- or space-separated with `run`, in any order:

| Flag | Effect |
| --- | --- |
| `title="…"` | Caption shown above the editor. |
| `readonly` | Show the Run button but don't let the reader edit the code. |
| `tx` | Run against a real Liquid testnet transaction instead of a placeholder, so transaction-introspection jets return true values. Adds a txid field and an input selector above the editor. |
| `txid="…"` | The transaction to prepopulate for a `tx` snippet. |
| `input=N` | Preselect input `N` in a `tx` snippet's selector. |
| `expect=compile-error` | This snippet is meant not to compile. |
| `expect=run-error` | This snippet is meant to compile and then fail. |

`expect=` doesn't change anything a reader sees; it tells `cargo test` (see below) that
the snippet failing is correct, not a bug.

## Adding a plain example

Write the fence, then confirm it behaves as written:

```
cargo test --manifest-path crates/simplicity-runner/Cargo.toml
```

This walks every runnable fence under `docs/` and checks it against its `expect=` flag
(success, by default). That's the whole workflow if the snippet doesn't need `tx`.

## Adding an example with a real transaction

`tx` snippets need the transaction's data available locally — either already checked in,
or fetched on the spot. To add a new one deliberately (recommended, so the example
doesn't depend on a live explorer for every reader):

1. Find or create the Liquid testnet transaction the example needs.
2. Fetch it and everything it spends from:
   ```
   npm run add:tx-fixture -- <txid>
   ```
3. Reference it in the fence:
   ````markdown
   ```simplicityhl,run,tx txid="<txid>"
   fn main() {
       let index: u32 = dbg!(jet::current_index());
       assert!(jet::lt_32(index, jet::num_inputs()));
   }
   ```
   ````
4. Regenerate the JSON the browser reads, so the example loads instantly instead of
   depending on the live explorer:
   ```
   npm run export:tx-fixtures
   ```
5. Confirm it all actually works: `cargo test --manifest-path crates/simplicity-runner/Cargo.toml`.
6. Commit the `.md` change together with the new files under
   `crates/simplicity-runner/tests/fixtures/` and `docs/assets/tx-fixtures/`.

If you reference a `txid` and skip steps 2 and 4, nothing breaks: CI fetches the missing
data itself before testing, so the site still builds and deploys. It'll also post a
(non-blocking) warning telling you the fixture wasn't actually committed. Caching it
yourself is still worth doing, mainly so the example doesn't need a live explorer at
all — not just for readers, but so `cargo test` itself stays fast, offline, and
reproducible.

## Previewing locally

```
npm install
npm run build        # bundles the editor's JS
npm run build:wasm    # compiles the SimplicityHL compiler to wasm
mkdocs serve
```

`npm run build` only needs re-running if you touch `js/*.ts`; `npm run build:wasm` only
if you touch the Rust crate. Editing Markdown alone just needs `mkdocs serve` (with
livereload on, the default) to pick up changes on save.
