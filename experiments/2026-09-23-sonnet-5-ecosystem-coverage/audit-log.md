# Ecosystem Documentation Coverage Audit

## Run header

| Field | Value |
| --- | --- |
| Date of run | 2026-09-23 |
| Protocol file | `tests/ecosystem-documentation-coverage.md` in `simplicity-lang-org` |
| Protocol file git blob SHA-1 | `f892d11d41d2b6b2f181ee81c56b673ef67f5561` |
| Last commit touching protocol file | `0ec4d910d2aa9f4eebe948a6e07186ccb63ce86c` (2026-09-18) |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Harness | Claude Code CLI, Linux |
| Auditor persona | Technical employee at a mid-size finance firm (full-stack TS/React, moderate classic Bitcoin, no Liquid/Simplicity experience) |
| Local repos read for knowledge | None. No locally checked-out repository was read or scanned for content; the protocol file itself was the only local file read. |
| Toolchain available | Not yet determined at header time — checked and logged in Method section below. |

## Note on prior runs

Two earlier audit directories exist as siblings to this one:
`ecosystem-doc-audit` (2026-09-21, complete, model not recorded here) and
`ecosystem-doc-audit-2026-09-23` (started 2026-09-23, same date as this run,
model recorded as Claude Opus 5, but only the run-header table was written —
no goals were attempted). This run is a separate, independent attempt using
Claude Sonnet 5 and does not read or reuse content from either prior
directory, to keep the audit's findings uncontaminated by earlier attempts.

---

## 0. Method

**Start URL:** https://docs.simplicity-lang.org/

**Toolchain check (before any research):**
```
which simc simplicityhl simplex hal elements-cli elementsd lwk_cli humid node npm cargo
```
returned nothing — no output, no errors, every name absent from PATH. Every
"deploy/build/test" goal below (G3, G4) is therefore **not executed — docs-only
reconstruction**, per the protocol's own instruction for this case. This was
checked once, up front, and not re-checked per goal.

**Pages visited, in order** (all under docs.simplicity-lang.org unless noted; all fetched with WebFetch):

1. `/llms.txt` — full site index, used to build the initial page map for the whole run
2. `/` (homepage) — found the allowance covenant example here (see G1)
3. `/use-cases/index.md`
4. `/documentation/state.md`
5. `/documentation/witness.md`
6. `/documentation/simplex.md`
7. `/documentation/txmanifest.md`
8. `/documentation/wallet.md`
9. `/documentation/toolchain.md`
10. `/getting-started/quickstart.md`
11. `/resources/roadmap.md`
12. `/documentation/road-to-ecosystem.md`
13. `/resources/faq.md`
14. `/resources/projects.md`
15. `/use-cases/lending-protocol.md`
16. `/documentation/jets.md`
17. `/documentation/witness-format.md`
18. `/getting-started/try-it.md`
19. WebSearch (site-restricted to docs.simplicity-lang.org): `Humid wallet`
20. WebSearch (site-restricted to docs.simplicity-lang.org): `Blockstream Audit Service contract registry`
21. `/documentation/execution-model.md`
22. `/glossary.md`
23. WebSearch (site-restricted to docs.simplicity-lang.org): `Mutinynet Bitcoin testnet Simplicity signet`
24. `/documentation/simplicity-compared.md`
25. `/documentation/timelocks.md`
26. `/simplicityhl-reference/type.md`
27. `/resources/roadmap.md` — re-fetched for exact verbatim quotes (Mutinynet, AMP/LWK, state-commitment sentences)
28. WebSearch (site-restricted to docs.simplicity-lang.org): `hal-simplicity liquid_mainnet_address info json fields`
29. `/documentation/toolchain.md` — re-fetched for the exact `hal-simplicity simplicity info` JSON field list
30. `/documentation/stdlib.md`

**Search terms that found nothing** (i.e., the term does not appear in the
official corpus as far as this audit could determine):

- `Humid wallet` (site-restricted WebSearch) — no relevant hits
- `Blockstream Audit Service contract registry` (site-restricted WebSearch) — no relevant hits
- `Asset1` / `Amount1` / `ExplicitAsset` / `TokenAmount1` type definitions, searched on `/simplicityhl-reference/type.md` and `/documentation/stdlib.md` — used throughout the flagship example and jets reference but never defined in either reference page
- `confidential` (as a term), searched on `/documentation/state.md` and `/documentation/timelocks.md` — zero occurrences on either page
- a contract registry for txmanifest uploads, searched on `/documentation/txmanifest.md` and by general WebSearch — none found (page instead warns against trusting third-party manifests)
- an audit-service page, searched via WebSearch and by reading `/resources/roadmap.md`, `/resources/faq.md`, `/documentation/road-to-ecosystem.md` — none found

