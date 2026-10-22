# SimplicityHL Allowance Contract Experiment — Log

Role: full-stack dev at a finance company evaluating SimplicityHL/Liquid for building
an allowance smart-contract app (benefactor funds it, beneficiary withdraws weekly).
Target: Liquid **testnet**. Goal: web app for both sides + txmanifest-based wallet
handoff + indexer to find current UTXO. Constraint: learn via docs.simplicity-lang.org
and experimentation rather than relying on built-in prior knowledge of Simplicity/Liquid.

Conventions in this log: timestamps are session-relative steps, not wall-clock.
"CONFUSION:" and "DOC GAP:" tags mark things worth feeding back into the docs/prompt.

## Step 1 — Orientation: docs homepage

Fetched https://docs.simplicity-lang.org/ (twice — first pass got a summary, second
pass asked for raw links + full code so I didn't miss anything).

Findings:
- SimplicityHL = Rust-like high-level language compiling to Simplicity. Simplicity is
  "live on Liquid mainnet since July 2025."
- The homepage's allowance covenant sample is the exact contract described in the
  prompt. Saved verbatim to `contracts/allowance.simf`.
- Site structure I'll need, in likely visit order:
  - Get Started: `getting-started/try-it/`, `getting-started/quickstart/`
  - Learn: `documentation/execution-model/`, `documentation/state/` (covenants/state),
    `documentation/witness/`, `documentation/oracle/`, `documentation/timelocks/`,
    `documentation/simplex/` (Simplex SDK), `documentation/wallet/` (ecosystem/wallet
    integration), `documentation/txmanifest/` (**txmanifest** — this is the mechanism
    the prompt wants me to use for the wallet handoff, so this page is high priority)
  - Reference: `simplicityhl-reference/` (language syntax, types, functions, etc.),
    `documentation/jets/`, `documentation/stdlib/`, `documentation/witness-format/`
    (.wit files), `documentation/toolchain/` (**toolchain reference** — need this to
    know what CLI/compiler to install)
  - Examples: GitHub `BlockstreamResearch/SimplicityHL/tree/master/examples` (basic),
    `BlockstreamResearch/simplicity-contracts` (advanced), plus use-cases pages for a
    DEX and a lending protocol.
- There's also `/llms.txt` and `/llms-full.txt` — machine-readable doc dumps. Could be
  a fast way to ingest the whole doc site; will consider if targeted browsing gets slow,
  but reading via real pages first to mimic an actual developer's path per the prompt's
  intent.

### Reading the allowance.simf contract itself

Contract logic (from the code + its own comments, no outside knowledge assumed):
- Params (compile-time constants, chosen by the benefactor before funding):
  `ALLOWANCE_AMOUNT` (u64, sats presumably), `MIN_DISTANCE` (a `Distance`, i.e. a
  relative-blocks timelock), `BENEFICIARY_KEY` (a `Pubkey`).
- Witness: `SIGNATURE` supplied by whoever spends it (the beneficiary).
- `main()`: checks beneficiary's BIP-340 signature over the whole transaction
  (`sig_all_hash`), enforces the relative timelock via the input's nSequence field
  (`enforce_relative_distance` / `parse_sequence`), enforces exactly one input to the
  tx (so allowance UTXOs can't be merged or have their balance-checks confused), then
  branches: if remaining balance <= ALLOWANCE_AMOUNT, beneficiary can take it all with
  no continuation output; otherwise beneficiary must recreate the exact same covenant
  script at output 0 with a big enough balance left, take their withdrawal at output 1,
  and output 2 must be the explicit Elements fee output. No other outputs allowed.
- Important operational implications for the app I'm building:
  - Every spend needs a transaction of shape [this covenant] -> [covenant (maybe),
    beneficiary payout, fee]. This is NOT a generic "send to any address" wallet
    operation — a generic wallet would need to be told the exact output structure,
    which is presumably what txmanifest is for.
  - Funding output MUST be explicit (non-confidential) asset+amount, or funds are
    stuck forever. This is a real foot-gun for the benefactor UI: default Liquid
    wallets often send confidential outputs by default. The UI/instructions must be
    very explicit about this.
  - Each UTXO at the contract address is its own independent allowance; sending more
    funds to the same address creates a second, unrelated allowance rather than
    topping up the first. Relevant for "how do I fund this" UX copy.
  - The beneficiary key is a single BIP-340 pubkey (Schnorr) — so the beneficiary
    needs a Simplicity/Taproot-capable Liquid wallet that can produce such a signature
    for a covenant it doesn't natively understand — again, txmanifest territory.

Next: read the toolchain reference (to find what to install) and the txmanifest page
(central to the wallet-handoff requirement), then the quickstart to actually get a
compiler running.

## Step 2 — Toolchain, txmanifest, wallet integration, quickstart

- **Toolchain** (`documentation/toolchain/`): two CLIs, `simc` (`cargo install
  simplicityhl`) compiles .simf -> base64 Simplicity + CMR; `hal-simplicity`
  (`cargo install hal-simplicity`) inspects programs and builds PSETs
  (create/update-input/finalize/run/extract) and signs (sighash). But the page itself
  says most real development goes through Rust SDKs or "Liquid Wallet Kit" rather than
  raw CLI — and the quickstart bears this out (see below).
- **txmanifest** (`documentation/txmanifest/`): JSON format to "teach wallets" about a
  contract (recognize instances on-chain, describe them to users, build txs for them).
  Docs page says the spec is "work-in-progress and has not yet been frozen," and points
  to a "txmanifest book" for details.
  - CORRECTION (added after the human running this experiment questioned my first
    pass — see below): my original note here claimed the "txmanifest book" and the
    "txmanifest-wallet" reference implementation didn't really exist. **That was
    wrong, and it was my own research failure, not a documentation gap.** The first
    pass fetched this page through a summarizing tool that dropped the actual link
    hrefs and only kept visible link text, then went looking for "txmanifest-wallet"
    under the `BlockstreamResearch` GitHub org via web search and got nothing —
    without ever re-fetching this page asking specifically for its raw hyperlinks. It
    reported the resulting blank as "doesn't exist" instead of as "I couldn't find
    it." When asked directly which URL I'd tried and what I got back, I couldn't
    answer, re-checked, and found both links right there in the page's own markup:
    - txmanifest book: https://stringhandler.github.io/tx_manifest_book/ (real, a
      cookbook-style guide, describes manifest format 0.2.0)
    - reference wallet: https://github.com/stringhandler/txmanifest-wallet/ — under
      GitHub user `stringhandler`, not `BlockstreamResearch` (which is exactly why
      the org-scoped search came up empty). This is a real, actively-developed
      (54+ commits) Rust Cargo workspace: a generic "declarative transaction engine"
      that reads a JSON manifest + params and handles covenant compilation, UTXO
      resolution, PSET construction, signing, and broadcasting for you, against
      Liquid testnet by default. It ships prebuilt Linux/macOS/Windows binaries via
      GitHub releases (v0.2.2 as of this session) — no Rust toolchain needed to run
      it. It includes worked examples for several contracts, including one
      structurally close to ours: `examples/last_will/` (a 3-key recursive covenant
      with a timelocked inheritance path), with a full `txmanifest.json`,
      `params.json`, and the `.simf` source side by side. There's also a real JSON
      Schema at `schema/txmanifest.schema.json`.
    - Lesson for how I work, not just a fact to log: a WebFetch call that returns a
      confident-sounding prose summary is not the same as having actually seen a
      page's content, especially its links — summarizing tools drop things silently.
      When a claim rests on "X doesn't exist," that claim deserves an actual fetch of
      the specific page with an explicit ask for raw links/hrefs (or a `git clone` /
      direct file read, as I should have done here immediately rather than after
      being asked), not a general web search standing in for it.
  - This also **reverses my earlier conclusion that no wallet could realistically
    consume a txmanifest for this contract.** `txmanifest-wallet` is exactly that —
    generic, not tied to one specific contract, real, and runnable today without
    building from source. It's still fair to say it's a third-party/community
    developer tool (not an official Blockstream product, not a consumer-friendly
    wallet UI, explicitly marked experimental/unaudited/testnet-only by its own
    README) rather than something an actual non-technical parent/child would run
    themselves — so the app I'm building still needs to be the thing a non-technical
    user interacts with — but as the underlying engine doing the actual covenant
    compilation/signing/broadcasting, it's a much better fit than hand-rolling that
    logic myself, and a much better fit for the prompt's "use an existing wallet
    application... using the txmanifest technology" framing than I'd given it credit
    for. Revised plan: write `examples/allowance/{allowance.simf,params.json,
    txmanifest.json}` following the `last_will` example's pattern, and have my app
    shell out to the prebuilt `tx-manifest-wallet` binary for every contract-touching
    operation, rather than reimplementing PSET/signing logic in my own backend.
- **Quickstart** (`getting-started/quickstart/`): walks through a *different*,
  structurally similar contract, `last_will.simf` (hot/cold/inheritor 3-key covenant
  with a check-in-resets-timelock pattern), not the allowance contract — the homepage
  and the quickstart use different examples. Two paths offered: a Rust path using repo
  `github.com/BlockstreamResearch/simplicity-demo`, and a raw bash/CLI path using
  `simc`/`hal-simplicity`/`curl`/`jq` directly. The Rust path is clearly the intended
  "real" workflow (the CLI path's own doc summary notes an inheritance spend must be
  built, fails pre-timelock with `non-BIP68-final`, and resubmitted after — all
  handled by ergonomic Rust commands in the other path). Cloned
  `simplicity-demo` into `logs/scratch-simplicity-demo/` to use as an adaptation base
  for the allowance contract instead of writing PSET-building code from scratch.
- **Simplex SDK** (`documentation/simplex/`): a *separate* Rust framework
  (`curl -L https://smplx.simplicity-lang.org | bash`) for local integration testing
  against a regtest `elementsd` (`simplex test`/`simplex regtest`). Decided **not** to
  use this for the live-testnet app itself (it's for local test automation, not
  driving real testnet transactions), though it could be useful later for automated
  tests of the allowance contract's logic before touching testnet.

## Step 3 — Parallel deep dives (delegated to two background research agents)

To keep moving efficiently I ran two research passes in parallel rather than serially:
(A) a deep read of the cloned `simplicity-demo` Rust repo to find a concrete
implementation plan, and (B) continued doc research into txmanifest's real spec,
the jets used by allowance.simf, timelocks, witness/.wit format, and the faucet/
explorer APIs. Condensed findings:

**(A) simplicity-demo repo internals**
- It does NOT shell out to `simc`/`hal-simplicity`; it links `simplicityhl` (crate
  v0.7.1) directly as a Rust library. `CompiledProgram::new_with_unstable(source,
  unstable_features, arguments, true, Box::new(ElementsJetHinter::new()))` compiles;
  params are supplied as a `simplicityhl::Arguments` map keyed by `WitnessName`
  matching the `param::X` names in the .simf source — no separate .args file needed
  when driven from Rust. allowance.simf needs no unstable/`-Z enums` flag (unlike
  last_will) since its only witness is a bare `Signature`.
- Address derivation: single-leaf Taproot tree with the compiled program's CMR as the
  only script leaf, and a fixed NUMS internal key (since allowance, like last_will,
  has no legitimate key-path spend — only `p2pk.simf` in that repo uses a real
  internal key). `Address::p2tr(...)`.
- PSET flow: build `PartiallySignedTransaction::new_v2()`, explicit (non-confidential)
  `Output::new_explicit(script, amount, asset, None)` for every output plus
  `Output::from_txout(TxOut::new_fee(...))`, `pst.extract_tx()`, sign via
  `ElementsEnv`/`sighash_all()`/`keypair.sign_schnorr`, finalize by running the
  compiled program against the witness (`program.satisfy(...).redeem()...`) and
  writing the 4-element Simplicity/Taproot witness stack (witness bytes, program
  bytes, CMR, control block), then broadcast with `POST {esplora}/tx` (raw hex body).
