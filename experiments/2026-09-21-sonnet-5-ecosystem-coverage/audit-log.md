# Simplicity/SimplicityHL Ecosystem Documentation Coverage Audit

- **Run date:** 2026-09-21
- **Experiment spec followed:** `tests/ecosystem-documentation-coverage.md` in
  the `simplicity-lang-org` repo
  - File commit: `0ec4d910d2aa9f4eebe948a6e07186ccb63ce86c`
  - File blob hash: `f892d11d41d2b6b2f181ee81c56b673ef67f5561`
  - Repo HEAD at run start: `0cf7d9d55b40a8d71ef53128d16c7e209cb3ef5f`
- **Model:** Claude Sonnet 5 (model ID `claude-sonnet-5`), run as Claude Code
- **Persona in effect:** technical employee at a mid-size finance firm evaluating
  SimplicityHL documentation (see spec's "Role" section) — not a Simplicity core
  developer, moderate classic-Bitcoin background, full-stack TS/React + light Rust.

This log and its artifacts live in a repository separate from `simplicity-lang-org`
so the audit doesn't read the docs source tree directly (which contains many
untracked/draft files not live on the site) and doesn't get intermixed with the
docs repo's own history. All pages were fetched live from
`https://docs.simplicity-lang.org` rather than read from the local repo checkout.

---

## 0. Method

