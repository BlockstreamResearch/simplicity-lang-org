# Ecosystem documentation coverage: allowance journey, 2026-10-21

Test plan: simplicity-lang-org `tests/ecosystem-documentation-coverage.md`. Draft under test:
<https://docs.simplicity-lang.org/getting-started/allowance-howto/> (HOWTO, EXPLANATION, REFERENCE, README),
published but not linked from navigation. Detailed rows are in `AUDIT.md` (68 rows), actions and
reasoning in `LOG.md`, raw tool output in `logs/`.

**Headline.** The draft carried the journey much further than the rest of the corpus could. Both the
original contract and an adapted commission contract were deployed and exercised on Liquid testnet:

- the original contract, through the HOWTO's browser page (Steps 4-10) and through Humid (Step 11, both withdrawal actions);
- the commission contract, through `tx-manifest-wallet` driven by a manifest written from the
  txmanifest book: Fund, two partial withdrawals and a final one, with commission paid on each.

What stops a newcomer is mostly **version drift between documented and current tools**
(G7.-5 Blocker, G7.-11, G3.-7), **missing reference material** (Simplex API, `param::`), and
**production topics that have no product yet** (registry, audit, mainnet signer).

## 0. Method

- **Start URL:** https://docs.simplicity-lang.org/ and `/llms.txt`; the draft by its URL (supplied by the
  user; G1.-1 records that a reader couldn't find it otherwise).
- **Pages visited, in order:** llms.txt, llms-full.txt, homepage (`index.md`); allowance-howto
  README/HOWTO/EXPLANATION/REFERENCE (published `.md` and HTML); simplicity-demo repo (cloned, as
  HOWTO "Get the files" says); site search index; documentation/destinations, state, jets, _jets,
  builtin, txmanifest, wallet, simplex, road-to-ecosystem, toolchain, timelocks, witness-format,
  execution-model, simplicity-compared; simplicityhl-reference match_expression, program, type;
  getting-started quickstart, try-it; resources roadmap, faq, projects; glossary; use-cases index,
  lending-protocol, simplicity-dex, unchained; office-hours; news mainnet post; tutorial
  reading-transaction-data; signet.simplicity-lang.org (linked from glossary); txmanifest book
  (index and print view, linked from txmanifest page); txmanifest-wallet repo and releases (linked
  from txmanifest page and book); simplicity-demo `examples/*/README.md`, `allowance_test.rs`,
  `docs-notes/mainnet-notes.md`, `webapp/server/indexer.py`, `examples/allowance-lwk/index.html`.
- **Search terms that found nothing** (site search index): commission, policy asset, per asset, each
  asset, Humid Web Wallet, Green, Audit Service, Bitcoin testnet, Waterfalls, docs.rs,
  FinalTransaction, finalize_strict, sign_tx, issue an asset, `simc "`, version directive, Compiler
  version, 6f0279e9, 144c6543 (L-BTC asset id prefixes), allowance-howto (in llms.txt/llms-full.txt).
- **Tools actually executed** (by the user at my request, output in `logs/`): `simplex` 0.1.0
  (`init/build/test`), `simc` 0.8.0, `cargo` 1.91.1, `wasm-pack` 0.15.0, `bun` (npm, under `/tmp`),
  Humid build + patch, `tx-manifest-wallet` 0.1.3, 0.3.0 and v0.2.2 (reports 0.2.1), `python3 -m
  jsonschema`, Chromium with the HOWTO page and Humid. By me: Python `urllib` fetches of docs and
  Esplora (`liquid.network`, one request to `blockstream.info`), and the status checker
  `artifacts/allowance_status.py`.
- **Left the official corpus:** no. Every external page or repo used was linked from an official
  page (cited per row). Chain data came from public Esplora instances. See "Persona fidelity" for
  where *knowledge* outside the corpus influenced reasoning.

Testnet transactions produced:

| Run | Fund | Withdrawals |
|---|---|---|
| Commission contract, tx-manifest-wallet | dfb366ab… | 3d6cc98e… (P), e469afcc… (P), b88678e2… (F); commission 3×1000 at `scripthash/1ab1ba46…` |
| Original contract, page signer (Steps 4-10) | 076c4bba… | 99d3b550… (P), 9d53d0fb… (F) |
| Original contract, Humid (Step 11) | f45304f8… | ccdf5ac2… (P), d8e4be04… (F, beyond Step 11) |

