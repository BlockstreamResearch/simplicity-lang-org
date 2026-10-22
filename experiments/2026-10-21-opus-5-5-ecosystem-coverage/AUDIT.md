# Documentation Audit Log

Schema per the test plan. `corpus` values: official | official-linked-repo | left-corpus.
The allowance draft is published at `https://docs.simplicity-lang.org/getting-started/allowance-howto/`
and is treated as **official**. Positive findings are marked `severity: Positive`.

## G1

- id: G1.-1
  topic_component: discoverability / allowance HOWTO
  doc_page_url: https://docs.simplicity-lang.org/llms.txt ; https://docs.simplicity-lang.org/
  corpus: official
  gap_friction: The allowance HOWTO, EXPLANATION and REFERENCE pages are live but are not in the site navigation, not in llms.txt, not in llms-full.txt, and not linked from the homepage, which shows the same contract as its hero example.
  expected_by_reader: From the homepage covenant, a "Run this contract end to end" link.
  attempted_resolution: grep llms.txt / llms-full.txt / homepage HTML for "allowance-howto" (0 hits); site search for "allowance" (finds all four pages).
  evidence: llms.txt lists no allowance page; search_index.json does index getting-started/allowance-howto/{,HOWTO/,EXPLANATION/,REFERENCE/}.
  severity: Major friction
  suggested_fix: Add the HOWTO to nav under Get Started and to llms.txt; add a link below the homepage covenant ("Deploy and run this covenant").
  duplicated_with: none

- id: G1.-2
  topic_component: Allowance covenant source
  doc_page_url: https://docs.simplicity-lang.org/
  corpus: official
  gap_friction: none (positive). The homepage publishes the full covenant with ten numbered annotations explaining params (`param::`), the witness, the recursive rule and the explicit-only funding rule.
  expected_by_reader: The contract, with its parameters and constraints explained.
  attempted_resolution: Read homepage index.md.
  evidence: "Fund this address only with explicit (non-confidential) outputs."; annotation 6 "`param::` values ... are compile-time parameters ... they become part of the resulting address."
  severity: Positive
  suggested_fix: none
  duplicated_with: https://github.com/BlockstreamResearch/simplicity-demo/blob/main/allowance-web/contracts/allowance.simf (identical code, different comments)

- id: G1.-3
  topic_component: Allowance covenant / explanation
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/EXPLANATION/
  corpus: official
  gap_friction: none (positive). "What the contract enforces" gives a decision flowchart and per-function explanation; "Confidential and explicit outputs" gives a per-output table. This answers every G1 sub-question in one page.
  expected_by_reader: Which values are compile-time, which are witness, what the recursive rule pins, what must be explicit.
  attempted_resolution: Read EXPLANATION.
  evidence: "Three values are fixed at compile time ... The witness is a single `SIGNATURE`"; table row "The funding output, and the continuation at index 0 | explicit".
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G1.-4
  topic_component: Allowance covenant / asset rule
  doc_page_url: https://docs.simplicity-lang.org/
  corpus: official
  gap_friction: Only the repo copy of the contract says the fee must be in the policy asset (L-BTC) and that funding the covenant with any other asset makes every partial withdrawal need a zero-value fee. The homepage and the EXPLANATION don't say it; EXPLANATION says only "Elements fee outputs always are [explicit]".
  expected_by_reader: Whether the covenant may hold a non-L-BTC asset (e.g. a stablecoin), a natural question for a finance team.
  attempted_resolution: Compared homepage source with repo contracts/allowance.simf.
  evidence: repo comment "Funding this covenant with any other asset limits every partial withdrawal to a zero-value fee output, which nodes will generally not relay."
  severity: Minor friction
  suggested_fix: Add the policy-asset constraint to EXPLANATION "enforce_single_input()" and to the homepage annotation 8.
  duplicated_with: none

- id: G1.-5
  topic_component: Allowance covenant / repo hygiene
  doc_page_url: https://github.com/BlockstreamResearch/simplicity-demo/blob/main/allowance-web/contracts/allowance.simf (linked from HOWTO "Get the files")
  corpus: official-linked-repo
  gap_friction: The repo's .simf files contain MkDocs annotation markers (`// (1)!` ... `// (6)!`) that mean nothing outside the docs site.
  expected_by_reader: Clean source.
  attempted_resolution: diff.
  evidence: line 48 `let x_asset_id: u256 = unwrap_right::<(u1, u256)>(x_asset);// (1)!`
  severity: Minor friction
  suggested_fix: Strip annotation markers from the repo copies.
  duplicated_with: homepage

## G2

- id: G2.-1
  topic_component: destination binding (commission destination)
  doc_page_url: https://docs.simplicity-lang.org/documentation/destinations/
  corpus: official
  gap_friction: none (positive). Explains that a destination is bound by comparing `output_script_hash(i)` to a SHA-256 of the scriptPubKey, gives a test vector, three ways to compute it, the byte-order trap, and that the hash does not pin the network, does not force confidential/explicit, and does not constrain other outputs or amounts.
  expected_by_reader: How to hard-code "pay this address", and what that does and doesn't guarantee.
  attempted_resolution: site search "output_script_hash", "destination".
  evidence: "A hash cannot be used to confirm that an address was a testnet one"; "Pinning a destination while leaving the amount unconstrained permits a transaction that pays the right party a single satoshi".
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G2.-2
  topic_component: adding compile-time parameters
  doc_page_url: not found (searched reference pages program, type, builtin, witness-format, toolchain)
  corpus: official
  gap_friction: No reference page defines `param::` syntax, how a parameter's type is determined, which types are allowed, or the `.args` file format. The only evidence is usage (quickstart `let x: Pubkey = param::X;`, homepage annotation 6) and one example `.args` with string values.
  expected_by_reader: "To add a u256 and a u64 parameter, write ... and supply them in .args as ..."
  attempted_resolution: site search "param::" (quickstart, destinations, EXPLANATION only), ".args" (quickstart only); grep of reference pages for "param".
  evidence: toolchain reference only has `-a, --args <ARGUMENTS_FILE>  File containing the arguments data`.
  severity: Major friction
  suggested_fix: Add a "Parameters" page to the SimplicityHL reference (declaration, typing, allowed types, `.args` JSON format with an example per type), and link it from toolchain `-a`.
  duplicated_with: none

- id: G2.-3
  topic_component: fee output vs payment output
  doc_page_url: https://docs.simplicity-lang.org/glossary/#fee ; https://docs.simplicity-lang.org/documentation/jets/
  corpus: official
  gap_friction: Decidable but only by combining pages: glossary says a fee is "paid to miners"; homepage annotation 5 says Elements has explicit fee outputs; jets `output_is_fee`. So a commission must be an ordinary output. No page says directly that a fee output has no destination and can't pay a third party.
  expected_by_reader: One sentence: "a fee output pays the block producer; to pay anyone else, use a normal output and check its scriptPubKey hash".
  attempted_resolution: site search "commission" (0), "fee output" (8 pages).
  evidence: glossary "Resources intentionally paid to miners"; Liquid's block producers are not miners (EXPLANATION: "scheduled signers").
  severity: Minor friction
  suggested_fix: Add the sentence to the jets entry for `output_is_fee` and to the destinations page.
  duplicated_with: none

- id: G2.-4
  topic_component: asset identity of the commission
  doc_page_url: https://docs.simplicity-lang.org/documentation/state/ ; .../allowance-howto/EXPLANATION/
  corpus: official
  gap_friction: Docs say to check assets (state page; `same_asset()` rationale) and that the single input is the only funding source, but nowhere state that Elements transactions must balance per asset, or that the fee must be in the policy asset. The latter appears only in the linked repo's contract comment. So "must the commission be the same asset" is answerable as "check it anyway", but why a different asset is impossible is not explained.
  expected_by_reader: Whether the commission could be in a different asset (e.g. a fee token), and whether the covenant may hold a non-L-BTC asset.
  attempted_resolution: site search "per asset" (0), "each asset" (0), "policy asset" (0), "balance".
  evidence: state page: "the contract should inspect the assets being transferred to confirm that they always of the expected kinds" (also a typo: missing "are").
  severity: Minor friction
  suggested_fix: Add a short "Assets in a transaction" note (per-asset balance, fee in policy asset) to the glossary Asset entry or the state page; fix the typo.
  duplicated_with: repo contracts/allowance.simf comment (G1.-4)