**Tools actually executed:** none. `which` was run once (above) to confirm
absence; no compiler, test runner, or node/elements process was ever invoked.
Every code artifact in `artifacts/` is a docs-only reconstruction, annotated
accordingly.

**Whether this audit left the official corpus:** **No.** Every fact used to
support a finding or artifact traces to a page under `docs.simplicity-lang.org`
(fetched directly or reached via a site-restricted WebSearch). Several pages
*link outward* to GitHub repositories (`BlockstreamResearch/SimplicityHL`,
`BlockstreamResearch/smplx/examples`, `BlockstreamResearch/simplicity-lending`,
etc.) and to one external demo (`demolending.distributedlab.com`); this audit
**catalogued that those links exist** (see G5, G6, resources/projects.md
findings) but did **not fetch their content**, so nothing from inside those
repos or that demo informed any finding or artifact. This is logged as a
limitation of this specific run (see row G3.2) rather than as "leaving the
corpus," since the rule only requires logging outward material actually used.

---

## 1. Goal-by-goal results

### G1 — Locate the official Allowance covenant example

**Status: Docs partial.**

The example is real and is NOT hidden — but it lives only on the site
**homepage** (`https://docs.simplicity-lang.org/`), with no dedicated URL, no
entry in `use-cases/index.md`, and no entry in `llms.txt`'s use-cases list.
Compile-time params (`param::ALLOWANCE_AMOUNT`, `param::MIN_DISTANCE`,
`param::BENEFICIARY_KEY`), the spend-time witness (`witness::SIGNATURE`), the
recursive covenant rule (`recursive_covenant()`, checking
`jet::current_script_hash()` against `jet::output_script_hash(0)` and
`jet::output_is_fee(2)`), and the explicit-vs-confidential funding constraint
("Fund this address only with explicit (non-confidential) outputs") are all
directly stated in the homepage's code and prose — see
`evidence/G1-allowance-homepage.md` for the exact quotes. What could NOT be
resolved from docs: the `Asset1`/`Amount1`/`ExplicitAsset` types used
throughout this example are never defined anywhere in the Reference section
(`simplicityhl-reference/type.md`) or the standard library reference
(`documentation/stdlib.md`) — see rows G1.2.

**Produced:** `evidence/G1-allowance-homepage.md` (verbatim excerpt + citations).

### G2 — Add a fixed commission to every successful withdrawal

**Status: Docs partial.** Every decision listed in the goal was made and
justified with a citation, per the design-decision block at the top of
`artifacts/allowance-with-commission.simf` — but several of those citations
are "closest available analog," not "docs directly answer this," because no
official page discusses adding a commission/royalty-style output at all. In
particular:
- extra output vs fee output: justified from `documentation/state.md`'s
  definition of `output_is_fee` as the network-fee payment specifically.
- asset identity: justified by reusing the homepage's own `same_asset()`
  helper, the only in-docs pattern for asset equality.
- explicit vs confidential: justified from the homepage's funding-constraint
  comment, extended by analogy (DOC-GAP — the docs never say this extends to
  other outputs, only to the funding output).
- whether the recursive copy still balances: **this audit's own invented
  policy** (commission counts against `ALLOWANCE_AMOUNT`, not on top of it) —
  the docs do not discuss commissions/fees on this contract at all, so there
  is no citation for this one; logged as G2.6.
- destination binding (param, not witness or hardcoded): justified from the
  homepage's own params-vs-witness explanation.
- which network the destination belongs to: **not decided** — see G2.7/G10.2.

**Produced:** `artifacts/allowance-with-commission.simf`,
`artifacts/allowance-with-commission.args.example.json`.

**Could not decide from docs:** whether commission should be exempt from the
allowance cap (G2.6); whether the full-withdrawal branch should be
commission-constrained at all, since the base contract deliberately leaves it
unconstrained (G1.4); the exact jet name for u64 equality (worked around, see
G2.4).

### G3 — Write Simplex tests for the adapted contract

**Status: Docs partial** (bordering on Docs missing for the actual test bodies).

`documentation/simplex.md` gives the exact test-file skeleton
(`#[simplex::test] fn name(context: simplex::TestContext) -> anyhow::Result<()>`)
and the CLI lifecycle (`simplexup` → `simplex init` → `simplex build` →
`simplex test`) — this part is directly citable and high-confidence. But the
page never shows what the generated `src/artifacts` functions are named or
how a test funds a UTXO, submits a spend, or asserts that a spend was
**rejected** (three of the five requested scenarios are rejection tests). The
page links to `BlockstreamResearch/smplx/examples` on GitHub for a worked
example; this audit did not fetch that repo (see Method), so this remains
undemonstrated from docs pages alone.