## 1. Goal-by-goal results

**G1. Locate the Allowance covenant: Docs sufficient.**
Produced: the contract (homepage; six identical copies in the repo), and answers to every
sub-question with citations (LOG §G1). Couldn't decide: nothing. Caveat: only the homepage is
discoverable; the HOWTO is not (G1.-1).

**G2. Adapt with a fixed commission: Docs partial.**
Produced: `artifacts/allowance_commission.simf` (compiles; ran on testnet), `.args`. All five
decisions justified from pages: payment output not fee output (glossary Fee + jets); same asset
(EXPLANATION `same_asset()`); explicit (EXPLANATION per-output rule); recursive balance with the
cap widened and the **final path now constrained** (EXPLANATION's warning that it otherwise
constrains nothing); destination as a compile-time scriptPubKey hash, network not encoded
(destinations). Couldn't decide from docs: how to declare a new `param::` and its `.args` format
(G2.-2); why a different-asset commission is impossible (G2.-4); whether fixed output positions are
safe given "randomized output order" (G2.-7).

**G3. Simplex tests: Docs partial.**
Produced: `artifacts/allowance-commission-simplex/` with five tests (happy path, insufficient
remainder, too soon, missing commission on partial and on final): 5/5 pass. HOWTO Step 2 itself
passed 2/2 verbatim. Couldn't do: wrong-asset test (no issuance recipe, G3.-4 Blocker). All API
use was copied from one linked example, since no Simplex API reference exists (G3.-2).

**G4. Deploy and exercise on Liquid testnet: Docs partial.**
Produced: the three runs above. The HOWTO's builds (3a-3c) worked verbatim. Friction: a stale
`proptest` pin that now errors (G3.-7); Step 4's expected text doesn't match the page (G4.-6);
fixed 500-sat fee unmentioned (G4.-9); **the page stops polling after a claim**, so Step 10's
sequence never appears without a manual refresh (G4.-10, Major); port 8099 collisions and shared
per-origin wallet (G4.-5). The commission contract was deployed through the CLI route REFERENCE
mentions; that route needed the REFERENCE hint to choose tool 0.2.2 (G7.-5) and exits 0 on failed
broadcasts (G4.-4). The page changes the commission contract would need are listed, not built, in
`artifacts/commission-on-page.md` (scope agreed with the user).

**G5. Non-technical web UI: Docs partial.**
Produced: `artifacts/ui-sketch.md`. Humid signing of covenant spends works for both actions, confirming both fixes in the HOWTO's Humid patch (G5.-11). Which names
the docs describe: **Humid**: only the allowance draft and one Projects row; **"Humid Web Wallet"**:
nowhere; **LWK wasm**: wallet page + HOWTO 3b; **WalletConnect**: wallet page and Road to
Ecosystem, "in development"; **Blockstream App**: one sentence (customized builds for the lending
demo). Couldn't decide: how the WalletConnect mechanism and Humid's injected provider relate
(G5.-2). Page usability in Humid mode: G5.-8, G5.-9, G5.-10.

**G6. Contract indexer: Docs partial.**
Produced: `artifacts/indexer-spec.md` and `artifacts/allowance_status.py` (used live to time every
withdrawal above). Documented only inside use cases (allowance Step 8; lending pre-lock discovery),
not as a reusable pattern (G6.-2). EXPLANATION explains why a product needs its own server-side
indexer (G6.-1).