- id: G2.-5
  topic_component: explicit vs confidential commission
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/EXPLANATION/#confidential-and-explicit-outputs
  corpus: official
  gap_friction: none (positive). "The transferable rule is to ask, for each output, whether the contract reads it." The contract reads the commission amount, so it must be explicit; destinations page adds that a scriptPubKey hash check doesn't itself force either.
  expected_by_reader: A rule to apply to a new output.
  attempted_resolution: read EXPLANATION.
  evidence: as quoted.
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G2.-6
  topic_component: recursive covenant balance; full-withdrawal path
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/EXPLANATION/
  corpus: official
  gap_friction: none (positive), and important: EXPLANATION calls out that the full-withdrawal path constrains no outputs at all. Without that, an adapter would add the commission only to the partial path and the final withdrawal would escape it. The `retained >= balance - cap` explanation makes it clear how to widen the cap.
  expected_by_reader: Where the arithmetic is and what each branch enforces.
  attempted_resolution: read EXPLANATION.
  evidence: "The full-withdrawal path enforces no transaction shape at all ... the easiest to miss."
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G2.-7
  topic_component: output positions vs "randomized" output order
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/#step-7-fund-the-allowance
  corpus: official
  gap_friction: HOWTO Step 7 says "Liquid's confidential transactions randomize output order, so you should not rely on output position", while the contract (and Step 9) depend on fixed positions 0/1/2, and the quickstart reads the faucet payment as `.vout[0]`. A reader adding a commission output at a fixed index can't tell whether position is under the builder's control. (It is: ordering is a wallet-builder choice, not a consensus rule; that is not stated.)
  expected_by_reader: "Wallets may shuffle outputs of ordinary payments; a transaction spending a covenant is built with the order the covenant requires."
  attempted_resolution: site search "randomi", "output order" (HOWTO and REFERENCE only).
  evidence: HOWTO Step 7 vs. EXPLANATION "exactly 3 outputs, fee at index 2"; quickstart `jq -r '.vout[0].scriptpubkey' < input-tx.json`.
  severity: Contradiction
  suggested_fix: Reword Step 7 to attribute shuffling to the wallet that built the funding transaction; in the quickstart, select the faucet output by address instead of `vout[0]`.
  duplicated_with: https://docs.simplicity-lang.org/getting-started/allowance-howto/REFERENCE/ (same claim)

- id: G2.-8
  topic_component: jets reference hygiene
  doc_page_url: https://docs.simplicity-lang.org/documentation/jets.md ; https://docs.simplicity-lang.org/documentation/_jets/
  corpus: official
  gap_friction: (a) The published jets page source contains `<!-- Generated from /home/schoen/src/SimplicityHL/codegen/elements.json ... -->`, exposing a contributor's local path (also present in the rendered HTML source). (b) A second, longer jets page at `/documentation/_jets/` (1123 lines vs 600) is public and indexed by site search, so searches return two "Jets reference" hits.
  expected_by_reader: One jets reference.
  attempted_resolution: site search "output_is_fee" returned both.
  evidence: search hits "documentation/_jets/" and "documentation/jets/".
  severity: Duplication
  suggested_fix: Exclude `_jets.md` from the build (or from search); have the generator emit a repo-relative path.
  duplicated_with: https://docs.simplicity-lang.org/documentation/_jets/

- id: G2.-9
  topic_component: jets reference for introspection
  doc_page_url: https://docs.simplicity-lang.org/documentation/jets/
  corpus: official
  gap_friction: none (positive). Every jet the adaptation needed (`add_64`, `eq_64`, `output_amount`, `output_script_hash`, `output_is_fee`, `num_outputs`, `current_amount`) is listed with a signature and a None/overflow note.
  expected_by_reader: Exact signatures.
  attempted_resolution: grep.
  evidence: "`add_64(u64, u64) -> (bool, u64)` | Add two integers and return the carry."
  severity: Positive
  suggested_fix: none
  duplicated_with: G2.-8

## G3

- id: G3.-1
  topic_component: Simplex testing / worked example
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/#step-2-run-the-contracts-tests-on-regtest
  corpus: official + official-linked-repo
  gap_friction: none (positive). Step 2 gives exact project-setup commands, including the four fixups `simplex init` needs and the `proptest` pin; the linked `allowance_test.rs` is heavily commented and shows funding, partial/full spends, mining past a timelock, tracking UTXOs by txid, and telling a node rejection from a contract rejection. Every API call in the G3 tests was copied from it.
  expected_by_reader: A template test for this exact contract.
  attempted_resolution: followed HOWTO link to examples/allowance-simplex.
  evidence: "`BroadcastRejected` carries the node's own response body ... a failed `assert!` inside the contract would arrive as `CovenantExecution`".
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G3.-2
  topic_component: Simplex API reference
  doc_page_url: https://docs.simplicity-lang.org/documentation/simplex/
  corpus: official
  gap_friction: The Simplex page documents CLI commands and the test-function prototype only. There is no API reference (no docs.rs link) for `FinalTransaction`, `PartialOutput`, `ChangeOutput`, `Signer::broadcast` vs `finalize_strict`, error types, or the names/types Simplex generates for a contract's arguments and witness. The linked example README says so itself.
  expected_by_reader: An API reference, or at least the generated-code naming rule (file name -> module, param -> field, u256 -> type).
  attempted_resolution: site search "docs.rs" 0, "FinalTransaction" 0, "finalize_strict" 0, "sign_tx" 0, "TestContext" 1 (the prototype).
  evidence: allowance-simplex README: "the SDK's own API surface is close to undocumented".
  severity: Major friction
  suggested_fix: Link the Simplex rustdoc from the Simplex page; add a "Generated artifacts" section stating the naming and type mapping; document the error enum.
  duplicated_with: none

- id: G3.-3
  topic_component: Simplex output ordering
  doc_page_url: simplicity-demo examples/allowance-simplex README and allowance_test.rs (linked)
  corpus: official-linked-repo
  gap_friction: That Simplex appends the change output and then the fee output after listed outputs is stated only in comments in the example. This fact determined the adapted contract's output layout (commission must precede the beneficiary's change output), and a contract designer has no official page for it.
  expected_by_reader: Builder output-order rules on the Simplex page.
  attempted_resolution: read example.
  evidence: "The other two are left to Simplex, which appends the change output and then the Elements fee output ... landing them at 1 and 2."
  severity: Minor friction
  suggested_fix: Document output ordering on the Simplex page.
  duplicated_with: none

- id: G3.-4
  topic_component: Simplex asset issuance (wrong-asset test)
  doc_page_url: not found
  corpus: official
  gap_friction: No page shows how to issue an asset on regtest or attach an issuance to a covenant input in Simplex, so the "wrong asset" test (the attack `same_asset()` exists to stop) can't be written from docs.
  expected_by_reader: A recipe to create a second asset in a test.
  attempted_resolution: site search "issuance" (jets, _jets, execution-model: jet descriptions only), "issue an asset" 0, "FinalTransaction" 0; example covers policy asset only.
  evidence: no page found.
  severity: Blocker
  suggested_fix: Add a Simplex example test that issues an asset and attempts to substitute it, or add it to the allowance-simplex suite.
  duplicated_with: none

- id: G3.-5
  topic_component: allowance-simplex README accuracy
  doc_page_url: simplicity-demo examples/allowance-simplex/README.md (linked from HOWTO Step 2)
  corpus: official-linked-repo
  gap_friction: (a) It describes "four more already-written tests" as "real, passing" but they are not published anywhere a reader can get them. (b) It says the copy "strips the `// (N)!` line-annotation markers"; the copy contains them (G1.-5). (c) It refers to an "original project" inside the smplx monorepo that isn't linked.
  expected_by_reader: Either the tests, or no mention.
  attempted_resolution: searched the cloned repo.
  evidence: "Real, passing tests from the same original suite, left out of the file above".
  severity: Minor friction
  suggested_fix: Publish the four tests in an `extra_tests.rs`, or describe them only as suggested tests.
  duplicated_with: none

- id: G3.-6
  topic_component: Simplex install docs vs HOWTO
  doc_page_url: https://docs.simplicity-lang.org/documentation/simplex/ ; HOWTO Step 2 ; REFERENCE "Installing and running Simplex"
  corpus: official
  gap_friction: The Simplex page recommends only `simplexup`; the HOWTO leads with `cargo install --path smplx/crates/cli` and warns about version skew and a `proptest` pin that the Simplex page doesn't mention. A reader who arrives at the Simplex page first gets a setup that, per REFERENCE, fails with "around fifteen errors inside `smplx-test`".
  expected_by_reader: One install path, with the known pin.
  attempted_resolution: read both.
  evidence: REFERENCE: "`proptest` 1.12 breaks `smplx-test`."
  severity: Contradiction
  suggested_fix: Move the proptest pin and version-skew warning to the Simplex page; have the HOWTO link to it.
  duplicated_with: https://docs.simplicity-lang.org/getting-started/allowance-howto/REFERENCE/#installing-and-running-simplex

