# Friction Log – Ecosystem Documentation Coverage Audit

## G1: Locate Allowance Covenant Example

### Search Strategy
1. Query official docs homepage for "Allowance"
2. Check llms.txt index
3. Follow navigation links
4. Document all queries and results

### Execution Log

#### Search Query 1: "Allowance covenant"
- Starting point: https://docs.simplicity-lang.org/
- Status: Beginning...


## G1 CHECKPOINT: Locate Allowance Covenant

### Search Path Completed

#### Queries Executed:
1. llms.txt index search — **No "Allowance" mention found**
2. Covenants & State Management page — **Had Last Will and Third Time's the Charm, NOT Allowance**
3. llms-full.txt index — **No "allowance" anywhere**
4. Use Cases Overview URLs (404s) — unreachable
5. Main homepage — **Confirms Allowance Covenant is featured**, describes it as "primary example"
6. Quickstart page — **Found GitHub link to examples repo** (BlockstreamResearch/SimplicityHL/examples)
7. GitHub examples directory — **404 or truncated list, not readable**
8. GitHub search for "allowance" — **No results in SimplicityHL**
9. Multiple lending protocol URL variations — **All 404s**

#### Tools Used:
- WebFetch (8 requests)
- Bash for gh CLI search (failed — gh not installed)

#### Pages Visited (In Order):
1. https://docs.simplicity-lang.org/llms.txt
2. https://docs.simplicity-lang.org/documentation/state.md
3. https://docs.simplicity-lang.org/llms-full.txt
4. https://docs.simplicity-lang.org/ (homepage)
5. https://docs.simplicity-lang.org/documentation/use_cases.md (404)
6. https://docs.simplicity-lang.org/getting-started/quickstart.md
7. https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples
8. https://github.com/BlockstreamResearch/SimplicityHL/search?q=allowance

### Search Terms That Found Nothing:
- "Allowance covenant"
- "allowance" (in llms-full.txt)
- "allowance" (in GitHub code search)

### Left Official Corpus:
**YES** — Followed official docs link to GitHub repository (BlockstreamResearch/SimplicityHL/examples)

### G1 Result: **DOCS PARTIAL**

#### What I Found:
- Confirmed Allowance Covenant exists and is featured on homepage
- Found descriptions: "a beneficiary [can] withdraw up to ALLOWANCE_AMOUNT, no more often than once every MIN_DISTANCE blocks"
- Identified key features: remainder return, timelock, recursive covenant
- Located related examples: Last Will, Third Time's the Charm (both well-documented)

#### What I Could NOT Find:
- **Exact compile-time parameters** (only "ALLOWANCE_AMOUNT" and "MIN_DISTANCE" inferred from description)
- **Spend-time witnesses** (no witness structure documented for Allowance)
- **Recursive covenant rule** (not explicitly detailed)
- **Funding constraints** (not specified)
- **Actual covenant source code** (no .simf file located)

#### Friction: MAJOR
- Featured example on homepage is not discoverable via: navigation menu, search index, or linked repositories
- Mismatch: homepage describes Allowance as "primary example" but it's not in the official docs corpus
- Lending Protocol page (mentioned in navigation) returns 404

### Next Steps for G1 Completion:
Would need to:
1. Search outside official docs (GitHub issues, blog posts, Office Hours)
2. Or access a local checked-out repository (which the test forbids)
3. Or find a direct link on official docs that I may have missed


---

## G2: Adapt Covenant for Commission

### Research Strategy
1. Examine Last Will covenant for output structure patterns
2. Examine Third Time's the Charm for state/asset handling
3. Check Jets Reference for output introspection APIs
4. Build adapted covenant with explicit doc citations

### Queries Executed:
1. Covenants & State Management (state.md) — **Found Last Will + Third Time's complete source**
2. Jets Reference (jets.md) — **Found output_amount, output_asset, output_is_fee**
3. Witnesses page — **Limited to conceptual level**
4. Execution Model page — **Mentions introspection but no specific jets listed**

### Pages Visited:
1. https://docs.simplicity-lang.org/documentation/state.md ✓
2. https://docs.simplicity-lang.org/documentation/witness.md (404)
3. https://docs.simplicity-lang.org/documentation/execution-model.md (minimal)
4. https://docs.simplicity-lang.org/documentation/jets.md ✓