**G7. TX manifest: Docs partial.**
Produced: `artifacts/txmanifest/txmanifest.commission.json`, schema-valid, `validate`-clean in 0.2.x,
and it ran the full lifecycle on testnet. **Schema version 0.2.0; not frozen** (txmanifest page: "has
not yet been frozen"). But the current tool (0.3.0) rejects every documented 0.2.0 manifest
(G7.-5 Blocker); the book documents a `fee` declaration its matching tool rejects (G7.-11); the book
uses `script_hash` for two different values (G7.-3); Humid reads a different 0.1.0 dialect (G7.-1).
"Signing stages" isn't a docs term; mapped to per-input `witnesses` (G7.-4).

**G8. Upload to a contract registry: Product not shipped.**
No registry exists; REFERENCE: "no registry of known protocols"; Road to Ecosystem lists registries
as a future requirement (G8.-1).

**G9. Request a Blockstream Audit Service audit: Docs missing.**
No page mentions such a service, not even the roadmap, so it can't be classified as roadmap-only
from the docs. EXPLANATION says an independent audit is needed (G9.-1).

**G10. Migrate to Liquid mainnet: Docs partial.**
Produced: `artifacts/mainnet-migration.md` (12 steps). EXPLANATION gives the outline. Missing: the
L-BTC asset id or how to verify it, a parameter table, and **any documented wallet fit to sign
mainnet covenant spends** (the HOWTO says not to run on mainnet; Humid is "not intended for
real-money use"). The long-form notes describe a different app and contain working notes (G10.-2).

**G11. Environments.** `artifacts/environments.md`.
(a) Liquid testnet: **supported** (run end to end). Liquid mainnet: **supported** by the chain, with
no documented signer for this flow. (b) Simplicity-enabled Bitcoin test network: **prototype; not
documented for this contract**: glossary says Simplicity Signet is live, roadmap says Mutinynet is
in progress, nothing says which jets exist; the contract uses Elements-only jets (G11.-2).
(c) Bitcoin mainnet via Unchained: **product not shipped**; the use-case page is an empty stub
(G11.-3).

## 2. Documentation Audit Log

See `AUDIT.md`: 68 rows in the required schema (16 Positive, 3 Blocker, 10 Major friction,
7 Contradiction, 6 Outdated, 23 Minor friction, 2 Product not shipped, 1 Duplication).

## 3. Coverage scorecard

| Dimension | Score | Driving rows |
|---|---|---|
| Discoverability | **2** | G1.-1 (HOWTO not in nav/llms.txt), G5.-1 (Humid absent from wallet page), G6.-2, G11.-3 (stub page) |
| Completeness for this journey | **3** | G1-G4 achievable; gaps G2.-2, G3.-2, G3.-4, G6.-2, G10.-1 |
| Technical correctness / freshness | **2** | G7.-5, G7.-6, G7.-11, G3.-7, G3.-10, G4.-6, G4.-7, G5.-4, G5.-5, G10.-2 |
| Security guidance | **4** | Strong: explicit outputs, `same_asset`, destination hashing, manifest trust. Gaps: G2.-3, G2.-4, G2.-7 |
| Production readiness | **1** | G8.-1, G9.-1, G10.-1, G10.-2; no mainnet signer |
| Wallet / non-technical UX path | **2** | G5.-1, G5.-2, G5.-13, G4.-10, G5.-8, G5.-9, G5.-10 |
| Multi-environment story | **2** | G11.-2, G11.-3 |

## 4. Priority list

1. **Publish a compatibility table and pin versions** on the txmanifest page, the book and the
   HOWTO: which `tx-manifest-wallet`, Humid, Simplex/`smplx-std` and `simc` releases go with which
   manifest format and examples; mark per-feature minimum versions in the book. (G7.-5, G7.-6,
   G7.-11, G7.-8, G3.-6, G3.-7)
2. **API references for Simplex and LWK wasm**, neither of which is documented today. Simplex: link
   the rustdoc; document generated-artifact naming and type mapping, builder output ordering, the
   error enum, and an asset-issuance test recipe. LWK wasm: render `lwk_wasm.d.ts`, plus a short page
   on ownership rules and the covenant calls. (G3.-2, G3.-3, G3.-4, G5.-13)
3. **A `param::` / `.args` reference page.** (G2.-2)
4. **Fix the HOWTO page's post-claim polling** and the Step 4/6/9/10 wording (exact
   `Simplicity API: present`, the 500-sat fee and minimum, refresh lag, port choice), and publish
   the current REFERENCE (Waterfalls). (G4.-10, G4.-11, G4.-6, G4.-9, G4.-8, G4.-5, G4.-7)
5. **Wallet page: "wallets you can use today"**, reconciling WalletConnect pairing with Humid's
   injected provider, and current ELIP numbers. (G5.-1, G5.-2, G5.-4)
6. **"Moving to Liquid mainnet" how-to**: parameter table, asset-id verification, and an explicit
   statement of which wallets can sign mainnet Simplicity spends today; retire or rewrite
   `mainnet-notes.md`. (G10.-1, G10.-2)
7. **Contract discovery how-to**: fixed-address vs. template-matching vs. OP_RETURN discovery, with
   a server-side example. (G6.-2)
8. **State the status of the registry and audit** on the txmanifest page and the roadmap, even if
   the answer is "none yet". (G8.-1, G9.-1)
9. **Simplicity Signet page**: what it is, how to connect, which jets differ from Liquid; update
   the roadmap's Mutinynet entry and unpublish or fill the Unchained stub. (G11.-2, G11.-3)
10. **Transaction-structure notes**: per-asset balance and fee-in-policy-asset; output ordering is
    the builder's choice (fix "randomized" wording and the quickstart's `vout[0]`); the book's
    `script_hash` naming. (G2.-4, G2.-7, G2.-3, G7.-3)