## G2/G3 execution results (run by the user, 2026-10-22 00:24 UTC; `logs/run-g2-g3.txt`)

Environment: cargo/rustc 1.91.1, Simplex 0.1.0 (smplx-std 0.1.1, simplicityhl 0.8.0), simc 0.8.0
(version taken from its own output), wasm-pack 0.15.0, clang 18.1.3, bun absent.

- id: G3.-7
  topic_component: Simplex setup / proptest pin
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 2) ; .../REFERENCE/#installing-and-running-simplex
  corpus: official
  gap_friction: The pin command the HOWTO requires now fails, because smplx-test 0.1.1 pins `proptest = "=1.12.0"` exactly. The build then succeeds with proptest 1.12, so the REFERENCE explanation ("`proptest` 1.12 breaks `smplx-test`") is also out of date. The step is harmless only because the script/shell keeps going; a reader running with `set -e` or stopping at the first error would be blocked by a step that is no longer needed.
  expected_by_reader: Commands that succeed against current releases.
  attempted_resolution: ran HOWTO Step 2 verbatim.
  evidence: "error: failed to select a version for the requirement `proptest = \"=1.12.0\"` / candidate versions found which didn't match: 1.11.0 / required by package `smplx-test v0.1.1`"; followed by "2 tests run: 2 passed".
  severity: Outdated
  suggested_fix: Remove the pin line, its warning box, and the REFERENCE paragraph; or state the smplx-std version range it applies to.
  duplicated_with: REFERENCE "Installing and running Simplex"

- id: G3.-8
  topic_component: HOWTO Step 2 as published
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/
  corpus: official
  gap_friction: none (positive). Apart from G3.-7, Step 2 worked verbatim on the first try: `simplex init`, the three fixups, copying the two files, `simplex build && simplex test` → "2 tests run: 2 passed" in ~22 s after a ~36 s compile.
  expected_by_reader: Copy-paste setup that works.
  attempted_resolution: n/a
  evidence: logs/run-g2-g3.txt part A.
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G3.-9
  topic_component: adapting the worked tests to a new contract
  doc_page_url: simplicity-demo allowance_test.rs (linked)
  corpus: official-linked-repo
  gap_friction: none (positive). The adapted contract compiled with simc on the first attempt, and all five adapted tests compiled and passed on the first attempt, including the four names I had marked GUESSED (generated module/type names, `[u8; 32]` for a u256 param, sha256 import path). The example was consistent enough to extrapolate from. Still, extrapolation is not documentation (G3.-2).
  expected_by_reader: n/a
  attempted_resolution: n/a
  evidence: part B "CMR: 6c2dbdfb…"; part C "5 tests run: 5 passed".
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G3.-10
  topic_component: simc version reporting
  doc_page_url: https://docs.simplicity-lang.org/documentation/toolchain/
  corpus: official
  gap_friction: `simc --version` is rejected, so a reader can't report the compiler version as the contributing guide asks; the version only appears inside compile output. simc 0.8.0 also warns "no compiler version directive at the top of the file; consider adding `simc \"0.8.0\";`", a directive no page documents (site search `simc "` 0, "version directive" 0). None of the published contracts, including the homepage covenant, carry it.
  expected_by_reader: How to check the compiler version; whether to add the directive.
  attempted_resolution: ran simc; site search.
  evidence: "simc: error: unexpected argument '--version' found"; "Warning: no compiler version directive ...".
  severity: Outdated
  suggested_fix: Document the version directive in the SimplicityHL reference (Programs) and add it to published examples; mention in the toolchain reference how to see simc's version. (Correction, later: the txmanifest book does mention the directive in passing, "The simc \"=x.y.z\"; directive inside a .simf still applies"; the docs site does not.)
  duplicated_with: none

## G5 (docs side; hands-on rows pending the user's HOWTO run)

- id: G5.-1
  topic_component: wallet names in the corpus
  doc_page_url: https://docs.simplicity-lang.org/documentation/wallet/ ; .../resources/projects/ ; allowance-howto HOWTO/REFERENCE
  corpus: official
  gap_friction: Name inventory (site search hit counts). **Humid**: 64 hits, all in the allowance draft plus one Projects row ("Humid Wallet ... Demonstration in-browser Liquid wallet"); not mentioned on the wallet-integration page or Road to Ecosystem. **"Humid Web Wallet"**: 0 hits. **LWK / LWK wasm**: wallet page (Rust, "JavaScript bindings, with a WASM compile target"; Simplicity "alpha ... behind the compile-time feature `simplicity`"), HOWTO Step 3b builds it. **WalletConnect**: wallet page and Road to Ecosystem, as "in development". **Blockstream App**: one sentence on the wallet page ("Lightly-customized versions of Blockstream Jade, the Blockstream App ... can pair with this demo"). A reader cannot tell from the wallet-integration page that Humid exists or that it is the wallet the only end-to-end walkthrough uses.
  expected_by_reader: One page naming every wallet path, its status, and which one to use for a prototype.
  attempted_resolution: site search for each name.
  evidence: as listed.
  severity: Major friction
  suggested_fix: Add a "Wallets you can use today" table to the wallet page (Humid: demo, testnet, injected provider; WalletConnect pairing: in development; Blockstream App/Jade: customized builds for the lending demo only) and link the allowance HOWTO Step 11.
  duplicated_with: none

- id: G5.-2
  topic_component: wallet connection mechanism
  doc_page_url: https://docs.simplicity-lang.org/documentation/wallet/#wallet-connection-mechanisms ; .../allowance-howto/REFERENCE/#talking-to-the-humid-wallet
  corpus: official
  gap_friction: The wallet page says the official mechanism is built on WalletConnect "including a facility for pairing an external wallet with a web application via WebSockets". The allowance REFERENCE describes Humid as an injected `window.humid` provider using six CAIP-25/27 session methods with "no pairing step". No page says how these relate (same RPC profile over a different transport? a different mechanism?), so a UI developer can't tell which one to code against.
  expected_by_reader: "Humid implements the Liquid Wallet RPC Profile (ELIP PR 36) over an injected provider; WalletConnect pairing carries the same methods over WebSockets" (if true).
  attempted_resolution: read wallet, Road to Ecosystem, REFERENCE.
  evidence: as quoted.
  severity: Contradiction
  suggested_fix: One paragraph on the wallet page reconciling the two, and naming the RPC methods common to both.
  duplicated_with: none

- id: G5.-3
  topic_component: lending demo links
  doc_page_url: https://docs.simplicity-lang.org/documentation/wallet/
  corpus: official
  gap_friction: Two different URLs are given for "the lending contract demo": demolending.distributedlab.com (LWK wasm section) and lending.dev.blockstream.com (wallet-connect section). Both respond 200; the page doesn't say whether they differ.
  expected_by_reader: One demo, or an explanation of two.
  attempted_resolution: fetched both.
  evidence: "[lending contract demo](https://demolending.distributedlab.com/)" vs "[lending contract demo](https://lending.dev.blockstream.com/)".
  severity: Minor friction
  suggested_fix: Use one link, or label each.
  duplicated_with: none

- id: G5.-4
  topic_component: ELIP references
  doc_page_url: https://docs.simplicity-lang.org/documentation/road-to-ecosystem/ ; .../allowance-howto/EXPLANATION/#the-elips-this-rests-on
  corpus: official
  gap_friction: Road to Ecosystem lists ELIP PRs 35 (Wallet ABI) and 36 (Liquid Wallet RPC Profile) and says a clear-signing profile "is expected". The allowance EXPLANATION cites PRs 36, 41 (Tx Manifest) and 40 (Simplicity Clear Signing) as existing, and doesn't mention 35. The txmanifest book cites "ELIP-205" for the version rule. Three pages, three different sets of ELIP identifiers.
  expected_by_reader: One current list of the relevant ELIPs and their status.
  attempted_resolution: site search "ELIP".
  evidence: as quoted.
  severity: Outdated
  suggested_fix: Update Road to Ecosystem with PRs 40 and 41; explain how "ELIP-205" relates to PR 41.
  duplicated_with: none