**Produced:** `artifacts/allowance_commission_tests.rs` — real skeletons for
all 5 requested scenarios (happy path, insufficient remainder, too-soon
withdrawal, wrong asset, missing commission output), with every body-level
statement marked DOC-GAP pseudocode.

**Could not decide from docs:** the generated builder API's actual names; the
idiom for asserting an expected on-chain rejection.

### G4 — Deploy and exercise on Liquid testnet via the documented faucet

**Status: Docs sufficient for the procedure** (for the general
compile→derive-address→fund→PSET→sign→broadcast workflow, which
`getting-started/quickstart.md` documents completely and verbatim, command by
command, for `last_will.simf` and generalizes mechanically to any compiled
`.simf` program including this one) — **but not executed**, since no `simc`
or `hal-simplicity` binary was available in this environment (see Method).
This is a "docs sufficient, environment insufficient" outcome, not a docs
failure.

**Produced:** nothing new — G4 would reuse the exact command sequence in
`getting-started/quickstart.md` substituting
`allowance-with-commission.simf` / `.args`, per the workflow documented there.

**Could not decide from docs:** nothing new beyond what's flagged under G2/G3;
two friction points were found in the documented flow itself (faucet
rate-limit silence, and an unexplained mix of `liquid.network` vs
`blockstream.info` Esplora endpoints within one tutorial) — see G4.2, G4.3.

### G5 — Non-technical beneficiary web UI

**Status: Docs missing** for the one step that actually matters (signing).
`documentation/wallet.md` names **LWK** (including a WASM target "for web
applications") and **WalletConnect** ("official recommendation... under
development") and **Blockstream Jade/App** (named only inside one specific
lending demo). It gives **no code sample** for calling any of them from a
browser. **Humid** and **"Humid Web Wallet" do not appear anywhere in the
official corpus** searched during this audit — see
`evidence/G5-G8-G9-negative-findings.md`.

**Produced:** `artifacts/ui-sketch.md` — balance display and plain-language
withdrawal explanation are constructible from docs (with DOC-GAPs noted for
the underlying lookup, see G6); the sign-and-submit step is explicitly a
`throw new Error('DOC-GAP...')` stub, because no documented API exists.

**Could not decide from docs:** literally how to call a wallet to sign a
Simplicity PSET input from a browser. This is the single largest blocker in
the whole journey for the "Product Architect" and "Trad-Fi Engineer"
audiences named in CONTRIBUTING.md, who would specifically need a
non-technical path.

### G6 — Contract indexer

**Status: Docs partial.** The only indexer description in the entire corpus
is `use-cases/lending-protocol.md`'s Pre-lock-covenant indexer, documented as
part of one specific use case, not as a general reusable pattern, and not
cross-linked from `documentation/state.md` (where a reader designing any new
covenant would look). This audit adapted the documented mechanism (recompile
the covenant from candidate params, compare script hashes, then track spends)
to the allowance-with-commission case by analogy.

**Produced:** `artifacts/indexer-spec.md`.

**Could not decide from docs:** whether any reusable indexer software exists
to point at (none is named in `resources/projects.md`); how to distinguish
multiple simultaneous UTXOs at one beneficiary's address (the homepage says
"each UTXO at this address is an independent allowance," but no page explains
how a UI should present that to a non-technical user).

### G7 — TX manifest

**Status: Docs partial.** Purpose and a strong security warning are
documented; `documentation/txmanifest.md` explicitly states the format "has
not yet been frozen as a released specification" — so there is genuinely no
schema version to cite, not merely an undocumented one. No full example
manifest was found on the page.

**Produced:** `artifacts/txmanifest-draft.json`, with every field beyond the
prose-derived facts marked DOC-GAP.

**Could not decide from docs:** any concrete schema version string; the
representation of multi-stage/multi-signer signing flows; the exact JSON key
names for params/witnesses (invented by analogy to `param::`/`witness::`
syntax, not confirmed from a real manifest).

### G8 — Upload the TX manifest to a documented contract registry

**Status: Product not shipped.** No registry is named anywhere in the
corpus. `documentation/txmanifest.md` instead warns against importing
manifests "posted online or sent to them by strangers," which if anything
argues against an open registry existing today. Nothing to upload to; G8
could not be attempted beyond confirming its absence.

**Produced:** nothing (correctly — see anti-patterns list: do not call
something documented if it was only found outside the corpus, and here it
was not found at all).

### G9 — Request an audit from a documented Blockstream Audit Service

**Status: Product not shipped.** No page in the corpus (checked:
`resources/roadmap.md`, `resources/faq.md`, `documentation/road-to-ecosystem.md`,
plus a general WebSearch restricted to the docs domain) mentions an audit
service by that or any similar name. Classified per the protocol's own
instruction as "product not shipped," not "bad docs," since there is no
mention to be bad — the gap here is closer to "no such product exists yet in
the official record."