Discoverability of the HOWTO (G1.-1) is deliberately not on this list as "promote it": whether it's
ready is what this test measured (below). Link it from navigation once items 1 and 4 are done.

## 5. Artifacts

All annotated with SOURCE / CONFIDENCE.

| File | Goal | State |
|---|---|---|
| `artifacts/allowance_commission.simf`, `.args`, `.args.NOTES.md` | G2 | compiled (simc 0.8.0); deployed on testnet |
| `artifacts/allowance-commission-simplex/` | G3 | 5/5 tests pass; wrong-asset test not written (`WRONG_ASSET_TEST.md`) |
| `artifacts/txmanifest/` | G7 | schema-valid; ran full lifecycle in tx-manifest-wallet 0.2.2 |
| `artifacts/commission-on-page.md` | G4/G5 | specification only |
| `artifacts/ui-sketch.md` | G5 | sketch |
| `artifacts/indexer-spec.md`, `artifacts/allowance_status.py` | G6 | spec; checker used live |
| `artifacts/mainnet-migration.md` | G10 | checklist |
| `artifacts/environments.md` | G11 | table |

## HOWTO readiness

Worked verbatim: Get the files; Step 1; Step 2 (2/2 tests); Steps 3a-3c builds, including the Humid
patch; Step 7's explicit funding; Steps 8-9 claims; Step 11's Humid funding and covenant spends (a partial, plus a full withdrawal beyond what Step 11 asks).
The Step 11 warning about a separate allowance was accurate.

Not tested: the "What you need" install routes for Rust, `wasm-pack` and LLVM `clang`, which
were already present on the test machine. A run on a clean machine (or a fresh container) would
test them.

Would stop or mislead a newcomer today, roughly in order:

1. Step 10: the page stops refreshing after a claim, and a manual refresh can still use a stale tip (G4.-10, G4.-11).
2. Step 2: the `proptest` pin command now fails (G3.-7). It's harmless only if the reader carries on.
3. Step 4: the expected text doesn't match the page (G4.-6).
4. Steps 6/9: the 500-sat fixed fee is not mentioned (G4.-9).
5. Step 11: stale page-wallet status and loaded terms after switching signer (G5.-9, G5.-10).
   Step 11 also asks for only one Humid claim, so only one of the patch's two fixes gets exercised; it should ask for claims until the allowance closes (G5.-12).
6. REFERENCE's CLI route: the current tool rejects the manifests (G7.-5).

None of these is in the contract or the explanation; all are in the page, pins and wording.

## Persona fidelity

The goal statuses above record what the docs let **this run** do. This run was an AI agent, and its
results overstate what the persona in the test plan, a finance-firm full-stack engineer who
"does not write Rust daily", would achieve. This section records that gap as facts first and
judgments second.

### What the run actually required (measured)