- CONFUSION/GAP found by the sub-agent, worth remembering: **the existing repo has NO
  address -> current-UTXO indexer.** Every command takes an explicit `--utxo
  txid:vout` argument because its CLI operator always already knows the txid (they
  just funded it or just spent it themselves). A beneficiary who didn't fund the
  contract, or who's checking in after several recursive spends, has no such
  foreknowledge — this is exactly the indexer the prompt calls out as possibly
  necessary ("may require implementing an indexer... find the newest UTXO!"), and it
  turns out the reference implementation the docs point you to doesn't have one
  either. Will build on Esplora's plain `/address/:addr/utxo` endpoint.
- `blinder.rs` (confidential-output helper) is unused scaffolding in the existing repo
  and must NOT be used for allowance — every output touching this contract has to stay
  explicit/unblinded (contract panics otherwise, funds-stuck risk called out in the
  contract's own header comment).
- last_will's 2-output shape (covenant + fee) doesn't structurally match allowance's
  3-output partial-withdrawal shape (covenant + beneficiary payout + fee) or its
  2-output full-withdrawal shape (payout + fee, with NO covenant continuation) --
  those SDK functions need to be written new, following the same *pattern* as
  `transfer_native`/`last_will.rs` but not reusable as thin wrappers.
- Build risk: full workspace (`simplicity`, `elements`, `secp256k1-zkp` compiled from
  source) — expect a slow first `cargo build`, but no blocking system-dependency or
  regtest-node requirement for driving live testnet (that's only needed by the
  separate `smplx`/Simplex test framework, not this CLI).

**(B) Remaining docs**
- Jets: all 17 jets used in allowance.simf are documented under `documentation/jets/`
  with matching signatures; no mismatches found.
- Timelocks (`documentation/timelocks/`): `Distance` = relative block count, `Duration`
  = relative 512-second units. Client sets `nSequence` directly to the Distance value
  for a block-based relative timelock (matches `enforce_relative_distance`'s
  `unwrap_left` on `parse_sequence`, which rejects a time-based sequence encoding).
  Liquid blocks are ~1/minute, so e.g. `MIN_DISTANCE = 10` is roughly a 10-minute
  cooldown on testnet -- worth surfacing prominently in the benefactor's parameter UI
  so "weekly" translates to a sane block count (mainnet is also ~1 min/block per
  Liquid's design, so the same block-count math should carry over, modulo actual
  observed block times).
- `documentation/state/`: for a covenant whose script hash is constant across
  generations (true for allowance, since params don't change across spends — only
  balance changes), tracking state reduces to "list unspent outputs at this one
  address," not the general "recursive covenant with changing script hash" case the
  page mostly discusses. Simplifies the indexer considerably.
- `.wit` format (`documentation/witness-format/`): JSON, primitives as strings
  (decimal or 0x-hex), tuples/arrays/Option/Either/enum all have defined textual
  encodings. Consumed by `simc --json contract.simf -w witness.wit` in the pure-CLI
  workflow; not needed directly for the Rust-library workflow (witnesses are built as
  in-memory `Value` maps there).
- Faucet: DOC GAP — docs.simplicity-lang.org itself never prints a concrete faucet
  URL, just says "a faucet service." Found via the cloned repo's `faucet.rs` (and
  confirmed by web search): `GET https://liquidtestnet.com/api/faucet?address=<addr>&action=lbtc`
  -> `{"txid": "..."}`; human UI at https://liquidtestnet.com/faucet. This is a
  third-party service, not Blockstream/Simplicity-operated -- an operational
  dependency outside this project's (or Blockstream's) control, worth flagging as a
  fragility risk for the demo.
- Explorer: `https://blockstream.info/liquidtestnet/api`, standard Esplora surface:
  `GET /address/:addr/utxo`, `GET /tx/:txid`, `GET /tx/:txid/hex`, `GET
  /blocks/tip/height`, `POST /tx` (broadcast, raw hex body).
- Mainnet differences found: chain param `liquidv1` vs `liquidtestnet`; testnet has NO
  peg-in from a parent chain, so testnet tLBTC only ever comes from faucets, never a
  real peg -- another testnet-only fragility. DOC GAP: neither docs site had a
  mainnet migration checklist; I'll write my own reasoned one at the end based on what
  actually differs (network params/address prefixes, real asset IDs fetched from a
  live node rather than hardcoded, real key custody, no faucet, real fees).
- CONFUSION avoided: a web search result briefly surfaced what looked like a mainnet
  LBTC asset ID but it was the wrong byte length (66 hex chars, not 64) — almost
  certainly a scraping artifact, not a real asset id. Noted rather than trusted;
  the right way to get a real asset ID is a live node/explorer query, not a copied
  string, and I will do this only if/when actually documenting mainnet steps, without
  executing any mainnet transaction.

Next: define the web app's API contract, then implement — extending the cloned repo
with an `allowance` module + small HTTP API server (reusing the repo's compile/PSET/
sign/broadcast logic as a library), plus a static frontend, plus the new indexer.

## Step 4 — Rust backend attempt: blocked by the sandbox, not by the docs

Wrote `webapp/API.md` (full endpoint contract) and a static frontend
(`webapp/frontend/`) against it, then had a background agent implement the backend by
extending the cloned `simplicity-demo` repo per Step 3(A)'s plan: new `allowance`
module mirroring `last_will.rs`, new withdraw SDK functions, an indexer extension to
`explorer.rs`, and a new Axum `webserver` crate.

**This never compiled.** The sandbox this session runs in is a snap-only "Ubuntu
Core" box: no C compiler anywhere (`cc`/`gcc`/`clang` all absent), no `apt`/`dpkg`,
and `sudo`/`snap` both return permission-denied for this user — confirmed
independently, not just taken on the sub-agent's word. `rustc` needs a working
linker to produce *any* output, including the shared libraries that proc-macro
crates (`serde`, `clap`, etc.) compile to, so even `cargo check` — not just the final
link — is blocked; this has nothing to do with SimplicityHL's own tooling being
deficient. Full account: `logs/backend-implementation-log.md`; the code itself lives
in `webapp/backend/` with a `STATUS.md` marking it unverified. Deleted the resulting
2.2GB of half-built `target/` artifacts before committing anything (kept the ~480KB
of actual source).

CONFUSION worth recording precisely because it's easy to overlook: the quickstart's
"install Rust" step never separately calls out needing a working C toolchain
alongside it. On a typical desktop this is invisible (a C toolchain is usually
already there), but it's a real, separate prerequisite the docs don't name.

Told the user about the blocker and asked how to proceed (three options: pivot
language, ship the Rust code unverified, or have them build it outside this
sandbox). They offered to build it for me on their own machine. Before taking them up
on that, though, a separate correction (next section) opened a better path entirely.

## Step 5 — Correcting a research mistake: txmanifest is real and working

The user asked me directly: "what URL did you try for the txmanifest book, and what
result did you get?" I couldn't answer without re-checking — and that re-check found
I'd been wrong. Full mechanism, since it's a generalizable lesson and not just a fact
to correct: my first pass at `documentation/txmanifest/` used a WebFetch call that
returns a prose summary rather than raw content; that summary quietly dropped the
page's actual hyperlink hrefs and kept only visible link text. A follow-up web search
for "txmanifest-wallet" implicitly searched under the `BlockstreamResearch` GitHub
org (where the rest of the project's repos live) and found nothing, and I reported
that as "doesn't exist" rather than "I couldn't find it." Both were wrong:

- The book is real: https://stringhandler.github.io/tx_manifest_book/
- The reference wallet is real: https://github.com/stringhandler/txmanifest-wallet/
  — just under a different (community) GitHub user, `stringhandler`, not
  `BlockstreamResearch`, which is exactly why an org-scoped mental model of "where
  else would it be" came up empty.

**The generalizable mistake**: treating a summarizing tool's confident prose as
equivalent to having actually seen a page, and treating one search coming back empty
as proof of absence rather than as "I haven't found it yet." Both failures compound
silently — neither one *feels* uncertain from the inside. Corrected in detail in
`docs-notes/txmanifest-notes.md`.

This didn't just fix a citation — it changed the architecture. `txmanifest-wallet` is
a real, actively-developed (community, not official-Blockstream), Cargo-workspace CLI
that reads a `txmanifest.json` + `params.json` and itself handles covenant
compilation, UTXO resolution, PSET construction, signing, and broadcasting — against
Liquid testnet by default, explicitly marked experimental/unaudited. It ships
prebuilt Linux/macOS/Windows binaries (v0.2.2 at the time of this session), which
sidesteps the Step 4 compiler blocker entirely. It ships a worked `examples/last_will/`
manifest structurally close to our contract. This reverses the earlier (also
now-corrected) conclusion that no wallet could realistically consume a txmanifest for
a custom covenant today — one can, it's just a developer CLI rather than a
consumer-facing wallet app, so the web app this project builds is still needed as the
layer a non-technical benefactor/beneficiary actually touches, but it can now *drive*
this real engine instead of reimplementing PSET/signing logic itself.

Discussed the resulting design question with the user directly: should the web app's
backend shell out to `tx-manifest-wallet` (yes), and since that tool keeps keys in a
local `wallet.json`, should a shared multi-user server hold everyone's keys, or should
each party run their own local instance? Flagged this explicitly rather than deciding
silently; proceeding with local-per-party as the default for this testnet demo, noted
as a specific thing a future iteration of this prompt could ask to explore
differently (a shared server with client-side-only signing, say).

## Step 6 — Live round trip on real Liquid testnet, driven entirely by txmanifest-wallet

Wrote `examples/allowance/{allowance.simf,params.json,txmanifest.json}` following the
`last_will` example's pattern (full design reasoning and schema findings in
`logs/txmanifest-implementation-log.md`; not duplicated here). Two structural notes
worth keeping in the main log:

- allowance.simf has no witness-selected spend-path (unlike last_will's `SPEND_PATH`
  enum witness) — `main()` picks full-vs-partial internally by comparing on-chain
  balance to `ALLOWANCE_AMOUNT`. So the manifest exposes **two separate actions**,
  `PartialWithdraw` and `FullWithdraw`, and the caller/UI has to pick whichever the
  current balance makes valid — there's no single "Withdraw" action the schema can
  express for this particular contract shape.