**Produced:** nothing.

### G10 — Migrate to Liquid mainnet

**Status: Docs partial** (leaning toward missing). No dedicated migration
page exists anywhere in the corpus. Concrete facts that WERE recoverable:
`hal-simplicity simplicity info`'s JSON output has separate
`liquid_address_unconf` and `liquid_testnet_address_unconf` fields from the
same compiled program (`documentation/toolchain.md`), implying the CMR/script
hash itself is network-independent and only the address encoding differs —
but this is never stated outright, only implied by field naming. No page
discusses asset-ID differences between testnet and mainnet, faucet removal
(trivially "the faucet doesn't exist on mainnet," but never said), or
re-binding of params for a production deployment.

**Produced:** the design-decision notes in
`artifacts/allowance-with-commission.simf` (item 6) document what's
undecidable; no separate migration checklist file was fabricated, per the
instruction to prefer incomplete annotated output over an invented polished
artifact.

**Could not decide from docs:** almost the entire migration checklist the
goal asked for. The single most load-bearing safety fact — that most mainnet
Liquid wallets send confidential-by-default outputs, which this specific
covenant design treats as **permanently unspendable** — is stated nowhere
as a mainnet-specific warning (only as a testnet-example code comment).

### G11 — Multi-environment support matrix

**Status: Docs partial.**

| Environment | Status per docs | Citation |
|---|---|---|
| (a) Liquid testnet | **Supported** | `getting-started/quickstart.md` full working flow |
| (a) Liquid mainnet | **Supported** | homepage: "launched on Liquid mainnet in July 2025" |
| (b) Simplicity-enabled Bitcoin testnet (Mutinynet/signet) | **Prototype / in progress** | `resources/roadmap.md`: "An integration of Simplicity in Mutinynet, a signet... is in progress." |
| (c) Bitcoin mainnet via Simplicity Unchained cosigner | **Not documented as shipped — explicitly planned/future** | `resources/roadmap.md`: "...an oracle-based Simplicity interpreter called Simplicity Unchained **will** offer Simplicity scripting support" for "blockchains where a native Simplicity integration isn't present, like the Bitcoin Mainnet" |

This audit did **not** assume Bitcoin mainnet native Simplicity exists, per
the protocol's explicit instruction, and the docs actively confirm it does
not (the whole reason Unchained is being built is that native support is
absent on Bitcoin mainnet).

**Produced:** the table above; no separate artifact file (a table fully
answers this goal).

**Could not decide from docs:** how far along Mutinynet integration actually
is (no percentage/milestone, just "in progress"); whether Unchained's oracle
model is meant to ever apply to Liquid too, or is Bitcoin-mainnet-specific
only.

---

## 2. Documentation Audit Log