- id: G5.-5
  topic_component: Projects page description of simplicity-demo
  doc_page_url: https://docs.simplicity-lang.org/resources/projects/
  corpus: official
  gap_friction: Describes `simplicity-demo` as "Quickstart P2PK demo using Rust"; the repo now holds `allowance-web/` (the HOWTO's files) and `quickstart-cli/`.
  expected_by_reader: Accurate description.
  attempted_resolution: cloned repo.
  evidence: as quoted; repo top level `allowance-web quickstart-cli`.
  severity: Outdated
  suggested_fix: "Worked examples: the allowance covenant HOWTO and the quickstart."
  duplicated_with: none

## G6

- id: G6.-1
  topic_component: indexer pattern
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/#step-8-watch-the-allowance ; .../EXPLANATION/#what-the-examples-are-not
  corpus: official
  gap_friction: none for the algorithm (positive): Step 8 gives the whole allowance-specific indexer (two Esplora calls, `depth = tip - block_height + 1`, the balance test that picks the action), and EXPLANATION explains why neither LWK nor the wallet does this and why a product needs its own server-side indexer.
  expected_by_reader: How to find the live UTXO and decide what's withdrawable.
  attempted_resolution: site search "indexer" (lending, allowance pages only).
  evidence: "Neither the library nor the wallet provides this lookup, so the page queries the explorer itself."
  severity: Positive
  suggested_fix: none
  duplicated_with: lending-protocol "Pre-lock Transaction Discovery"

- id: G6.-2
  topic_component: indexer as a reusable pattern
  doc_page_url: https://docs.simplicity-lang.org/use-cases/lending-protocol/ ; https://docs.simplicity-lang.org/documentation/wallet/#tooling-blockchain-indexing-and-discovery
  corpus: official
  gap_friction: Indexing is documented only inside two use cases: the allowance HOWTO (address-based, because the covenant address is fixed) and the lending protocol (template matching + recompile-and-compare, because addresses aren't known in advance). The wallet page's indexing section is two sentences pointing at Esplora. No page states the general pattern (fixed address vs. discover-by-template vs. OP_RETURN tag), and none gives a server-side implementation; the only one is the 76-line `webapp/server/indexer.py` in the linked repo, which REFERENCE calls "reference only".
  expected_by_reader: A how-to "Find the live UTXOs of your contract", with the two or three patterns and their trade-offs.
  attempted_resolution: site search "indexer", "discovery", "Esplora".
  evidence: wallet page: "The main API for discovering and analyzing transactions on an Elements blockchain ... is Esplora."
  severity: Major friction
  suggested_fix: New how-to page on contract discovery, with the allowance and lending cases as worked examples.
  duplicated_with: none

## G7

- id: G7.-1
  topic_component: txmanifest version and status
  doc_page_url: https://docs.simplicity-lang.org/documentation/txmanifest/
  corpus: official
  gap_friction: The official page says the format "has not yet been frozen" but gives no version number. The book (linked) is 0.2.0 and says mismatched versions are "refused outright"; REFERENCE says Humid reads a 0.1.0 dialect and never validates the field. A reader must read three sources to learn there are two incompatible dialects in use, and which wallet takes which.
  expected_by_reader: "Current version: 0.2.0 (tx-manifest-wallet). Humid: 0.1.0 dialect; differences: ..."
  attempted_resolution: read page, book intro, REFERENCE.
  evidence: book: "This book describes manifest format 0.2.0"; REFERENCE: "`manifest_version` is read and never validated".
  severity: Major friction
  suggested_fix: State the current version and the dialect table on the txmanifest page.
  duplicated_with: REFERENCE "The two manifest dialects here"

- id: G7.-2
  topic_component: txmanifest book
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ (linked from the txmanifest page)
  corpus: official-linked-repo
  gap_friction: none (positive). Recipe-style, with a field reference and a type table. It answered: how to derive a covenant parameter from an address (`compute: {type: script_hash}`), that `address` cannot be a template field, that `required_index` is "Not enforced", how to declare the fee leg, and the asset-id byte-order trap.
  expected_by_reader: Enough to write a manifest for a new contract.
  attempted_resolution: read print view.
  evidence: "Deriving one from the other is the only way to keep that true".
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G7.-3
  topic_component: "script_hash" terminology in the txmanifest book
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/
  corpus: official-linked-repo
  gap_friction: The book uses `script_hash` for two different values: `compute.type: "script_hash"` is "sha256(scriptPubKey) of an address" (the jet value), but the `{ "script_hash": ... }` output destination embeds "a 32-byte covenant script hash ... directly as a P2TR output", i.e. an output key. The docs site's destinations page warns about exactly this collision and avoids the term. A reader who hashes a commission address and then uses the `script_hash` destination would build an output to the wrong place (the covenant would reject it, so funds are safe, but the action can't succeed).
  expected_by_reader: Distinct names, or a warning box.
  attempted_resolution: read both sections.
  evidence: as quoted; destinations page "Terminology".
  severity: Contradiction
  suggested_fix: Rename the destination key (e.g. `p2tr_key`), or add a warning; link the destinations terminology table.
  duplicated_with: none

- id: G7.-4
  topic_component: "signing stages"
  doc_page_url: not found
  corpus: official
  gap_friction: The test plan's "signing stages" has no counterpart term in the docs or the book; the closest are per-input `witnesses` with `sig_type` and the wallet `source`. Not a docs defect by itself; logged so the next evaluator doesn't search for it.
  expected_by_reader: n/a
  attempted_resolution: site search; book grep "stage".
  evidence: no page found.
  severity: Minor friction
  suggested_fix: none required
  duplicated_with: none

## G8

- id: G8.-1
  topic_component: contract / manifest registry
  doc_page_url: not found (REFERENCE "How Humid treats a manifest"; Road to Ecosystem conclusion)
  corpus: official
  gap_friction: No registry is documented. REFERENCE says Humid has "no origin binding, no hash pinning, and no registry of known protocols"; Road to Ecosystem lists "registries" among things clear signing "requires" (future). The txmanifest book's field reference mentions a "registry hash (see crate::canonical)" without explanation.
  expected_by_reader: Where to publish a manifest, or an explicit "there is no registry yet".
  attempted_resolution: site search "registry" (REFERENCE only); book grep.
  evidence: as quoted.
  severity: Product not shipped
  suggested_fix: State on the txmanifest page that no registry exists and manifests travel with the dApp request.
  duplicated_with: none

## G9

- id: G9.-1
  topic_component: audit service
  doc_page_url: not found
  corpus: official
  gap_friction: "Audit Service" has 0 hits; "audit" appears only on simplicity-compared (as a property of the language), a 2018 news post, and EXPLANATION ("The contract needs an independent security audit before real funds go behind it"). There is no Blockstream Audit Service in the corpus, not even as roadmap, so it can't be classified as product-not-shipped from docs either.
  expected_by_reader: Whether and where to get a contract audited.
  attempted_resolution: site search "audit", "Audit Service".
  evidence: no page found.
  severity: Blocker
  suggested_fix: If a service exists or is planned, add it to the roadmap; otherwise say so on the mainnet guidance.
  duplicated_with: none

## G10

- id: G10.-1
  topic_component: testnet → mainnet migration
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/EXPLANATION/#what-a-mainnet-deployment-would-require
  corpus: official
  gap_friction: Partly positive: EXPLANATION lists the mechanical swaps (chain parameter, Esplora endpoint, real LBTC asset id, address encodings), the engineering items (custody, confidential-output guardrails, fee estimation, audit, indexer) and what stays the same. Gaps: no page gives the mainnet (or testnet) L-BTC asset id or a command to fetch it (search "6f0279e9" 0, "144c6543" 0); no page states the address prefixes beyond REFERENCE's `tlq1`/`lq1` aside and the destinations examples (`tex1`/`ex1`); and the HOWTO's own advice is "do not run any of this against mainnet". The wallet used (Humid) is "not intended for real-money use", so there is no documented mainnet signing path at all.
  expected_by_reader: An ordered checklist with values.
  attempted_resolution: site search "mainnet", "asset id", "ex1", "lq1".
  evidence: EXPLANATION: "the real LBTC asset id (confirmed live from a trusted source at deploy time, since it is security-critical)".
  severity: Major friction
  suggested_fix: A short "Moving to Liquid mainnet" how-to: parameter table (network, HRPs, Esplora URLs, policy asset id with a verification command), custody options, and an explicit statement of which wallets support mainnet Simplicity today.
  duplicated_with: simplicity-demo docs-notes/mainnet-notes.md

- id: G10.-2
  topic_component: mainnet notes (long form)
  doc_page_url: simplicity-demo allowance-web/docs-notes/mainnet-notes.md (linked from EXPLANATION and HOWTO "Going further")
  corpus: official-linked-repo
  gap_friction: The long form describes a different app (the CLI-driven `webapp/`: "accepts a raw private key pasted into a web form", "the vendored `simplicity-demo` code's `address_params()`"), not the page the HOWTO uses; cites files that aren't there (`docs-notes/txmanifest-notes.md`, `logs/LOG.md`); describes the full withdrawal as a "2-output" shape though the contract constrains no outputs on that path; and contains working-notes text ("per the prompt", "a single AI-assisted read-through during a demo build", "This experiment").
  expected_by_reader: Notes about the code the HOWTO actually runs.
  attempted_resolution: read in full.
  evidence: as quoted.
  severity: Outdated
  suggested_fix: Rewrite against `examples/allowance-lwk/`, drop the working-notes phrasing and dead citations, or fold the useful parts into EXPLANATION and delete it.
  duplicated_with: EXPLANATION "What a mainnet deployment would require"

## G11

- id: G11.-1
  topic_component: Liquid testnet and mainnet
  doc_page_url: https://docs.simplicity-lang.org/ ; .../glossary/#liquid
  corpus: official
  gap_friction: none (positive): homepage "The tutorials on this site currently target Liquid testnet ...; production deployments run on Liquid mainnet"; glossary Liquid. The news post backs this, though its page dates itself February 11, 2026 under a /2025/07/31/ URL and has a one-sentence body (minor).
  expected_by_reader: Supported networks.
  attempted_resolution: read.
  evidence: as quoted.
  severity: Positive
  suggested_fix: Fix the news post date.
  duplicated_with: none

- id: G11.-2
  topic_component: Simplicity on a Bitcoin test network
  doc_page_url: https://docs.simplicity-lang.org/glossary/#signet ; https://docs.simplicity-lang.org/resources/roadmap/#mutinynet-integration
  corpus: official
  gap_friction: Glossary: "Simplicity Signet ... a public signet instance available since September 2026" (signet.simplicity-lang.org: Bitcoin Inquisition, "Simplicity active", has a faucet and explorer). Roadmap: Mutinynet integration "in progress". Neither says how they relate, and no page says which jets exist on a non-Elements chain. The allowance contract uses Elements-only constructs (`output_is_fee`, `Asset1`/`Amount1`, explicit/confidential amounts; the jets page is titled "the Elements Simplicity integration on Liquid Network"), so it almost certainly does not run unchanged on a Bitcoin signet, but no page says so.
  expected_by_reader: "Contracts using these jets are Liquid-only; on Simplicity Signet use ..."
  attempted_resolution: site search "signet" (glossary, roadmap, jets), "Bitcoin testnet" 0; fetched signet.simplicity-lang.org.
  evidence: as quoted.
  severity: Contradiction
  suggested_fix: A short page on Simplicity Signet (what it is, how to connect, which jets differ), and update the roadmap's Mutinynet entry.
  duplicated_with: none

- id: G11.-3
  topic_component: Simplicity Unchained
  doc_page_url: https://docs.simplicity-lang.org/use-cases/unchained/ ; .../resources/roadmap/#simplicity-unchained
  corpus: official
  gap_friction: The use-case page is a live, search-indexed stub containing only the heading "Simplicity Unchained". The roadmap describes it in the future tense ("will offer"). Nothing explains how a Liquid contract would map onto an oracle cosigner, or which jets apply.
  expected_by_reader: Status and whether existing contracts carry over.
  attempted_resolution: site search "Unchained" (roadmap, stub).
  evidence: use-cases/unchained.md is 23 bytes: "# Simplicity Unchained".
  severity: Product not shipped
  suggested_fix: Unpublish the stub or give it a status paragraph linking the roadmap.
  duplicated_with: roadmap

## G7 execution (tx-manifest-wallet)

- id: G7.-5
  topic_component: txmanifest version drift (current tool vs documented format)
  doc_page_url: https://docs.simplicity-lang.org/documentation/txmanifest/ (links the repo and the book)
  corpus: official + official-linked-repo
  gap_friction: The current tx-manifest-wallet release (v0.3.0, 2026-10-06) rejects every 0.2.0 manifest, including the HOWTO repo's own `examples/allowance/txmanifest.json`. The book (linked as the format documentation) describes 0.2.0; the official txmanifest page doesn't state any version; only the allowance REFERENCE warns that "a newer release may reject the `0.2.0` manifest outright". A reader who installs the latest release from the linked repo can't use any documented manifest.
  expected_by_reader: "Use tx-manifest-wallet 0.2.x with this book and these examples" on the txmanifest page, or 0.3.0 docs.
  attempted_resolution: user built v0.3.0 from source per the book; ran `validate`.
  evidence: "manifest_version \"0.2.0\" is a different format from the 0.3.0 this build implements. While the major version is 0 the minor version carries the breaking changes, so 0.1 and 0.2 are different formats rather than two revisions of one."
  severity: Blocker
  suggested_fix: Pin the tool version on the txmanifest page and in the HOWTO; update the book and the demo manifests to 0.3.0, or state which release pairs with which format.
  duplicated_with: REFERENCE "Other ways to drive the same contract"

- id: G7.-6
  topic_component: txmanifest book version claim
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ ("Check the version speaks this format")
  corpus: official-linked-repo
  gap_friction: The book says "a 0.1.x one will refuse every manifest here", but tx-manifest-wallet 0.1.3 `validate` accepted the 0.2.0 commission manifest with "✓ no issues found". Either the claim is wrong or `validate` skips the version check in 0.1.x; either way a reader on 0.1.x gets a false pass.
  expected_by_reader: A validate that fails on a version mismatch.
  attempted_resolution: user ran 0.1.3 validate.
  evidence: "OK: 0 error(s), 0 warning(s)" from tx-manifest-wallet 0.1.3.
  severity: Contradiction
  suggested_fix: Correct the book, or note that 0.1.x validate doesn't check versions.
  duplicated_with: none

- id: G7.-7
  topic_component: tx-manifest-wallet `info` wording
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ ("Creating a wallet")
  corpus: official-linked-repo
  gap_friction: `info` (0.3.0) prints a "Wallet Signing Key" and an "Oracle Public Key", then "Use ORACLE_PUBLIC_KEY in your params file." Which of the two a manifest's `{"type":"wallet","key":...}` signature source must match isn't stated where a reader would look (the book's create-wallet page mentions "oracle key" only). I used the signing key per the book's definition of `compute.wallet: "key"`.
  expected_by_reader: Which key to give a covenant as its signer.
  attempted_resolution: read info output and book.
  evidence: as quoted.
  severity: Minor friction
  suggested_fix: Explain the two keys on the book's wallet page.
  duplicated_with: none

- id: G7.-8
  topic_component: tx-manifest-wallet version string
  doc_page_url: https://github.com/stringhandler/txmanifest-wallet (linked from the txmanifest page)
  corpus: official-linked-repo
  gap_friction: Building tag `v0.2.2` produces a binary that reports `tx-manifest-wallet 0.2.1`, so a reader can't confirm from `--version` that they have the release REFERENCE describes. Both 0.2.x validate the demo and commission manifests cleanly.
  expected_by_reader: Version string matches the tag.
  attempted_resolution: user built v0.2.2 from source.
  evidence: logs/run-g7-txw-stage2a.txt "tx-manifest-wallet 0.2.1".
  severity: Minor friction
  suggested_fix: Bump the crate version with the tag.
  duplicated_with: none

- id: G7.-9
  topic_component: tx-manifest-wallet: compute script_hash and faucet (positive)
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ ; allowance-howto HOWTO Step 11 (faucet API)
  corpus: official-linked-repo
  gap_friction: none (positive). `compute: {"type": "script_hash", "address": "params.commission_address"}`, written from the book's field reference alone, resolved correctly in 0.2.2 ("COMMISSION_SCRIPT_HASH = 1ab1ba46… [script_hash of params.commission_address]"); the faucet API sent 100000 sats (txid 99a4312b9ab87fe199457cff18c3f87439ebc7b5b3e07cf4ddc8865032c7de97), visible to `sync` within 30 s.
  expected_by_reader: n/a
  attempted_resolution: n/a
  evidence: logs/run-g7-txw-stage2b.txt
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G7.-10
  topic_component: tx-manifest-wallet headless use
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/REFERENCE/#other-ways-to-drive-the-same-contract ; txmanifest book CLI reference
  corpus: official + official-linked-repo
  gap_friction: REFERENCE calls tx-manifest-wallet "the only path here that runs headless", but `run` prompts for a fee rate (and a fee review) and fails without a terminal; no flag, params key or config value for the fee rate is documented (book: "Estimate the transaction fee or prompt the user for a fee rate"). Params can be supplied non-interactively; the fee can't. So it can't be scripted in CI as described.
  expected_by_reader: A `--fee-rate` flag or a documented config default.
  attempted_resolution: ran with stdin closed; searched book for "fee rate", "fee_rate", "non-interactive".
  evidence: "Error: prompt error for fee rate: IO error: not a terminal".
  severity: Minor friction
  suggested_fix: REFERENCE: say "runs without a browser" rather than "headless", or document how to supply the fee rate.
  duplicated_with: none

- id: G7.-11
  topic_component: txmanifest book vs tool: `fee` destination
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ ("Outputs & destinations", fee)
  corpus: official-linked-repo
  gap_friction: The book documents `{ "destination": { "type": "fee" } }` as "A declaration, not an output ... Declare it when a covenant counts outputs". tx-manifest-wallet 0.2.2 (reporting 0.2.1), which the book's own version section says "speaks" 0.2.0, rejects it at output construction, after `validate` passed it. The book appears to describe a newer engine than the format version it states.
  expected_by_reader: Features in a 0.2.0 book work with 0.2.x tools, or are marked with the version that added them.
  attempted_resolution: removed the declaration; the engine appends the fee output itself.
  evidence: "Error: Output 'network_fee' has no amount_sat and is not optional." (logs/txw-partial1.txt)
  severity: Contradiction
  suggested_fix: Mark per-feature minimum versions in the book, or publish the book per release.
  duplicated_with: G7.-5

## G4 (commission contract, deployed via tx-manifest-wallet)

- id: G4.-1
  topic_component: end-to-end deployment of the adapted contract
  doc_page_url: https://docs.simplicity-lang.org/documentation/txmanifest/ → txmanifest book; allowance-howto REFERENCE "Other ways to drive the same contract"
  corpus: official + official-linked-repo
  gap_friction: none (positive). With the adapted contract (G2) and the drafted manifest (G7), tx-manifest-wallet 0.2.2 ran the full lifecycle on Liquid testnet on the first attempt per step (after G7.-11): Fund dfb366ab…, PartialWithdraw 3d6cc98e…, PartialWithdraw e469afcc…, FullWithdraw b88678e2…. The wallet's local covenant dry run passed before each broadcast. The commission destination received exactly three 1000-sat explicit outputs, verified via Esplora by the compiled-in scriptPubKey hash. No web development was needed.
  expected_by_reader: n/a
  attempted_resolution: n/a
  evidence: logs/txw-fund.txt, txw-partial1.txt, txw-partial2.txt; state.3.json; Esplora.
  severity: Positive
  suggested_fix: The allowance HOWTO could add this CLI route as an alternative to Steps 3-11 for readers who want to deploy without building wasm or an extension; it needs only a prebuilt binary (if the version pin of G7.-5 is fixed).
  duplicated_with: none

- id: G4.-2
  topic_component: tx-manifest-wallet stale state
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ (implementer guide: "Validate each provided_inputs UTXO against chain state: confirm it is unspent")
  corpus: official-linked-repo
  gap_friction: Re-running a withdrawal with an already-spent `--state` file isn't caught before broadcast: the tool builds, dry-runs and signs, then the node refuses `bad-txns-inputs-missingorspent`. The book's implementer guide says a wallet should confirm the UTXO is unspent first; the reference wallet doesn't. (The exit status in this case is G4.-4.)
  expected_by_reader: A pre-broadcast "already spent" error.
  attempted_resolution: user re-ran the final step by accident.
  evidence: "[error] Broadcast failed: HTTP 400: sendrawtransaction RPC error -25: bad-txns-inputs-missingorspent" followed by "exit final: 0".
  severity: Minor friction
  suggested_fix: Tool fix; in the book, note that `--state` files go stale after a successful spend.
  duplicated_with: none

- id: G4.-3
  topic_component: Esplora scripthash = jet value (positive)
  doc_page_url: https://docs.simplicity-lang.org/documentation/destinations/#checking-a-hash-against-the-chain
  corpus: official
  gap_friction: none (positive). Querying `/scripthash/<COMMISSION_SCRIPT_HASH>/utxo` returned the commission payments, confirming the page's statement that Esplora's `scripthash` is the unreversed jet value.
  expected_by_reader: n/a
  attempted_resolution: n/a
  evidence: three UTXOs returned.
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G4.-4
  topic_component: tx-manifest-wallet exit status
  doc_page_url: https://stringhandler.github.io/tx_manifest_book/ (CLI reference) ; allowance-howto REFERENCE "Other ways to drive the same contract"
  corpus: official-linked-repo
  gap_friction: `run` exits 0 when broadcasting fails. Build-time failures do exit non-zero (fee prompt without a TTY: exit 1; undeclared fee output: exit 1), but a node rejection at the broadcast step prints `[error] Broadcast failed: ...` and exits 0. Neither the book's CLI reference nor REFERENCE documents exit codes. This matters because REFERENCE positions the tool as the scriptable path and its own `webapp/` drives it from a backend: any caller checking `$?`, and any CI job, records a failed spend as a success. The only reliable signals today are scraping the output for "Broadcast txid:" or checking the chain.
  expected_by_reader: Non-zero exit on any failure to complete the requested action, including broadcast rejection; documented exit codes (e.g. 0 broadcast, 1 build/validation error, 2 broadcast rejected, 3 user declined).
  attempted_resolution: compared exit statuses across runs.
  evidence: logs/txw-final.txt "[error] Broadcast failed: HTTP 400: sendrawtransaction RPC error -25: bad-txns-inputs-missingorspent" then "exit final: 0"; logs/run-g7-txw-stage2b.txt "exit Fund dry run: 1"; "exit partial1: 1" from partial1 attempt 1 (seen in this session; that log was later overwritten by the successful attempt 2).
  severity: Major friction
  suggested_fix: Tool: return non-zero when broadcast fails. Book CLI reference: document exit codes, including what declining the broadcast prompt returns. Until fixed, REFERENCE should tell scripted callers to confirm the txid on chain.
  duplicated_with: none

- id: G5.-6
  topic_component: Humid installation alongside earlier copies
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 3d)
  corpus: official
  gap_friction: Step 3d says to "Load unpacked" `$GUIDE/humid/dist` but doesn't consider a reader who already has another Humid build loaded, which is likely for anyone who has tried another Humid-based tutorial or rebuilt from a different checkout (the user reports several in two weeks). Chrome treats each unpacked directory as a separate extension with separate storage, so two enabled copies may both inject `window.humid`; which one the page reaches is unclear, and the symptoms (a different key in Step 11, an unexpected balance, a missing `processConfidentialTransaction` grant) would look like HOWTO defects. Removing an old copy deletes its wallet storage, including the encrypted seed, so "delete the old ones" is unsafe generic advice. Proposed rather than observed: raised before the user ran Step 3d.
  expected_by_reader: "If you have another Humid loaded, disable it first."
  attempted_resolution: n/a (preventive)
  evidence: Step 3d text; REFERENCE "The injected provider is `window.humid`".
  severity: Minor friction
  suggested_fix: Add to Step 3d: "If another copy of Humid is already loaded, turn it off on its card in `chrome://extensions` before loading this one. Only one copy should be enabled while you follow this guide. Removing a copy deletes its wallet, so don't remove one that holds funds you haven't backed up."
  duplicated_with: none

- id: G4.-5
  topic_component: fixed local port (8099) and per-origin state
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 4; also Steps 5 and 11)
  corpus: official
  gap_friction: Step 4 hard-codes `python3 -m http.server 8099 &`. Running two tests in parallel (several agents; or a person's manual run beside an agent's) is common, and the failure is quiet: the backgrounded server prints `OSError: [Errno 98] Address already in use` once and exits, and `http://localhost:8099/` keeps working because the *other* test's server answers it, so the reader may follow the guide against a different checkout, `vendor/` build or contract without any sign of it. Separately, the page stores its wallet mnemonic and the beneficiary key in `localStorage`, and Humid grants connection per origin; both are keyed to `http://localhost:8099`, so every run that ever used that port shares one page wallet and one beneficiary key, even sequentially, and Step 5's "Clearing this site's data leaves any allowance made out to it permanently unclaimable" applies across all of them. Proposed from the user's parallel-test setup; not yet observed in this run.
  expected_by_reader: A port choice, a check that the server really started, and a note that the origin carries the wallet.
  attempted_resolution: n/a (preventive)
  evidence: Step 4 command; Step 4 "The mnemonic will be stored in `localStorage` in plaintext"; Step 5 warning; REFERENCE "Sessions and prompts".
  severity: Minor friction
  suggested_fix: In Step 4, set the port once and check it: `PORT=8099; python3 -m http.server "$PORT" &` then "If you see `Address already in use`, pick another port and open that one instead." Add one sentence: "The page's wallet and key belong to this exact address, port included; another port starts with an empty wallet, and the same port reuses one."
  duplicated_with: none