- DOC-ADJACENT GAP (in the schema's behavior, not the docs site): `required_index` on
  outputs is parsed but **not enforced** by the engine (confirmed straight from the
  schema's own doc comments) — output ordering in the JSON array is what actually
  binds. This mattered concretely: `allowance.simf`'s `recursive_covenant()`
  hard-requires the continuation output at index 0, so the continuation entry had to
  be listed *first* in `PartialWithdraw`'s `outputs` array; the `required_index: 0`
  annotation alone would silently not have enforced this.

`validate` passed clean on the first attempt. Then a full, real, live round trip
(every number below independently re-verified against the public testnet explorer
API after the fact, not just taken from the sub-agent's report):

1. Faucet funded the benefactor's own wallet (100,000 sats).
2. `Fund` (test params: `ALLOWANCE_AMOUNT=5000`, `MIN_DISTANCE=3` blocks,
   funded 8000 sats — chosen so the run would exercise a partial withdrawal followed
   by a full one) — compiled the covenant, address
   `tex1p0488z8v0p3m3yv644n9d6ks7jl7celf8sttf4xjk9647a323t55q52fxym`, broadcast
   `2563f774a52b73b490485decc79891dfa63d743bfc646353c299e504385ce11f`, confirmed
   height 2620721.
3. `PartialWithdraw` attempted at 0/3 blocks elapsed: signing succeeded (proves the
   manifest/witness shape is right) but broadcast was rejected by the node with
   `non-BIP68-final` — **real, independent proof the timelock is consensus-enforced,
   not just decorative**, and the engine correctly wrote no stale state file on the
   failed attempt.
4. `PartialWithdraw` retried at 3/3 blocks elapsed: succeeded, txid
   `d7b1cd82a4cc283fc7fd5ccc32fd69684d130d4f58e2fa5b700222598afc03f4`, confirmed
   height 2620725. Outputs: 3000 sat continuation, 3440 sat payout, 1560 sat fee —
   exact arithmetic match to `8000 - 5000` and `5000 - 1560`.
5. `FullWithdraw` on the 3000 sat remainder (≤ ALLOWANCE_AMOUNT, so valid): succeeded,
   txid `5ab387f963f2c5a6fdb402a9e9fe11531f8533dee1da3b87b684d6148398e383`, confirmed
   height 2620729. Single 1519 sat payout, no continuation — covenant closed.
6. Independently re-queried all three txids against
   `https://blockstream.info/liquidtestnet/api` myself after the sub-agent reported
   back (not just trusting its summary): confirmed status, block heights, and every
   output address/amount all matched exactly.

This is a complete, verified, on-chain demonstration of the allowance contract's full
lifecycle — funding, a correctly-rejected early claim, a correctly-succeeding partial
claim, and a correctly-succeeding final claim — driven entirely through a generic,
real, txmanifest-consuming wallet rather than any bespoke signing code written for
this project.

Workaround (not a blocker, not a docs gap): `tx-manifest-wallet run` is an
interactive wizard that hard-checks `isatty` on stdin and refuses piped input outright
even with well-formed responses queued up — needed a small Python `pty.fork()` driver
to run it non-interactively from an agent. A human at a real terminal would never hit
this.

Housekeeping: the two throwaway test wallets (`benefactor_wallet.json`,
`beneficiary_wallet.json`) contain plaintext BIP39 mnemonics — testnet-only, faucet
funds, effectively worthless, but still real key material by shape. Deliberately kept
out of git (`.gitignore`d), even though committing throwaway testnet secrets would be
low-stakes, on the general principle of not making a habit of committing key material
even when the specific instance doesn't matter.

Next: build a thin Python wrapper (no compiler needed) that shells out to
`tx-manifest-wallet` for the web app's actual backend, wire it to the existing
frontend, and adjust the frontend where its assumptions (one "Withdraw" action, a
Rust-backend-shaped API) no longer match this contract's real two-action shape.

## Step 7 — Python backend (`webapp/server/`): a real bug I found and fixed, and a
## real third-party infrastructure limit

Wrote `webapp/server/{tmw.py,wallet_store.py,indexer.py,faucet.py,app.py}` — a thin
wrapper (stdlib only, no dependencies, so nothing to `pip install`) that shells out to
`tx-manifest-wallet` for every contract-touching call, plus the address-based
indexer (direct Esplora `/address/:addr/utxo` calls, independent of any wallet/state
file — see Step 3(A) for why this piece has to exist at all). One local `wallet.json`
per running instance, per the custody discussion with the user in Step 5.

Before writing any of this, ran the actual binary interactively (via a small pty
script) to observe real prompts rather than guessing: confirmed `run` shows a "Fee
rate (sat/vb)" prompt (not always — sometimes cached) then a "Broadcast transaction?
[y/N]" prompt, confirmed the exact success line (`Broadcast txid: <hex>`) and the
exact failure line for an early-timelock rejection (`Broadcast failed: HTTP 400:
sendrawtransaction RPC error -26: non-BIP68-final`, matching what the earlier fork
had already found), and confirmed no stale state file is written on a failed
broadcast. Did my own fresh Fund + early-PartialWithdraw-rejection round trip (new
throwaway wallets, new params) rather than only relying on the earlier fork's — a
second independent confirmation the whole mechanism is reliable, not a one-off.

**Found and fixed a real bug in my own code** (not in `tx-manifest-wallet`): my first
pty driver stopped reading output based on a "quiet for N seconds with no more
scripted responses to send, so it must be done" heuristic — copied from the
exploratory script that worked fine standalone. Once wired into the actual
multi-threaded HTTP server and exercised concurrently (two server instances running
at once, simulating benefactor and beneficiary each running their own local
installation), that heuristic lost a race: the child process legitimately paused
longer than the quiet threshold while waiting on the broadcast HTTP call, the driver
gave up and stopped reading, and the API call returned an "unparseable output" error
— **even though the underlying Fund action had actually succeeded and broadcast a
real transaction**, confirmed by checking the wallet's balance afterward (it showed
exactly `100000 − 6000 (covenant) − 1387 (fee)` sat, i.e. the spend had gone out,
while my API response claimed failure). This is exactly the kind of silent
success/failure mismatch that would be dangerous in a real financial app (a user
retrying a "failed" funding action could end up double-funding, or a beneficiary
distrusting a working withdrawal). Fixed by making termination depend only on EOF
(the pty genuinely closing when the child exits) or a generous hard timeout, never on
an inferred "it's probably done" signal. Full reasoning is in `tmw.py`'s own comment
above `_run_pty`, written at the time of the fix so it doesn't get lost.

**Then hit a separate, real, external limit** while running a full end-to-end test of
the actual web app (two local server instances talking HTTP to each other, mimicking
benefactor and beneficiary each running their own installation): wallet `sync` started
failing outright with `Error: Sync failed: Too many retry` against
`blockstream.info/liquidtestnet` — confirmed via a direct, un-timeout-raced CLI call
(not just my code) that this is the tool correctly reporting a real upstream problem,
not a hang. Almost certainly rate-limiting or overload from this session's own
cumulative request volume against one shared public Esplora instance across many
faucet calls, syncs, broadcasts, and address lookups over the course of this
experiment. This is precisely the fragility already flagged in
`docs-notes/mainnet-notes.md` ("a beneficiary's ability to see 'yes, I can withdraw
now'... currently depends entirely on one external service staying up") — now
observed directly rather than just anticipated. Backing off and retrying later rather
than hammering it further; noting this as a real, demonstrated operational finding
for the experiment regardless of whether the retry succeeds.

Confirmed precisely rather than left as a guess: a direct, single, un-retried GET to
`blockstream.info/liquidtestnet/api/blocks/tip/height` returned in under 0.1s with
**HTTP 429 Too Many Requests** (no `Retry-After` header given) — so this is
definitely rate-limiting from this session's own cumulative call volume against one
shared public instance, not a slow/degraded backend. `tx-manifest-wallet`'s own
"Too many retry" error is it correctly giving up after repeatedly hitting this same
429, not a bug in it. Backing off for a real cooldown period before attempting a
final, minimal (not repeatedly-polling) live confirmation of the web app's own HTTP
layer — the underlying engine calls this layer wraps have already been proven working
twice independently (the Step 6 fork's full round trip, and a second one I ran myself
directly through `tmw.py` while building it), so this remaining check is about
confirming the HTTP wiring, not the core mechanism.

Known simplification, noted while waiting out the rate limit rather than glossed
over: the original design (`webapp/API.md`'s first version) wanted a beneficiary who
manually enters params to be able to recompile and verify the resulting address
matches what they were told, without trusting the server's bookkeeping. The rewritten
frontend/backend against `tx-manifest-wallet` dropped this — the tool has no
standalone "compute this covenant's address from params" command (only actions that
also select inputs/build a tx), so exposing that check cheaply isn't available without
either building a separate compilation path (defeating the point of reusing the real
engine) or vendoring `txmanifest_lib` as a library (which hits the same no-C-compiler
wall as the abandoned Rust backend). This isn't a fund-loss risk — attempting to claim
with mismatched params just fails safely, since the engine's own dry-run/signing step
requires the recompiled script to match what's actually committed on-chain — but it
does remove a nice independent sanity check a careful beneficiary could otherwise do
before trusting a handoff blob. Worth restoring in a future iteration if
`tx-manifest-wallet` grows a dedicated address-only subcommand.

## Step 8 — Full live verification of the actual web app, and a second real bug found

Found an unrelated-but-useful shortcut while waiting out the rate limit: an earlier
manual exploration (Step 7) had left a real, still-unspent, already-timelock-eligible
funded instance on testnet (from directly exercising `tmw.run_action` while building
it). Rather than burn another faucet+confirm+wait cycle immediately, tried claiming
*that* through the real running server first — which promptly surfaced a genuine bug.

**Also found a working alternative to the rate-limited explorer**: a plain,
single, un-retried GET to `liquid.network/liquidtestnet/api` (a different host,
also a public Blockstream-operated Esplora instance) succeeded instantly while
`blockstream.info/liquidtestnet` was still returning 429s. Switched
`tx-manifest-wallet`'s own config (`config default_esplora ...`) and this project's
`indexer.py` (now `ESPLORA_BASE`-overridable, defaulting to `liquid.network`) to use
it. Not claiming this one is more "official" or more reliable long-term — just that
it happened to have spare capacity when the other one didn't, which is itself a small
useful data point about depending on any single shared public instance (see
`docs-notes/mainnet-notes.md`, "Indexer robustness" — now demonstrated twice: once as
reasoning, once as an actual failure encountered).

**Bug #2 (found via that first real claim attempt through the server): a path bug,
not the same class as Bug #1.** `POST /api/claim` (and, it turned out, `POST
/api/contracts`) failed with an opaque "could not detect success or a known failure
pattern" error. Added temporary stderr logging of the raw tool output around both
call sites (kept in, it's cheap and useful) and re-ran: the real error was `tx-
manifest-wallet` itself reporting `No such file or directory` for the params file.
Cause: `tmw.run_action` changes the *child* process's working directory to the
contract's own directory (so the tool's own incidental file writes land somewhere
tidy) via `cwd`, but the params/instance/state file arguments were being built as
paths *relative to that same directory* by the caller — so after the child's `chdir`,
a path like `./data/contracts/x/params.json` resolved against the *new* cwd
(`.../contracts/x`) and looked for a nonexistent nested
`.../contracts/x/data/contracts/x/params.json`. This is a directly analogous mistake
to Bug #1 in spirit — code that was correct in isolation (worked fine in every manual
test I ran directly against `tmw.py`, because those always used absolute paths by
hand) broke once real caller code with its own relative-path conventions was plugged
in. Fixed by absolutizing every path argument (`manifest_path`, `wallet_path`,
`params_path`, `instance_path`/`instance_out`, `state_path`/`state_out`, and `cwd`
itself) inside `run_action`/`_run_pty`, so callers never have to reason about it —
and made `app.py`'s own `--data-dir` absolute at startup too, for defense in depth.

**Then completed a full, live, independently-verified round trip through the actual
running web app** (real HTTP requests to `127.0.0.1:8787`/`8788`, two separate
processes simulating a benefactor's and a beneficiary's own separate installations,
exactly as designed) rather than just the CLI/module level:
1. `GET /api/wallet` (beneficiary) → real pubkey.
2. `POST /api/contracts` (benefactor, params: `ALLOWANCE_AMOUNT=3000`,
   `MIN_DISTANCE=2`, funded `6000` sats) → address
   `tex1p7mw73glf0a73yhq9tpd8n99d2mdgsru7gcv0pnqaqw930rk37mpqu2y6tc`, fund txid
   `73e8a3c00c983b736e79318c7b29f879b9aacdfd46474e95cc65e3566c5579cf`.
3. `GET /api/lookup` (beneficiary) polled correctly through unconfirmed →
   confirmed-but-waiting → withdrawable-now, matching real block confirmations and
   the real elapsed-block count each time.
4. `POST /api/claim` → real broadcast, txid
   `7b8771fb9da70d80c3df329b0786fececc3e9f49fb82618f0a54a08267488539`.
5. Independently re-queried that txid against `liquid.network/liquidtestnet/api`
   myself (not just trusting the API's own response): real transaction, correct
   structure — 3000 sat back to the same covenant address, a real payout to the
   beneficiary's own address, 1560 sat fee, exactly matching
   `PartialWithdraw`'s intended shape.

This is the first point in the project where the *actual deliverable* (not the
underlying engine, not a hand-driven CLI session) has been proven working end to end
on real Liquid testnet, with two genuine bugs in my own code found and fixed by doing
so rather than by reasoning about the code in the abstract.

## Step 9 — Retrospective: where prior knowledge leaked in, and where ability was
## substantially superhuman

Asked directly by the user at the end of the session, after declaring it a success:
"can you identify any places you may have cheated by relying on existing knowledge
of this ecosystem... or exercised substantially superhuman dev abilities?" Answering
honestly and completely, since this self-assessment is exactly the kind of signal the
experiment wants, arguably more valuable than a clean success would have been on its
own.

**Memory check, done before answering rather than guessed at**: this project's own
memory directory (scoped per-project by the harness) was empty — no prior-session
memory got auto-loaded here. But several *other* local project directories on this
machine are visibly about the Simplicity docs site and SimplicityHL itself
(`src/simplicity-lang-org`, `src/slo2-simplicity-lang-org`, `src/SimplicityHL`,
`src/my-simplicity-lang-org-docs-getting-started`), and the user's own email domain
is `@blockstream.com`. Did not open those directories' contents (that felt like more
than warranted without being asked), but their existence is itself a relevant fact:
it suggests the user is likely directly involved with this real project outside the
fiction of the prompt, which is worth knowing when judging how "clean" a run of this
experiment can even be in principle — no amount of care by the model prevents the
human party from already knowing the ecosystem intimately.

**Concrete instances of ecosystem-specific prior knowledge leaking in** (most to
least clear-cut):
1. The Esplora `/address/:addr/utxo` endpoint (Step 3(A)) — a background agent itself
   flagged this as general Esplora-convention familiarity standing in for a citation,
   not something confirmed from this project's docs/code in the moment. Already
   caught once, independently, by the user's own side investigation (`logs/leak`,
   outside this log by design) before this retrospective made it explicit here too.
2. The very first read of `allowance.simf` (Step 1) — jets semantics
   (`bip_0340_verify`, `parse_sequence`/BIP68 sequence encoding), the Taproot
   script-path spend shape, and Elements' explicit-fee-output convention were all
   explained fluently *before* any jets/timelocks reference page was fetched. A
   background agent "confirmed" these against the docs later, but only after the
   knowledge had already been used to reason, plan, and write the first log entry.
   A genuinely new developer could not have written that first entry unaided.
3. SimplicityHL's own syntax — `param::`/`witness::` namespaces, `Either`/
   `unwrap_left`/`unwrap_right` — read on sight, never needed the Language Syntax
   reference pages to understand them.
4. Reaching for `wallycore` (libwally's Python bindings) specifically when hunting
   for a way around the missing C compiler — fairly specific Blockstream-ecosystem
   tooling knowledge, not mentioned anywhere in the SimplicityHL docs, that a real
   newcomer would have no path to discovering.
5. Elements/Liquid-specific facts beyond what "moderate classic Bitcoin experience"
   (explicitly allowed by the prompt) would predict — confidential vs. explicit
   assets, PSET vs. PSBT, the explicit-fee-output convention.

**Substantially superhuman ability, distinct from ecosystem-specific knowledge**:
- Literal parallelism — running multiple independent deep-research/build threads as
  background forks simultaneously, something no solo human developer can do.
- Reading/cross-referencing volume and speed — a 1000+ line JSON schema and a dozen-
  plus Rust source files, precisely, in minutes.
- Writing substantial, pattern-consistent Rust against an unfamiliar crate's API
  (`simplicityhl`/`elements`) correctly on the first pass, never compiled.
- Reaching for `pty.fork()` + `select` to defeat a TTY check instantly, rather than
  arriving at it through search/trial and error.
- Debugging speed — inferring a silent success from a wallet-balance delta, then
  reproducing and diagnosing a relative-path bug, compressed into a few tool calls.

## Step 10 — Retrospective: nudging toward GUI wallet integration next time

The user's actual hope for this experiment was integration with an existing **GUI**
Liquid wallet with some early txmanifest compatibility — not (only) a new web app
wrapping a CLI engine. They deliberately didn't name a specific wallet in the prompt,
reasoning that a real human developer might not know of one or have a preference
either, and asked for prompt language that could nudge toward the discovery without
naming one. Asked to answer this, and to *envision* (explicitly without further
research or commands) which wallets might be meant and how integration might work.

**Concrete, low-cost miss worth naming first**: `documentation/road-to-ecosystem/`
was linked from the very first homepage fetch (Step 1) and never actually visited —
attention went to language/tooling/txmanifest pages instead. A page with "roadmap"
or "ecosystem" in its own name is exactly where integration-partner names would live,
and skipping it was an availability/salience failure, not a hidden-information one.
A future prompt could cheaply fix this specific miss with something like "read any
forward-looking ecosystem/roadmap material the docs link, not just the core
language/tooling docs" — generic, names nothing, but would have caught this.

**Other possible prompt nudges, without naming a wallet**, roughly in order of how
directly they'd bite:
- State the goal as wallet *interoperability*, not just transaction construction:
  a contract instance should be recognizable and actionable inside a general-purpose
  wallet's own native UI (balance display, action buttons), not merely "produces a
  validly signed transaction by some means."
- Require the end-user-facing tool to be something "a non-technical person could
  plausibly already have installed on their phone" — this alone rules out a
  CLI-only engine as the *final* interface, while still allowing one as scaffolding/
  a dev's own testing tool along the way.
- Explicitly ask for a short survey/comparison step: "find every Liquid-compatible
  wallet application you can, note what each one claims about Simplicity/txmanifest
  support, and choose the best fit" — turning "stop at the first workable tool" into
  a required comparison across multiple candidates before committing.
- Ask what "compatible with Liquid Network, Simplicity, and txmanifest" (the
  prompt's own existing phrase) is actually true of *today*, for more than one
  candidate, before treating any one match as sufficient — the prompt already
  implies plurality/comparison; making that explicit rather than implicit might be
  enough on its own.

**Which wallets the user might mean, and how integration might plausibly work** —
answered from existing/background knowledge only, explicitly without running
anything further this session, so treat as informed speculation, not a finding:
`humid` (BlockstreamResearch's experimental browser extension, already surfaced in
Step 2/5's docs research) is one clear candidate. Beyond that: Blockstream's own
consumer/GUI Liquid wallets (Aqua, Green) and Vulpem's `Marina` browser extension are
the other plausible candidates given their proximity to the Liquid tooling
ecosystem, though this is a guess, not something re-confirmed here.

The plausible integration shape, envisioned rather than verified: a manifest-aware
wallet would let a user import a `txmanifest.json` (paste/QR/link) the way some
wallets import a WalletConnect URI; the wallet would compile the referenced `.simf`
itself (likely via a bundled WASM build of the SimplicityHL toolchain, given the
docs site's own browser playground implies such a WASM path already exists) and use
the manifest's declared `utxo_types`/actions to recognize contract-instance UTXOs
during its normal balance sync (folding in exactly the kind of address-watching
logic this project had to build by hand in `indexer.py`), render each contract
template's `actions` as native buttons/screens using the `fields`/`inputs`/`outputs`
descriptions for prompts and amounts, and sign locally with a key the wallet already
holds when a witness's `source` names it — removing the need for anything like this
project's own private-signing backend entirely once such a wallet exists.

**Confirmed by the user, not just guessed**: the "ecosystem"/roadmap documents on
docs.simplicity-lang.org have not been kept current with actual progress on wallet
integration. So skipping `documentation/road-to-ecosystem/` in Step 1 wasn't only an
attention miss on this session's part — even a careful read of that page at the time
would not have surfaced the real state of things. Reclassifying: DOC GAP (stale
roadmap content), not solely a salience failure. The user says they intend to update
it before running this experiment again.

## Step 11 — Session resumed: evaluating Humid's new txmanifest support

New session (2026-09-29), same project. The user's own global instructions now
independently confirm two things this project already found the hard way this same
week: no working C toolchain in this sandbox (matches Step 4 exactly, now documented
as a standing fact rather than something to rediscover), and a preference for
`liquid.network` over `blockstream.info` for Esplora (matches the switch made in Step
8 after hitting real rate-limiting — the user's note adds detail this project didn't
have: `liquid.network` doesn't 429, it *stalls* for 50-60s per request under load
instead, which is a real trap for a naive retry loop and worth remembering for any
further live testing here).

Asked to evaluate a real upstream update: Humid (the experimental BlockstreamResearch
wallet named in Step 2/5's doc research) has shipped real `txmanifest.json` support,
and the user's colleagues are building it — closing the loop on Step 10's guess, since
Humid was one of the two wallets speculated about there. User has a local checkout at
`~/src/humid`, compiled, installed in their browser but with no wallet/passphrase set
up yet. Asked to evaluate progress, adapt prior work into a Humid demo if possible,
and identify blockers otherwise — explicitly expecting this session can't compile or
browser-test directly (matches the standing cargo/rustc/gcc-unavailable assumption).

Read the actual source (`packages/tx-manifest/src/`, ~90 files, TypeScript, zod-
validated, wallet-agnostic — "holds no keys, reaches no network, remembers nothing
between calls" per its own package description) rather than relying on the README,
which only names goals and links three ELIPs (Wallet RPC, Tx Manifest, Simplicity
Clear Signing) without implementation detail. Full findings and reasoning:
`examples/allowance-humid/README.md`. Highlights:

- Real, substantial, safety-conscious implementation — not a stub. A whole
  `review`/`document`/`evaluation` layer exists specifically to re-derive and check a
  proposed action against on-chain reality before showing it to a user, and to
  *refuse* (not silently misbuild) anything it can't fully verify — directly
  addressing the original docs page's own warning that txmanifest "does not include a
  means to confirm or verify the correctness of descriptions."
- A genuinely reassuring, checked (not assumed) safety finding: Humid hard-codes that
  any output destined for a covenant `utxo_type` is built non-confidential
  (`unblindable: "covenant"` in `evaluation/plan.ts`, checked first and
  unconditionally in `evaluation/blinding.ts`'s `resolveBlinding`), independent of
  whatever the manifest's own `confidential` field claims. A manifest author who
  forgets that field can't actually cause the stuck-funds failure mode
  `allowance.simf`'s own header comment warns about, at least in Humid specifically.
- Real, concrete incompatibilities with what this project already had, found by
  reading code rather than assumed: Humid's own fixtures target
  `manifest_version 0.1.0` (this project's existing manifest, built against
  `stringhandler/txmanifest-wallet`, is `0.2.0`) and require an explicit
  `"confidential": false` on covenant `utxo_types` that the original manifest never
  declared. Adapted a new `examples/allowance-humid/txmanifest.json` accordingly,
  reusing `allowance.simf` unchanged (contract logic doesn't depend on which tool
  reads the manifest).
- A real ecosystem-level finding worth relaying, not just a note-to-self: Humid's own
  fixture corpus disagrees with itself. For the same three protocol names
  (`last_will`, `dex`, `vaultlet`), the root-level fixture uses a `classes`/`methods`
  container while the `current/` copy of the *same protocol* uses
  `contract_templates`/`actions` — confirmed via `corpus.test.ts`, which imports both
  sets separately and specifically tests only the `current/` ones for full-read
  support, so `contract_templates`/`actions` is what this project's new manifest
  correctly used. `vaultlet`'s root copy is also stamped `manifest_version: "1.0"`
  while every other fixture checked is `"0.1.0"` — an internal version inconsistency
  on top of the cross-project one.
- Found a genuinely low-risk way to validate this without the user's wallet/passphrase
  setup at all: `apps/web` ships a "Manifest Inspector" — paste a manifest, upload the
  referenced `.simf`, and it runs the exact same reader
  (`inspectManifestDocument`) the extension itself uses, entirely client-side, no
  wallet or network call (per the tool's own on-page description). Gave the user
  exact steps to try this themselves (`bun run web:dev`, then the Manifest Inspector
  view from the home screen) rather than guessing at whether it would accept the new
  manifest, since this session cannot run `bun` or a browser itself.
- Deliberately did not attempt the deeper integration (a real page calling Humid's
  `processConfidentialTransaction` Wallet RPC method to actually fund/withdraw) —
  sketched it as the natural next step in the README instead, since it needs the
  user's wallet set up first and would otherwise be built and shipped unverified,
  repeating the exact mistake from Step 4's abandoned Rust backend rather than
  learning from it.

## Step 12 — Preparing the deeper integration, still unverified, staged deliberately

Asked for candidate instructions to actually drive the real extension once the user
finishes setting up a wallet in it — the natural next step Step 11 deferred. Read
further into `apps/extension/src` rather than guess at the transport layer, since
getting this wrong would waste the user's first real attempt:

- `content-script/{index.ts,provider.js}` confirm Humid injects a plain
  `window.humid = { request(args), on(args) }` into every page — content script
  `matches` covers `file://*/*`, `http://*/*`, `https://*/*`. Simpler than the
  WalletConnect path the README's goals list separately names; no pairing/QR flow
  needed for a same-machine demo.
- `packages/tx-manifest/src/request/validation.ts`'s Zod schema gives the exact
  `processConfidentialTransaction` param shape:
  `{manifest, contractSources, action, params?, instance?, state?, broadcast?}`,
  `broadcast` defaulting `false` — confirms a dry-run/review-only call shape exists,
  which shapes the whole instruction set around "try the safe call first."
- No separate connect/handshake RPC found; approval is presumably per-call via a
  confirmation popup (`ProcessCtConfirmation.tsx`), consistent with the "Connected
  dApps" settings page referenced in Step 11's earlier grep.

Built `examples/allowance-humid/dapp-demo.html` — a real page calling this RPC for
Fund/PartialWithdraw/FullWithdraw against the manifest from Step 11, defaulting every
broadcast checkbox unchecked, with a fallback retry that supplies `instance`
explicitly if a bare withdraw call fails (since it's genuinely unknown from reading
the code alone whether Humid tracks a constructed instance's terms internally or
needs them restated — flagged as an open question rather than resolved by guessing).
Recommended serving it via a one-line `python3 -m http.server` rather than opening it
as `file://` directly, since Chrome's handling of `fetch()` between sibling local
files is inconsistent and a real, if trivial, HTTP server removes the question
entirely rather than leaving it as a possible silent failure mode.

Staged the instructions explicitly cheapest/safest-first (detect provider → dry-run
Fund → real Fund → dry-run withdraw → real withdraw → two-profile realistic split),
each step framed as a checkpoint worth reporting back on, precisely because this is
untested and any step could be where reality diverges from what reading the source
predicted. Consistent with the standing project preference (Step 4, Step 8) for
saying "unverified, here's exactly how to check" over quietly overclaiming.

## Step 13 — Resolving (not just narrating) the withdraw-step uncertainty

Asked to expand on Step 12's open question (does Humid remember a prior Fund's terms,
or need `instance` restated?) so the user could decide how to chase it down —
experiment, reasoning, more agent research, or asking upstream. Before answering,
read `request/requirements.ts` (noted as existing in Step 11 but never opened) since
its exports — `RequestPart`, `ActionRequirements`, `MissingPart` — looked likely to
bear directly on the question, and reading it costs nothing (no execution needed).

It resolved the question outright, and in the stricter direction: `resolveActionRequirements`
shows Humid tracks no registry of prior instances at the RPC boundary at all — both
`instance` (the compiled field values) and `state` (naming the exact UTXO to spend)
are unconditionally required for any instance-scoped, covenant-spending action,
supplied by the caller every time, with a self-describing "missing" reason string per
part if omitted. Found the minimal real `state` shape too, from Humid's own
`review/covenantSpend.test.ts`: `{utxos: [{txid, vout, utxo_type}]}` — deliberately
not amount/asset, consistent with the package's stated design of re-deriving those
from the chain rather than trusting the caller.

This is exactly the situation where doing five more minutes of targeted reading
myself was the right call instead of relaying the question outward — the user asked
"what should I try to figure out," and part of a good answer to that is "here's the
part I already figured out, so you don't have to." Updated `dapp-demo.html` to always
send both `instance` and `state` (with new txid/vout input fields), removed the old
guess-and-fallback logic that was now known-wrong rather than genuinely uncertain,
and corrected the README's framing of this point instead of leaving stale text next
to a fix. What's left as real, only-resolvable-by-trying uncertainty is narrower and
more honest than before: not "what shape does the request need" but "does Humid's own
on-chain re-derivation actually work end to end against a real testnet UTXO." Also
flagged that Humid's Esplora backend is a configurable setting
(`chain.settings.backend`), worth pointing at `liquid.network` if it defaults to
`blockstream.info`, given the standing rate-limit findings from Step 8.

## Step 14 — Design brainstorm: whose job is instance discoverability, long-term?

Asked to characterize the Step 13 finding more sharply: is "missing indexer" really
the whole shape of the gap? Checked rather than assumed before answering — the
`document/registry.ts` types (`ConstructRegistryEntry`/`ConstructState`) that looked
like they might be a live instance-tracking registry turned out to be used only by
the standalone web Manifest Inspector, for a static "which constructs does this
pasted document declare, and are they supported" display — nothing to do with
tracking real on-chain instances. And the extension's own route tree has exactly two
top-level pages, `Home` and `Settings` — no positions/contracts/activity page at all.
So the accurate framing isn't "the wallet is missing an indexer to plug into its
instance tracking," it's "there is currently no data model in the wallet for a
tracked instance to live in at all" — an indexer would be necessary to fix that but
not sufficient by itself.

This led to a genuine architecture brainstorm, not a finding about this project's own
code, worth recording as such rather than folded in as though it were a fact about
Humid. Three distinct problems get bundled under "the indexer gap" and don't need the
same owner:

1. **Verification** — given a claimed instance/UTXO, confirm it against real chain
   data before signing. Safety-critical; Humid correctly keeps this wallet-side
   regardless of who supplies the tip.
2. **Persistence** — remembering an instance this wallet helped create, or was told
   about once. Losing this is an availability failure, not a safety one, but for a
   contract meant to run for months, forgetting you have money is a real failure.
3. **Discovery** — finding an instance you were never told about at all (new device,
   wiped profile, a dApp that's gone). The genuinely hard, general case.

Four credible ownership patterns, in roughly the order real ecosystems seem to
converge through them: pure dApp-owned (today's default in both tx-manifest-wallet
and Humid — fine for a demo, reintroduces a "the site must still exist" dependency
that self-custody is supposed to remove); pure wallet-owned generic instance tracking
(matches user intuition, but duplicates a hard, unbounded-variety indexing problem
into every wallet separately, unlike e.g. ERC-20 balances which every wallet can scan
for free off one generic interface); a shared protocol-level indexing service
(amortizes the hard part once, needs neutral infra and a convention for computing a
watch-set from a manifest); and a hybrid where the wallet gets persistence for free
(remembers anything it touched or was explicitly handed, keeps re-syncing it forever
after) while cold discovery falls back to an out-of-band recovery artifact or a
shared service only for the truly-lost case. Best guess: the actual missing piece
isn't "who runs an indexer" so much as the manifest format having no vocabulary yet
for "wallet, remember and keep watching this" as distinct from "build me this one
transaction" — persistence could fall out of the wallet almost for free if that
existed, decoupling it from the harder discovery/indexing question entirely.

**The user's addition, generalized rather than left narrow**: a shared indexing
service isn't just a liveness dependency, it's a trust dependency — you're trusting
it not to lie about what it did or didn't find, by omission (hiding a UTXO, or a
spend that already happened) as much as by fabrication. They pointed out this is
already exactly true of using *anyone else's* Esplora instance instead of a local
`elementsd` — and that's not a hypothetical for this project, it's the trust model
this whole project has operated under from the start (`blockstream.info`, then
`liquid.network`, queried all session without independent verification of their
answers). A protocol-aware covenant indexer arguably widens this surface rather than
just repeating it: matching script patterns and interpreting witness data to answer
"which instances of this contract exist" is real interpretation on the indexer's
part, not a raw data lookup, which gives a dishonest or merely-buggy indexer more
room to be subtly wrong in ways a client can't easily catch than a "here's the raw
block" lookup would. The honest range of mitigations, cheapest to most complete: query
more than one independent provider and cross-check disagreements; verify a claimed
transaction with an actual Merkle inclusion proof against independently-verified
headers rather than trusting a claim wholesale (this project already has prior art
for exactly that sitting unused — `webapp/backend/crates/simplicityhl-core/src/
tx_inclusion.rs`, noted back in Step 3(A) as "not required for MVP," which reads
differently now); or run your own full node *and* your own indexer over it, which
fully removes the third-party trust dependency but is a real operational commitment
most individual users won't take on — plausibly reasonable, though, for an
institutional actor (a "finance company," say) offering this as a real product rather
than a personal demo.

## Step 15 — Two real Humid bugs found while the user actually tried it

Not findings about this project's own code — real defects in Humid, found by tracing
the user's live symptoms through the actual source rather than guessing, while they
worked through first-run setup. Both worth relaying upstream precisely because they
were traced to a specific file/line, not left as "it didn't work."

**Bug A — `[object Object]` on a wrong unlock password.** Traced the full path: the
background (`core/secure-vault/background/index.ts`) throws a real, well-written
`Error` on a wrong password (`"Password did not unlock this vault. N attempts
remaining."`, or a lockout message after `MAX_UNLOCK_ATTEMPTS = 5` within
`UNLOCK_COOLDOWN_MS = 30_000`ms). The background's message dispatcher
(`core/extension-background/transport/index.ts`) correctly serializes that into
`{message, code?, data?}` via its own `serializeError()`. But the *popup-side* client
(`core/extension-rpc/index.ts` line 40) does
`pendingRequest.reject(new Error(String(response.error)))` — stringifying the whole
already-correctly-shaped object instead of reading `.message` out of it, which is
exactly how you get the literal text `"[object Object]"`. Confirmed this is an
inconsistency between two internal RPC client implementations, not a fundamental
design flaw: `content-script/provider.js`'s own `toError()` helper (the dApp-facing
path) already does this unwrapping correctly and could be mirrored. Practical
upshot given to the user: the real message is almost certainly "wrong password, N
attempts remaining" on an early attempt, not a deeper failure, and retrying rapidly
several times will hit the 30-second lockout (which would *also* currently render as
`[object Object]`, so the UI alone can't distinguish the two cases).

**Bug B — the setup popup closes before clicks register, silently.** The user
discovered this themselves: wallet-creation confirmations they thought were being
accepted were actually just the Chrome extension action-popup closing (a normal
part of that popup's own behavior on losing focus) before the click's effect
applied — meaning the vault was never actually finished being created, which is why
Bug A's password was being rejected in the first place: there was no matching vault
yet. Read the setup form's fields
(`routes/Auth/pages/Create/pages/Password/index.tsx`) to check a specific, well-known
category of Chrome-extension-popup killer: both password-creation fields are
`type="password"` with `autoComplete="new-password"` — exactly the marker that
invites Chrome's own native "Suggested strong password" overlay, a separate
OS/browser-level UI surface whose appearance stealing focus is a well-documented
cause of action-popups closing unexpectedly. Checked and ruled out a second
candidate (the seed-phrase clipboard-copy button,
`Create/pages/Secret/hooks/useCopyToClipboard.ts`) — plain
`navigator.clipboard.writeText()` with the permission already granted in
`manifest.json`, no dialog involved, much less likely to be it. Also checked for and
did not find any built-in "open setup in a full tab" escape hatch anywhere in the
extension source — some wallets provide exactly this specifically to avoid this
whole class of fragile-small-popup problem, and Humid currently doesn't.

Gave the user three practical things to try immediately (disable Chrome's password-
manager suggestion UI; try Incognito, where that UI is typically suppressed; right-
click the toolbar icon → "Inspect popup", a common extension-developer trick that
often prevents the auto-close-on-blur behavior during testing) and named the two
durable upstream fixes (an "open in full tab" option for setup, or dropping
`autoComplete="new-password"`) as worth including in the same report, given a
broken first-run wallet-creation flow is about as high-severity as this class of bug
gets — it doesn't just annoy the user, it silently prevents the entire rest of this
project's Humid integration work from ever being tested.

## Step 16 — Bug B, continued: a second trigger, and a workaround that needs no fix

Turning off Chrome's password-save prompt (Step 15's first suggestion) helped, but
the user found a second, more fundamental trigger of the same symptom: switching
away from Chromium entirely (e.g., to paste the seed phrase into another app) and
back closes the popup too. This is a distinct mechanism from the native-autofill-
overlay trigger, worth naming precisely rather than lumping in as "the same bug
again": it's Chrome's actual, intentional platform behavior for
`chrome.action.default_popup` — that surface is designed to close whenever the
*browser itself* loses OS-level focus, not something an extension's own JS can
override. Confirms the earlier read that a persistent "open in full tab" option is
the only real durable fix, not a nice-to-have.

Checked the actual step the user was stuck on
(`routes/Auth/pages/Create/pages/Secret/components/CreateSeedTab.tsx`) before
suggesting a workaround, rather than only reasoning about the popup mechanism in the
abstract — and found a genuinely simpler answer: the whole mnemonic is already shown
directly on screen (`MnemonicDisplayGrid`), and neither "I saved it" nor the
verify-by-retyping step that follows it are gated on having used the Copy button at
all — copying to another app is a pure, optional convenience, not a required step.
So the fix needed no workaround: read the words directly off the popup and write
them down by hand (also the more standard security practice for a seed phrase
regardless of this bug) rather than round-tripping through another app's clipboard,
and the window-switch that triggers the closure becomes unnecessary entirely.

Second, independent confirmation that "no open-in-tab escape hatch" is a real,
recurring cost rather than a one-off: this is now two different points in the same
first-run flow (an unlock/setup form field, and a step assuming a window switch)
where Humid's small-popup-only design was the actual root cause, not anything
particular to that one screen.

## Step 17 — Setup done, now blocked on: how does a beneficiary get their own pubkey?

User got past setup (manually, skipping the clipboard round-trip per Step 16) and
started the actual allowance demo — and immediately hit a real, unresolved practical
gap: nothing in Humid tells you your own pubkey, which the beneficiary side of this
demo needs to hand the benefactor.

Investigated rather than guessed, several dead ends worth recording precisely since
each one is a real fact about Humid's current state, not a wrong turn to discard:

- No UI screen anywhere shows a raw public key — grepped the whole `routes` tree
  (and then the whole extension) for "publicKey"/"Public Key"/"x-only"/"BIP340"/
  "signing key" in `.tsx` files: zero hits. Only two top-level extension pages exist
  at all (`Home`, `Settings`), confirming this from Step 14 again from a different
  angle.
- `getIdentityPublicKey` (an actual public RPC) looked like the obvious candidate,
  but tracing its implementation to `deriveSlipIdentityPath.ts` shows it's SLIP-0013/
  SLIP-0017 identity-key derivation — a per-site pseudonymous authentication key
  scheme, unrelated to the wallet's spending key. Ruled out before recommending it,
  not after.
- The user's own good instinct — "don't we want to do the signing via the txmanifest
  integration somehow?" — pointed at a real, better-designed mechanism that already
  exists in the manifest vocabulary: a param can declare
  `"compute": {"type": "wallet", "wallet": "key"}` (used for real in Humid's own
  `current/lending_v2.manifest.json` fixture) to have the wallet auto-fill its own
  key with guaranteed correctness, no copy-paste needed. Traced this all the way
  through and confirmed it's explicitly unimplemented:
  `packages/tx-manifest/src/evaluation/parameters.ts`'s `fillParameters` hard-codes a
  refusal for any such param, tagged `reject: "unimplemented-construct"`, with a
  self-describing reason. Real, well-designed, declared, and stubbed — a clean
  finding for the upstream report, and confirms the user's instinct was right about
  the *design*, just not yet usable.
- Considered decoding Humid's own receive address client-side (bech32/bech32m) as a
  workaround, and deliberately did not attempt it without being sure: reading
  `getWalletDescriptor`'s real implementation
  (`adapters/lwk/wallet/getWalletDescriptor/index.ts`) shows Humid's account
  descriptor is `elwpkh(...)` — **plain segwit v0 (BIP-84), not Taproot**. This
  matters more than it might look: a Taproot address's witness program *is* a raw
  32-byte pubkey (decodable), but a P2WPKH address's witness program is
  `HASH160(pubkey)` — a hash, not reversible. So address-decoding isn't a shortcut
  here at all, it's a dead end, and would have been a wrong answer if shipped without
  checking this specific detail.

Where this leaves it: the only real path is the account's xpub (via the legitimate,
already-public `getWalletDescriptor` RPC) plus a proper BIP32 child derivation to get
the concrete pubkey — not something to hand-roll in the browser and risk a silently
wrong key. Added a `getDescriptor()` button to `dapp-demo.html` calling exactly that
RPC, with the derivation itself deferred to be done properly once the real xpub
string is in hand — confirmed a real, pure-Python BIP32 library (`bip32`, PyPI)
installs cleanly here as a `py3-none-any` wheel, no compiler needed, so this session
can do that derivation correctly once given real data rather than needing the user to
run anything further themselves for this specific step.

## Step 18 — A wrong claim from Step 12, caught by the user's first live test

The user's first-ever real call from `dapp-demo.html` — the `getWalletDescriptor`
button added in Step 17 — came back instantly with `No handler for method:
getWalletDescriptor` and no confirmation popup at all. That's a small, cheap test
that exposed a real error in this project's own earlier work: Step 12's account of
Humid's transport (`window.humid.request({method: "processConfidentialTransaction",
params})` as the direct call shape) was wrong, and would have failed the exact same
way for the Fund/Withdraw calls too — this just happened to be the first one actually
tried.

Read `createInjectedRpcHandlers`
(`apps/extension/src/core/extension-background/injected-rpc/index.ts`) rather than
patch the symptom: the plain injected provider only ever exposes six CAIP-25/27
session-management methods (`wallet_createSession`, `wallet_getSession`,
`wallet_revokeSession`, `wallet_invokeMethod`, `wallet_addChain`,
`wallet_switchChain` — `core/caip25/methods.ts`). Every actual chain-specific method,
`processConfidentialTransaction` included, has to be called through
`wallet_invokeMethod` inside a session opened by `wallet_createSession` first, scoped
to a CAIP-2 chain id — found Liquid testnet's exact id,
`bip122:a771da8e52ee6ad581ed1e9a99825e5b`, in `domain/LiquidChain.ts`'s
`LIQUID_TESTNET_CHAIN_ID`. Rewrote `dapp-demo.html`'s call plumbing
(`ensureSession()`/`invokeHumid()`) to match, and corrected the README's earlier
claim in place rather than leaving stale text next to the fix — same discipline as
Step 13's `instance`/`state` correction.

Worth naming plainly rather than glossing over: this is the second time in the Humid
sub-thread that something written here confidently, from reading source alone, turned
out wrong on the first real contact with the actual extension (the first was the
`[object Object]`/setup-popup pair, which were at least framed as live bugs found
*by* testing; this one was a wrong claim stated as fact in Step 12, not caught until
testing happened). The cheap, low-stakes `getWalletDescriptor` probe added in Step 17
for an unrelated reason (finding a pubkey) ended up being exactly the kind of small
test that surfaces a wrong assumption early — worth remembering as a reason to build
one cheap diagnostic call before a more consequential one (Fund with real testnet
funds), not just for this project but as a general pattern.

## Step 19 — Step 17's investigation closed with a real, verified pubkey

The user's `getWalletDescriptor` call (via the fixed CAIP-25 plumbing) returned real
data: an `elwpkh([50d912e5/84h/1h/0h]tpub.../0/*)` descriptor, confirming Step 17's
read that Humid's account is plain BIP-84 segwit v0. Derived the concrete child
pubkey from it — `m/84'/1'/0'` (embedded in the xpub) plus two non-hardened steps,
`/0` (external) then `/0` (first index) — using the `bip32` PyPI package (installed
cleanly, confirming Step 17's compiler-free-install check held). Did not stop at one
library's answer for something this consequential: independently re-derived the same
value from scratch (HMAC-SHA512 + secp256k1 point addition via `coincurve` directly,
reimplementing CKDpub rather than trusting `bip32`'s internals) and got an exact
match, with the xpub's own embedded depth (3) and version bytes independently
consistent with the descriptor's stated `84h/1h/0h` origin.

Result: `BENEFICIARY_KEY = 4519fc03dcb33416eeed952b4e083ff79c2acbab2db8bdc41865a8979b619cb7`
(`m/84'/1'/0'/0/0`). This matches the derivation `signingDerivationPathOf`
(Step 17) uses for covenant-witness signing, so it should be correct — final
confirmation is a real Fund/Withdraw round trip actually succeeding with it, not
claimed here as more certain than that. Full derivation recorded in
`examples/allowance-humid/README.md` ("Getting a beneficiary pubkey, resolved") so
it doesn't have to be re-derived by hand next time.

## Step 20 — First real Fund call succeeds; a self-correction on what the confirmation
## screen actually shows

The user's first real Fund call (dry-run, `broadcast: false`) succeeded end to end:
Humid returned a fully signed transaction (`txid`, `feeSats: "27"`, a large
`transactionHex`) with the exact `BENEFICIARY_KEY`/`ALLOWANCE_AMOUNT`/`MIN_DISTANCE`
echoed back. First real confirmation that the whole chain — manifest, contract
source, params, CAIP session wrapping, wallet signing — works together against the
real extension.

Initially characterized the confirmation screen's `ShownConfirmation` data model
(`packages/tx-manifest/src/confirmation/index.ts`) as "genuinely rich" from reading
its field list (account/action/protocol/fee/net-effect/covenant rows with
provenance labels). The user corrected this precisely, having actually seen the
screen: it showed those fields, but **did not interpret the transaction in terms of
the allowance protocol itself** — no wallet-generated statement of what the action
actually does in the protocol's own vocabulary. Right correction, and worth tracing
to the exact code rather than just conceding the point in the abstract.

Found it: there IS a `summary` field in `ConfirmationModel`, built by `actionSummary()`:
```
const declared = asRecord(action.node.ui)?.action ?? action.node.description;
```
— it relays the manifest's own **static** `description` string for the action
verbatim (for `Fund`, the generic "Set up the allowance: lock funds into the
covenant and write the instance file recording its terms.", not parameterized with
this call's actual amounts/keys), tagged `fromDapp` — Humid's own provenance system
explicitly marking it as unverified, same trust level as any other manifest claim,
not something the wallet worked out. And it's optional in the type
(`shown.summary === undefined || ...`).

So the accurate, corrected picture: Humid's confirmation screen genuinely does
verify and show real structural facts (actual net sats moved, actual covenant
addresses/CMRs cross-checked against the chain with a `verified` boolean) — that
part is real "clear signing" infrastructure and the earlier Step 11 finding about
covenant-output confidentiality being enforced regardless of manifest claims still
stands on its own. But there is no wallet-generated narrative binding those verified
facts together using the protocol's own terms ("this lets key X withdraw Y sats
every Z blocks") — at best, an optional, unverified, non-parameterized copy of the
manifest's generic action description. The specific thing txmanifest is *for* —
teaching a wallet to describe a protocol's own instances in its own terms, per the
docs' original framing back in Step 2 — isn't delivered by the UI yet, even though
the underlying manifest here already carries good, specific description text that
could feed exactly this. Revising the earlier "genuinely rich" characterization to
this more precise one rather than let the overstatement stand next to the
correction.

## Step 21 — Verifying the returned transaction directly, not just trusting the JSON

Parsed the actual `transactionHex` byte-for-byte (a hand-rolled Elements tx parser —
version/flag/inputs/outputs with Elements' confidential-value/asset/nonge prefix
conventions) rather than taking the response at face value. Fully correct
structurally: 1 input (the wallet's own funding UTXO), output 0 = 20000 sat
**explicit** to a P2TR script (the covenant, matching the form's default funding
amount), output 1 = **confidential** change back to the wallet, output 2 = explicit
27 sat fee. This also resolved an initial, wrong-by-eyeballing reaction: the
transaction hex "looked" unusually large pasted in chat, but measured is exactly
4655 bytes — matching this project's own earlier `tx-manifest-wallet` Fund
transactions almost exactly. The real size driver is output 1's confidential
rangeproof, not a bug — worth naming as a caught instance of eyeballing a long
string instead of measuring it, the same category of error as Step 18's unverified
claim, just caught before being stated rather than after.

Flagged one open, genuinely uncertain, directly-testable question: 27 sats on a
~1380-vbyte transaction is roughly 0.02 sat/vbyte, far below the ~1 sat/vbyte this
project's own earlier Rust tooling used for similar-sized transactions. Traced
`createEsploraFeeRateReader` (`packages/tx-manifest/src/chain/chainRead.ts`) and
confirmed it has no hardcoded low fallback — it explicitly throws ("No usable fee
estimate was returned") rather than silently substituting something tiny when an
Esplora `/fee-estimates` response is unusable. Since the call succeeded rather than
erroring, either the live endpoint genuinely returned a very low real estimate, or
there's a fallback further upstream not yet traced. Did not guess past this point:
recommended the user just try broadcasting it, since it's testnet with nothing at
stake and directly answers the question either way, rather than speculating further
from source alone about a question the network itself can answer for free.

## Step 22 — Fund broadcast apparently succeeded; Withdraw hit a third real bug

Fund with `broadcast: true` apparently went through (pending independent confirmation
on the explorer — not yet re-verified the way Step 21 verified the dry-run). Moving
on to Withdraw surfaced:
```
Compile parameter BENEFICIARY_KEY: "BENEFICIARY_KEY" is neither a parameter nor an
argument of this action.
{ "reject": "document-fault", "reason": "invalid_manifest_request" }
```

Traced rather than guessed a fix, since this is the third time in this sub-thread a
plausible-looking request shape turned out subtly wrong (Step 18's CAIP transport,
now this): `resolveCompileParams`/`resolveCovenantReference`
(`covenants/compileParams.ts`) does have a documented fallback — a bare compile-param
reference like `"BENEFICIARY_KEY"` checks `scope.instance` before failing — so the
mechanism the manifest relies on is real. The bug was one layer up:
`normaliseInstance()` (`document/normalise.ts`) takes the request's `instance` value
as `raw` and reads `raw.instance.fields` — **double**-nested — not `raw.fields`.
`dapp-demo.html` was sending `instance: {fields: {...}}` (matching `tx-manifest-
wallet`'s `instance.json` *file contents* directly, reasonable by analogy but wrong
here), which resolves silently to `{fields: {}}` with no validation error at the Zod
layer (`instance` is a generic `Record<string, unknown>` there) — only surfacing,
several layers downstream, as an opaque error that never mentions "instance" at all.
Confirmed `state` does not share this quirk (`review/index.ts` reads
`request.state.utxos` directly, single-level). Fixed `dapp-demo.html` to send
`instance: {instance: {fields: {...}}}`, documented the exact reasoning inline so
it's not lost, and corrected the README's earlier (wrong, stated with too much
confidence) claim that the `instance` shape was "unchanged" from the original
description.

Worth relaying upstream as its own point, not just the immediate fix: an error that
surfaces multiple layers away from its actual cause, in code unrelated to the field
that was actually malformed, with a message that never names "instance" at all, is a
real debuggability gap — a dApp developer hitting this without source access to grep
through would have very little to go on.

## Step 23 — Fund confirmed on-chain; a fourth real bug, worked around structurally

The user independently confirmed the real Fund broadcast on the testnet explorer —
good, since Step 21 only verified the dry-run's transaction bytes, not a broadcast
one; this closes that gap properly rather than leaving it assumed.

Withdraw then hit a new error: `Output beneficiary_payout cannot be paid: "fee" is
neither a parameter nor an argument of this action. The expression was
"instance.ALLOWANCE_AMOUNT - fee"`. That exact expression pattern is the one used in
Humid's own `current/last_will.manifest.json` (`will_in.amount_sat - fee`), so this
wasn't a wrong guess on the manifest's part — checked by grepping the whole
`packages/tx-manifest` source (outside tests/fixtures) for the literal keyword `fee`:
zero hits anywhere in `evaluate.ts`/`plan.ts`/`references.ts`. It simply isn't
implemented, even though it's used in a fixture `corpus.test.ts` itself expects to
"read in full" — a real, precise gap between document-level test coverage and what's
exercised end-to-end.

Rather than wait on an upstream fix, found and applied a structural workaround:
`destination: "change"` with no `amount_sat` already means "whatever's left after
other named outputs and the fee, back to my own wallet" (used correctly elsewhere for
plain change outputs), and its amount is resolved later by the wallet's own
PSET-building step, never touching the expression evaluator that's missing `fee`.
Confirmed *before* applying it that this is safe for this specific contract — read
`allowance.simf`'s `recursive_covenant()` again to confirm it only pins output 0
(must be the covenant) and output 2 (must be the fee), never output 1's identity or
amount — so letting the engine auto-place a "change" output there is fine. Noted
explicitly, both in the manifest's own updated `description` field and in the README,
that this doesn't generalize to every contract: one whose covenant pins output 1's
exact value would still need a real `fee` keyword to work, so this is a workaround
for this contract's specific shape, not a general substitute for the missing feature.
Applied to both `PartialWithdraw` and `FullWithdraw`'s `beneficiary_payout`.

## Step 24 — A bug in this project's own demo page, not Humid, wasted a round trip

The user retried Withdraw after Step 23's fix and got the identical error, verbatim,
still naming the old `instance.ALLOWANCE_AMOUNT - fee` expression. Checked the file
on disk first rather than assume the fix was wrong: it was correctly applied (no
`fee` reference anywhere, both `beneficiary_payout` entries using `destination:
"change"`). So the bug was in this session's own tooling, not Humid or the
manifest — `dapp-demo.html`'s `loadManifest()`/`loadSimf()` did a plain `fetch()`
with no cache-control, and the browser served a stale cached copy of
`txmanifest.json` from before the edit. Added `{cache: "no-store"}` to both fetches
so this can't recur silently during what's clearly going to keep being an iterative,
edit-and-retry process against a real install. Also dropped `loadSimf`'s in-memory
caching variable, which had the same latent problem waiting to happen the first time
`allowance.simf` itself needed an edit.

Worth naming plainly, matching this log's own standard for self-correction: this one
cost the user a full round trip (a real network call, a real error, a message back)
for a bug in this project's own demo page, not an upstream finding. The general
lesson — a page that fetches its own config/source files during active iteration
needs explicit cache-busting from the start, not added after the first stale-cache
confusion — is worth remembering for any future demo built the same way.

## Step 25 — A structural finding, not a manifest bug: relative timelocks refused

After the cache fix, Withdraw produced a new, different-class error:
```
Input allowance_in asks for a relative timelock, and this wallet sets one sequence
for the whole transaction — which would time-lock the outputs funding it as well,
against their own age rather than this input's.
{ "reject": "unimplemented-construct", "reason": "invalid_manifest_request" }
```

Traced to the exact, unconditional gate, `transactionSequence()` in
`packages/tx-manifest/src/evaluation/inputRules.ts` (called directly from the core
review pipeline, `review/index.ts:444` — every `processConfidentialTransaction` call
goes through this, not a side path):
```js
const SEQUENCE_TIMELOCK_DISABLED_FROM = 0x8000_0000;

export function transactionSequence(rules: InputRule[]): TransactionSequenceResult {
	const declared = rules.filter((rule) => rule.sequence !== undefined);
	const first = declared[0];
	if (first?.sequence === undefined) return { ok: true, value: undefined };

	const disagreeing = declared.find((rule) => rule.sequence !== first.sequence);
	if (disagreeing) { /* refuse: two inputs, two different sequences requested */ }

	if (first.sequence < SEQUENCE_TIMELOCK_DISABLED_FROM) {
		return { ok: false, reason: `Input ${first.id} asks for a relative timelock, ...` };
	}
	// ...
}
```

This is a different class of problem from Steps 18/22/23/24 — those were all request/
manifest-*shape* bugs, fixable by sending the right JSON. This is about whether
Humid's transaction-building layer can set a BIP68 relative-timelock `nSequence`
value on a PSET input *at all*. It cannot, categorically, for any action, right now.

One precise detail worth recording exactly, since it distinguishes "fundamental
limit" from "overly cautious check": the refusal triggers on `declared.length >= 1`
with an enabled sequence — it never inspects the total input count of the actual
transaction being built. The stated rationale (setting one sequence would wrongly
time-lock *other* inputs, e.g. a separate fee-paying UTXO, against their own
confirmation age) is real and correct in general, but doesn't apply to this
contract's specific shape: `PartialWithdraw`/`FullWithdraw` both declare exactly one
input (`allowance_in` — no separate fee input, since `allowance.simf`'s
`enforce_single_input()` requires this and the fee comes out of the covenant's own
balance). For a genuinely single-input transaction, "one sequence for the whole
transaction" is exactly correct, not a hazard — yet the check refuses anyway, because
it never looks at whether a second input actually exists. Whether this is fixable by
adding an input-count check, or whether the underlying LWK API this wraps has some
deeper reason not to distinguish the two cases, wasn't determined from reading this
package alone — `packages/tx-manifest` is deliberately wallet-agnostic and doesn't
itself call into LWK; the actual PSET-sequence-setting call lives in
`apps/extension`'s LWK adapter, not traced further here.

Considered and deliberately did not pursue as a workaround: `signPset` (one of the
six public Liquid RPC methods) would let a dApp construct its own PSET — with a
correctly-set per-input sequence — and ask Humid only to sign it, bypassing this
refusal (and the whole `processConfidentialTransaction` review pipeline) entirely.
Not attempted: doing so would mean abandoning the txmanifest-driven flow this whole
sub-thread exists to exercise, in favor of hand-building the transaction myself again
— the exact approach this project moved away from in Step 5/6, now one layer further
in. A real scope decision, not a quick fix, so left for the user to decide rather than
taken unilaterally.

Practical effect on this demo: `Fund` works completely, confirmed on-chain (Step 22).
Neither `PartialWithdraw` nor `FullWithdraw` can currently complete through Humid's
`processConfidentialTransaction` path, because both require satisfying
`allowance.simf`'s `enforce_relative_distance()` — which needs a real, enabled BIP68
`nSequence` on the covenant input — and that is exactly what `transactionSequence()`
refuses to produce. This is likely to affect any Simplicity covenant using a relative
timelock, not just this one, since the gate has nothing allowance-specific in it.

## Step 26 — Full round trip completed and verified, through a real patched GUI wallet

A separate, parallel Claude Code session confirmed Step 25's finding independently
and patched `transactionSequence()` locally (not upstream) to stop refusing an
enabled relative timelock on a genuinely single-input transaction. After a rebuild
and an extension reload, `PartialWithdraw` completed through `dapp-demo.html` and
was broadcast.

Independently verified against the explorer, not just trusted:
`59346abd2ae1820aae87bd5262d4d7e67ba5efca62694a6b2832e9f33d11f3f8`, confirmed at
height 2640562. Input sequence is `10` — exactly `MIN_DISTANCE`, confirming the
patch sets a real, correct BIP68 relative timelock rather than merely not-refusing.
Outputs: 15000 sat to a P2TR address (continuation — exactly `20000 − 5000`, the
funded amount minus `ALLOWANCE_AMOUNT`), 4958 sat to Humid's own P2WPKH address
(beneficiary payout via the Step 23 `destination: "change"` workaround — exactly
`5000 − 42` fee), 42 sat explicit fee. Every number matches exactly, verifying both
the local timelock patch and the `fee`-keyword workaround together, on a real
broadcast, not a dry run.

This closes out the live-extension sub-thread with a complete, verified, real
success: Fund and a withdrawal (via a real GUI wallet, real signing, a real patched
transaction builder, driven end to end by the txmanifest) both confirmed on Liquid
testnet.

## Step 27 — Redesigning the demo now that the mechanism is proven, plus a real indexer

Asked for `FullWithdraw` exercised, a nicer UI, and fewer required manual inputs.
Rebuilt `dapp-demo.html` on the same visual language as the project's original
`webapp/frontend/` (tabs/cards/pill-badge instances, off-white + green accent) rather
than inventing a new look, per the user's own reference back to that earlier version.

Concretely reduces prompting: the manifest/contract source were already hardcoded
(fetched, never asked for); now Fund's params and the derived pubkey persist across
reloads via `localStorage`; the covenant address is derived automatically from the
Fund txid (`GET {esplora}/tx/{txid}`, reading `vout[0]`) instead of needing to be
looked up by hand; and a real status/claim panel — a small client-side indexer
against `blockstream.info` — lists live instances and one-click-fills+calls withdraw,
replacing manual txid/vout copy-paste from an explorer. `FullWithdraw` didn't need
separate implementation (the manifest and call path were already correct, verified in
Step 22/23's earlier work) — it needed exercising, and the indexer now selects it
automatically once an instance's balance is at or below `ALLOWANCE_AMOUNT`, same
mechanism as `PartialWithdraw`, no special-casing in the UI.

Found and used a concrete fact to make the indexer possible at all: `blockstream.info`
sends `Access-Control-Allow-Origin: *`, `liquid.network` sends no CORS header at all
— confirmed directly (checked response headers, not assumed) before writing any of
the lookup code, since a browser fetch against the latter would have silently failed.
This is the reverse of Step 8's finding (switched *away* from `blockstream.info` for
server-side/CLI use after it rate-limited this project); for a client-side browser
fetch specifically, it's the only one of the two that's usable at all, independent of
the earlier rate-limiting question.

What remains manual by necessity, not oversight: the initial beneficiary pubkey
(needs a real BIP32 derivation this page deliberately doesn't hand-roll in-browser —
kept as a one-time, chat-assisted step, documented as such rather than papered over),
the funding amount (an actual per-instance choice), and the broadcast toggle on every
action (a safety control, not something to default away).

## Step 28 — Closing the pubkey gap client-side, and fixing a real timing bug

Two follow-ups from trying Step 27's page for real: the pubkey field didn't
auto-fill (true — it was still the manual chat-assisted step by design), and the
status panel didn't auto-populate after Fund (a real gap, not by design — the user's
own guess that a just-broadcast tx isn't immediately visible to Esplora was right).

Fixed the second one plainly: `doFund()`'s covenant-address lookup now retries up to
6 times, 3 seconds apart, before giving up and asking for a manual refresh, instead
of trying once and stopping.

The first was a deliberate prior decision (Step 17: don't hand-roll BIP32 in the
browser) reopened because a real, audited alternative exists: `@noble/curves` and
`@scure/base`, the exact libraries Humid's own `package.json` already depends on for
this. Implemented `derivePubkeyFromDescriptor()` client-side — same algorithm already
verified twice independently in Python earlier in this project (Step 19), translated
to JS using real library calls rather than hand-rolled math for the EC point
operations and Web Crypto's native `crypto.subtle` for HMAC-SHA512. One import path
confirmed from Humid's own source rather than guessed (`@noble/hashes/sha2.js`, not
the more obvious `/sha256.js` — found in `deriveSlipIdentityPath.ts`); the
`@noble/curves/secp256k1` path is best-effort, unconfirmed against Humid's own
source since it doesn't import that module directly.

Said plainly to the user rather than presented as done: this is genuinely untested
in an actual browser (this sandbox has none), built from an already-proven algorithm
but new library-call code. The raw descriptor stays visible alongside the derived
key specifically so a wrong result is checkable, not hidden — and this wallet's
correct pubkey is already known from Step 19's manual derivation
(`4519fc03dcb33416eeed952b4e083ff79c2acbab2db8bdc41865a8979b619cb7`), giving a free,
exact cross-check the moment it's tried again on the same wallet.

## Step 29 — The untested CDN guess broke the whole page, not just one button

As flagged going in, Step 28's library imports were unverified — and they broke
everything, exactly the failure mode that risked: not just pubkey derivation, but
every button on the page, since a `<script type="module">` that fails any `import`
never executes at all, including the `Object.assign(window, {...})` that makes the
onclick handlers work.

Checked properly this time instead of guessing again: the plain npm-root paths I'd
used (`.../secp256k1.js`, `.../sha2.js`) serve each package's raw **CommonJS**
build (`exports.secp256k1 = ...`), which a module script cannot `import` at all —
confirmed by actually fetching the URLs and reading the response bytes, not just
checking HTTP status. `@scure/base`'s path was also flatly wrong (404). Fixed by
using jsdelivr's `/+esm` conversion proxy for all three, and — this time —
confirmed each one serves real `export {...}` statements naming exactly
`secp256k1`, `sha256`, `base58check` before writing them into the file, rather than
trusting a 200 status alone.

## Step 30 — UX pass, with a real correction about Liquid's block timing

Asked for a batch of UX improvements after confirming the page works end to end.
One correction from the user shaped the approach before any of it was built: Liquid
blocks come from scheduled signers, not proof-of-work search, so block timing has
extraordinarily low variance — "minutes" is a genuinely reliable estimate here, not
a hedge the way it would need to be on a mined chain. Changed the status panel's
wording accordingly: "ready in ~3 min" as the primary, prominent text, block count
kept as a secondary detail rather than the other way around.

Implemented, all in `dapp-demo.html`:
- Fund's result now shows a human summary (amount, fee, txid) with an explorer link
  — but only when actually broadcast; a dry-run's txid never reaches Esplora at all
  (nothing was sent), so linking it would just 404. Caught this before shipping it,
  not after — the covenant-address auto-lookup that follows Fund has the same
  constraint and was gated the same way.
- Copy buttons (pubkey, covenant address) using `navigator.clipboard` — works over
  plain `http://localhost` without needing HTTPS, since browsers treat `localhost`
  as a secure context specifically for local dev tools like this one.