| id | topic_component | doc_page_url | corpus | gap_friction | expected_by_reader | attempted_resolution | evidence | severity | suggested_fix | duplicated_with |
|---|---|---|---|---|---|---|---|---|---|---|
| G1.1 | Allowance covenant discoverability | https://docs.simplicity-lang.org/ | official | The flagship "allowance covenant" example lives only on the homepage: no dedicated URL, not linked from use-cases/index.md, not in llms.txt's use-cases list | A stable, bookmarkable, linkable page for the example the reader is asked to build on | Searched use-cases/index.md and llms.txt for "allowance" | use-cases/index.md: "does not mention an 'allowance' covenant or contract example with a dedicated URL" | Major friction | Give the allowance example its own permalinked page under use-cases/ or documentation/, and link it from use-cases/index.md and llms.txt | none |
| G1.2 | Asset1/Amount1/ExplicitAsset type definitions | https://docs.simplicity-lang.org/simplicityhl-reference/type.md | official | Types used pervasively in the flagship example and in jets.md's issuance jets are never defined in the Types reference or stdlib reference | To know what these types are (evidently `Either<_,u256>`-shaped, inferred only from `unwrap_right::<(u1,u256)>` call sites) before writing new code touching them | Fetched type.md and documentation/stdlib.md, explicitly asked for these names | "no definitions or type aliases for Asset1, Amount1... found" (both pages) | Blocker | Add Asset1/Amount1/ExplicitAsset/TokenAmount1 to simplicityhl-reference/type.md with their Either encodings | none |
| G1.3 | Allowance covenant example clarity | https://docs.simplicity-lang.org/ | official | (positive finding) | Understand params vs. witnesses vs. recursive rule vs. funding constraint from one page | Read homepage code + prose directly | Full code block + "param::... become part of the resulting address" + funding-constraint comment, all quoted in evidence/G1-allowance-homepage.md | Positive finding | n/a | none |
| G1.4 | Full-withdrawal branch has zero output constraints | https://docs.simplicity-lang.org/ | official | `main()`'s true-branch for full withdrawal enforces nothing about outputs (no fee check, no destination check), with no prose explaining why | An explicit statement that full withdrawal is intentionally unconstrained because the signer already has full authorization over their own funds | Read the code directly; no accompanying prose addresses the asymmetry with partial_withdrawal() | `match full_withdrawal() { true => (), false => partial_withdrawal() }` | Minor friction | Add a one-line comment explaining the asymmetry | none |
| G2.1 | Multi-output covenant pattern | https://docs.simplicity-lang.org/documentation/state.md | official | Docs explain `output_is_fee` as "network fee payment" but never show a covenant with a THIRD kind of constrained output (e.g. a commission) alongside covenant-copy + fee | A worked example of a covenant with more than 2 semantically distinct constrained outputs | Read state.md's last_will.simf explanation and the homepage's 3-output allowance version | state.md: "the first output must be an updated version of the same contract, while the second output must be a network fee payment" | Major friction | Add a worked "covenant + commission/royalty + fee" example | G2.8 |
| G2.2 | Cross-asset amount comparison | not found | official | No page discusses whether/how to compare amounts across two different assets | An explicit rule or jet for cross-asset checks | Searched jets.md for asset comparison jets | "No dedicated asset comparison jets exist in the reference" | Minor friction | State explicitly that cross-asset comparisons require manual unwrap + eq_256, as same_asset() does | none |
| G2.3 | Explicit vs. confidential amounts — general guidance | https://docs.simplicity-lang.org/documentation/state.md | official | Neither the "Covenants & State Management" nor "Timelocks" page mentions confidential/explicit amounts at all, despite this being safety-critical for any covenant reading `output_amount()` | A general rule, stated once in a canonical concepts page, not only inside one example's code comment | Fetched both pages, explicitly asked about confidential terms | "does not discuss confidential (blinded) amounts... zero results for 'confidential'" | Blocker | Add an explicit-vs-confidential ⚠️ safety subsection to documentation/state.md | G10.3 |
| G2.4 | u64 equality jet unclear | https://docs.simplicity-lang.org/documentation/jets.md | official | No confirmed `eq_64` jet found in the fetched arithmetic-jets excerpt (only add_64, subtract_64, le_64) | The exact jet name for exact u64 equality, needed for a fixed commission check | Asked jets.md explicitly for the arithmetic jets list | Returned table: add_64, subtract_64, le_64 only | Minor friction | Make jets.md filterable/searchable by category, or add a complete alphabetical index | none |
| G2.5 | Param vs. witness decision guidance | https://docs.simplicity-lang.org/ | official | No page directly discusses the tradeoff of binding a destination as a compile-time param vs. a witness | Explicit guidance for this common pattern (a fixed payee baked into a covenant) | Read homepage's param::/witness:: framing and documentation/witness.md | homepage: params "become part of the resulting address"; witness.md: witnesses are supplied "at transaction time" | Minor friction | Add a short "params vs. witnesses: which should I use?" decision box | none |
| G2.6 | Commission counted against ALLOWANCE_AMOUNT or additional? | not resolvable from docs | official | Entirely undocumented — the base example has no fee/commission at all, so there is no citation either way | N/A — this is a genuine open design question the docs cannot answer, since the scenario doesn't exist in them | Re-read the homepage comment and chose the conservative reading (commission counts against the cap) | homepage: beneficiary "may withdraw up to ALLOWANCE_AMOUNT" (no fee carve-out mentioned) | Major friction | Not really a "fixable" docs gap — flagged so a reviewer treats this as invented, not documented, policy | none |
| G2.7 | Network-independence of script-hash params | https://docs.simplicity-lang.org/documentation/toolchain.md | official | `hal-simplicity simplicity info` returns separate `liquid_address_unconf` / `liquid_testnet_address_unconf` fields from the same program+params, implying script hashes are network-independent — but this is never stated outright | An explicit statement that CMR/script-hash params are network-independent, so a testnet-derived param works unchanged on mainnet | Fetched toolchain.md, asked about mainnet/testnet address fields directly | Field list: "...liquid_address_unconf... liquid_testnet_address_unconf" | Major friction | State explicitly, once, that script hashes/CMRs are network-independent and only address encoding differs | G10.2 |
| G2.8 | No worked "3+ constrained outputs" example anywhere | https://docs.simplicity-lang.org/documentation/state.md | official | Every fetched example contract (last_will.simf, third_time.simf, allowance) tops out at 2 constrained outputs (or 3 outputs where the middle one is left unconstrained) | At least one example demonstrating 3+ meaningfully different constrained outputs, since this is exactly what G2 required inventing from scratch | Read documentation/state.md fully and re-examined the homepage code | state.md's 2-output example; homepage's 3-output example with an unconstrained middle slot | Major friction | Add a "covenant + royalty" or "covenant + commission" worked example | G2.1 |
| G3.1 | Simplex test skeleton | https://docs.simplicity-lang.org/documentation/simplex.md | official | (positive finding) | The attribute + function signature to start a test file | Read the page directly | `#[simplex::test] fn test_name(context: simplex::TestContext) -> anyhow::Result<()>` quoted verbatim | Positive finding | n/a | none |
| G3.2 | No worked Simplex test body example | https://docs.simplicity-lang.org/documentation/simplex.md | official | Page describes `simplex build` generating "functions for building witnesses and transactions" into src/artifacts but never names or shows those functions in use | At least one complete, runnable example test body | Read simplex.md fully; page links to BlockstreamResearch/smplx/examples on GitHub but this audit did not fetch that repo (see Method) | "generates... functions for building witnesses and transactions. These define..." | Blocker | Inline at least one minimal complete test body directly on documentation/simplex.md rather than relying solely on an external repo link | none |
| G3.3 | No documented failure-assertion idiom | https://docs.simplicity-lang.org/documentation/simplex.md | official | No documented convention for "this spend should be rejected by the covenant," needed for 3 of 5 requested G3 scenarios | An idiom like `assert!(context.broadcast(tx).is_err())` or an attribute for expected failures | Read the full page | No mention of failure-path testing found | Major friction | Document the failure-assertion idiom explicitly — covenant tests are disproportionately about proving rejections work | none |
| G4.1 | Quickstart CLI walkthrough | https://docs.simplicity-lang.org/getting-started/quickstart.md | official | (positive finding) | Full compile→fund→spend→broadcast sequence, with real commands | Read the page fully | Complete command sequence with simc, hal-simplicity pset create/update-input/sighash/finalize, faucet curl | Positive finding | n/a | none |
| G4.2 | Faucet limits undocumented | https://docs.simplicity-lang.org/getting-started/quickstart.md | official | The faucet command has no documented rate limit, amount, or failure-mode guidance | To know how much tLBTC to expect and how often the faucet can be called while iterating on a new contract | Read quickstart.md fully | Bare `curl "https://liquidtestnet.com/api/faucet?address=...&action=lbtc"` with no surrounding caveat | Minor friction | Add a short faucet-limits note | none |
| G4.3 | Inconsistent Esplora hosts within one tutorial | https://docs.simplicity-lang.org/getting-started/quickstart.md | official | Funds/reads via `liquid.network` endpoints but broadcasts/checks status via `blockstream.info`, with no explanation | One consistent host, or an explicit note that Esplora-compatible instances are interchangeable | Read the full command sequence | Mixed curl targets shown verbatim (liquid.network reads, blockstream.info writes/status) | Minor friction | Standardize on one host and note interchangeability explicitly | none |
| G5.1 | No browser-callable wallet signing API | https://docs.simplicity-lang.org/documentation/wallet.md | official | LWK is named as having WASM bindings "for web applications" but no code sample or package name is given | A minimal npm-package-level starting point for calling wallet signing from a browser | Fetched wallet.md, asked explicitly for code samples | "No specific code snippets for UI-wallet connection are provided in this content" | Blocker | Add a minimal LWK-wasm "connect + sign" code sample directly to documentation/wallet.md | none |
| G5.2 | WalletConnect integration not yet shipped | https://docs.simplicity-lang.org/documentation/wallet.md | official | Described as "official recommendation... under development" — roadmap-only, but easy to misread as already available | An unambiguous "not yet available" marker | Fetched wallet.md and road-to-ecosystem.md | "Official recommendation under development for connecting external wallets" | Product not shipped | Add a clear status badge next to WalletConnect | none |
| G5.3 | No generically-usable, documented end-user wallet | not found | official (absence confirmed across multiple pages + search) | Only Blockstream Jade/App is named, and only inside one specific lending demo — no generic, documented wallet a beneficiary can install today to sign any Simplicity covenant spend | Some named, ready-to-use wallet independent of any single demo | Full corpus search: wallet.md, road-to-ecosystem.md, projects.md, plus WebSearch for "Humid wallet" | See evidence/G5-G8-G9-negative-findings.md | Blocker | Name and document at least one concrete, generically-usable wallet app for Simplicity covenant spends | none |
| G6.1 | Indexer pattern documented only for lending | https://docs.simplicity-lang.org/use-cases/lending-protocol.md | official | The only indexer description in the corpus is embedded in one use case, not generalized or cross-linked from documentation/state.md | A general "how to index any covenant's UTXOs" page under documentation/ | Searched documentation/ pages and use-cases/index.md | "An indexer scans the blockchain to identify transactions that initialize Pre-lock covenants" (lending-specific wording) | Major friction | Extract the indexing pattern into a general documentation/indexing.md page | none |
| G6.2 | No documented reusable indexer software | https://docs.simplicity-lang.org/use-cases/lending-protocol.md | official | No npm package, hosted API, or open-source indexer tool is named anywhere | A reusable library/service name | Read the page fully; checked resources/projects.md for an indexer entry | resources/projects.md project table has no indexer entry | Major friction | Publish or link a minimal reference indexer implementation | none |
| G7.1 | txmanifest schema has no version string | https://docs.simplicity-lang.org/documentation/txmanifest.md | official | Format explicitly "has not yet been frozen as a released specification," and no version string exists at all | At minimum a draft-dated version marker so two tools can agree which draft they implement | Fetched the page directly, asked for schema version | "has not yet been frozen as a released specification" | Major friction | Add a version string even pre-freeze, plus a changelog | none |
| G7.2 | No full example txmanifest | https://docs.simplicity-lang.org/documentation/txmanifest.md | official | No complete example JSON manifest shown on the page | A copy-pasteable starting point | Fetched the page, explicitly asked for a full example | "No example manifest provided in the source material" | Blocker | Add one complete, annotated example manifest | none |
| G8.1 | No contract registry to upload manifests to | https://docs.simplicity-lang.org/documentation/txmanifest.md | official | Page warns against trusting manifests "posted online or sent to them by strangers" but names no trusted alternative distribution channel | Where to put a manifest so a wallet can find/trust it | Fetched txmanifest.md; general WebSearch for "contract registry" | "only import manifest files from appropriately trusted sources" | Product not shipped | If none is planned, say so explicitly rather than leaving it implicit | none |
| G9.1 | No documented Blockstream Audit Service | not found | official | Nothing in roadmap.md, faq.md, or road-to-ecosystem.md describes an audit service | A page describing how to request a security review before mainnet deployment | WebSearch + fetched roadmap/faq/road-to-ecosystem explicitly | See evidence/G5-G8-G9-negative-findings.md | Product not shipped | If this exists only as blog/Office-Hours content, at least link to that unofficial channel so readers aren't left with nothing | none |
| G10.1 | No testnet-to-mainnet migration guide | not found | official | No page walks through address prefix, faucet removal, confidential-by-default risk, or asset-ID changes when moving to mainnet | A migration checklist page | Searched roadmap.md, faq.md, toolchain.md, simplicity-compared.md | simplicity-compared.md: "the page does not... distinguish between current vs. future support" | Blocker | Add a "Going to mainnet" checklist page | none |
| G10.2 | Address field naming implies but doesn't state migration steps | https://docs.simplicity-lang.org/documentation/toolchain.md | official | Same underlying gap as G2.7 | Explicit confirmation of what changes vs. what stays the same | See G2.7 | Same as G2.7 | Major friction | Same as G2.7 | G2.7 |
| G10.3 | No mainnet-specific confidential-funding warning | https://docs.simplicity-lang.org/ | official | The allowance example demands explicit funding; most production Liquid mainnet wallets send confidential-by-default; nowhere is there a mainnet-specific warning that this combination causes PERMANENT fund loss | A loud ⚠️ warning specifically about mainnet funding UX, not just a testnet example's code comment | Read homepage; searched state.md/toolchain.md for a matching mainnet callout | homepage: "Fund this address only with explicit (non-confidential) outputs" — no mainnet-specific echo found anywhere | Blocker | Add a mainnet-specific ⚠️ warning wherever explicit-funding requirements are discussed | G2.3 |
| G11.1 | Liquid mainnet launch clearly stated | https://docs.simplicity-lang.org/ | official | (positive finding) | To know Simplicity is live on mainnet, not just testnet | Read the homepage | "launched on Liquid mainnet in July 2025" | Positive finding | n/a | none |
| G11.2 | Bitcoin-testnet (Mutinynet) status buried in one sentence | https://docs.simplicity-lang.org/resources/roadmap.md | official | Only place a reader learns Simplicity can run on a non-Elements test network at all is one roadmap sentence, with no link, timeline, or milestone detail | A status table (shipped/in progress/planned) across all environments, in one place | WebSearch, then fetched roadmap.md for the exact quote | "An integration of Simplicity in Mutinynet, a signet... is in progress." | Major friction | Add a multi-environment support-status table | none |
| G11.3 | Bitcoin mainnet non-support not stated as an explicit disclaimer | https://docs.simplicity-lang.org/resources/roadmap.md | official | Documented, but only in the roadmap; homepage doesn't disclaim it, inviting a natural misconception | An explicit non-goal statement up front (e.g. on the homepage or FAQ) | Read homepage + roadmap | roadmap: Unchained "will offer" support for "blockchains where a native Simplicity integration isn't present, like the Bitcoin Mainnet" | Minor friction | State on the homepage or FAQ: "Simplicity does not run natively on Bitcoin mainnet today" | none |
| G11.4 | Elements regtest vs. Liquid testnet terminology not disambiguated | https://docs.simplicity-lang.org/documentation/simplex.md | official | simplex.md tests "against a local elementsd instance" (regtest) while quickstart.md uses public Liquid testnet — different networks, never explicitly disambiguated in one place | A one-paragraph glossary-style disambiguation of the different test networks in play | Cross-read simplex.md and quickstart.md | simplex.md: "local elementsd instance" vs. quickstart.md: "Liquid testnet... faucet" | Minor friction | Add a "which network am I testing on?" box, ideally in the glossary | none |