- id: G5.-7
  topic_component: Humid wallet creation (seed phrase backup)
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 3d)
  corpus: official
  gap_friction: Partly positive. Humid's setup window closes whenever the browser loses focus, so the seed phrase can't be copied into another application as Humid's own UI suggests (known; reported upstream by the user). Step 3d anticipates this ("you may need to write the seed phrase on paper instead of copying it into another software application"), which is the working route. The wording ("Due to interactions with other browser UI features") doesn't say *why*, so a reader whose window vanishes may think setup failed.
  expected_by_reader: "Humid's setup window closes if you switch to another window; write the phrase on paper before leaving it."
  attempted_resolution: user's prior experience.
  evidence: Step 3d text; user report.
  severity: Minor friction
  suggested_fix: Name the behavior in Step 3d and link the upstream issue.
  duplicated_with: none

- id: G4.-6
  topic_component: Step 4 expected output vs page text
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 4)
  corpus: official
  gap_friction: Step 4 says "You should see the Library row report that `vendor/lwk_wasm.js` loaded, and that the build has the Simplicity feature compiled in." The page prints neither phrase: its status box reads "Loaded. / network: Liquid testnet / policy asset: … / Simplicity API: present", and the activity log reads "library loaded, network Liquid testnet". The user (experienced with this page) looked at the log line, couldn't match it to the HOWTO, and then confirmed `Simplicity API: present` was shown once told the phrase: "I wasn't aware I should be looking for that specific phrase."
  expected_by_reader: The exact text to look for, and where.
  attempted_resolution: read examples/allowance-lwk/index.html lines 548-576.
  evidence: as quoted.
  severity: Minor friction
  suggested_fix: "You should see `Simplicity API: present` in the library box. If the build lacks the feature, the page stops with `This build is missing: SimplicityProgram, …`."
  duplicated_with: none