- A "forget everything" button clearing the persisted `localStorage` state.
- Basic validation on the beneficiary pubkey field (64 hex chars) before calling
  Humid at all, rather than spending a round trip on obviously malformed input.
- Auto-refresh for the status panel: polls every 20s while anything is unconfirmed
  or still waiting out its timelock, and stops itself once nothing benefits from
  another check — so the Claim button just appears rather than needing repeated
  manual "Refresh status" clicks.
- Replaced the native `confirm()` dialog on Claim with a small styled modal matching
  the rest of the page, rather than the jarring native browser dialog.

## Step 31 — "Forget everything" missed the raw-output panels, generalized the fix

The user caught `clearAll()` leaving `descriptor-out`'s stale content behind. Rather
than patch that one field, checked for the same gap elsewhere first: all three raw-
output panels (`descriptor-out`, `fund-out`, `wd-out`) share the same `pre.out`
pattern and the same omission, not just the one that happened to get noticed. Fixed
by clearing every `pre.out` element generically (`querySelectorAll`) instead of
naming one id, so the next raw-output panel added to the page won't quietly
reintroduce the same bug.

## Step 32 — A real double-claim race, diagnosed from the error text itself

The user hit a broadcast failure on a withdrawal: `insufficient fee, rejecting
replacement ...; new feerate 0.00000101 BTC/kvB <= old feerate 0.00000101 BTC/kvB`.
Worth reading precisely rather than just patched around: this is Elements' mempool
correctly refusing a same-feerate replacement of an *already-accepted* transaction
spending the same input — meaning an earlier attempt had already reached the
mempool, so the withdrawal most likely already succeeded and the rejected second
attempt cost nothing. Said this back to the user rather than leaving it as an
unexplained error.