---

## 3. Coverage scorecard (0-5, integer)

| Dimension | Score | Driven by |
|---|---|---|
| Discoverability | 3 | G1.1, G6.1, G11.2 — key material exists but is buried (homepage-only example, use-case-only indexer, one roadmap sentence) |
| Completeness for this journey | 2 | G3.2, G5.1, G5.3, G7.2, G8.1, G9.1 |
| Technical correctness / freshness | 3 | G1.2 (undefined types), G4.3 (inconsistent hosts), G2.4 (jet name unclear) — but everything that IS documented (jets.md signatures, quickstart commands) checked out as internally consistent |
| Security guidance | 1 | G2.3, G10.3 (both Blocker, both about a fund-loss footgun with no general warning), G2.1 |
| Production readiness | 1 | G10.1 (no migration guide), G8.1 (no registry), G9.1 (no audit service) |
| Wallet / non-technical UX path | 1 | G5.1, G5.2, G5.3 — the one step a non-technical beneficiary absolutely needs (sign and submit) has no documented API at all |
| Multi-environment story | 2 | G11.2, G11.3 — the facts exist but require cross-page archaeology to assemble into the table this audit had to build itself |

---

## 4. Priority list

Ordered by impact on completing G1-G11 from docs alone, not by ease of writing:

1. **Document a real, code-level wallet-signing API for the browser** (LWK-wasm or equivalent) directly on `documentation/wallet.md`. This is the single biggest blocker in the whole journey (G5.1, G5.3) — without it, no non-technical beneficiary can ever complete a signed transaction from docs alone, which the protocol names as the definition of a "successful" newcomer journey.
2. **Add a general explicit-vs-confidential safety section** (with a mainnet-specific ⚠️) to `documentation/state.md`. Currently this fund-loss footgun is documented nowhere except one testnet example's code comment (G2.3, G10.3).
3. **Add a full worked Simplex test-body example**, including the failure-assertion idiom, directly on `documentation/simplex.md` (G3.2, G3.3) — the skeleton alone cannot produce the rejection-path tests that matter most for a financial covenant.
4. **Give the allowance covenant its own permalinked page** and **add `Asset1`/`Amount1`/`ExplicitAsset` to the type reference** (G1.1, G1.2) — the flagship example is currently un-linkable and built on undefined types.
5. **Publish a "Going to mainnet" migration checklist** (address prefixes, confidential-by-default risk, asset IDs, faucet removal, param re-binding) (G10.1) — G10 currently cannot be attempted at all beyond inference from field names.
6. **Version-stamp the txmanifest schema and publish one complete example manifest** (G7.1, G7.2) — also a prerequisite for any future registry (G8), since a registry needs a stable format to register against.
7. **Generalize the lending-protocol indexer pattern** into its own `documentation/indexing.md` page, cross-linked from `documentation/state.md` (G6.1, G6.2).
8. **Add a multi-environment support-status table** (Liquid testnet/mainnet, Mutinynet/Bitcoin-testnet-like, Bitcoin mainnet via Unchained) to the roadmap or a dedicated page (G11.2, G11.4) — currently this audit had to assemble the table itself from scattered sentences.
9. **Add a worked example with 3+ differently-constrained outputs** (covenant copy + commission/royalty + fee) to `documentation/state.md` (G2.1, G2.8) — directly de-risks the hardest design decisions the next adapter will face.
10. **Add an "ecosystem status" table** for Humid/WalletConnect/Blockstream Audit Service/contract registry — shipped, planned, or nonexistent — even a single honest table would have saved this run's several dead-end searches (G5.2, G5.3, G8.1, G9.1) and would prevent a reader from assuming tribal-knowledge products are documented when they are not.

