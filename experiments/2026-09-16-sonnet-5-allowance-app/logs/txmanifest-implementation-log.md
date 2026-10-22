# Building examples/allowance and running it live on Liquid testnet

This picks up after the parent session corrected an earlier research mistake: the
"txmanifest book" and its reference implementation (`stringhandler/txmanifest-wallet`)
are real, not vaporware as first reported. That tool — a generic Rust CLI that reads a
JSON manifest + params and handles covenant compilation, UTXO resolution, PSET
building, signing, and broadcasting — ships prebuilt Linux binaries, which matters
because this sandbox has no C compiler and cannot build Rust from source. This log
covers writing a real manifest for `allowance.simf` and driving it end to end.

## Schema research

Read `schema/txmanifest.schema.json` in full and grepped `txmanifest_lib/src/*.rs` for
the manifest type vocabulary. Key findings that shaped the manifest:

- Witness map must name **every** witness the compiled program declares, nothing more.
  allowance.simf declares only `SIGNATURE` — unlike `last_will`'s examples, which all
  pair a `SPEND_PATH` selector witness with a signature, ours needs no selector since
  the contract branches on-chain balance internally rather than on a witness choice.
- `sequence: {"relative_blocks": <expr>}` maps directly to BIP68 relative timelocks —
  same convention as `last_will`'s `INHERIT_BLOCKS`.