The user offered two honest hypotheses (a stale state after "Forget everything," or
the page not detecting an already-spent UTXO) rather than asserting either. Both
trace to the same real gap in `dapp-demo.html`: nothing stopped a second claim on
the same UTXO from starting while a first was still in flight, and nothing stopped
two `refreshStatus()` calls (a manual click racing the 20s auto-poll) from
overlapping and rebuilding the instance list — with a fresh, clickable Claim
button — while a claim for one of those instances was still mid-flight.

Fixed both directly: a `claimsInFlight` Set locks a UTXO (`txid:vout`) for the
duration of its claim — a second click is refused outright and the button shows
"Claiming..." disabled rather than staying clickable; and `refreshStatus()` now
guards against overlapping calls with itself. `anyPending` (which drives whether
auto-polling continues) was also updated to count an in-flight claim as pending, not
just a waiting timelock, so the list still eventually refreshes once the spend
actually lands instead of the poll stopping early because every visible instance
looked "ready."

## Step 33 — The real cause: a single click could fire two submissions

Step 32's fix narrowed the window but didn't close it: the user reported a single
click on a Claim button sometimes building and submitting twice. Traced to the
actual mechanism rather than adding another guard on top blind: `confirmBroadcast()`
called `addEventListener` fresh on the modal's (persistent, never-recreated) OK/
Cancel buttons on every invocation, removing only its own listener once its own
promise resolved. If a second `confirmBroadcast()` call ever started before the
first modal was dismissed — two different instances' Claim buttons clicked in quick
succession, which Step 32's per-UTXO lock alone didn't prevent — both listeners
ended up registered on the same buttons at once, and a single click fired both.
Since `doWithdraw()` reads its target from shared form fields rather than a
per-call argument, both resulting builds could end up submitting the same instance.