- id: G4.-7
  topic_component: published HOWTO vs repo page (Waterfalls)
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/REFERENCE/#chain-access
  corpus: official + official-linked-repo
  gap_friction: The page in the repo the HOWTO clones syncs its wallet through Waterfalls (`waterfalls.liquidwebwallet.org`, commit 28cee53 "Update web app to use Waterfalls API"), but the published REFERENCE doesn't mention Waterfalls at all (site search "Waterfalls": 0). A newer, unpublished revision of REFERENCE does. A reader debugging sync, CORS or privacy ("The Waterfalls operator learns the wallet's addresses") has no published explanation of the third endpoint the page contacts.
  expected_by_reader: Every endpoint the page contacts, listed.
  attempted_resolution: diff of published vs local draft; repo log.
  evidence: index.html `WATERFALLS` constant; published REFERENCE "Chain access" lists Esplora and the faucet only.
  severity: Outdated
  suggested_fix: Publish the current REFERENCE revision.
  duplicated_with: none

- id: G4.-8
  topic_component: page auto-refresh lag (Step 9)
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 9)
  corpus: official + official-linked-repo
  gap_friction: The page did switch to Claim by itself, but a minute or two after the chain showed the instance claimable (depth 3 at tip 2671306). An experienced user concluded polling was broken (suspecting the Waterfalls change) before it updated. The lag is by design: with one block left `pollDelayMs()` schedules the next check about 60 s out, so the button can trail the chain by roughly a minute. Step 9 says the page refreshes "about once a minute" but doesn't say the button may lag the countdown. (The Waterfalls commit 28cee53 doesn't touch the status poll.)
  expected_by_reader: To know how long to wait before pressing Refresh status.
  attempted_resolution: read index.html `pollDelayMs`/`schedulePoll` and the 28cee53 diff; compared with an independent chain check.
  evidence: user: "Oh, it did auto-refresh after all. I was just too eager!"
  severity: Minor friction
  suggested_fix: Step 9: "The button can lag the countdown by about a minute; press Refresh status if you don't want to wait." Optionally show "next refresh in N s" in the status box.
  duplicated_with: none