- **`required_index` on inputs/outputs is parsed but NOT enforced** — the schema's own
  doc comment says so explicitly ("inputs land in declaration order and that ordering
  happens to satisfy the covenants... a reordering that breaks a covenant's
  introspection would surface only as an on-chain failure"). This mattered directly:
  allowance's `recursive_covenant()` hard-requires the continuation output at index 0,
  so I had to make sure `allowance_again` is literally the *first* entry in
  `PartialWithdraw`'s `outputs` array, not just annotated with `required_index: 0`
  (I kept the annotation too, for documentation, but it does nothing).
- `optional` on inputs has the same "parsed but not enforced" caveat — irrelevant here
  since allowance has no optional inputs.
- Field/compile-param types `u64`, `u16`, `pubkey` all confirmed in `covenant.rs`
  (mapping to Simplicity `u64`/`u16`/`u256` respectively) and `prompt.rs`.
- Amount expressions (`amount_sat` on inputs/outputs) are free-form strings evaluated
  against `params.*` / `instance.*` / `<input_id>.amount_sat` / the bare keyword `fee`
  — confirmed working in practice: `allowance_in.amount_sat - instance.ALLOWANCE_AMOUNT`
  and `instance.ALLOWANCE_AMOUNT - fee` both evaluated correctly (see broadcast
  results below).

## Manifest design (`examples/allowance/txmanifest.json`)

One `utxo_type` (`allowance`, wrapping `allowance.simf` with the 3 compile params),
one `contract_template` (`allowance_contract`) with three actions:

- **Fund** (constructor): wallet UTXO in, `allowance` covenant UTXO + optional change
  out, `create_instance` recording BENEFICIARY_KEY/ALLOWANCE_AMOUNT/MIN_DISTANCE.
- **PartialWithdraw**: covenant UTXO in (with `sequence.relative_blocks:
  instance.MIN_DISTANCE` and the `SIGNATURE` witness sourced from
  `instance.BENEFICIARY_KEY`), two outputs in this exact order — `allowance_again`
  (continuation, `amount_sat = allowance_in.amount_sat - instance.ALLOWANCE_AMOUNT`)
  then `beneficiary_payout` (`amount_sat = instance.ALLOWANCE_AMOUNT - fee`). Fee is
  deliberately taken out of the payout, not the continuation, matching
  `enforce_single_input()`'s own comment in the contract ("Fees therefore come out of
  the allowance itself").
- **FullWithdraw**: same input shape, single output `beneficiary_payout = 
  allowance_in.amount_sat - fee`, no continuation.

Split into two actions rather than one, because unlike `last_will`'s `SPEND_PATH`
witness selector, allowance's `main()` picks the branch internally by comparing
balance to `ALLOWANCE_AMOUNT` — there's no witness value to set to choose a path, so
the manifest has to offer both as separate callable actions and let the caller (or a
UI informed by current balance) pick the one that's actually valid.

`tx-manifest-wallet validate txmanifest.json` passed clean on the **first** attempt —
no iteration needed, which suggests the schema research above was accurate.

## Running it: the interactive-prompt problem

`run` is built as an interactive wizard (fee-rate prompt, broadcast confirmation) and
refuses non-TTY stdin outright: piping `"1.0\n"` via a shell pipe still fails with
`Error: prompt error for fee rate: IO error: not a terminal` — it's checking `isatty`,
not just trying to parse stdin. Worked around it with a small Python driver
(`pty.fork()` + `select`) that allocates a real pseudo-terminal, feeds queued
responses whenever the child goes quiet for >1.5s, and streams output live. This was
necessary purely because of running non-interactively from an agent; a human at a
real terminal would never hit this.

## Live round trip on Liquid testnet — full results

1. **Two wallets created** via `create-wallet`: `benefactor_wallet.json` and
   `beneficiary_wallet.json`. Beneficiary's signing pubkey
   (`fcc73154944f9eb42adff279e348a5ae9078826f191157b867b6e10dd0b5cade`) used as
   `BENEFICIARY_KEY`. Test params: `ALLOWANCE_AMOUNT=5000`, `MIN_DISTANCE=3` (blocks),
   funded amount `8000` sats — chosen so the first withdrawal is forced to be
   *partial* (8000 > 5000) and the remainder (3000) is small enough for a *full*
   withdrawal next, exercising both paths in one run.
2. **Faucet**: `GET liquidtestnet.com/api/faucet?...` sent 100,000 sats to the
   benefactor's receive address, txid `ba96a273b2f2...be243`, confirmed at height
   `2620719`.
3. **Fund**: `run txmanifest.json Fund` compiled the covenant
   (CMR `85334c3f...80635b8`, address
   `tex1p0488z8v0p3m3yv644n9d6ks7jl7celf8sttf4xjk9647a323t55q52fxym`), built/signed/
   broadcast a real tx: **`2563f774a52b73b490485decc79891dfa63d743bfc646353c299e504385ce11f`**,
   8000 sat to the covenant + change back to wallet + 1387 sat fee. Confirmed at
   height `2620721`.
4. **PartialWithdraw attempted early** (0 of 3 blocks elapsed): the engine's own
   Simplicity dry-run and signing both **passed** (proving the manifest/witness/output
   shape is correct), but the actual network broadcast was rejected:
   `HTTP 400: sendrawtransaction RPC error -26: non-BIP68-final`. This is real,
   independent confirmation that the timelock is enforced by consensus, not just
   decorative — and confirms the engine correctly does NOT write a new state file on
   a failed broadcast (`allowance.state.2.json` was never created by this attempt;
   the original `allowance.state.json` stayed valid for the retry).
5. **PartialWithdraw retried** after tip height reached `2620724` (3 blocks after
   confirmation): succeeded. Broadcast txid
   **`d7b1cd82a4cc283fc7fd5ccc32fd69684d130d4f58e2fa5b700222598afc03f4`** — output 0:
   3000 sat continuation (`8000 - 5000`), output 1: 3440 sat beneficiary payout
   (`5000 - 1560` fee), output 2: 1560 sat fee. Confirmed at height `2620725`.
6. **FullWithdraw** on the 3000 sat remainder (≤ ALLOWANCE_AMOUNT, so valid), after
   waiting 3 more blocks (tip `2620728`): succeeded. Broadcast txid
   **`5ab387f963f2c5a6fdb402a9e9fe11531f8533dee1da3b87b684d6148398e383`** — single
   payout output, 1519 sat (`3000 - 1481` fee), no continuation — covenant closed.
   Confirmed at height `2620729`.
7. **Final check**: `sync --wallet beneficiary_wallet.json` shows balance
   `4959 sat (2 UTXOs)` = `3440 + 1519`, exactly matching the two payouts above.

Every number reconciles exactly with the contract's own arithmetic. This is a
complete, real, on-chain demonstration of the allowance contract's full lifecycle —
funding, a rejected early claim, a successful partial claim, and a successful final
claim — driven entirely through a generic txmanifest-consuming wallet rather than any
bespoke signing code.

## Blockers vs. workarounds

- Real blocker (environment-specific, not SimplicityHL's fault): no C compiler in
  this sandbox — worked around entirely via prebuilt binaries (both `simc` and
  `tx-manifest-wallet` ship them).
- Workaround, not a blocker: `run`'s hard TTY requirement needed a pty driver script
  to use non-interactively. A real human would just run it in a real terminal.
- No actual blockers or bugs found in `tx-manifest-wallet` itself. The one schema
  surprise (`required_index` unenforced) was clearly documented in the schema's own
  description text, so it's a "read the docs closely" issue, not a gap.

## What was NOT staged to git

`benefactor_wallet.json` and `beneficiary_wallet.json` contain plaintext BIP39
mnemonics (testnet-only, faucet funds, effectively worthless — but still real private
key material). Left them out of `git add` deliberately; only the manifest, contract
source, params, and instance/state files (public data: txids, amounts, addresses) are
staged. If these example wallets are wanted in the repo for reproducibility, they
should go through a decision to either regenerate throwaway keys fresh each time or
accept committing testnet-only secrets — not staged automatically here.