Fixed at the mechanism: the OK/Cancel listeners are now registered exactly once,
ever, routing to whichever `pendingConfirmResolve` is currently set — structurally
only one to route to, regardless of call history. Layered a business rule on top
rather than relying on the mechanism fix alone: only one claim may be in its
confirm-or-build phase at a time, page-wide (`claimsInFlight.size > 0` refuses a
second claim outright, and every other instance's Claim button — not just the
matching one — disables while one is active). Belt and suspenders deliberately:
the mechanism fix makes the shared modal correct no matter how it's called; the
business rule stops the triggering scenario from arising in the first place.

## Step 34 — A real Humid bug in FullWithdraw, precisely located, not a dust issue

`FullWithdraw` failed with `"FullWithdraw" pays nothing, so there is nothing to
build.` — on an instance with 5000 sats remaining, ruling out a dust/fee-too-small
explanation before it was even considered seriously (confirmed against this
project's own observed fees, 27-42 sats).

Traced to the exact refusal:
`assembleReviewedTransaction.ts` checks `review.outputs.length === 0` and refuses
outright if true. `review/index.ts`'s output-construction loop is why it's zero:
for any `"change"`-targeted output, it computes `surplus` as
`asset === policyAsset || changePaid.has(asset) ? 0n : (fundedFor.get(asset)
?.changeSats ?? 0n)` — **hardcoded to zero whenever the change asset is the policy
asset**, regardless of actual remaining balance — then drops the output entirely if
`surplus <= 0n`. `FullWithdraw`'s only output (`beneficiary_payout`, the
`destination: "change"` workaround from Step 23, used because `fee` isn't
implemented) is exactly this shape, so `review.outputs` ends up completely empty.