- id: G4.-9
  topic_component: page's fixed withdrawal fee
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Steps 6, 9)
  corpus: official + official-linked-repo
  gap_friction: The page pays a hard-coded 500-sat fee on every withdrawal (`WITHDRAW_FEE_SATS = 500n`, "deliberately generous"), which on this 412.5-vbyte claim is 1.21 sat/vB, about 12x the 0.1 sat/vB default tx-manifest-wallet offers (that rate would have cost about 42 sats here); Humid's own claim of the same size in Step 11 (ccdf5ac2…) paid 63 sats (0.15 sat/vB). The page states it in its facts panel and guards funding below it, but the HOWTO doesn't mention it: Step 6 suggests no minimum for "Withdrawable per period", and Step 9 shows "output 2 as the fee" without an amount. With small test values the fee is a large share (here 500 of 5000 per withdrawal), and an `ALLOWANCE_AMOUNT` at or below 500 can't be withdrawn from the page. EXPLANATION's mainnet section already flags "Fee estimation has to work rather than falling back to a hardcoded testnet rate".
  expected_by_reader: In Step 6, "keep Withdrawable per period well above 500 sats: the page pays a fixed 500-sat fee per withdrawal out of the allowance".
  attempted_resolution: chain check of 99d3b550… (fee 500); index.html lines 417-420, 1080-1086.
  evidence: tx 99d3b5506dbb0ae1e7da0af324a971e7f37c5eac638fd56eb08b7d2bbfb7643b outputs 3000 / 4500 / fee 500.
  severity: Minor friction
  suggested_fix: One sentence in Step 6 (as above); optionally compute the fee from size.
  duplicated_with: none

- id: G4.-10
  topic_component: page stops polling after a claim (Step 10 sequence never appears)
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 10: "the instance you just spent shows **Spent**, and the new one holding the remainder appears as **Unconfirmed**, then **Timelocked**, then **Claim**")
  corpus: official + official-linked-repo
  gap_friction: Observed: after the first PartialWithdraw (99d3b550…), the page kept showing a greyed-out "Spent" row and never showed the continuation instance, although the chain had it confirmed and claimable for 6+ blocks (unspent, nothing in mempool, both liquid.network and blockstream.info agree). Cause, from examples/allowance-lwk/index.html: after a broadcast the page adds the outpoint to `spentPending` and refreshes once; if Esplora still lists the spent UTXO at that moment (the code's comment says it does "for a while"), the list holds only that row. `pollDelayMs()` counts only unconfirmed or not-yet-ready instances and ignores `spentPending`, so it returns 0 and `schedulePoll()` stops ("nothing pending"). The continuation is never fetched. It's a race, so it won't happen every time. Not related to the Waterfalls change (claim and status paths don't use `scanClient`). The user first suspected polling generally (G4.-8), then Waterfalls.
  expected_by_reader: Step 10's sequence, without manual refreshes.
  attempted_resolution: chain checks (utxo, mempool, outspend) on both Esplora instances; read `pollDelayMs`, `schedulePoll`, `doClaim` finally block, `loadInstances`, `renderInstances`.
  evidence: user: "It is a greyed-out Spent right now" ... "it has been stuck on Spent since the *first* claim" ... "It's not that I tried to send a final claim at all"; outspend of 99d3b550…:0 `{"spent":false}`; mempool `[]`. Confirmed: the stuck row is the first claim's spent outpoint, and no poll ran after that claim. One press of Refresh status then listed the continuation with Claim ("Refresh status did exactly the right thing"), confirming that only the poll scheduling stopped.
  severity: Major friction
  suggested_fix: Page: in `pollDelayMs()`, return 60000 while any listed instance is in `spentPending` (a spend is in flight and its continuation is expected). HOWTO Step 10, until fixed: "If the spent row stays and no new instance appears after a couple of minutes, press Refresh status."
  duplicated_with: G4.-8 (earlier lag observation)

- id: G5.-8
  topic_component: page UI in Humid mode
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 11) ; simplicity-demo examples/allowance-lwk/index.html
  corpus: official + official-linked-repo
  gap_friction: After switching "Who signs" to Humid extension, the page keeps showing the page wallet's mnemonic and related controls, with a note that they aren't used in this mode. Two signers' worth of UI on screen at once makes it unclear which key and balance a Humid-mode action will use, which is exactly the distinction Step 11's warning ("This creates a second, separate allowance") depends on. Long-standing per the user.
  expected_by_reader: Only the controls that apply to the selected signer.
  attempted_resolution: user observation in Step 11.
  evidence: user: "the unused mnemonic continues to be visible (alongside text saying it's not used)".
  severity: Minor friction
  suggested_fix: Page: hide (not just annotate) the page-wallet mnemonic, balance and key controls while Humid mode is selected; restore them when switching back.
  duplicated_with: none