| Goal | What had to be produced | Documentation available | Effort, measured from `artifacts/` |
|---|---|---|---|
| G2 | modified `.simf` with two new parameters | homepage contract, EXPLANATION, destinations, jets; **no** `param::` reference (G2.-2) | 143-line contract; parameter typing inferred from usage |
| G3 | Simplex tests for the modified contract | **no** API reference (G3.-2); one linked 312-line example test | about 47 distinct API symbols (18 types/constants, 26 methods, 3 generated names), 197 non-comment lines of Rust; 4 names guessed by extrapolation, all correct first time |
| G4, CLI | deploy and exercise the commission contract | txmanifest book; REFERENCE's version hint | 234-line JSON manifest, two params files, a CLI; **no Rust or JavaScript** |
| G4/G5, page and Humid | run the original contract | the HOWTO, step by step | none written; buttons and prompts. Done by the user |

Sources consulted: 66 fetched pages and files, plus the cloned demo repository.

### Where outside knowledge entered (what happened)

- **G2.-7 (output order):** the docs contradict each other ("randomized" order vs fixed indices).
  I resolved it from prior knowledge that ordering is the transaction builder's choice. No page
  says so.
- **G2.-4 / wrong-asset test:** my reasoning that only an issuance on the single input could put
  another asset on an output uses Elements knowledge not in the corpus.
- **G3:** the generated names, `[u8; 32]` for a `u256` parameter, and the hash import path were
  extrapolated from Rust conventions and one example, not read from documentation.
- **G6:** the pacing advice in `indexer-spec.md` comes from the user's instructions about these
  Esplora instances, not from the docs.
- **G10:** L-BTC asset id prefixes known from training were used as search terms only; nothing was
  filled from them.

### What a human in the persona would likely have done (judgment)

- **G3 is the largest gap.** Facing about 47 undocumented symbols with one example and no
  reference, a developer who doesn't write Rust daily would reasonably stop, or spend days. For the
  persona G3 is closer to **Docs missing** than **Docs partial**. Documenting the API alone would
  not close this: the persona needs a task-shaped page ("the calls a covenant test needs") and a
  project that already runs.
- **G2 would likely stall at the output-order contradiction** (G2.-7) or at declaring parameters
  (G2.-2), unless the reader copies the existing patterns without understanding them.
- **G4 via the CLI is the route closest to the persona**: JSON, a params file and a CLI, with no
  programming API. Its blockers were tool-version drift (G7.-5, G7.-11), which a human would hit
  in the same way, and the REFERENCE hint that resolved it is easy to miss.
- **The HOWTO's build steps (3a-3c) worked by copy-paste; the prerequisites are the uncertain
  part.** Observed: the human tester, who doesn't do JavaScript development and had never used Bun,
  pasted the commands and waited; everything built first time (module builds 214 s and 302 s, with
  long silent stretches the HOWTO warns about). But that machine already had Rust 1.91,
  `wasm-pack` and a `clang` with the wasm32 target, installed while the HOWTO was being written;
  only Bun was new (one `npm` command). So the HOWTO's install table was not exercised in this run. Guess: for
  the persona, the commands themselves are not the obstacle; getting a toolchain like that in place
  is, especially on macOS, where the HOWTO warns the system `clang` "fails deep inside a Rust crate
  build, with an error that never mentions wasm". Some would get through, given the HOWTO's
  install table and checks; some would stall on a toolchain error the HOWTO can't anticipate.
  Prebuilt, versioned packages (a Simplicity-enabled `lwk_wasm` and a patched Humid build) would
  remove that risk and the wait (Further recommendations, Documentation item 1); the verbatim
  commands are good enough to keep as the "build it yourself" route.
  A second guess, specific to the persona's employer: at a finance firm the obstacle may be
  permission, not willingness. Managed work laptops commonly forbid `curl … | bash` installers and
  global `npm -g` installs, and endpoint security often disables loading unpacked extensions in
  Developer mode (Step 3d). The steps also pull many dependencies from the network, a supply-chain
  exposure a security team may reasonably refuse. So the persona may need IT approval or a separate
  machine before Step 3. A route that runs in an isolated environment, such as the Simplicity
  Codespace the Simplex page already links, plus prebuilt, checksummed packages, would address
  both the permission and the risk.
- **The browser and Humid path fits the persona well**, because the page hides the LWK API behind
  buttons. Its findings came from the human tester's own experience (G4.-6, G4.-10, G5.-8,
  G5.-9, G5.-10), which an agent reading code and chain data might have missed. Several were
  noticed only because a person was misled by the page.

### Consequence for reading the scores