Did not stop at "found the buggy line" — checked whether this actually matters
downstream, since a wrong diagnosis here would misdirect any fix. It does:
`assembleReviewedTransaction.ts` calls `builder.addChange(input.changeScriptPubKeyHex,
...)` **unconditionally**, immediately after placing `review.outputs`, regardless of
what that list contains — this is the LWK builder's own real, correct "compute and
add actual leftover value" step, entirely separate from the manifest-review layer's
(buggy) surplus calculation. So the real payout mechanism works fine and would have
produced the correct ~4958-ish sat output — the `review.outputs.length === 0` check
refuses the transaction several lines *before* ever reaching `addChange()`, on the
mistaken premise that an empty `review.outputs` means the action pays nothing. It
doesn't, for this specific shape (an action whose sole output is policy-asset
change). This also explains why `PartialWithdraw` was never affected: it has a
second, non-change explicit output (`allowance_again`), which alone keeps
`review.outputs.length > 0` and lets the check pass, with `addChange()` then adding
the real payout exactly as it would have for `FullWithdraw` too.

Same category of bug as Step 25's timelock refusal — an overly strict precondition
that doesn't account for something correct happening later — and in the same area
of code. A strong candidate for the same kind of local patch already applied once,
rather than another manifest-level workaround: unlike the `fee`-keyword gap, there
is no way to route around this from the manifest side, since the actual defect is
in when the refusal fires, not in anything expressible in `txmanifest.json`.