- id: G5.-9
  topic_component: stale status after switching signer; Humid funding prompt
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 11) ; simplicity-demo examples/allowance-lwk/index.html
  corpus: official + official-linked-repo
  gap_friction: After switching "Who signs" to Humid extension, output from the page-wallet run (including the faucet "funds received" result) stayed on screen. The user, experienced with this page, read it as the Humid wallet already being funded, which it wasn't. The page didn't prompt to fund Humid; the HOWTO does say so in Step 11 ("Humid funds from its own balance, so send testnet coins to the receive address in the extension rather than to the page's wallet"), but the page's stale status contradicted it. Recoverable (Humid would refuse with a shortfall, per Step 11), but misleading at the moment it matters.
  expected_by_reader: Switching signer clears results that belong to the other signer, and the page says "Fund Humid's own receive address before Fund" with the faucet link.
  attempted_resolution: user funded Humid from the faucet manually.
  evidence: user: "details related to the prior test (including 'faucet funds received' or similar) were *still displayed* after switching to Humid, which caused me to assume that we had already funded the Humid wallet".
  severity: Minor friction
  suggested_fix: Page: on signer switch, clear the wallet, faucet, funding and claim output boxes (in addition to G5.-8's hiding), and show a Humid-mode funding prompt. HOWTO Step 11: move "send testnet coins to the receive address in the extension" ahead of the key step as its own instruction.
  duplicated_with: G5.-8 (same switch, different symptom)

- id: G5.-10
  topic_component: loading the Humid-mode allowance on the beneficiary side
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 11) ; simplicity-demo examples/allowance-lwk/index.html ("Load the allowance")
  corpus: official + official-linked-repo
  gap_friction: Observed in Step 11: the status first reported "No live instances", and "Load the allowance" appeared to load terms other than the blob just copied (user unsure of the details); it worked after some retrying. Cause undetermined. Plausible, from the code: the page restores the last terms from `localStorage` on load (`restoreParams()`), and the beneficiary-tab fields "are shared with the benefactor tab", so terms from the Step 6 page-wallet allowance (whose address was by then empty) could still be in effect after switching to Humid; or the status query ran before the unconfirmed funding transaction was indexed. Step 11 says "repeat Steps 6 and 7" but doesn't say to re-load the new blob on the beneficiary side, or that the old allowance's terms may still be loaded.
  expected_by_reader: An explicit Step 11 instruction to load the Humid-mode blob, and a page that shows which allowance (address) is loaded.
  attempted_resolution: user retried; read `restoreParams()` and the Load section.
  evidence: user: "It said 'no live instances' at first and then it also seemed to have trouble with the 'Load the allowance' (the details it loaded were seemingly not the same as the ones that I had copied to the clipboard... I don't remember for sure). At some point it worked, though."
  severity: Minor friction
  suggested_fix: Page: display the loaded covenant address prominently on the beneficiary tab and clear loaded terms on signer switch (with G5.-9). Step 11: add "On the beneficiary tab, load the new blob; the address should be the one Humid just funded, not Step 6's."
  duplicated_with: G5.-9

## G5 (Step 11, Humid)

- id: G5.-11
  topic_component: covenant spend through the Humid wallet (positive)
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Steps 3c, 3d, 11)
  corpus: official + official-linked-repo
  gap_friction: none (positive). With Humid built from source and the HOWTO's patch applied (Step 3c, verbatim), the page handed the contract to Humid as a manifest; Humid funded a separate covenant (f45304f8…, 8000 explicit to tex1pmp58…, a different address from Step 6 as the HOWTO warns), then built, showed its own confirmation for, signed and broadcast a PartialWithdraw (ccdf5ac2…: 3000 back to the covenant, 4937 to Humid's change address, fee 63, sequence 3). Beyond what Step 11 asks, a Humid FullWithdraw of the remaining 3000 (d8e4be04…: 2958 to Humid's address, fee 42, no continuation; covenant left empty) confirmed the patch's second fix (the change-only-output bug) as well as the first (relative timelock). This is the documented wallet-signing path working end to end on testnet, both actions. Friction on the way is logged separately (G5.-6 to G5.-10).
  expected_by_reader: n/a
  attempted_resolution: n/a
  evidence: chain: f45304f891943e07f2df0963d6297fc8ce47b24136313e4ef4da5395606df5dc, ccdf5ac221a28f4d3ff80f67ca7c05359ebad7d81e51f9d0dd2d7739c71a827f, d8e4be04fc98b350537f9e2396bc87c9739635b4d88b11b00415b3ed0cbab41c.
  severity: Positive
  suggested_fix: none
  duplicated_with: none

- id: G4.-11
  topic_component: manual refresh can still show a stale timelock state
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Steps 9, 11) ; simplicity-demo examples/allowance-lwk/index.html
  corpus: official + official-linked-repo
  gap_friction: Observed in Step 11 (Humid FullWithdraw, instance ready on chain at depth 3): the first press of Refresh status didn't show Claim; a second press did. Likely cause from the code: `cachedTipHeight()` reuses the tip for 30 s (`TIP_CACHE_MS = 30000`), so a refresh within 30 s of an earlier one computes depth from a stale tip and shows the instance a block short (Timelocked) even though the UTXO list is fresh. Alternative: the 5 s manual-refresh guard ("Just checked..."). Not yet distinguished.
  expected_by_reader: A manual refresh reflects the current chain.
  attempted_resolution: read `cachedTipHeight`, `MANUAL_REFRESH_MIN_MS`.
  evidence: user: "Refresh status did not make the Claim button appear (but doing it a second time then did)".
  severity: Minor friction
  suggested_fix: Page: bypass the tip cache on a manual refresh. HOWTO: none needed once fixed.
  duplicated_with: G4.-10

- id: G5.-12
  topic_component: Step 11 exercises only one Humid withdrawal path
  doc_page_url: https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/ (Step 11) ; .../REFERENCE/#errors-and-what-causes-them
  corpus: official
  gap_friction: Step 11 says "claim once through Humid". The Step 3c patch fixes two separate Humid bugs (REFERENCE error table): `unimplemented-construct` on any withdrawal, and `"FullWithdraw" pays nothing, so there is nothing to build.`, which only a FullWithdraw triggers. Which one a single claim exercises depends on whether the reader funded above or at/below `ALLOWANCE_AMOUNT`; readers who reuse their Step 6 terms (as in this run) fund above it, get a PartialWithdraw, and never check the FullWithdraw fix. In this run a second, unprompted Humid claim (d8e4be04…) confirmed the FullWithdraw fix works.
  expected_by_reader: A Step 11 that covers both withdrawal actions through the wallet.
  attempted_resolution: ran the extra FullWithdraw.
  evidence: Step 11 "claim once through Humid as in Step 9"; REFERENCE error table rows 1-2.
  severity: Minor friction
  suggested_fix: Step 11: "Claim until the allowance closes: the first claim is a PartialWithdraw and the last a FullWithdraw, and each exercises a different fix in the patch from 3c." Or, for a shorter run: "Fund at or below ALLOWANCE_AMOUNT and the one claim is a FullWithdraw; fund above it to see a PartialWithdraw."
  duplicated_with: none

- id: G5.-13
  topic_component: LWK wasm JavaScript API reference
  doc_page_url: https://docs.simplicity-lang.org/documentation/wallet/#lwk ; .../allowance-howto/HOWTO/ (Steps 3b, 6, 7)
  corpus: official
  gap_friction: No page documents LWK's wasm JavaScript API for Simplicity, and none links generated docs. The wallet page says only that LWK "can generate native apps or provide JavaScript bindings, with a WASM compile target". The HOWTO shows five calls in collapsed snippets (`SimplicityArguments`, `SimplicityTypedValue`, `SimplicityProgram.load`, `createP2trAddress`, `TxBuilder`); the page that the HOWTO runs uses about 25, documented only by its own source comments and by `examples/allowance-lwk/README.md`'s ownership rules ("consumed `TxOut` arrays, builders that move on every call, and two `Address` constructors that are not interchangeable"). Anyone adapting the page (e.g. to add the commission output, `artifacts/commission-on-page.md`) has to learn the API from that source. Counterpart to G3.-2 (Simplex).
  expected_by_reader: An API reference (the build already emits `lwk_wasm.d.ts`, which a generator such as TypeDoc can render) plus a short page on the ownership rules and the subset needed for covenants.
  attempted_resolution: site search "SimplicityProgram" (HOWTO only), "SimplicityArguments" (HOWTO), "PsetBuilder" 0, "EsploraClient" 0, "TxBuilder" (HOWTO), "Wollet" (HOWTO), "wasm-bindgen" 0, "lwk_wasm.d.ts" (HOWTO, as a grep target), "JavaScript bindings" (wallet page, one sentence).
  evidence: as listed.
  severity: Major friction
  suggested_fix: Publish generated reference from `lwk_wasm.d.ts` and link it from the wallet page; add a "covenant calls in LWK wasm" page drawn from the HOWTO page, with the ownership rules from its README.
  duplicated_with: none

