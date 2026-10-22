# Backend implementation log — allowance webserver

Scope: implement the backend described in `webapp/API.md` inside
`webapp/backend` (a working copy of `simplicity-demo`, mirroring its `last_will`
patterns for the allowance contract). This log covers what was written, how it was
cross-checked, and a hard environment blocker that prevented compiling or running any
of it.

## What was built

1. `crates/simplicityhl-core/src/allowance.rs` — `AllowanceKeys`, `get_allowance_program`,
   `get_allowance_address`/`allowance_address`, `allowance_witness_values`,
   `create_allowance_signature`. Mirrors `last_will.rs` closely, but simpler: no
   unstable `-Z enums` feature needed (allowance.simf's witness is a bare `Signature`,
   not an enum), so it compiles via `scripts::load_program` rather than
   `load_program_with_unstable`. Registered in `lib.rs` (`mod allowance; pub use
   allowance::*;`).
2. `crates/simplicityhl-core/src/source_simf/allowance.simf` — verbatim copy of the
   contract from `contracts/allowance.simf` (already saved by the parent session from
   the docs.simplicity-lang.org homepage).
3. `crates/contracts/src/sdk/basic/allowance.rs` — `withdraw_full` (2-output:
   payout + fee, for when the UTXO balance is at or below `allowance_amount`) and
   `withdraw_partial` (3-output: covenant continuation + payout + fee). Both set the
   input's `Sequence` to `min_distance` blocks, since `allowance.simf`'s
   `enforce_time_delay()` runs unconditionally in `main()` before the
   full/partial branch, unlike `last_will.simf` where only the inheritor path checks
   it. Added a new error variant `TransactionBuildError::FeeExceedsAllowance` (there
   wasn't an existing one that fit "fee_amount >= allowance_amount" cleanly).
   Registered in `sdk/basic/mod.rs`.
4. `crates/cli/src/explorer.rs` — added `fetch_address_utxos` (`GET
   /address/:addr/utxo`) and `fetch_tip_height` (`GET /blocks/tip/height`), plus a
   public `AddressUtxo` struct and free-function wrappers, matching the existing
   `fetch_utxo`/`broadcast_tx` style in the same file. This is the indexer piece the
   parent's earlier research identified as missing from the whole reference repo.
5. New binary crate `crates/webserver` (package `webserver`, binary
   `allowance-webserver`) — Axum + tower-http `ServeDir`, implementing every endpoint
   in `webapp/API.md`: `POST /api/contracts`, `GET /api/contracts/:address[/status|/manifest]`,
   `POST /api/contracts/:address/withdraw`, `POST /api/faucet`, with static frontend
   serving as the fallback route. Contract params persist to
   `webapp/backend/data/contracts.json` via a small hand-rolled store
   (`crates/webserver/src/store.rs` — no real DB needed for this scale). A
   `crates/webserver/src/manifest.rs` module builds a best-effort, explicitly-labeled-
   speculative txmanifest-shaped JSON per contract (see its module doc for the
   ELIP-205 sourcing and why it's speculative — this follows directly from the
   parent's earlier doc research, not re-derived here).
6. Added `webapp/backend/data/` and a placeholder `webapp/frontend/index.html` so the
   server has somewhere to persist to / serve before the real frontend exists.

`crates/webserver` was NOT added to a workspace `members` list because it didn't need
to be: the root `Cargo.toml` already declares `members = ["crates/*"]`, which
auto-includes any new crate directory.

## Design decisions worth flagging

- **Where the allowance amount actually goes on a partial withdrawal.** Working
  through `allowance.simf`'s `partial_withdrawal()` arithmetic by hand: it only lower-
  bounds the *retained* (continuation) output
  (`difference <= retained_amount` where `difference = remaining_amount -
  ALLOWANCE_AMOUNT`), and Elements' value conservation then forces
  `retained + payout + fee == remaining_amount`. So the contract doesn't top up the
  fee from outside the allowance -- **the fee comes out of the per-period allowance
  itself**, i.e. `payout + fee <= ALLOWANCE_AMOUNT` in total. This is stated in the
  contract's own `enforce_single_input` comment but easy to miss; `withdraw_partial`
  withdraws the maximum allowed each call (`payout = allowance_amount - fee_amount`,
  `retained = remaining_amount - allowance_amount`, satisfying the contract's
  inequality with equality). A version that withdraws less and leaves more behind
  would need a different function; not built, since API.md doesn't ask for partial-
  of-partial withdrawals.
- **`withdraw_full` has no output-shape constraint from the contract at all.**
  `full_withdrawal()`'s branch in `main()` is just `()` -- it never calls
  `recursive_covenant()`, so nothing in the covenant restricts the transaction beyond
  what `enforce_single_input`/`enforce_signature`/`enforce_time_delay` already check
  (all path-independent). The 2-output `[payout, fee]` shape is a webserver design
  choice for this app, not something the contract demands -- worth knowing if a future
  iteration wants e.g. multiple payout outputs on the terminal withdrawal.
- **Reused the "recompile the program from stored params" pattern for signing**,
  exactly like the existing CLI commands do (`get_allowance_program` is called again
  inside the `withdraw` handler rather than caching the `CompiledProgram`) -- it's
  cheap relative to a network round trip and avoids a non-`Send`/non-serializable type
  living in the shared store.
- **Cross-checked every `simplicityhl`-internal type-path choice against already-
  working code in this same repo** rather than guessing blind, because I could not
  compile to verify (see blocker below). Specifically: `simplicityhl::elements` vs
  `simplicityhl::simplicity::elements` are two different module paths this codebase
  uses interchangeably for what must be the same underlying `elements` crate types --
  confirmed by `commands/last_will.rs` itself passing a `TxOut`/`Address`/`OutPoint`
  obtained via the `simplicity::elements` path into `contracts::sdk::*` functions
  whose signatures are typed via the plain `elements` path. `webserver/src/main.rs`
  was written to mirror that exact existing cross-path usage (import `Address`,
  `OutPoint`, `TxOut` from `simplicityhl::simplicity::elements`; import the `elements`
  module itself, for `schnorr::Keypair`/`bitcoin::secp256k1::*`, from
  `simplicityhl::elements` directly) rather than inventing a new pattern. Also used
  `OutPoint`'s `FromStr` (parsing a `"<txid>:<vout>"` string) instead of separately
  parsing a `Txid` and calling a constructor whose name I hadn't directly confirmed --
  clap's `--utxo <txid>:<vout>` argument in `commands/last_will.rs` only works because
  `OutPoint: FromStr` accepts exactly that format, so this leans on the single
  strongest piece of precedent available rather than a guess.

## BLOCKER: no C compiler/linker available in this sandbox -- nothing could be built or run

This is the single most important finding from this piece of work, and it stopped
steps 6-8 of the assigned task (build, smoke test, live testnet round trip) cold.

- `cargo`/`rustc` were not preinstalled at all. Installed them myself via
  `rustup` (downloaded `sh.rustup.rs` with `wget`, ran with `--profile minimal`;
  `curl` isn't available either). This part worked -- outbound network access to
  `static.rust-lang.org`/`sh.rustup.rs` is allowed, and rustup completed cleanly:
  `rustc 1.98.1` installed.
- The very first `cargo build -p webserver` failed immediately on the **first**
  crate with a build script (`quote`, a proc-macro dependency several levels below
  anything Simplicity/Liquid-specific) with:
  ```
  error: linker `cc` not found
    = note: No such file or directory (os error 2)
  ```
  This is not specific to any cryptography crate (`ring`, `secp256k1-zkp`, etc.) --
  it's `rustc`'s default linker driver on Linux, needed to link literally any Rust
  binary or build-script executable, pure-Rust or not.
- Confirmed exhaustively that no C toolchain exists anywhere reachable in this
  sandbox: `cc`, `gcc`, `clang`, `cc1` all "not found" via `command -v`; a filesystem
  search for `*gcc*`/`*clang*`/`cc1` under `/usr` turned up nothing. A linker
  binary (`ld`, `ld.gold`) does exist, bundled inside the Claude Code snap itself
  (`/snap/claude-code/50/usr/bin/ld`), and the Rust toolchain even ships its own
  `rust-lld`/`gcc-ld/ld.lld` -- but a working linker alone isn't sufient: linking a
  glibc executable also needs glibc's C runtime start files (`crt1.o`, `crti.o`,
  `crtn.o`) and `libc.so`'s dev symlinks, normally provided by `libc6-dev` /
  `build-essential`. A filesystem-wide search for `crt1.o` and `libc.so` (not just
  under `/usr`) found nothing either.
- No path to install one: no `apt`/`apt-get`/`dpkg` present at all (not just missing
  from `PATH` -- genuinely absent, unusual for a real Debian/Ubuntu system, which
  points at this being a deliberately minimal sandboxed environment rather than a
  full desktop despite `uname` reporting a real Ubuntu OEM kernel version). `sudo`
  and `snap` are both present as binaries but return `Permission denied` for this
  user, not a missing-privilege prompt -- so even a snap-packaged compiler (`snap
  install gcc` or similar) is not reachable, root or not.
- Did not attempt riskier workarounds (e.g. downloading a statically-linked GCC
  tarball from a third-party mirror and hoping it's compatible with the running
  kernel/glibc, or hand-crafting a `rustc`-bypassing static-linking flag combination
  without confirmed CRT objects) -- these have a low chance of success and a real
  chance of leaving broken/confusing partial state behind for comparatively little
  signal, given the blocker is already conclusively diagnosed.

**Net effect: every file listed above was written and manually cross-checked against
already-established, presumably-working code paths elsewhere in this same repository
(see "design decisions" above), but none of it has been compiled, type-checked, run,
or tested against real Liquid testnet. Steps 7 (curl smoke test) and 8 (live
faucet/withdraw round trip) were not attempted at all, since they require a running
server, which requires a successful build.** This should be treated as *unverified,
carefully-written-by-hand* Rust, not as working software, until it's built in an
environment with a proper C toolchain (e.g. `apt install build-essential` on a normal
Debian/Ubuntu host, or any standard Rust devcontainer image).

## Assessment: real blocker vs. doc-gap-worked-around

**Real, unresolved blocker (this session):** the missing C toolchain. Nothing in the
SimplicityHL docs is at fault here -- this is specific to the sandbox this agent is
running in, not a shortcoming of the Simplicity/Liquid tooling or its documentation.
It is, however, worth the parent/user knowing as an experiment-process finding: an
agent (or a human developer working in a similarly locked-down environment, e.g. a
CI container built from `scratch` or a minimal cloud IDE) would hit this exact wall
before ever getting to write a line of SimplicityHL, and none of the quickstart docs
mention "you need a working C toolchain" as a prerequisite alongside "install Rust" --
worth suggesting as a doc addition (`getting-started/quickstart/` currently just says
"Install Rust via rust-lang.org/tools/install" and doesn't mention `build-essential`/
Xcode-command-line-tools/equivalent, which most desktop Rust installs have already
satisfied incidentally and so never notice is a separate requirement).

**Doc-gaps worked around earlier (not this session's problem, carried over from the
parent's research and applied here without re-deriving):** the txmanifest spec/schema
gap (see `manifest.rs`'s module doc) and the missing address-level indexer in the
reference repo (see item 4 above) -- both already fully handled in code, not just
noted.