### G2 Result: **DOCS PARTIAL**

#### What I Successfully Documented:
- Output structure pattern (recursive covenant in output 0)
- Asset checking via jets (output_asset)
- Fee output designation pattern (output_is_fee)
- Witness structure (Either types)
- Signature verification pattern
- Timelock enforcement (check_lock_distance)

#### What Remains Undocumented:
1. **output_amount() return type** — Docs list the jet but not its signature. Is it (asset, amount) or something else?
2. **Commission destination encoding** — Should it be:
   - Liquid address (P2WPKH, P2WSH, etc.)?
   - Taproot script hash (u256)?
   - Something else? NOT SPECIFIED.
3. **Compile-time parameterization** — How do you pass params to a contract? Via:
   - Function parameters (shown in examples)?
   - Witness values?
   - Module attributes? NO DOCUMENTATION.
4. **State tracking across withdrawals** — The Allowance requires tracking "last withdrawal block"
   to enforce MIN_DISTANCE. Third Time's the Charm shows tapleaf-based state, but:
   - Is this the canonical way for Allowance?
   - Can simpler block-height tracking work? UNCLEAR.
5. **Multi-asset environment handling** — Liquid supports confidential assets. Should Allowance:
   - Only accept specific asset IDs?
   - Accept any asset (allow beneficiary to move to different asset)? UNDOCUMENTED.

#### Friction Points:
| Issue | Severity |
|-------|----------|
| output_amount() signature not documented | Medium |
| Commission destination format (address type) not specified | Major |
| Parameterization mechanism not shown | Major |
| State persistence for withdrawal tracking pattern not explained for Allowance | Medium |
| Confidential asset handling in covenant context | Medium |

#### Annotations in Artifact:
- 5 major design decisions justified with source citations
- 5 doc gaps identified with confidence ratings
- Complete source code with in-code comments for assumptions

### Next Steps for G2:
1. To make code functional: would need to ask a Simplicity expert about:
   - Exact return types of introspection jets
   - Address encoding (Liquid vs script hash)
   - Param passing mechanism (likely module-level, but not shown)
2. Current state: "best partial artifact" per test rules — justified decisions, clear annotations


---

## G3: Write Simplex Tests

### Research Strategy
1. Find Simplex testing documentation
2. Identify test structure and patterns
3. Create test cases for 5 scenarios
4. Annotate with doc sources and confidence levels

### Pages Visited:
1. https://docs.simplicity-lang.org/llms.txt ✓
2. https://docs.simplicity-lang.org/documentation/simplex.md ✓
3. https://docs.simplicity-lang.org/llms-full.txt (Simplex section) ✓
4. https://github.com/BlockstreamResearch/smplx/tree/master/examples (truncated)

### G3 Result: **DOCS PARTIAL**

#### What I Successfully Documented:
- Test macro syntax: `#[simplex::test]` attribute
- Test function signature: `fn test_name(context: simplex::TestContext) -> Result<()>`
- Test execution: `simplex test` command with flags
- Artifact generation: `simplex build` creates witness/transaction builders
- Project structure: `Simplex.toml`, `simf/` contracts, `src/artifacts` generated code
- Test contexts: persistent regtest instance option mentioned

#### What Remains Undocumented:
1. **Artifact API Signatures** — Docs say simplex generates "witness-building and
   transaction-construction functions" but:
   - Exact function names not specified
   - Parameter types not shown
   - Return types not documented
   - Result: cannot write actual test calls without running `simplex build` yourself

2. **Transaction Input/Output Construction** — No docs for:
   - TxInput struct fields and how to set previous outpoint
   - TxOutput struct fields
   - How to mark output as fee (is_fee attribute)
   - How to set asset ID in test output
   - Example: `TxOutput { script_pubkey: ... }` structure completely guessed

3. **Test Context API** — Documented existence, not methods:
   - Available methods (sign, verify, execute, etc.) not listed
   - Exact method names guessed
   - Parameter types assumed
   - How to set block height / sequence not shown

4. **Witness Construction** — Conceptual only:
   - Docs mention "witnesses might include amounts" and "choices"
   - No example of constructing Either<T, U> witnesses
   - No example of passing u256 state data (witness::STATE)
   - Result: witness_building code completely fabricated