**Start URL:** `https://docs.simplicity-lang.org/` (plus `llms.txt` and
`llms-full.txt`, per the spec's designated entry points).

**Pages visited, in order** (all fetched live over HTTPS):

1. `https://docs.simplicity-lang.org/llms.txt`
2. `https://docs.simplicity-lang.org/llms-full.txt`
3. `https://docs.simplicity-lang.org/` (homepage HTML)
4. `https://docs.simplicity-lang.org/index.md` (homepage raw markdown, once the
   HTML revealed the Allowance covenant lives here)
5. `https://docs.simplicity-lang.org/getting-started/quickstart.md`
6. `https://docs.simplicity-lang.org/documentation/state.md`
7. `https://docs.simplicity-lang.org/documentation/witness-format.md`
8. `https://docs.simplicity-lang.org/documentation/toolchain.md`
9. `https://docs.simplicity-lang.org/documentation/wallet.md`
10. `https://docs.simplicity-lang.org/documentation/txmanifest.md`
11. `https://docs.simplicity-lang.org/resources/roadmap.md`
12. `https://docs.simplicity-lang.org/documentation/road-to-ecosystem.md`
13. `https://docs.simplicity-lang.org/resources/faq.md`

**Search terms that found nothing** (full-text search over the complete
`llms-full.txt`, 437 KB, plus the homepage):

- `allowance` — **zero matches in `llms-full.txt`**, despite the Allowance
  covenant being the homepage's centerpiece example (see G1).
- `Humid` — zero matches anywhere in the audited corpus (see G5).
- `registry`, `Blockstream Audit`, `audit service` — zero matches (see G8, G9).
- `Unchained` — two short matches, both describing it as a future/roadmap
  oracle-based interpreter, never as something usable today (see G11).

**Tools actually executed:** none of `simc`, `hal-simplicity`, or `simplex`.
This environment has no Rust toolchain (`cargo`/`rustc` not found), and
installing one plus building both crates from source was judged out of scope
for completing all eleven goals in a single pass, per the spec's own
sanctioned fallback ("not executed — docs-only reconstruction"). Live network
egress to `docs.simplicity-lang.org` was confirmed and used throughout (via
direct HTTPS fetches); no faucet, testnet node, or wallet software was used,
and no real or testnet transaction was constructed or broadcast. G3's test
sketch and G4's status are both docs-only reconstructions as a result — this
is flagged again at each relevant goal below rather than treated as a docs
defect, since the CLI *is* documented (`documentation/toolchain.md`); it
simply wasn't installed in this run.

**Left the official corpus:**

- `https://stringhandler.github.io/tx_manifest_book/` — directly linked from
  `documentation/txmanifest.md` ("Detailed documentation... is available in
  the txmanifest book"), fetched once (landing page only) to find the current
  schema version, since the official page itself never states one. Treated as
  official-linked, not officially hosted; flagged in G7.
- One WebSearch (via a forked research task) for `"Humid" wallet Blockstream
  Liquid`, to determine whether "Humid" is a real product invented outside
  the corpus, as opposed to a name that doesn't exist anywhere. Result: real,
  actively-developed (`BlockstreamResearch/humid` on GitHub — a browser
  extension Liquid wallet with txmanifest/clear-signing features). This
  finding is used only to characterize the gap in G5; the Humid repository
  itself is not treated as part of the audited corpus and none of its
  contents were used to complete any goal "sufficiently."

---

## 1. Goal-by-goal results

### G1 — Locate the Allowance covenant

**Status: Docs sufficient (with a Blocker-level discoverability defect in
getting there).**

The Allowance covenant lives only at `https://docs.simplicity-lang.org/`
(raw source at `/index.md`) — the site's homepage. It is **not** the
`last_will.simf` contract used everywhere else in the corpus (Quickstart,
Covenants & State Management); it is a separate, third recursive-covenant
example that only appears on the homepage.

Once found, the page fully answers every sub-question G1 asks, entirely from
inline code comments and numbered footnotes:

- **Compile-time params:** `param::ALLOWANCE_AMOUNT` (u64), `param::MIN_DISTANCE`
  (`Distance`), `param::BENEFICIARY_KEY` (`Pubkey`) — footnote 6: "`param::`
  values aren't defined in this file: they're compile-time parameters bound
  when the contract is instantiated, and they become part of the resulting
  address."
- **Spend-time witnesses:** `witness::SIGNATURE` (a `Signature`), consumed by
  `enforce_signature()`.
- **Recursive covenant rule:** `recursive_covenant()` asserts exactly 3
  outputs, that output 0's script hash equals `jet::current_script_hash()`
  (the same contract), and that output 2 `jet::output_is_fee()`.
- **Explicit-vs-confidential funding constraint:** stated directly in the
  contract's header comment — "Fund this address only with explicit
  (non-confidential) outputs" — and explained in footnote 3: `unwrap_right`
  "panics on a confidential value... A confidential output sent to this
  contract can therefore never be spent, and its funds would be stuck
  permanently."

**What I still could not decide from docs:** nothing substantive about the
contract itself — the friction was entirely in *finding* it (see audit log
row G1.1). This page is one of the best-annotated pieces of prose in the
whole corpus once you're on it.

### G2 — Add a fixed commission to every withdrawal

**Status: Docs partial.** Every individual design decision the spec lists is
justifiable from a cited page (see `artifacts/allowance_with_commission.simf`
for the full annotated adaptation), but no page shows the *composite*
technique of adding a required third-party output to an existing recursive
covenant — this took original synthesis across four separate pages.

- **Extra output vs. fee output:** must be a genuine payment output, not
  `output_is_fee`. Footnote 5 (homepage): "Elements... pays fees through an
  explicit fee output rather than Bitcoin's implicit input/output-value
  difference" — a fee output has no destination script, so it cannot carry a
  third party's payment.
- **Asset identity:** the commission should be checked against the same
  `same_asset()` pattern already used for the retained balance, per footnote
  2's reasoning ("anyone can issue a new Liquid asset carrying any amount at
  no cost") and `documentation/state.md`'s general advice ("the contract
  should inspect the assets being transferred to confirm that they are
  always of the expected kinds").
- **Explicit vs. confidential amounts:** must be explicit, for the identical
  reason the contract's own balance must be explicit (footnote 3):
  `unwrap_right` panics on a confidential value, so a confidential commission
  output could never be verified on-chain.
- **Does the recursive copy still balance:** yes, but *because* Elements
  enforces per-asset input/output conservation at the consensus layer, not
  because this program computes it — the original contract already relies on
  this same assumption (footnote 8: "since no other input is available, fees
  can only come out of the allowance's own balance"). This isn't spelled out
  as a general principle anywhere in the corpus; it's implicit background
  knowledge the docs assume the reader already has.
- **How the destination is bound, and network:** `param::` binding (matching
  every other identity in the corpus — `BENEFICIARY_KEY`, `HOT_PUBLIC_KEY`,
  etc. in quickstart.md) is clearly the right mechanism, since the spec asks
  for a *fixed* destination and a witness would let the beneficiary redirect
  the commission per-transaction. Hardcoding in source is disfavored: the
  one place the corpus hardcodes a key directly (`third_time.simf` in
  `state.md`) does so "for demonstration purposes" only. **But no cited page
  shows how to turn a Liquid destination *address* into the `u256`
  script-hash param the contract actually needs to check** — every
  documented `param::` example is a raw pubkey or integer, never an address.
  This is a genuine gap (row G2.2).

### G3 — Simplex tests

**Status: Docs partial.** `documentation/simplex.md` documents installation
(`curl -L https://smplx.simplicity-lang.org | bash`), project layout
(`simplex init`/`simplex build`/`simf/`/`src/artifacts`), and the bare test
function signature (`#[simplex::test] fn test_name(context:
simplex::TestContext) -> anyhow::Result<()>`), run against a local
`elementsd`/Electrs pair. That's the entire documented surface. See
`artifacts/simplex_tests_sketch.rs` for all five required tests, with every
line that goes beyond this signature marked `DOC-GAP` — there's no
documented example of the generated `src/artifacts` API's function names,
how to fund a UTXO in the test context, how to advance the regtest chain to
test a timelock, or how to assert a proposed transaction is *rejected*
rather than accepted. A reader without separate Rust/`smplx-std` experience
cannot get from the signature to a working test using this corpus alone.

### G4 — Deploy on Liquid testnet

**Status: not executed — docs-only reconstruction**, for the reasons in
Method above (no Rust toolchain in this environment; installing one was
judged out of scope for a single pass over all eleven goals). This is a
statement about my execution, not a documentation defect: quickstart.md's
bash/CLI tab is a genuinely complete, real, copy-pasteable worked example —
real faucet URL (`https://liquidtestnet.com/api/faucet`), real Esplora
endpoints, exact `hal-simplicity`/`simc`/`curl`/`jq` invocations, confirmation
polling, and a `non-BIP68-final` broadcast-rejection walkthrough — for
`last_will.simf`. It does not, and was never claimed to, cover the Allowance
covenant or this adaptation. One flaw worth flagging: the docs' own bash tab
admits a bug inline — `(FIXME: This method of converting satoshis to Bitcoin
is not correct in general if the number of satoshis isn't exactly six digits
long.)` — a real, shipped, self-acknowledged rough edge (row G4.3).

### G5 — Non-technical beneficiary web UI

**Status: Docs partial / Docs missing**, split by sub-requirement — see
`artifacts/ui_sketch.md` for the full table.

- **See balances:** documented and usable today — Esplora + LWK (wasm target)
  (`documentation/wallet.md`).
- **Understand a proposed withdrawal (clear signing):** described only as a
  design motto and two open, draft GitHub PRs (Wallet ABI Transaction
  Creation Protocol, Liquid Wallet RPC Profile) in
  `documentation/road-to-ecosystem.md` — no shipped library.
- **Sign and submit via the beneficiary's own wallet:** wallet.md states
  outright that "an official wallet connection recommendation is currently
  in development" — not usable today per the docs' own words.
- **LWK wasm:** documented, alpha, feature-flagged.
- **Naming audit (exactly what G5 asks for):** LWK, WalletConnect, and
  Blockstream App are all named in the corpus (with the honest status above);
  **"Humid" and "Humid Web Wallet" are not mentioned anywhere in the
  corpus**, despite "Humid" being a real, currently-developed Blockstream
  Research wallet whose GitHub PRs are directly about txmanifest parsing and
  clear-signing review — exactly the missing piece this goal is looking for.
  This is confirmed via a left-corpus WebSearch (Method, above) and logged as
  row G5.1; it is exactly the trap the experiment spec names by name ("Do not
  assume Humid is documented because you have heard of it").

### G6 — Contract indexer

**Status: Docs partial.** `wallet.md`'s general answer is "use Esplora,"
which is real and reusable but generic — it has no notion of "this address
belongs to an Allowance covenant instance." The only place the corpus
documents an actual discovery *technique* (recompile a candidate contract
from extracted parameters, compare its script hash/CMR against the observed
output, then track state transitions) is
`use-cases/lending-protocol.md`'s "Indexing and Discovery Mechanism" section
— written specifically for the lending protocol's parameter-token/OP_RETURN
scheme, not offered as a general pattern. See `artifacts/indexer_spec.md` for
the adaptation; this **is** documented only inside a specific use case, per
the spec's own suspected framing, not as a reusable pattern (row G6.1).

### G7 — TX manifest

**Status: Docs partial.** `documentation/txmanifest.md` is clear and
unambiguous on the one question G7 explicitly asks about freezing: "The
`txmanifest` format is work-in-progress and has not yet been frozen as a
released specification." But the page contains **no field reference, no
example file, and no version number** — I had to leave `docs.simplicity-
lang.org` for the linked txmanifest book to learn the actual current schema
version is `manifest_version: "0.2.0"` (row G7.1). The page's "Security
considerations" section, by contrast, is a strong, concrete, well-written
threat-model discussion of manifest spoofing risk (positive finding, row
G7.3) — worth calling out since the audit log isn't only complaints.

### G8 — Contract registry

**Status: Product not shipped.** Zero mentions of "registry" (or any
close synonym) describing a contract registry anywhere in the corpus. The
single occurrence of the word "registries" in the entire corpus is one
unspecified, aspirational word in `road-to-ecosystem.md`'s closing paragraph
("It requires standards, registries, validation logic..."), not a described
system, roadmap item, or named project (row G8.1). Correctly classified as
"product not shipped," not merely "bad docs" — there is nothing to document
yet.

### G9 — Blockstream Audit Service

**Status: Product not shipped.** Zero mentions anywhere in the corpus,
including the roadmap page — this isn't even a named future item, unlike
Simplicity Unchained or Mutinynet (row G9.1).

### G10 — Testnet → mainnet migration

**Status: Docs missing.** There is no migration page or checklist anywhere
in the corpus. The only concrete, on-topic hook is
`documentation/toolchain.md`'s note that `hal-simplicity simplicity info`
returns both `liquid_address_unconf` and `liquid_testnet_address_unconf`
fields side by side — everything else (asset ID differences between tLBTC
and LBTC, whether to switch to confidential addresses in production, removing
faucet dependencies, hardening key management for real funds) is entirely
unaddressed (row G10.1). This is the single largest, cleanest gap found in
the whole audit.

### G11 — Multi-environment support

**Status: Docs sufficient, once assembled from three separate pages** (no
single comparison page exists — a minor discoverability ding, not double-
counted as its own row since it doesn't block completion).

- **(a) Liquid testnet/mainnet:** supported and the primary documented target
  — the homepage states directly, "The tutorials on this site currently
  target Liquid testnet for learning purposes; production deployments run on
  Liquid mainnet."
- **(b) Simplicity-enabled Bitcoin testnet:** prototype, clearly labeled as
  such — `resources/roadmap.md`: a Mutinynet (Bitcoin-like signet)
  integration "is in progress," explicitly described as a demonstration, not
  a finished product.
- **(c) Bitcoin mainnet via Simplicity Unchained:** prototype/roadmap, and
  explicitly oracle-based rather than native — `resources/roadmap.md` and the
  glossary both describe it in future tense ("will offer"). The corpus never
  once implies native Simplicity exists on Bitcoin mainnet — a positive
  finding, since this is precisely the false assumption the experiment spec
  warns against making.

---

## 2. Documentation Audit Log

| id | topic_component | doc_page_url | corpus | severity |
| --- | --- | --- | --- | --- |
| G1.1 | Allowance covenant discoverability | https://docs.simplicity-lang.org/ (`index.md`) | official | Blocker |
| G1.2 (positive) | Allowance covenant self-documentation | https://docs.simplicity-lang.org/ | official | — |
| G2.1 | Extending a recursive covenant with a new output | not found | official | Major friction |
| G2.2 | Binding an address (not a pubkey) as a compile-time param | not found | official | Major friction |
| G2.3 | Fee-asset (LBTC-only) rule not cross-linked to asset-identity discussion | documentation/toolchain.md | official | Minor friction |
| G3.1 | Simplex generated-API / rejection-assertion reference | documentation/simplex.md | official | Major friction |
| G3.2 | Simplex page duplicated verbatim in llms-full.txt | documentation/simplex.md | official | Duplication |
| G4.3 | Sat→BTC conversion FIXME left in shipped bash quickstart | getting-started/quickstart.md | official | Outdated |
| G5.1 | "Humid" wallet undocumented despite being a real, relevant, active project | documentation/wallet.md | official (gap); left-corpus for confirmation | Blocker |
| G5.2 | Clear signing / wallet connect only a design doc + draft ELIPs | documentation/road-to-ecosystem.md | official | Major friction |
| G6.1 | Indexer pattern documented only inside the lending use case | use-cases/lending-protocol.md | official | Major friction |
| G7.1 | txmanifest schema version/example only in an external book | documentation/txmanifest.md | official (gap); official-linked (resolution) | Major friction |
| G7.3 (positive) | txmanifest security-considerations section | documentation/txmanifest.md | official | — |
| G8.1 | No contract registry documented or named | not found | official | Product not shipped |
| G9.1 | No Blockstream Audit Service documented or named | not found | official | Product not shipped |
| G10.1 | No testnet→mainnet migration checklist | not found | official | Blocker |
| G11.1 (positive) | Corpus never implies native Bitcoin-mainnet Simplicity exists | resources/roadmap.md, glossary.md | official | — |

### Full detail

**G1.1 — Blocker.**
`topic_component`: Allowance covenant discoverability.
`gap_friction`: The Allowance covenant — the homepage's flagship worked
example — has zero mentions in `llms.txt` or the 437 KB `llms-full.txt`. The
spec's own Step 1 instruction ("Search the official docs / llms.txt first")
would send a reader straight past it.
`expected_by_reader`: An AI-consumption index file that actually indexes the
whole site, or at minimum its most prominent example.
`attempted_resolution`: Searched `llms-full.txt` for "allowance" (0 hits),
then fetched the homepage HTML directly and found it there; confirmed via
`index.md` and `.md` raw-source endpoint that no `llms*.txt` file references
this URL by any pattern.
`evidence`: "This file is an index of documentation pages" (`llms.txt` line
5) lists 30 pages, none of which is the homepage.
`suggested_fix`: Include the homepage (or at least its code example) in
`llms-full.txt`'s generation, or add an explicit "Home" entry to `llms.txt`.
`duplicated_with`: none.

**G1.2 (positive) — n/a severity.**
Once located, every clause of G1's ask (params, witness, recursive rule,
confidential-funding constraint) is answered by an inline footnote on the
same page — no cross-referencing required. Cited directly above in the G1
write-up.

**G2.1 — Major friction.**
`topic_component`: Extending a recursive covenant.
`gap_friction`: No page shows adding a required output to an existing
covenant beyond the fee output — the technique (extend `num_outputs` check,
add a script-hash + same-asset check at the new index) had to be assembled
from four separate pages (homepage, state.md, toolchain.md, quickstart.md).
`expected_by_reader`: A "design patterns" or "extending a covenant" page —
which `documentation/state.md`'s "Next steps" section explicitly promises is
coming ("SimplicityHL will have library functions reflecting the load and
store patterns...").
`attempted_resolution`: Read state.md's "Constraining state updates" section
in full; it discusses the *principle* ("without this constraint, the updater
could add an additional output that leaks contract funds") but has no
multi-output worked example.
`evidence`: state.md: "A real financial application may need to include
logic to enforce a variety of further constraints. For example: The contract
may be designed to deal with a specified asset..." — principles, not a
worked example.
`suggested_fix`: A "Adapting the Allowance covenant" or general
"adding a payment output to a covenant" how-to, ideally using this exact
commission scenario.
`duplicated_with`: none.

**G2.2 — Major friction.**
`topic_component`: Binding an address as a compile-time parameter.
`gap_friction`: Every `param::` example in the corpus binds a `Pubkey`,
`Distance`, or plain integer — never a destination *address*. Producing
`COMMISSION_SCRIPT_HASH` from a real Liquid address requires knowledge (the
scriptPubKey/Taproot derivation from an address) this corpus never
demonstrates end-to-end for a plain payment address (only for the
contract's *own* Taproot address, via `hal-simplicity simplicity info`).
`expected_by_reader`: A worked "params can also be scriptPubKeys/addresses"
example, or an explicit note in `simplicityhl-reference` on `type_alias.md`.
`attempted_resolution`: Checked `documentation/toolchain.md`,
`documentation/witness-format.md`, and `simplicityhl-reference/type_alias.md`
references in `llms.txt`; none address deriving a script hash from an
arbitrary third-party address.
`evidence`: toolchain.md's `hal-simplicity simplicity info` only documents
deriving the *contract's own* address, not consuming an external one.
`suggested_fix`: One short worked example: given a Liquid address string,
show the exact command/library call that yields the `u256` a SimplicityHL
contract can compare against `jet::output_script_hash`.
`duplicated_with`: none.

**G2.3 — Minor friction.**
`topic_component`: Fee-asset assumption.
`gap_friction`: "Network fees are currently always automatically paid in
LBTC" (toolchain.md) is never mentioned near the Allowance covenant's own
asset-identity discussion, even though it directly affects anyone adapting
the contract to a non-LBTC asset (a separate LBTC input becomes mandatory
just to pay fees).
`expected_by_reader`: A cross-link or footnote on the homepage example.
`attempted_resolution`: Found only via a separate toolchain.md read; not
discoverable from the Allowance page itself.
`evidence`: toolchain.md, `pset create` section: "If the asset is not
specified, it is assumed by default to be... LBTC. Network fees are
currently always automatically paid in LBTC."
`suggested_fix`: Add a one-line footnote to the Allowance example noting
this constraint.
`duplicated_with`: none.

**G3.1 — Major friction.**
`topic_component`: Simplex testing.
`gap_friction`: `documentation/simplex.md` documents only the bare
`#[simplex::test]` function signature; it never shows the generated
`src/artifacts` API, a funding call, a block-advance/timelock-testing call,
or an assertion that a proposed transaction was rejected.
`expected_by_reader`: At least one complete, realistic test body for a
non-trivial (recursive or timelocked) contract.
`attempted_resolution`: Read the full Simplex page (both of its two
identical copies, see G3.2) and the `examples/basic` reference
(`p2pk.simf`, mentioned by name but not shown); no test bodies are quoted
anywhere in the corpus.
`evidence`: simplex.md: "Each has a `README.md` file describing the project
and how to invoke its Simplex test suite" — description outsourced to an
external repository's README, not shown.
`suggested_fix`: Inline at least one complete happy-path-plus-one-failure-
path test body directly on the Simplex page.
`duplicated_with`: none.

**G3.2 — Duplication.**
`topic_component`: Simplex page content.
`gap_friction`: The entire Simplex page appears twice, verbatim, in
`llms-full.txt` (once inlined under the "Get Started" section, once as its
own page) — doubles token cost for any LLM-based reader and risks drifting
out of sync if only one copy is ever edited.
`expected_by_reader`: A single source of truth, or a nav-only cross-reference
in the aggregated file.
`attempted_resolution`: Diffed both occurrences line-by-line; byte-identical.
`evidence`: `llms-full.txt` lines 542–617 and 1605–1682 are identical.
`suggested_fix`: Fix the `llms-full.txt` generator to emit each page once.
`duplicated_with`: `documentation/simplex.md` (self-duplicate within
`llms-full.txt`).

**G4.3 — Outdated.**
`topic_component`: bash/CLI quickstart sat→BTC conversion.
`gap_friction`: The docs' own inline comment flags a real bug: `VALUE="0.00"$(jq
-r '.vout[0].value' < input-tx.json)` breaks for any value that isn't
exactly six digits of satoshis.
`expected_by_reader`: Correct, general-purpose conversion logic in a
tutorial meant to be copy-pasted.
`attempted_resolution`: n/a — the docs page itself surfaces this.
`evidence`: "(FIXME: This method of converting satoshis to Bitcoin is not
correct in general if the number of satoshis isn't exactly six digits
long.)"
`suggested_fix`: Replace with a locale/width-independent conversion (e.g.
`printf` with fixed decimal padding, or a `jq` expression).
`duplicated_with`: none.

**G5.1 — Blocker.**
`topic_component`: Humid integration.
`gap_friction`: "Humid" and "Humid Web Wallet" have zero mentions anywhere
in the corpus, yet Humid is a real, actively-developed Blockstream Research
wallet (`BlockstreamResearch/humid`) whose open work is specifically about
txmanifest parsing and clear-signing review — i.e., directly relevant to
this exact goal.
`expected_by_reader`: At minimum a named mention and status note in
`documentation/wallet.md`'s wallet list.
`attempted_resolution`: grepped the full corpus for "humid" (0 hits);
confirmed via one out-of-corpus WebSearch that the name is real and active,
not a hallucination trap with nothing behind it.
`evidence`: wallet.md names LWK, an unnamed "official wallet connection
recommendation... in development," and (once) Blockstream Jade/Blockstream
App — never Humid.
`suggested_fix`: Add Humid to the wallet/tooling list with an honest status
(e.g., "in development, not yet documented for external integrators").
`duplicated_with`: none.

**G5.2 — Major friction.**
`topic_component`: Clear signing / wallet connect.
`gap_friction`: The entire "how does a beneficiary understand what they're
signing" story is a design document plus two open draft GitHub PRs (ELIPs
#35, #36), not a usable spec or library.
`expected_by_reader`: A minimal shipped API or reference implementation.
`attempted_resolution`: Read `road-to-ecosystem.md` in full; both linked
ELIPs are described as drafts, and the page states the wallet-connect
mechanism itself is "currently in development."
`evidence`: "An official wallet connection recommendation is currently in
development to connect external wallets with Simplicity clients."
`suggested_fix`: Once shipped, replace the design-motto framing with a
concrete quick-start; until then, label the whole section "Planned" more
prominently than a single sentence.
`duplicated_with`: none.

**G6.1 — Major friction.**
`topic_component`: Contract indexing.
`gap_friction`: The only documented indexing *technique* beyond "use
Esplora" is specific to the lending protocol's parameter-token/OP_RETURN
scheme, not offered as a reusable pattern for arbitrary covenants.
`expected_by_reader`: A general "how to index any Simplicity covenant" page
separating the reusable technique (recompile + compare script hash) from
lending-specific mechanics.
`attempted_resolution`: Read `wallet.md`'s indexing section (generic,
Esplora-only) and `use-cases/lending-protocol.md`'s full "Indexing and
Discovery Mechanism" section (specific).
`evidence`: "An indexer recognizes Pre-lock initialization transactions by
matching them against a specific transaction template" — lending-specific
matching criteria, not generalized.
`suggested_fix`: Extract the general technique into
`documentation/wallet.md` as its own subsection, with the lending page
linking to it instead of repeating it standalone.
`duplicated_with`: none.

**G7.1 — Major friction.**
`topic_component`: txmanifest schema version.
`gap_friction`: `documentation/txmanifest.md` never states a version number
or shows a field reference; both exist only in the linked external
txmanifest book.
`expected_by_reader`: The schema version and at least one full example,
inline or one click away on the same domain.
`attempted_resolution`: Read txmanifest.md in full (no version stated);
followed its own "Detailed documentation" link to
`stringhandler.github.io/tx_manifest_book/`, whose landing page states "This
book describes manifest format `0.2.0`."
`evidence`: txmanifest.md: "The `txmanifest` format is work-in-progress and
has not yet been frozen as a released specification. Detailed documentation
... is available in the txmanifest book" — no version given.
`suggested_fix`: State the current `manifest_version` value directly on the
official page, and include one minimal example JSON file inline.
`duplicated_with`: none.

**G7.3 (positive) — n/a severity.**
txmanifest.md's "Security considerations" section is concrete and
well-reasoned about manifest-spoofing risk to end users; worth preserving as
a model for how other risk sections in the corpus should read.

**G8.1 — Product not shipped.**
`topic_component`: Contract registry.
`gap_friction`: No registry of any kind is named, described, or roadmapped.
`expected_by_reader`: Either a registry to upload to, or an explicit
"planned, not yet available" statement.
`attempted_resolution`: Searched the full corpus for "registry" and
"registries"; the only hit is one unspecified word in road-to-ecosystem.md's
closing paragraph, not a described system.
`evidence`: "It requires standards, registries, validation logic, contract
metadata, asset metadata, and wallet implementations that reject what they
cannot understand." — aspirational, not a spec.
`suggested_fix`: If none is planned yet, say so explicitly wherever a reader
might look for one (e.g., near txmanifest.md's security section, which is
exactly where "how do I trust a manifest source" would lead someone to look
for a registry).
`duplicated_with`: none.

**G9.1 — Product not shipped.**
`topic_component`: Blockstream Audit Service.
`gap_friction`: Zero mentions anywhere, including the roadmap page.
`expected_by_reader`: Either the service, or an explicit non-existence
statement.
`attempted_resolution`: Searched the full corpus and the roadmap page
specifically; nothing.
`evidence`: n/a — absence confirmed by exhaustive search of `llms-full.txt`.
`suggested_fix`: n/a (nothing to fix; correctly not claimed anywhere).
`duplicated_with`: none.

**G10.1 — Blocker.**
`topic_component`: Testnet → mainnet migration.
`gap_friction`: No page or checklist addresses moving a contract from
testnet to mainnet — asset IDs, confidential-by-default practice, faucet
removal, and production key management are all unaddressed together.
`expected_by_reader`: A single "Going to production" checklist page.
`attempted_resolution`: Searched the full corpus for "mainnet" (4 matches
total, all incidental — a glossary date example, a definition of Liquid, a
note about running your own node, and the Unchained roadmap blurb); none is
a migration guide.
`evidence`: The only concrete hook found anywhere is toolchain.md's
`hal-simplicity simplicity info` returning both `liquid_address_unconf` and
`liquid_testnet_address_unconf` in the same JSON object.
`suggested_fix`: Add a "From testnet to mainnet" page covering: asset ID
differences (tLBTC vs. LBTC and any other assets in use), whether/how to
move to confidential addresses for production, removing faucet-funding
assumptions, and hardening key storage for the compile-time params that
previously held demo keys.
`duplicated_with`: none.

**G11.1 (positive) — n/a severity.**
The corpus is careful, across `resources/roadmap.md` and the glossary, never
to imply that native Simplicity execution exists on Bitcoin mainnet today —
Simplicity Unchained is consistently future-tense and explicitly
oracle-based. This is exactly the false assumption the experiment spec warns
against, and the docs avoid it correctly.

---

## 3. Coverage scorecard (0–5)

| Dimension | Score | Driven by |
| --- | --- | --- |
| Discoverability | 2 | G1.1, G5.1, G7.1 |
| Completeness for this journey | 2 | G2.1, G3.1, G6.1 |
| Technical correctness / freshness | 4 | G4.3 (only ding); otherwise every spot-checked command, jet name, and URL was accurate and live |
| Security guidance | 4 | Strong positives (G1.2's footnotes, G7.3); dinged only by G2.2 (no guidance on safely binding an external address as a param) |
| Production readiness | 0 | G8.1, G9.1, G10.1 — no registry, no audit service, no migration guide |
| Wallet / non-technical UX path | 1 | G5.1, G5.2 — only LWK-wasm-in-page-signing is real today |
| Multi-environment story | 4 | G11.1 positive; only ding is that the three environments' status is scattered across three pages rather than one comparison table |

---

## 4. Priority list

Ordered by impact on completing G1–G11 without leaving the corpus, not by
implementation ease:

1. **Add the homepage's Allowance covenant (and any other homepage-only
   content) to `llms-full.txt`/`llms.txt`.** Highest leverage single fix —
   the flagship example is currently invisible to the corpus's own
   recommended entry point (G1.1).
2. **Publish a "extending a covenant" how-to** showing how to add a new
   required output (fee, commission, royalty) to an existing recursive
   covenant, using the asset-identity and balance-conservation reasoning
   the Allowance example already demonstrates for its existing outputs
   (G2.1).
3. **Publish a testnet-to-mainnet migration checklist** — the largest
   all-zero scorecard dimension: asset IDs, confidentiality defaults, faucet
   removal, production key management (G10.1).
4. **Fill in a complete Simplex test example**, including at least one test
   that asserts a proposed transaction is rejected, not just accepted
   (G3.1).
5. **State the txmanifest schema version and include one example file
   directly on `documentation/txmanifest.md`**, instead of requiring a trip
   to an external book (G7.1).
6. **Add a named wallet/tooling status table** (LWK, Humid, WalletConnect
   draft, Blockstream App, txmanifest-wallet) with an honest
   shipped/alpha/draft/roadmap column, closing the Humid gap and every
   future gap like it in one place (G5.1, G5.2).
7. **Generalize the lending protocol's indexing technique** into its own
   subsection of `documentation/wallet.md`, separated from lending-specific
   mechanics (G6.1).
8. **Explicitly state "not yet available" for a contract registry and an
   audit service** wherever a reader would naturally look for one (e.g.,
   txmanifest.md's security-considerations section) — cheap, removes
   ambiguity (G8.1, G9.1).
9. **Show how to derive a script-hash parameter from an ordinary Liquid
   address**, not just from the contract's own compiled address (G2.2).
10. **De-duplicate the Simplex page in `llms-full.txt`** and cross-link the
    LBTC-only fee rule from the Allowance covenant's asset-identity
    footnote — both small, mechanical fixes (G3.2, G2.3).

---

## 5. Artifacts

See `artifacts/` in this repository:

- `allowance_with_commission.simf` — the adapted G2 contract, fully annotated
  with `SOURCE`/`CONFIDENCE` per line or block.
- `simplex_tests_sketch.rs` — G3's five required tests, with every invented
  (undocumented) API call marked `DOC-GAP`.
- `indexer_spec.md` — G6's indexer design, adapted from the lending
  protocol's pattern.
- `txmanifest_draft.json` — G7's draft manifest, `manifest_version: "0.2.0"`
  per the external txmanifest book (not stated on the official page).
- `ui_sketch.md` — G5's wallet-naming table and UI sketch.
