# Action log

Times are approximate. "Reader" means the persona from the test plan: a full-stack
engineer at a finance firm, moderate classic-Bitcoin knowledge, no Liquid / Simplicity
experience.

## Setup

- Read the test plan (`tests/ecosystem-documentation-coverage.md`, local).
- Read the local draft `docs/getting-started/allowance-howto/{README,HOWTO,EXPLANATION,REFERENCE}.md`
  as the user directed. Then the user clarified the draft is published but not
  discoverable, so the audit uses the **published** copies and the local copy only for a diff.
- Environment: no `curl`, `node`, `npm`, `cargo`, `rustc`, `simc`, `simplex` in the
  sandbox; `git` and `python3` present. Wrote `fetch.py` (urllib) to fetch pages raw.
- Fetched `llms.txt`, `llms-full.txt`, homepage: all 200.

## Discoverability of the draft

- `llms.txt`: no entry mentions "allowance". `llms-full.txt`: zero hits for "allowance-howto".
- The homepage contains the Allowance covenant (as the hero example) but no link to the HOWTO
  (checked: no `allowance-howto` href in index.html).
- Probed URLs directly: `/getting-started/allowance-howto/`, `.../HOWTO/`, `.../EXPLANATION/`,
  `.../REFERENCE/`, and the `.md` sources all return 200. **A reader would only find it with
  the URL in hand.** For the rest of this test, the URL is treated as known (the user gave it),
  but the discoverability gap is logged.
- Diffed published vs. local: published is an older revision (headings "Step N.", no
  `${GUIDE:?}` guard, no Waterfalls paragraph in REFERENCE, no "takes several minutes" notes).
  Audit is against the published one.

## G1: locate the Allowance covenant

Queries: llms.txt grep "allowance" (0), llms-full.txt grep "allowance" (0); site search
(`search.py`, against the live `search/search_index.json`) "allowance" → HOWTO, EXPLANATION,
homepage, README, REFERENCE.

- Found the covenant on the homepage (`/index.md`), hero example "Allowance Covenant".
  Rationale: the plan says "do not assume the filename"; the homepage is the first page a
  reader sees and the contract is there with annotations.
- HOWTO "Get the files" says to `git clone https://github.com/BlockstreamResearch/simplicity-demo`.
  Cloned into `downloads/` (in-corpus: official page links it as source). Commit 7864241, 2026-10-21.
- The repo has six `.simf` copies; code (comments stripped) is byte-identical to the homepage in
  all six. Comments differ: the repo's are longer and contain one extra fact (fee must be the
  policy asset) and leftover `// (N)!` annotation markers.
- G1 answers, each from a cited page:
  - compile-time params: `BENEFICIARY_KEY` (Pubkey), `ALLOWANCE_AMOUNT` (u64), `MIN_DISTANCE`
    (Distance/u16). Homepage annotation 6; EXPLANATION §1; HOWTO Step 1 & 6 (types via the
    `fromU256Hex`/`fromU64`/`fromU16` snippet).
  - spend-time witness: `SIGNATURE` only. EXPLANATION §1.
  - recursive rule: exactly 3 outputs; output 0 script hash == current script hash; output 2 is
    fee; output 0 amount >= balance − ALLOWANCE_AMOUNT and same asset as input. Output 1 not
    constrained. Full withdrawal (balance <= ALLOWANCE_AMOUNT) constrains no outputs at all.
    EXPLANATION "What partial_withdrawal() checks", "recursive_covenant()", "The full-withdrawal path…".
  - explicit vs confidential: funding and continuation must be explicit; payout may be blinded;
    fee is explicit. EXPLANATION table; homepage annotation 3; HOWTO Step 7 (`addExplicitRecipient`).
- Status: **Docs sufficient** (with discoverability caveat G1.-1).

## G2: adapt with a fixed commission

Queries (site search): "commission" 0; "output_is_fee" 6 pages; "fee output" 8; "output_script_hash" 7
(destinations dominant); "policy asset" 0; "per asset" 0; "each asset" 0; "param::" 4; ".args" 1
(quickstart); "randomi" / "output order" HOWTO + REFERENCE only.

Pages read: destinations (whole), state "Constraining state updates", jets (output section),
glossary Fee / Parameter, quickstart .args section, match_expression reference.

Decisions, each with its source:
1. **Payment output, not fee output.** Fee = paid to block producer (glossary Fee; homepage annot. 5).
   A third party is paid by a normal output whose scriptPubKey hash is checked (destinations).