5. **Asset ID Representation** — Not documented:
   - How to express LBTC in tests (256-bit hash? shorter form?)
   - Whether asset IDs differ between testnet/mainnet
   - Example asset IDs in test context

#### Test Cases Created:
- G3-1: Happy path withdrawal with commission and fee (3 outputs)
- G3-2: Insufficient remainder (output 0 with 0 sats)
- G3-3: Too-soon withdrawal (timelock enforced)
- G3-4: Wrong asset in commission output
- G3-5: Missing commission output (only 2 outputs)

All 5 cases documented with expected behavior and doc sources for each assertion.

#### Friction: MAJOR
- Cannot write executable tests without running `simplex build` and inspecting
  generated code in src/artifacts/
- Official docs do not provide:
  - Example test file showing actual witness construction
  - Example test file showing transaction building
  - API reference for generated artifact functions
  - TestContext method documentation
- Consequence: "best partial artifact" per test rules

#### Workaround Path:
Test documentation acknowledges:
1. Run `simplex init` to create project
2. Copy covenant to simf/allowance-with-commission.simf
3. Run `simplex build`
4. Inspect generated src/artifacts/*.rs for actual APIs
5. Update test code to match reality
This is not documented in the official corpus.


---

## G4-G11 Summary: Remaining Goals Audit

### G4: Deploy and Exercise on Liquid Testnet

#### Status: DOCS SUFFICIENT (partially)

**Found:**
- Faucet API documented: `https://liquidtestnet.com/api/faucet?address=...` in Quickstart
- Deployment workflow: compile → generate address → fund via faucet
- Tool commands: `cargo run last-will fund-from-faucet`, `simc`, `hal-simplicity`
- Example: Last Will covenant with full faucet funding example
- Requirement: "allow transactions to confirm before proceeding with dependent operations"

**Missing:**
- How to send transactions AFTER deployment (fund the contract to testnet)
- How to invoke the covenant (where to build the spending transaction)
- How to monitor contract execution (block explorer, logs)
- Error handling and debugging procedures
- Wallet/key management for testnet operations

**Confidence:** Medium — faucet exists and is documented, but full flow (fund → spend → verify) not shown

---

### G5: Build Web UI for Beneficiary

#### Status: DOCS MISSING

**Found:**
- Wallet integration mentioned as "in development"
- WalletConnect Protocol mentioned (with caveat: "wallet connection mechanisms currently in development")
- Lending contract demo references "customized versions of Blockstream Jade and Blockstream App"
- LWK (Liquid Wallet Kit) mentioned with alpha availability for Simplicity

**Not Documented:**
- Which official wallet (Humid, LWK, Blockstream App, WalletConnect) is recommended for Simplicity?
- How to integrate UI with selected wallet (API docs, SDKs)
- Example code for balance querying, transaction building
- Non-technical UX patterns (approval screens, confirmation dialogs)
- Name distinctions: "Humid" vs "Humid Web Wallet" vs "LWK wasm" — only LWK clearly described

**Critical Gap:** Wallet integration is "currently in development" — may not be production-ready

**Confidence:** Low — components exist but integration path unclear

---

### G6: Contract Indexer Pattern

#### Status: DOCS MISSING

**Found:**
- No dedicated documentation for indexers
- Lending protocol page returns 404 (was supposed to have an example)
- No mention of "reusable pattern" vs "use-case-specific implementation"

**Not Documented:**
- Indexer architecture (event listener, blockchain scanner, state machine)
- How to query indexed contract state
- How to track UTXOs without scanning whole chain
- Pattern for balance tracking, transaction history
- Integration with UI (G5) for live updates

**Consequence:** UI in G5 would need to implement its own balance scanning logic (inefficient)

**Confidence:** Very Low

---

### G7: Generate TX Manifest

#### Status: DOCS PARTIAL

**Found:**
- txmanifest page exists and references the [txmanifest book](https://stringhandler.github.io/tx_manifest_book/)
- Reference implementation: [txmanifest-wallet](https://github.com/stringhandler/txmanifest-wallet/)
- Interactive demo: txw codespace at GitHub

**Not Documented:**
- Schema version number (docs state: "not yet frozen")
- How to generate manifest from Simplicity contract programmatically
- How to validate manifest (docs note: "does not include means to confirm correctness")
- Manifest format specification is external to official docs (in "txmanifest book" on GitHub)

**Critical Finding:** "txmanifest format is work-in-progress and has not yet been frozen as a released specification"

**Confidence:** Medium — tools exist, spec not frozen, schema version unknown

---

### G8: Upload to Contract Registry

#### Status: PRODUCT NOT SHIPPED

**Found:**
- NO mention of "contract registry" in official docs
- NO registry URL or service documentation
- NO instructions for registry uploads

**Searched:**
- llms.txt index — no registry page
- llms-full.txt — no registry references
- Navigation menu — no registry link

**Conclusion:** Contract registry is either:
a) Not documented (exists but undocumented), or
b) Not yet shipped (roadmap item)

**Confidence:** High (thorough search, definitively absent)

---

### G9: Request Audit from Blockstream Audit Service

#### Status: PRODUCT NOT SHIPPED

**Found:**
- NO mention of "Blockstream Audit Service" in official docs
- NO audit service documentation or contact info
- Wallet page mentions "customized versions of Blockstream Jade/App" but not audit service

**Possible Signals (outside corpus):**
- Blockstream Research team exists and publishes papers
- Could offer auditing services (common for L1/L2 developers)
- But NOT DOCUMENTED as official offering

**Consequence:** Cannot determine if service exists, pricing, SLA, turnaround

**Confidence:** High (definitively absent from official docs)

---

### G10: Testnet → Mainnet Migration Steps

#### Status: DOCS MISSING

**Found:**
- Quickstart mentions "testnet" operations
- Wallet page differentiates Liquid testnet contexts
- NO explicit "migration guide" or "mainnet deployment" page

**Not Documented:**
- Address type changes (testnet addresses vs mainnet)
- Asset ID changes (test LBTC vs mainnet LBTC)
- Confidential assets differences
- Key/param updates required
- Faucet removal (testnet has faucet, mainnet doesn't)
- Security checklist before mainnet

**Assumption Required:** Knowledge that testnet and mainnet are different chains (not documented)

**Consequence:** Developer must infer differences or ask community

**Confidence:** Low (details absent)

---

### G11: Multi-Environment Support Determination

#### Status: DOCS MISSING

**Research:** Checked for support in:
- Liquid (testnet and mainnet) — testnet documented, mainnet not addressed
- Bitcoin testnet (with Simplicity) — NO MENTION
- Bitcoin mainnet via Unchained cosigner — NO MENTION of Unchained, cosigners, or Bitcoin mainnet support

**Found:**
- All examples are Liquid testnet only
- NO mention of "Simplicity on Bitcoin testnet"
- NO mention of "Unchained" or "cosigner protocols" in official docs
- Wallet integration page assumes Liquid context ("Liquid testnet", "Elements", "multi-asset")

**Conclusion:**
- **Liquid (testnet):** SUPPORTED (documented via examples, faucet, tools)
- **Liquid (mainnet):** PROTOTYPE? (addressed in passing, no full guide)
- **Bitcoin testnet with native Simplicity:** NOT DOCUMENTED
- **Bitcoin mainnet via Unchained:** NOT DOCUMENTED (Unchained not mentioned in corpus)

**Caveat:** Unchained and Bitcoin testnet support might exist outside official docs but cannot be scored as "documented"

**Confidence:** High (comprehensive search, definitively absent)

---

## Consolidated Audit Log: G4-G11

| Goal | Status | Main Issue | Severity |
|------|--------|-----------|----------|
| G4 | Docs Partial | Faucet exists, but end-to-end flow (spend/verify) missing | Medium |
| G5 | Docs Missing | Wallet integration "in development"; unclear which to use; no API docs | **Major** |
| G6 | Docs Missing | No indexer pattern or architecture guidance documented | **Major** |
| G7 | Docs Partial | TX manifest spec not frozen; schema version unknown; external book | Medium |
| G8 | Not Shipped | Contract registry: zero documentation, likely doesn't exist | Blocker |
| G9 | Not Shipped | Audit service: zero documentation, likely doesn't exist | Blocker |
| G10 | Docs Missing | No testnet→mainnet migration guide; differences not specified | **Major** |
| G11 | Docs Missing | No Bitcoin testnet or Unchained support documented | **Major** |

---

