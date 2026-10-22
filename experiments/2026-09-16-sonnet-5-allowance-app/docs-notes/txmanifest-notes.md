# txmanifest for the allowance contract — reasoning and status

## Correction

An earlier version of this note claimed the "txmanifest book" and its reference
wallet implementation didn't really exist. That was wrong — it was a research
failure on my part (a summarizing WebFetch pass silently dropped the actual page
links; a follow-up web search looked under the wrong GitHub org), not a real
documentation gap. Caught when the human running this experiment asked me directly
which URL I'd tried and what result I got, which I couldn't answer without going
back and checking properly. Full account in `logs/LOG.md`. Corrected facts below.

## What's actually there

- **The book**: https://stringhandler.github.io/tx_manifest_book/ — a cookbook-style
  guide ("Getting Started", "The Cookbook", "The Full Walkthrough", "Appendix"),
  documents manifest format `0.2.0`.
- **The reference implementation**: https://github.com/stringhandler/txmanifest-wallet/
  — a real, actively-developed (third-party/community, not an official Blockstream
  project) Rust workspace: a generic "declarative transaction engine" / wallet CLI.
  Given a `txmanifest.json` (protocol description) and a `params.json` (this
  instance's concrete values), it handles covenant compilation, UTXO resolution, PSET
  construction, signing, and broadcasting itself — you don't write any of that by
  hand. Defaults to Liquid testnet; its own README says not to use it with real
  funds (experimental, unaudited).
- **Prebuilt binaries**: GitHub releases include
  `tx-manifest-wallet-v0.2.2-x86_64-unknown-linux-gnu.tar.gz` (plus macOS/Windows) —
  runnable without a Rust toolchain.
- **Worked examples** ship in the repo, including `examples/last_will/` — a 3-key
  recursive covenant with a timelocked inheritance path, structurally close to our
  allowance contract (also a recursive covenant with a relative timelock). Its
  `txmanifest.json` shows the real schema in practice: `utxo_types` (maps a named
  UTXO type to a `.simf` source + compile-time params + asset), and
  `contract_templates` with named `actions` (e.g. `Fund`, `Refresh`, `Inherit`), each
  declaring typed `inputs` (with `utxo_source`, optional `sequence.relative_blocks`
  for timelocks, and `witnesses` including wallet-sourced `Signature` witnesses) and
  `outputs` (with `destination`, `amount_sat` as either a literal or an expression
  like `will_in.amount_sat - fee`, and `required_index` to pin recursive-covenant
  continuation outputs to a specific position). A real `schema/txmanifest.schema.json`
  exists for validation.

## Revised plan

Write `examples/allowance/allowance.simf` + `params.json` + `txmanifest.json`
following this same pattern, with two spend actions instead of last_will's three
(allowance.simf has no witness-selected spend-path branch — `main()` picks
full-vs-partial internally by comparing the covenant's on-chain balance to
`ALLOWANCE_AMOUNT` — so the manifest exposes this as two actions, `PartialWithdraw`
and `FullWithdraw`, and the app/user picks whichever the current balance makes valid,
informed by the engine's own state/describe output). Drive it with the prebuilt
`tx-manifest-wallet` binary for every contract-touching operation. This is a much
closer match to the prompt's "help the beneficiary use an existing wallet
application... probably using the txmanifest technology" than hand-rolling PSET
construction in a bespoke backend — see `logs/LOG.md` for the full reasoning and the
research mistake that delayed finding it.

## What's still true from the original assessment

- No *mainstream, consumer-facing* Liquid wallet (Jade, Blockstream App, etc.) can
  import a manifest for an arbitrary custom covenant today — `txmanifest-wallet` is a
  developer CLI, not something a non-technical end user would run themselves. The web
  app this project builds is still the right layer for that non-technical user; it
  now drives `tx-manifest-wallet` as its backend engine rather than reimplementing
  the same logic.
- The manifest format itself is still explicitly pre-1.0 (`0.2.0`) and evolving —
  worth building against the real schema/examples rather than assuming stability.