An agent run measures **feasibility**: can the documentation, plus persistence, reach the goal? It
doesn't measure **approachability**: would the persona try, and keep going? Where the two differ in
this run, approachability is lower: chiefly G3, then G2.

## Further recommendations

Not tied to a single audit row; raised after the run.

### Test protocol

1. **Tier the contract modification (G2-G5).** The commission change produced most of the
   substantive findings and should stay. But "deployable" spans three layers that behave
   differently: (a) contract, tests, manifest and a CLI deploy, all decidable from the corpus
   (reached in this run); (b) the browser page, where the persona has the skills but the corpus
   doesn't document LWK's wasm JavaScript API, only the page's source and its README's ownership
   traps; (c) Humid with a modified manifest, where support for the needed 0.1.0 constructs can't be
   determined from the corpus at all. Make (a) required, and (b)-(c) a separately scored stretch
   that stops at the first undocumented dependency. Score each layer on whether it documents how to
   adapt it.
2. **Fresh browser profile per run** (`--user-data-dir`): removes extension conflicts (G5.-6) and
   shared per-origin wallets (G4.-5) at the source, and makes runs repeatable.
3. **Record the corpus version**: date, docs commit if knowable, every cloned repo's commit. The
   published draft lagged the local one in this run.
4. **State the agent's starting knowledge**, e.g. whether it's given the HOWTO URL, so G1 scores are
   comparable across runs.
5. **Allow G7 before G4 for a modified contract**: the manifest was the deployment vehicle here; the
   current order implies web development between G3 and G4.
6. **Require a per-goal "outside knowledge used" note** instead of a retrospective one.
7. **Append-only, timestamped logs**: two logs in this run were overwritten by re-runs.
8. **A "sufficient with one cited hint" status**, to show which single sentences carried a goal.
9. **Human-in-the-loop wallet steps**: agents can likely drive pages but not install or operate
   browser extensions; a human installs and approves, the agent records, and the human's confusion
   counts as findings.
10. **Record an effort measure per goal**: distinct API symbols used, lines written, sources
    consulted (as in "Persona fidelity" above). "Docs partial" alone hides whether a goal took one
    sentence or 47 undocumented symbols.
11. **A simulated give-up rule**: when a step needs more than N unfamiliar API symbols and no
    task-shaped page covers them, record "persona would likely stop here", then continue. This keeps
    agent thoroughness while marking where a human would probably have quit. Periodic human runs
    calibrate N.

### Documentation

1. **Prebuilt artifacts**: a Simplicity-enabled `lwk_wasm` and a patched Humid build attached to a
   release. Step 3 is the largest barrier in the HOWTO.
2. **"Tested with" line at the top of the HOWTO** (required by CONTRIBUTING): LWK commit, Humid
   version, Simplex/`smplx-std`, `tx-manifest-wallet`.
3. **Add this run's errors to REFERENCE's table** with cause and fix: the `proptest` selection error;
   `manifest_version "0.2.0" is a different format from the 0.3.0 this build implements`;
   `Output 'network_fee' has no amount_sat and is not optional`;
   `prompt error for fee rate: IO error: not a terminal`; `bad-txns-inputs-missingorspent`.
4. **A how-to on adapting a covenant**, using the commission change: add a parameter, constrain one
   more output, keep both paths enforced, update tests and manifest. Every piece is already tested
   (`artifacts/`). It would likely move G2-G3 to "sufficient" for an agent; for the persona it
   helps most with G2, since G3 still needs the task-shaped Simplex material (see Persona fidelity).
5. **Document the CLI route as an alternative track**, with pinned versions: the shortest path from
   contract to testnet, with no wasm or extension build.
6. **Document LWK's wasm JavaScript API for Simplicity** (or link its generated docs): needed for
   anyone adapting the page (tier (b) above). (G5.-13)
7. **Steer each audience to its route.** For the test plan's persona, the manifest-and-wallet route
   (`.simf` + JSON + a wallet or CLI) needs no programming API and is what manifests were designed
   for; Simplex and LWK wasm are for contract authors and wallet/app builders. Saying so where readers
   choose a path, and possibly in CONTRIBUTING's Audiences section, would send the persona to the
   route this run showed works for them. (Proposal, not a finding.)