2. **Same asset as the covenant**, checked with the existing `same_asset()` (EXPLANATION "same_asset()
   checks assets"; state page). Why another asset is impossible with one input isn't documented (G2.-4).
3. **Explicit commission amount**, because the contract reads it (EXPLANATION per-output rule).
4. **Recursive copy:** cap widened to ALLOWANCE + COMMISSION; 4 outputs (cov, beneficiary, commission,
   fee). Final path now also enforced (3 outputs) because EXPLANATION warns it is otherwise unconstrained.
   Added a dust branch (my design choice; docs silent on it) so a tail below the commission isn't stuck.
5. **Destination bound as a compile-time param** `COMMISSION_SCRIPT_HASH: u256` (destinations, "Require a
   payment to one destination"); network is NOT encoded in the hash (destinations table) so the
   deployer must pick a Liquid testnet address for testnet and recompute for mainnet. Param, rather than
   hard-coded, so the same source serves both networks; witness-supplied would let the spender choose.
- Restructured a nested `match` into a helper because match_expression reference doesn't show nesting.
- Artifacts: `artifacts/allowance_commission.simf`, `.args`, `.args.NOTES.md`. **Not compiled yet**
  (no simc here) — will ask the user.
- Status: **Docs partial** — all five decisions justifiable from cited pages, but parameter declaration
  is undocumented (G2.-2) and the "randomized output order" claim conflicts with fixed indices (G2.-7).

## G3: Simplex tests

Queries: "docs.rs" 0, "FinalTransaction" 0, "TestContext" 1, "finalize_strict" 0, "sign_tx" 0,
"smplx-std" 3 pages, "issuance" (jets, _jets, execution-model only), "issue an asset" 0.

- Read the Simplex page (CLI only), HOWTO Step 2, the linked `examples/allowance-simplex/README.md`
  and `tests/allowance_test.rs` (312 lines).
- **Design feedback into G2:** the example says Simplex appends change then fee after listed
  outputs. To make the beneficiary the change output, the commission must come before it, so I
  changed the contract's layout to partial = [covenant, commission, beneficiary, fee],
  final = [commission, beneficiary, fee].
- Wrote `artifacts/allowance-commission-simplex/tests/allowance_commission_test.rs` with five tests:
  happy path, insufficient remainder, too soon (BIP68), missing commission (partial), missing
  commission (final). All API calls copied from the example; generated type/field names and the
  sha256 import path marked GUESSED.
- Wrong-asset test **not written** (`WRONG_ASSET_TEST.md`): needs issuance APIs that no page shows.
- Status: **Docs partial** — four of five tests writable thanks to the linked example; no API
  reference; wrong-asset blocked.
- Next: ask user to run `simc` on the contract and `simplex test` on the project.

## G2/G3 execution (user ran `run-g2-g3.sh`)

- (A) HOWTO Step 2 verbatim: proptest pin **errored** (smplx-test now pins =1.12.0), build continued,
  **2/2 passed**. (B) simc compiled the adapted contract first try, CMR 6c2dbdfb…, warning about a
  missing `simc "0.8.0";` directive. (C) adapted tests: **5/5 passed** first try; one unused-import
  warning (`Hash`), now removed.
- Weakness in my own tests: `ensure_contract_rejected` accepts any non-node error. Added an
  `eprintln!` of the error so a re-run can show each rejection's actual reason.
- User confirmed G4/G5 scope: run the full HOWTO (standalone page Steps 3b–10, and Humid
  Steps 3c, 3d, 11) **with the original contract**; I then assess from docs + page source what the
  commission contract would change.
- Updated statuses: G2 code compiles (docs status unchanged: partial). G3 tests pass (docs partial).

## G4 builds

- User installed Bun with the HOWTO's npm route, scoped to /tmp: `npm install -g --prefix /tmp/bun-npm bun`, then ran `run-g4-builds.sh` with that bin dir on PATH. (Location is the user's choice; the HOWTO route itself was followed.)

## G5–G11 docs research (done while the user ran the Step 3 builds)

Order deviation: G6–G11 docs-side work was done before G4/G5 hands-on results, because G4/G5
execution is the user's and runs in parallel. Rows for G4 and G5's hands-on part will be added after.

Queries: Humid 64 (draft + Projects), "Humid Web Wallet" 0, LWK 43/9 pages, lwk_wasm (HOWTO only),
WalletConnect 2, "Wallet Connect" 4, "Blockstream App" 1, Jade 1, Green 0, indexer 14/4 pages,
registry 3 (REFERENCE), audit 5/3 pages, "Audit Service" 0, mainnet 27/9, Unchained 4/3, signet 6/3,
"Bitcoin testnet" 0, txmanifest 28/8, manifest_version 4/2, ELIP 7/3, faucet 20/5, Waterfalls 0,
Esplora 13/6, 6f0279e9 0, 144c6543 0, lq1 1, tlq1 1.

Pages read: wallet, txmanifest, roadmap, projects, road-to-ecosystem, use-cases/unchained (stub),
lending (indexer section), glossary (Signet, Liquid, Manifest, Elements), news mainnet post (HTML; `.md`
404s), signet.simplicity-lang.org (linked from glossary), txmanifest book (print view: intro,
Parameters, Outputs & destinations, Field types, field reference), simplicity-demo
docs-notes/mainnet-notes.md, webapp/server/indexer.py header. Liveness: both lending demos, the book,
txmanifest-wallet repo and the faucet all 200.

Artifacts: `artifacts/txmanifest/` (G7 draft + notes; not schema-validated: no `jsonschema` module),
`artifacts/indexer-spec.md` (G6), `artifacts/mainnet-migration.md` (G10), `artifacts/environments.md` (G11).

Statuses (provisional): G6 Docs partial; G7 Docs partial; G8 Product not shipped; G9 Docs missing;
G10 Docs partial; G11 (a) supported, (b) prototype/not documented, (c) product not shipped.

## Environment note

- User reports another agent is running a related test concurrently on the same machine. Possible shared effects: local port 8099 (HOWTO Step 4) and per-IP Esplora rate limits (blockstream.info). Unexplained 429s or stalls during Steps 4-11 should be read with that in mind and not attributed to the HOWTO without checking.

## G7 validation

- User ran `python3 -m jsonschema -i artifacts/txmanifest/txmanifest.commission.json <demo 0.2.0 schema>`: exit 0, no output. Structural validity only; engine semantics (e.g. `compute.address` taking a `params.` reference) unverified.

## G7 stage 2b

- Faucet OK (100000 sats, txid 99a4312b…). Sync via liquid.network fine.
- **My bug:** the wait-loop regex did not match `100000 sat  (1 UTXO)`, so it polled all 10 times (5 min) instead of stopping at the first funded sync.
- Fund dry run reached Step 5 then failed: fee-rate prompt needs a TTY (closed stdin). compute script_hash worked. Output lists "4 template field(s) loaded from instance" for a constructor action with no --instance, which is unexplained.
- Next: stage 2c in the user's own terminal, recorded with `script`.

## G4 (commission contract, CLI path) / G7 execution: Fund

- Stage 2c (dry run, user terminal): fee prompt `Fee rate (sat/vb) [0.1]`; fee 139 sat; contract compiled in-wallet, CMR 868526e7…, covenant `tex1pdmmt8ecs084xa8h8y4rew62zvc7vm3tanx47mz9pzylzrp4r96ssuw4p5l`; covenant output explicit. Exit 0.
- Fund for real (`logs/txw-fund.txt`): broadcast to blockstream.info, HTTP 200, txid dfb366ab169e6f798190f8df352234c9d8716b955cb649eb62a49fb33592baa2. Outputs: #0 50000 explicit (covenant), #1 confidential change, #2 fee 139.
- Observation: dry-run listing showed change output #1 as explicit; the finalized tx has it confidential. Harmless here (contract never reads it).
- Wrote `artifacts/allowance_status.py` (G6 spec as code: two Esplora calls, depth, action incl. Dust). First run: 1 UTXO, value 50000, asset 144c6543…, unconfirmed, PartialWithdraw (remainder 29000). Polling in background until depth >= 3.

- partial1 attempt 1: failed before signing: `network_fee` fee declaration (book feature) unsupported by 0.2.2. Nothing broadcast. Removed the declaration from both withdrawal actions (manifest now differs from what was schema-validated only by removing two outputs). Commission output confirmed explicit by the tool.

- partial1 attempt 2: SUCCESS. Wallet dry-run of covenant passed; txid 3d6cc98eccaaa485001437cdaf57a5534a38892713416035e8b875b9d814bdff, confirmed. Outputs: 0 p2tr 29000 explicit (covenant), 1 p2wpkh 1000 explicit (commission), 2 confidential payout 19837, 3 fee 163. Independently checked sha256(out1 spk 00141ef8…d933) == COMMISSION_SCRIPT_HASH 1ab1ba46…e49d. Polling for partial2.
- partial2: SUCCESS. txid e469afcc29a43d373ab0838472b0af9e041f2324044adb9c1048481645051cf3. Outputs 0: 8000 explicit covenant, 1: 1000 explicit commission, 2: confidential payout, 3: fee 163. Next action FullWithdraw (8000 <= 21000).
- final (FullWithdraw), run 1 at 18:21 local: SUCCESS. txid b88678e2549a6333a955a670848774519db059756504b98df50324885a786c62, confirmed 2671251. Outputs 0: 1000 explicit commission (hash match), 1: confidential payout, 2: fee 155. state.3.json: `last_action: FullWithdraw`, `utxos: []`.
- final, run 2 at 19:00 (user re-ran after an interruption): built the same spend from stale state.2.json, local covenant dry-run passed, node refused `bad-txns-inputs-missingorspent`; the tool still exited 0. This run overwrote logs/txw-final.txt; run 1's outcome is reconstructed from state.3.json and the chain.
- Covenant address now empty. Commission destination (Esplora `/scripthash/1ab1ba46…/utxo`) holds exactly three 1000-sat UTXOs: 3d6cc98e:1 (h 2671234), e469afcc:1 (h 2671237), b88678e2:0 (h 2671251).
- **Commission covenant lifecycle complete on Liquid testnet: Fund → PartialWithdraw → PartialWithdraw → FullWithdraw, commission paid on every withdrawal.**

## G4 builds (Steps 3a-3c), results

- 3a: all tools present (bun from /tmp npm prefix); clang wasm32 present.
- 3b: wasm-pack OK in 214 s; "Simplicity feature: present"; lwk 7ad29620 (2026-10-21); vendor/ has lwk_wasm.js + 15 MB wasm.
- 3c: build:wasm:lwk, build:wasm:smplx, bun install, git apply (patch applied cleanly), bun run build all exit 0; dist/ written. Commands worked verbatim.

## G4/G5 browser run (original contract)

- Step 3d: user loaded `humid/dist` as an unpacked extension. Known Humid setup friction (user has filed it upstream): Chromium closes the setup window when the browser loses focus, so the seed phrase cannot be copied into another application as the UI suggests. HOWTO Step 3d already advises writing the seed phrase on paper, which matches the workaround.
- Step 4: page served on port 8399 (not 8099; parallel tests). Steps 4-10 summarized to the user from the published page; user reports back.
- Browser run Step 6 blob: ALLOWANCE_AMOUNT 5000, MIN_DISTANCE 3, covenant tex1pdhnaepd…8fztv. Step 7 fund: 076c4bba7f64bb25068bdcb6ba92c6baafa75bb358b85d5196e2433b69daf7fe, confirmed 2671304; out0 8000 explicit p2tr, out1 confidential change, fee 27.
- Browser run Step 9 claim (PartialWithdraw): 99d3b5506dbb0ae1e7da0af324a971e7f37c5eac638fd56eb08b7d2bbfb7643b; out0 3000 covenant, out1 4500 explicit payout, out2 fee 500 (page constant); sequence 3. Page auto-refresh worked but lagged ~1 min (G4.-8, revised).
- Browser run Step 10 final claim (FullWithdraw): 9d53d0fbbce0e8c90d03b02a7e286ed9b9f44c73dbff3c257abe25b442b9e9a7, spends 99d3b550:0, sequence 3; out0 2500 to beneficiary (same address as first payout), out1 fee 500. Covenant address now holds 0 UTXOs (mempool spend). Needed one manual Refresh status first (G4.-10).
- **Browser Steps 4-10 complete with the original contract: Fund 076c4bba → PartialWithdraw 99d3b550 → FullWithdraw 9d53d0fb.**
- Step 11 (Humid) Fund: f45304f891943e07f2df0963d6297fc8ce47b24136313e4ef4da5395606df5dc; out0 8000 explicit p2tr to tex1pmp58t42dk055m06g8npe9kgtuznp6qfv26rly5e7xlxmtt05zs3sc62wfr (different covenant from Step 6, as Step 11 warns); out1 confidential change; fee 100 (Humid-computed). User funded Humid from the faucet first (G5.-9).
- Step 11: page initially reported "No live instances" and Load the allowance seemed to load other terms; resolved after retrying (G5.-10). Humid covenant ready at depth 3, tip 2671322.
- Step 11 Humid claim (PartialWithdraw): ccdf5ac221a28f4d3ff80f67ca7c05359ebad7d81e51f9d0dd2d7739c71a827f; spends f45304f8:0, seq 3; out0 3000 covenant, out1 4937 Humid change, fee 63 (412.5 vB, 0.15 sat/vB). **HOWTO Steps 3a-11 complete.** 3000 sats remain in the Humid covenant (Step 11 asks for one claim only).
- Humid FullWithdraw (beyond Step 11): d8e4be04fc98b350537f9e2396bc87c9739635b4d88b11b00415b3ed0cbab41c, confirmed; spends ccdf5ac2:0, seq 3; out0 2958 to Humid address, fee 42 (273.5 vB). Humid covenant empty. Both Humid patch fixes confirmed. Needed two Refresh status presses first (G4.-11).
