# Ecosystem Documentation Coverage Audit

## Run header

| Field | Value |
| --- | --- |
| Date of run | 2026-09-23 |
| Protocol file | `tests/ecosystem-documentation-coverage.md` in `simplicity-lang-org` |
| Protocol file git blob SHA-1 | `f892d11d41d2b6b2f181ee81c56b673ef67f5561` |
| Last commit touching protocol file | `0ec4d910d2aa9f4eebe948a6e07186ccb63ce86c` (2026-09-18) |
| Model | Claude Opus 5 (`claude-opus-5`) |
| Harness | Claude Code CLI, Linux |
| Auditor persona | Technical employee at a mid-size finance firm (full-stack TS/React, moderate classic Bitcoin, no Liquid/Simplicity experience) |
| Local repos read for knowledge | None. No locally checked-out repository was read or scanned for content; the protocol file itself was the only local file read. |
| Toolchain available | None. `simc`, `simplicityhl`, `simplex`, `hal`, `elements-cli`, `elementsd`, `lwk_cli`, `humid`, `node`, `npm`, `cargo` all absent from PATH. All code below is therefore **not executed — docs-only reconstruction**. |

## Result at a glance

| Goal | Status |
| --- | --- |
| G1 Locate the Allowance covenant | Docs partial |
| G2 Add a fixed commission | Docs partial (one blocker: G2.-4) |
| G3 Simplex tests | Docs missing |
| G4 Testnet deploy | Docs partial |
| G5 Beneficiary web UI | Docs missing |
| G6 Contract indexer | Docs partial |
| G7 TX manifest | Docs partial on-site; sufficient once its outbound link is followed |
| G8 Upload to a contract registry | Product not shipped |
| G9 Request an audit | Product not shipped |
| G10 Testnet → mainnet migration | Docs missing |
| G11 Multi-environment (Liquid / BTC testnet / Unchained) | Docs partial |

Four goals completed from documentation alone; three blocked outright. The corpus's reference
material is strong and its procedural material is thin — and at two points (G3, G7) the only
usable instructions live behind an outbound link rather than on the site.

---

## 0. Method

**Start URL:** `https://docs.simplicity-lang.org/`

**Corpus acquisition.** `curl` is absent from this environment; `wget` is present and was used to
retrieve official pages as raw text. The site serves a `.md` source for every page (the `llms.txt`
convention), so pages were fetched as Markdown rather than scraped HTML, giving exact quotable text
rather than a summarizer's paraphrase. Files are kept under `evidence/`.

**Pages fetched, in order:**

1. `https://docs.simplicity-lang.org/llms.txt` → `evidence/llms.txt`
2. `https://docs.simplicity-lang.org/llms-full.txt` → `evidence/llms-full.txt` (6,487 lines, 437 KB)
3. `https://docs.simplicity-lang.org/` → `evidence/index.html`
4. `https://docs.simplicity-lang.org/index.md` → `evidence/index.md.txt` (the landing page source)
5. `https://docs.simplicity-lang.org/search/search_index.json` → `evidence/search_index.json` (475 indexed sections; used as the site's own search)

Subsequent page reads were served out of `llms-full.txt`, which is itself an official corpus
artifact, except where a page is shown below to be missing from it.

**Tools actually executed:** `wget`, `grep`, `python3` (to query the search index), `git`.
No Simplicity tooling was executed — see the run header. All contract code below is
**not executed — docs-only reconstruction**.

**Search terms that found nothing** (recorded as they occurred; see goal sections for context):

| Term | Where searched | Result |
| --- | --- | --- |
| `allowance` | `llms-full.txt` | **0** |
| `allowance` | `search_index.json` (whole site, 475 sections) | 1 — the landing page only |
| `Humid` / `humid` | both indexes | **0 / 0** (G5.-1) |
| `registry` | both indexes | **0 / 0**; `registries` 1, in a list of things still needed (G8.-1) |
| `audit service`, `Audit Service`, `Blockstream Audit` | both indexes | **0 / 0** (G9.-1) |
| `cosigner`, `co-signer` | `llms-full.txt` | **0** (G11.-2) |
| `npm`, `package.json`, `@blockstream`, `lwk_wasm`, `wasm-bindgen`, `TypeScript` | `llms-full.txt` | **0** each (G5.-2) |
| `TestContext`, `FinalTransaction`, `PartialOutput`, `add_output`, `get_default_signer`, `generatetoaddress` | `llms-full.txt` | **0** each (G3.-1) |
| `dust`, `self-lock`, `fee donation` | `llms-full.txt` | **0** each (G2.-6) |
| `script hash`, `address inspect`, `decode address`, `hal-elements address` | `llms-full.txt` | **0** each (G2.-4) |
| `production checklist`, `going to production`, `deploy to mainnet`, `migration` | `llms-full.txt` | **0** each (G10.-1) |
| `activat…`, `live on liquid`, `deployed on liquid` | `llms-full.txt` | **0** each (G10.-6) |
| `blockstream.info/liquid/`, `/liquid/api` (mainnet Esplora) | `llms-full.txt` | **0** (G10 step 8) |
| any literal Liquid asset ID | `llms-full.txt` | **0** (G10.-3) |
| `/address/{addr}/utxo` or any address-scoped Esplora endpoint | `llms-full.txt` | **0** (G6.-4) |
| `mainnet` | `llms-full.txt` | 4 — all Glossary or Roadmap, none instructional |

**Did I leave the official corpus?** Tracked per goal; summarized in §6.

---

## 1. Goal-by-goal results

### G1 — Locate the official Allowance covenant example

**Status: Docs partial.**

**Found it.** The Allowance covenant exists in exactly one place in the entire published corpus:
the site landing page `https://docs.simplicity-lang.org/`, in a section headed
**"Write in a language you already know"** (anchor `#write-in-a-language-you-already-know`), in a
fenced block captioned `Allowance Covenant`.

Confirmed by querying the site's own search index: of 475 indexed sections, exactly one contains
the string "allowance".

```
$ python3 -c "...json.load(open('search_index.json'))..."
docs: 475
HIT: #write-in-a-language-you-already-know | Write in a language you already know
```

**No filename is given.** The protocol said not to assume the filename. That turns out to be the
right instruction: the docs never name this file. The fence caption is a prose title
(`title="Allowance Covenant"`), not a path, and there is no link to a `.simf` file, a repository,
or an `examples/` directory for it. By contrast the Quickstart contract is consistently named
`last_will.simf` and the `.wit` reference links out to
`https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples`. For this audit the
contract is referred to as **"the landing-page allowance covenant"** and the adapted copy is
named by me, not by the docs.

#### Compile-time parameters (all read off the source; none declared with a type)

| `param::` symbol | Used at | Type the reader must infer | How inferred |
| --- | --- | --- | --- |
| `BENEFICIARY_KEY` | `enforce_signature` → `checksig(pk: Pubkey, …)` | `Pubkey` | from `checksig`'s signature |
| `ALLOWANCE_AMOUNT` | `jet::le_64(explicit_amount, param::ALLOWANCE_AMOUNT)`, `jet::subtract_64(remaining_amount, param::ALLOWANCE_AMOUNT)` | `u64` (satoshis) | from the `_64` jets |
| `MIN_DISTANCE` | `enforce_relative_distance(param::MIN_DISTANCE)` → `min_distance: Distance` | `Distance` (`u16`) | from the function signature; `Distance` cap of 65535 stated on the Quickstart page |

The page's own annotation 6 explains the mechanism: *"`param::` values aren't defined in this
file: they're compile-time parameters bound when the contract is instantiated, and they become
part of the resulting address."* That is a genuinely good annotation — it answers the single most
confusing thing about the snippet for a newcomer, in one sentence, at the point of confusion.

**Units are never stated.** `ALLOWANCE_AMOUNT` is compared against the output of
`unwrap_right::<(u1, u256)>(jet::current_amount())`, i.e. an on-chain explicit amount, which on
Elements is in satoshis. The landing page does not say this, and the Quickstart's `hal-simplicity`
flow actively cuts the other way: it converts satoshis to whole LBTC (`0.00099900`) because
*"`hal-simplicity` expects an amount in LBTC"*. A reader who sets `ALLOWANCE_AMOUNT` to `0.001`
by analogy is writing a contract that cannot be instantiated; a reader who sets it to `1` has
built a one-satoshi allowance. See G1.-3.

#### Spend-time witnesses

Exactly one: `witness::SIGNATURE`, of type `Signature` (BIP-0340), consumed by
`enforce_signature` → `checksig` → `jet::bip_0340_verify((pk, jet::sig_all_hash()), sig)`.

Note what this implies and the page does not say: because the message is `jet::sig_all_hash()`,
the beneficiary signs the *whole* transaction, so the signature is not merely authorization to
withdraw — it is authorization of the specific split between the returned covenant output, the
withdrawal output, and the fee. This is the security-relevant fact for G5 ("understand what a
proposed withdrawal will do") and it is nowhere stated on the page.

#### The recursive covenant rule

`recursive_covenant()` enforces a fixed three-output shape:

```
assert!(jet::eq_32(jet::num_outputs(), 3));        // exactly 3 outputs, no more, no fewer
let this_script_hash  = jet::current_script_hash();
let output_script_hash = unwrap(jet::output_script_hash(0));
assert!(jet::eq_256(this_script_hash, output_script_hash));   // output 0 re-creates this contract
assert!(unwrap(jet::output_is_fee(2)));            // output 2 is the Elements explicit fee
```

Output 1 (the beneficiary's withdrawal) is **entirely unconstrained** — no asset check, no amount
check, no destination check. The contract's safety comes from the complementary constraint in
`partial_withdrawal`: `remaining - ALLOWANCE_AMOUNT <= retained`, with `retained` read from output
0 and forced to be the same asset as the input. Whatever is not retained can go anywhere; since
`witness::SIGNATURE` covers the whole transaction, the beneficiary is the one choosing it.

Supporting rules, both with good annotations:

* `enforce_single_input()` — `jet::eq_32(jet::num_inputs(), 1)`. Annotation 8 explains the attack
  it prevents (co-spending several covenant UTXOs against one shared output 0) *and* names the
  consequence (fees must come out of the allowance's own balance). This is the strongest piece of
  security writing in the whole corpus for this contract.
* `full_withdrawal()` — if `current_amount <= ALLOWANCE_AMOUNT`, the covenant may be drained and
  terminated, with **no** call to `recursive_covenant()`, so the 3-output shape is not enforced on
  that path.

#### The explicit-vs-confidential funding constraint

Stated in the contract header comment — *"Fund this address only with explicit (non-confidential)
outputs"* — and explained in annotation 3:

> Elements assets and amounts can be confidential (encrypted) or explicit; `unwrap_right` assumes
> explicit and panics on a confidential value, since this contract only knows how to check
> plaintext amounts. **A confidential output sent to this contract can therefore never be spent,
> and its funds would be stuck permanently.**

That is a correct, specific, consequence-bearing warning, and it is exactly what a finance reader
needs. Two problems with its presentation, though: it is delivered as a numbered code annotation
rather than a `!!! warning` admonition, so it does not survive being read as plain text or copied
out of the page; and it appears on a marketing-framed landing-page section rather than anywhere a
reader would look for operational guidance. See G1.-4.

#### What I could not decide from the docs at G1

1. The concrete types/units to write into a `.args` file for this contract (see G1.-3).
2. Whether any canonical source file for this contract exists at all, or whether the landing page
   is the only copy (see G1.-1).
3. Whether the contract has ever been compiled, or what compiler version it is known to build
   under. The fence is `simplicityhl` without `,run`, and the rendered landing page carries no Run
   control at all (grep for the runner markup: 0 hits on `/`, 6 hits on `/getting-started/try-it/`),
   so unlike the snippets on the Try-it page this one cannot be executed by the reader in place, and
   no "tested with <version>" note is given.

### G2 — Adapt the covenant to pay a fixed commission on every withdrawal

**Status: Docs partial.** Four of the five required decisions are justifiable from cited
official pages. The fifth — how to bind the commission destination — is a **blocker**: the docs
specify the jet but never document how to produce the value it compares against.

**Artifacts:**
`artifacts/allowance_with_commission.simf`,
`artifacts/allowance_with_commission.args`,
`artifacts/allowance_with_commission.args.NOTES.md`.
Not executed — docs-only reconstruction.

#### Decision 1 — extra output vs fee output (`output_is_fee`): **RESOLVED from docs**

A commission must be a **payment output, not a fee output.** Two independent citations force it:

* Jets reference: `output_is_fee(u32) -> Option<bool>` — "Check if the output at the given index
  is a fee output." A fee output is a *classification* of an output, and nothing in the corpus
  shows a fee output carrying a destination; the landing page's annotation 5 explains fee outputs
  exist because "Elements (Liquid's underlying protocol) pays fees through an explicit fee output
  rather than Bitcoin's implicit input/output-value difference" — i.e. the value goes to the
  network, not to a nominated party.
* Toolchain reference, `hal-simplicity simplicity pset create`: destinations are objects with an
  address; "One of the JSON objects can also optionally contain a mapping from the string `fee` to
  an amount". The fee entry has no address field at all. And: **"Network fees are currently always
  automatically paid in LBTC"** — so a fee output could not even carry a commission denominated in
  another asset.

This one is cleanly decidable. Positive finding, logged as G2.+1.

#### Decision 2 — must the commission be the same asset? **RESOLVED from docs: yes**

Landing-page annotation 2 is unusually good here and states the attack directly:

> Comparing amounts without also checking assets is unsafe: anyone can issue a new Liquid asset
> carrying any amount at no cost, so an amount check on its own can be satisfied with a worthless
> asset. Returning the amounts from the same function that checks the assets means the amounts
> can't be read without the check happening.

So a naive `assert!(le_64(COMMISSION_AMOUNT, output_amount(2)))` would be satisfiable with a
worthless self-issued asset, and the fix — route the check through `same_asset()` — is handed to
the reader by the contract itself. The adapted contract calls
`same_asset(jet::current_amount(), unwrap(jet::output_amount(commission_index)))` for exactly
this reason. Positive finding, logged as G2.+2.

#### Decision 3 — explicit vs confidential amounts: **HALF-RESOLVED**

Decidable: the commission output's asset and amount must both be **explicit**, because the
contract reads them with `unwrap_right`, which per annotation 3 "assumes explicit and panics on a
confidential value".

Not stated anywhere: **the operational consequence**, which is that the commission destination
must be an *unconfidential* Liquid address. The corpus has both halves and never joins them —

* Glossary → "Confidential": "the transaction must be sent to a 'confidential address' which
  includes a cryptographic blinding key. If the destination address does not include such a key,
  it may be called 'unconfidential'."
* Landing page annotation 3: `unwrap_right` panics on confidential values.

— but annotation 3 draws the conclusion only for **funding** the contract ("A confidential output
*sent to* this contract can therefore never be spent"). Nothing says the same reasoning applies to
any output the covenant *inspects*. A reader who pastes an ordinary Liquid address (confidential
by default in most wallets) into `COMMISSION_SCRIPT_HASH`'s destination builds a contract in which
every withdrawal fails. Logged as G2.-2.

#### Decision 4 — does the recursive copy still balance? **RESOLVED, with a caveat the docs miss**

The contract has exactly one amount rule and it is an *inequality*, not a balance equation:

```
(borrow, difference) = subtract_64(remaining_amount, ALLOWANCE_AMOUNT)
assert!(not(borrow))                      // remaining >= ALLOWANCE_AMOUNT
assert!(le_64(difference, retained))      // retained >= remaining - ALLOWANCE_AMOUNT
```

Adding a fourth output does not disturb it. What it does is fix *who pays*: because
`enforce_single_input()` admits no second input, every satoshi on the output side comes from this
UTXO, so `withdrawal + commission + fee <= ALLOWANCE_AMOUNT`. **The commission is carved out of
the beneficiary's allowance, not added on top of it.** The docs supply the premise —
annotation 8: *"since no other input is available, fees can only come out of the allowance's own
balance"* — and the reader draws the conclusion. That is an acceptable amount of work to ask.

The caveat the docs do miss: `full_withdrawal()` returns a `bool` and `main` dispatches to
`partial_withdrawal()` only on `false`. On the `true` branch the original contract runs **no
output checks whatsoever** — not `num_outputs`, not `output_is_fee`, nothing. The landing page
never says this. A reader adding a commission and only editing `recursive_covenant()` would ship a
contract whose commission is trivially avoidable: wait until the balance drops to
`ALLOWANCE_AMOUNT`, then take everything with no commission output. The adapted contract adds
`final_withdrawal()` to close it. Logged as G2.-3, and it is the most security-relevant omission
found in this audit.

#### Decision 5 — how is the commission destination bound? **BLOCKED**

*Which binding mechanism* is decidable: a **compile-time param**, not a witness and not a
hardcoded literal. Annotation 6 gives the rule — `param::` values "are compile-time parameters
bound when the contract is instantiated, and **they become part of the resulting address**". A
witness value would let the beneficiary choose the commission destination at spend time, which
defeats the purpose; a param is committed in the address the funder pays, so the funder's payment
is itself consent to the commission arrangement. That reasoning is fully supported.

*What value to put in the param* is not decidable from the corpus, and this is the blocker.

`jet::output_script_hash(u32) -> Option<u256>` returns **"the SHA256 hash of the scriptPubKey of
the output"**. To bind a destination, the param must therefore be SHA256(scriptPubKey of the
commission address). No official page documents how to get from a Liquid address to that value:

* `hal-simplicity simplicity info` runs the other way — it *emits* `liquid_address_unconf` /
  `liquid_testnet_address_unconf` from a program. There is no inverse subcommand documented.
* The only scriptPubKey in the whole corpus is lifted from a block-explorer API response for an
  already-existing UTXO: `HEX=$(jq -r '.vout[0].scriptpubkey' < input-tx.json)`. That works only
  if the destination has already received a transaction — useless at contract-instantiation time,
  and circular for a fresh commission address.
* The toolchain page says `hal-simplicity` "also includes the subcommands from `hal-elements`" but
  documents none of them, so a reader cannot tell whether an address-decoding subcommand exists.

Searches that found nothing (all against `llms-full.txt`, the official single-file corpus):
`script hash`, `scriptpubkey` (7 hits, all the above), `address inspect`, `decode address`,
`hal-elements address`. Logged as G2.-4 (blocker) and G2.-5.

Consequence for the artifact: `COMMISSION_SCRIPT_HASH` in `allowance_with_commission.args` is a
**32-byte placeholder of the correct shape and nothing more**, explicitly labelled
`CONFIDENCE: guessed`. Per the protocol I did not substitute a value from recollection of Elements
address encoding.

#### Which network does the commission address belong to? **Inferable, never stated**

This matters for G10 and the docs let a reader work it out only indirectly. `hal-simplicity
simplicity info` derives **both** `liquid_address_unconf` and `liquid_testnet_address_unconf` from
one compiled program, so the two networks' addresses differ only in encoding, not in scriptPubKey.
It follows that a `COMMISSION_SCRIPT_HASH` param **does not bind the network at all**: the same
value is valid on testnet and mainnet, and a testnet commission destination silently remains the
mainnet commission destination after migration. That is a genuine production foot-gun and no page
states it. Logged as G2.-7, and carried into G10.

#### A contradiction that blocks writing the transaction

Two official pages give **incompatible argument shapes for the same command**,
`hal-simplicity simplicity pset create`:

* Toolchain reference: `[{"address": "<addr>", "asset": "<assetid>", "amount": <amt>}, {"fee": <feeamt>}]`
* Quickstart, bash/CLI tab, step 4: `'[ { "'"$CONTRACT_ADDRESS"'": 0.00099900 }, { "fee": 0.00000100 } ]'`

The first is a list of three-field objects; the second is a list of single-entry
address-keyed maps. They cannot both be right. Per the protocol I implemented neither silently:
the conflict is logged as G2.-1 (Contradiction), and for the G4 reconstruction I chose the
**toolchain reference** form, because it is the reference page rather than a tutorial and because
only that form has an `asset` field — which a commission output paid in a non-LBTC asset requires.

#### What I still could not decide from docs at G2

1. The actual value of `COMMISSION_SCRIPT_HASH` (G2.-4).
2. Which `pset create` output syntax is current (G2.-1).
3. Whether `.args` supports the `{"value":…,"type":…}` annotation form that `.wit` supports, and
   whether an unknown or missing key is an error (G1.-3).
4. How to express a commission as a *percentage* rather than a fixed amount. The brief said
   "small fixed commission" so this did not block me, but it is the first thing a finance reader
   will ask, and the corpus answers it only if you already know where to look. The primitives do
   exist and are well documented — but in the **standard library reference**, not the jets
   reference: `mul_128_64(u128, u64) -> u256`, `div_mod_128_64`, `div_128`,
   `safe_u128_to_u64(u128) -> u64` ("Panics if the value does not fit in `u64`"). So basis-point
   math is `u64 → u128 → multiply → divide → narrow back`. Two frictions: the reader must notice
   that the stdlib, not the jets page, is where the wide-arithmetic helpers live (the jets page's
   own `multiply_64` returns a `u128` that no *jet* can then divide); and the stdlib is reached via
   `simplex install std`, so a percentage commission means adopting Simplex, which the
   landing-page contract does not use. There is no worked example of proportional fee logic
   anywhere in the corpus. Logged as G2.-8.

### G3 — Write Simplex tests for the adapted contract

**Status: Docs missing** (for the test API), Docs partial overall.

**Artifact:** `artifacts/tests/allowance_commission_test.rs`. Not executed — Simplex, `cargo` and
`elementsd` are all absent from this environment.

#### What the official page gives

`https://docs.simplicity-lang.org/documentation/simplex.md` is clear and correct about the
*shape* of a Simplex project, and that part is genuinely useful: install via `simplexup`,
`simplex init`, `.simf` files live in `simf/`, `simplex build` generates Rust artifacts into
`src/artifacts`, tests are `.rs` files in `tests/`, `simplex test [name] [-v]` runs them against a
throwaway `elementsd`, `simplex regtest` gives a persistent one configured through
`[test.rpc]`/`[test.esplora]` in `Simplex.toml`. The "tests run against local regtest, not public
testnet" framing is exactly right for a finance reader worried about leaking a strategy onto a
public chain. Positive finding, logged as G3.+1.

#### What it does not give: any API at all

The page's entire specification of how to *write* a test is this:

```rust
#[simplex::test]
fn test_name(context: simplex::TestContext) -> anyhow::Result<()> {
    // Test code goes here.
    Ok(())
}
```

`// Test code goes here.` is the whole API surface. `TestContext` has no documented methods. There
is no documented way to fund an address, read a UTXO's value, add an output, add a fee, set
nSequence, mine a block, or assert that a spend failed. Searches that found nothing across
`llms-full.txt`: `TestContext`, `FinalTransaction`, `PartialOutput`, `add_output`, `broadcast`,
`get_default_signer`, `mine`, `generatetoaddress`, `regtest block`. Logged as G3.-1 (Blocker).

#### Left the corpus? No — but only just

The Simplex page's "Examples" section links
`https://github.com/BlockstreamResearch/smplx/tree/master/examples` and names it as the source of
the example projects, so under the protocol's rule ("GitHub repositories ONLY when an official docs
page links them as the source of a contract, tool, or example") this is **official-linked-repo**,
not out of corpus. Files read there: `examples/basic/README.md`, `Simplex.toml`,
`tests/basic_test.rs`, `tests/confidential_test.rs`, `simf/p2pk.simf`.

That link is doing an enormous amount of load-bearing work. Everything in the artifact's imports —
`simplex::TestContext`, `Signer`, `FinalTransaction`, `PartialInput`, `PartialOutput`,
`ProgramInput`, `RequiredSignature`, `TxReceipt`, `context.get_default_signer()`,
`context.random_signer()`, `context.get_default_provider()`, `provider.fetch_scripthash_utxos()`,
`provider.get_network().policy_asset()`, `signer.send()`, `signer.broadcast()`,
`signer.get_address()`, `signer.get_blinding_public_key()`, `tx_receipt.wait()`,
`ft.add_program_input()`, `ft.add_output()`, `ft.add_issuance_input()`,
`PartialOutput::new(script, amount, asset).with_blinding_key(..)`,
`RequiredSignature::Witness("SIGNATURE")` — is **demonstrated in example source and documented
nowhere**. A reader who only reads the docs site cannot write a Simplex test.

The generated-artifact naming convention is likewise inferable from one data point only:
`simf/p2pk.simf` containing `param::PUBLIC_KEY` yields
`artifacts::p2pk::P2pkProgram` plus `derived_p2pk::{P2pkArguments, P2pkWitness}` with a
snake_case field `public_key`. So `param::BENEFICIARY_KEY` presumably becomes `beneficiary_key`.
That is an inference from a single example about the core code-generation contract of the whole
framework. Logged as G3.-3.

#### The examples do not cover a covenant

The Simplex page lists its examples as:

```
* `examples/basic` (demonstrates a pay-to-public-key contract, called `p2pk.simf`)
<!-- * `examples/last_will` (demonstrates a recursive covenant with a timeout-based inheritance mechanism, called `last_will.simf`) -->
```

The one covenant example — the only listed thing that would demonstrate recursive covenants and
timelocks under test — is **commented out**. I verified against the linked repo that it is absent
there too (`examples/` contains only `basic`), so the comment is honest rather than stale; the
example simply does not exist. Two consequences: the corpus has zero examples of testing the
contract class it spends the rest of its pages promoting, and the raw HTML comment is visible in
`llms-full.txt`, which is the machine-readable corpus. Logged as G3.-4.

#### The four capabilities the five required tests need, and cannot get

Each is annotated inline in the artifact as DOC-GAP A–D.

| Gap | Needed by | Status |
| --- | --- | --- |
| **A.** Exact control of output count and order | all 5 tests — the covenant pins `num_outputs() == 4` | `ft.add_output` exists, but `basic_test.rs` broadcasts a `FinalTransaction` with one input and **zero** explicit outputs and it confirms, so Simplex evidently adds outputs of its own. Nothing says which, or where in the ordering. For an ordinary contract that is a convenience; for a covenant it decides pass/fail. |
| **B.** An explicit fee output | happy path, tests 2/4/5 | No `add_fee`-shaped call in either example or any doc page. |
| **C.** Setting nSequence, and mining N blocks | tests 1 and 3 | Absent everywhere. |
| **D.** What a failed spend looks like | tests 2–5, i.e. four of the five | Everything returns `anyhow::Result`, so failure is an `Err`; nothing says whether a covenant violation surfaces at build, sign, or broadcast time, or what the message is. |

Gap D has one bright spot worth crediting: Quickstart step 6 names a real rejection string,
`non-BIP68-final`, and explains precisely why the contract accepts a transaction that the node
then refuses — *"the contract's own check only compares against the declared distance… the node
independently checks how many blocks have actually passed"*. That is the single most useful error
datum in the corpus and it directly shaped test 3, which I split into 3a (contract rejects) and 3b
(consensus rejects). Positive finding, logged as G3.+2. There is no equivalent for a Simplicity
assertion failure.

Per the protocol, every blocked line in the artifact is a `todo!()` naming its gap rather than an
invented method call.

#### A sixth test the protocol did not ask for, which matters more than three that it did

Writing these surfaced that the original contract's `full_withdrawal() == true` branch enforces no
output shape at all, so a commission bolted onto `recursive_covenant()` alone is avoidable by
draining to `ALLOWANCE_AMOUNT` first. The artifact ends with a specification for that regression
test. See G2.-3.

#### What I still could not decide from docs at G3

Everything in the table above, plus: the unit of `signer.send(script, 50)` — `50` what? The
example never says and `Simplex.toml` muddies it with a `bitcoins = 10_000_000` key.

### G4 — Deploy and exercise the contract on Liquid testnet

**Status: Docs partial.** The documented flow is genuinely good and I could follow it end to end
on paper. It could not be *executed* here for two reasons — one environmental, one a real doc gap.

**Artifact:** `artifacts/deploy-testnet.sh`. **Not executed — docs-only reconstruction.**

#### The documented flow, and why it is the best page in the corpus

`https://docs.simplicity-lang.org/getting-started/quickstart/` is the strongest documentation on
the site. Its bash/CLI tab is a complete, copy-pasteable, seven-step round trip: set parameters →
write `.args` → `simc` → `hal-simplicity simplicity info` for the address and CMR → faucet →
`pset create` / `update-input` / `sighash` / `finalize` / `extract` → broadcast. It does four
things most crypto tutorials do not:

* It **deliberately fails first.** Step 5 builds a transaction that finalizes and extracts
  successfully and is then rejected by the node, and explains exactly why: the contract only
  checks the *declared* sequence, consensus checks *elapsed* blocks. It even names the rejection
  string, `non-BIP68-final`, and tells you to keep the identical bytes and resend them unchanged
  in step 7. A reader learns the contract/consensus split by watching it happen.
* It **explains its own arithmetic** — the satoshis→LBTC conversion is spelled out digit by digit
  rather than left as a magic `printf`.
* It **states why waiting matters**: "a relative timelock's clock starts at the confirming block,
  not at broadcast time".
* It **offers two independent tabs** (a Rust `simplicity-demo` driver and raw bash), so a reader
  who cannot install Rust is not stranded.

Positive findings, logged as G4.+1 and G4.+2.

#### Endpoint freshness: all live

Every network endpoint the tutorial names responded on 2026-09-23. No funds were requested from
the faucet; only its landing page was checked.

| Endpoint (as documented) | Status |
| --- | --- |
| `https://blockstream.info/liquidtestnet/api/blocks/tip/height` | 200 |
| `https://liquid.network/liquidtestnet/api/tx/…` | 200 |
| `https://liquidtestnet.com/` (faucet host) | 200 |
| `https://community.simplicity-lang.org/` | 200 |
| `https://smplx.simplicity-lang.org` (install script) | 301 → resolves |

Logged as G4.+3.

#### Why G4 could not be executed

1. **Environmental, and honestly reported:** `simc`, `hal-simplicity`, `cargo`, `jq` and `curl`
   are all absent here. That is not a documentation defect. The toolchain page's install
   instructions (`cargo install simplicityhl`, `cargo install hal-simplicity`) are present and
   plausible.
2. **A real doc gap:** even with the toolchain installed, this contract **cannot be compiled to an
   address**, because `COMMISSION_SCRIPT_HASH` has no documented derivation (G2.-4). Step 1 of the
   deploy script is blocked before any network call. This is worth stating plainly: the commission
   requirement is not an exotic extension — it is "pay someone a fee", the most ordinary thing a
   finance firm would add to a contract — and the corpus cannot get you to a fundable address.

#### Three further problems the reconstruction exposed

**The `pset create` contradiction bites twice here** (G2.-1 / G4.-1). The toolchain reference's
output form carries an `asset` field; the Quickstart's carries an input `sequence`. This contract
needs the `sequence` (it calls `jet::parse_sequence`) and would need the `asset` for any non-LBTC
commission. **Neither documented form demonstrates both.** The script uses the Quickstart form,
because the sequence is non-negotiable and a non-LBTC commission is not, and says so in a comment
rather than silently.

**Output ordering is never guaranteed** (G4.-2). The covenant pins output 0 = covenant,
1 = withdrawal, 2 = commission, 3 = fee. Nothing on the toolchain page or the Quickstart says
`pset create` preserves the order of the outputs array — and for Bitcoin-family tooling, output
shuffling for privacy is a common and reasonable default. For *every covenant on this site* this
is a correctness precondition, and it is unstated. The Quickstart never has to care because
`last_will.simf` has only two outputs, one of which is the fee.

**`-Z` flags are undocumented as a set** (G4.-3). The Quickstart says to pass `-Z enums` "because
this contract uses SimplicityHL's `enum` feature, which is still experimental". The toolchain
reference lists `-Z, --unstable-feature <FEATURE>` with no list of accepted values, and no page
maps language features to the flags they require. The adapted allowance contract matches on a
`bool` and uses no `enum`, so I dropped `-Z enums` — a guess I could not verify.

#### Two smaller things

* **How does a funder guarantee an explicit output?** (G4.-4) The contract's header says "Fund
  this address only with explicit (non-confidential) outputs" and annotation 3 says the funds are
  otherwise **permanently stuck**. The docs never tell a funder how to comply. The reassuring
  answer is inferable — `hal-simplicity simplicity info` only ever emits `*_address_unconf`, and
  an unconfidential address cannot receive a blinded output — but for a warning this severe, the
  reader should not have to assemble the reassurance themselves.
* **Two explorers in one tutorial** (G4.-5). The bash tab fetches transaction data from
  `liquid.network` but broadcasts to and polls status from `blockstream.info`, with no explanation.
  A reader copying the pattern into their own tooling has no idea which host is canonical or why
  the tutorial switches.

#### A genuinely undersold command

`hal-simplicity simplicity pset run` — "simulates running a Simplicity program in the context of a
transaction… This helps with debugging to confirm whether a program will complete successfully and
approve a transaction, as well as understanding why it accepted or rejected a specific proposed
transaction." For a four-output covenant with a commission check, this is the most valuable tool
on the site: it turns "my spend was rejected" into a jet-by-jet trace. It gets one paragraph on the
toolchain reference, **no worked example, and no mention at all in the Quickstart** — which instead
walks the reader through a failing broadcast without ever suggesting they could have diagnosed it
locally first. Logged as G4.-6, and it is a cheap, high-leverage fix.

#### What I still could not decide from docs at G4

Which `pset create` syntax is current; whether output order is preserved; which `-Z` flags this
contract needs; and whether the faucet's 100,000 sats is enough headroom for a contract whose
`ALLOWANCE_AMOUNT` plus commission plus fee must all fit inside it.

### G5 — Non-technical web UI for the beneficiary

**Status: Docs missing** for the build; Docs partial for the concepts.

**Artifact:** `artifacts/ui-sketch.md`. Not executed; no npm/Node in this environment and, more
to the point, no documented client API to build against.

#### The name check the protocol asked for

Counted across `llms-full.txt` (the official single-file corpus) and the site's own
`search_index.json` (475 indexed sections):

| Name | In corpus? | What the corpus actually says |
| --- | --- | --- |
| **Humid** | **No — zero occurrences, in either index** | Nothing. The name does not appear on docs.simplicity-lang.org at all. |
| **"Humid Web Wallet"** | **No — zero occurrences** | Nothing. |
| **LWK wasm** | **Yes** | Ecosystem page: "LWK can generate native apps or provide JavaScript bindings, with a WASM compile target, for building web apps." Simplicity support is "available as an alpha release behind the LWK compile-time feature `simplicity`", and "still being added in LWK as of April 2026". |
| **WalletConnect** | **Yes, but as work in progress** | "An official wallet connection recommendation is **currently in development**… built on top of the Bitcoin ecosystem's existing WalletConnect protocol… pairing an external wallet with a web application via WebSockets." |
| **Blockstream App** | **Yes, once** | One sentence: "Lightly-customized versions of Blockstream Jade, the Blockstream App, and other wallet applications can pair with this demo and authorize lending contract transactions on Liquid testnet." |

**The protocol's warning was well aimed.** It said "Do not assume Humid is documented because you
have heard of it." Humid is not documented. It is not mentioned once. A requirement phrased as
"sign and submit via their own Humid wallet" is, from inside the official corpus, unimplementable
and unrecognizable — a reader cannot even determine whether Humid is a wallet, a library, or a
product name they have misremembered. Logged as G5.-1 (Blocker). I did not resolve this by
leaving the corpus.

#### What the corpus does give, and it is not nothing

Two pages carry real weight here:

* **Ecosystem & Wallet Integration** states the architecture plainly: the web app is built with
  LWK targeting WASM and provides the UI; user keys stay in an external wallet; a PSET built by
  Simplicity-aware software is handed out for signature and the signature is inserted into the
  witness. It also states the trust consequence in one unusually honest sentence: *"if the wallet
  does not provide UI support for a specific contract, the web application must be trusted to
  accurately represent the meaning and effects of the contract state and requested signatures."*
  Positive finding, G5.+1.
* **Road to Ecosystem** is, for the "understand what a proposed withdrawal will do" requirement,
  the single most useful document on the site, and it is framed exactly right for a finance
  reader: *"I understand for what I am paying."* Its clear-signing list — parses transaction,
  interprets inputs/outputs, validates assets/amounts, explains fees, explains protocol metadata,
  **explains Simplicity covenants**, **rejects what it cannot understand** — is a requirements
  spec I could design against directly. Positive finding, G5.+2.

It also names the standards work: ELIP drafts for a
[Wallet ABI Transaction Creation Protocol](https://github.com/ElementsProject/ELIPs/pull/35) and a
[Liquid Wallet RPC Profile](https://github.com/ElementsProject/ELIPs/pull/36), plus an expected
"Liquid Clear Signing Profile". These are linked as open pull requests, i.e. drafts of drafts.

#### Why the UI still cannot be built

The gap is between "here is the architecture" and "here is the call you make". Specifically:

1. **No LWK-wasm Simplicity API is documented anywhere on the site.** Not one function name, not
   one npm package name, not one import line. The ecosystem page links
   `https://github.com/Blockstream/lwk/` and the LWK docs at `docs.liquid.net`, both outside
   docs.simplicity-lang.org. Searches that found nothing: `npm`, `package.json`, `import`,
   `@blockstream`, `lwk_wasm`, `wasm-bindgen`. Logged as G5.-2 (Blocker).
2. **The one working reference is a third-party demo.** The ecosystem page points to
   `https://demolending.distributedlab.com/` with source at
   `BlockstreamResearch/simplicity-lending`, and a WalletConnect proof of concept at
   `https://lending.dev.blockstream.com/`. Both are linked by an official page as the source of a
   demo, so they are in corpus — but they demonstrate *lending*, not a generic covenant, and the
   docs extract no reusable pattern from them. Logged as G5.-3.
3. **The transport layer does not exist yet.** WalletConnect support is "currently in
   development"; the ELIPs are unmerged PRs. A design I write today cannot pin a version.

#### The requirement the docs are best placed to answer, and do not

"Understand what a proposed withdrawal will do" is answerable for *this* contract, and the answer
is genuinely alarming in a way the UI must surface. Because `checksig` signs
`jet::sig_all_hash()`, the beneficiary's single signature authorizes the **entire** transaction —
the returned covenant amount, the withdrawal amount, the commission, and the fee. And because
output 1 is **completely unconstrained by the contract** (no asset, amount, or destination check),
a malicious or buggy web app can direct the beneficiary's withdrawal anywhere while the covenant
still validates. The contract protects the *covenant's* remainder and the *commission*. It does
not protect the beneficiary's own draw at all.

That is exactly the "I understand for what I am paying" problem, on the site's own flagship
contract, and no page says it. Logged as G5.-4 and carried into the priority list.

#### What I still could not decide from docs at G5

Whether Humid exists; any LWK-wasm call signature; which wallets can sign a Simplicity witness
today versus which are "lightly-customized" one-offs built for the lending demo; and whether a
generic covenant UI is expected to ship its own clear-signing metadata or wait for the Liquid
Clear Signing Profile.

### G6 — Contract indexer for the UI

**Status: Docs partial.**

**Artifact:** `artifacts/indexer-spec.md`.

**Is it documented as a reusable pattern, or only inside one use case? Only inside one use case.**
The corpus's single treatment of indexing is a subsection of the Lending Protocol page,
[Indexing and Discovery Mechanism](https://docs.simplicity-lang.org/use-cases/lending-protocol/#indexing-and-discovery-mechanism),
written entirely in lending vocabulary ("Pre-lock covenants", "Parameter UTXOs", "bit-packed
lending protocol structure", "minimum of 5 inputs and 6 outputs"). There is no indexing page, no
`llms.txt` entry, and — the real miss — **no link to it from the Ecosystem page**, which is where
a reader hunting for indexing actually lands and which says only that Esplora is "the main API for
discovering and analyzing transactions". Logged as G6.-1, G6.-2.

**The reusable idea is in there, undersold.** The lending indexer's verification step is
protocol-independent and is the whole trick: compile the covenant with candidate parameters, then
match the resulting hash against the output. Any covenant indexer needs exactly this. It appears
once, as step 2 of a numbered list, inside a lending walkthrough. Positive finding G6.+1, and the
clearest candidate on the site for promotion out of a use case into a pattern page.

**A contradiction that would mislead an implementer** (G6.-3): the lending page says the indexer
"compares the resulting script hash (**CMR**) with the script hash of output 0", treating CMR and
output script hash as the same thing. They are not. `hal-simplicity simplicity info` reports `cmr`
and `liquid_testnet_address_unconf` as separate fields; the address is a Taproot output key
derived from the CMR *and* an internal key. The allowance covenant itself compares
`jet::current_script_hash()` with `jet::output_script_hash(0)`, neither of which is a CMR. Written
literally, the lending page's instruction compares the wrong two values.

**Two things this contract needs that the corpus does not give:**

* **G6.-4** — `/address/{addr}/utxo`, the endpoint that actually answers "what are this contract's
  UTXOs", is never shown. The Quickstart only fetches transactions whose txid the faucet already
  handed it. The Ecosystem page names Esplora and links its GitHub repo, not an endpoint
  reference. So the corpus names the API and never demonstrates the call the requirement depends
  on. The spec marks that line **CONFIDENCE: guessed**.
* **G6.-5** — state-committed contracts. The State page says every state update moves assets to "a
  new copy of itself with a *different on-chain address*" and that "client software must be
  programmed to observe that this has happened", then gives no method: no derivation-chain walk,
  no scan strategy, nothing. The allowance covenant is stateless and dodges this; essentially
  every contract a finance firm would ship does not. This is the deepest hole in the indexing
  story.

**Two things the docs make easy, and one the spec had to invent:** the address is fixed for a
given parameterization (landing-page annotation 6), so "no chain scan in the browser" is satisfied
by construction; and per-UTXO rather than summed balances is forced by annotations 1 and 8, which
state it clearly. The invented part is detecting **confidentially-funded, permanently unspendable**
UTXOs and surfacing them — the consequence is documented (annotation 3), the client-side
obligation is not.

**What I still could not decide:** reorg handling; public-Esplora rate limits or self-hosting
guidance beyond one sentence; and which of the two explorers the Quickstart uses is canonical.

---

### G7 — TX manifest describing the contract's signing stages

**Status: Docs partial** on the official site; **Docs sufficient** once its outbound link is
followed — which is itself the finding.

**Artifact:** `artifacts/txmanifest.json`.

#### Schema version and freeze status — both answerable

* **Schema version: `0.2.0`.** From the linked txmanifest book: *"This book describes manifest
  format **0.2.0**. That version string goes in every manifest as `manifest_version`, and it is
  checked before anything else runs — a file written against a different revision is refused
  outright rather than half-understood."* Strict version gating, clearly stated. Good design,
  clearly documented.
* **Frozen? No, explicitly.** The official page says so without hedging: *"The `txmanifest` format
  is work-in-progress and **has not yet been frozen as a released specification**."* Positive
  finding G7.+1 — the corpus is straightforwardly honest about maturity here, which is more than
  most ecosystems manage, and it let me classify the goal immediately instead of guessing.

Note the asymmetry: the official page states the freeze status but **not** the version number;
the book states the version but is not where a reader starts. Neither fact is in both places.
Logged as G7.-2.

#### The real G7 finding: the spec lives outside Blockstream's docs

`https://docs.simplicity-lang.org/documentation/txmanifest/` is three short sections and a
security warning. Everything operational is delegated to two links, **both under an individual
contributor's personal GitHub account**:

* the spec/tutorial: `https://stringhandler.github.io/tx_manifest_book/`
* the reference implementation: `https://github.com/stringhandler/txmanifest-wallet/`

The book is excellent — a genuinely first-rate piece of documentation, far better than the page
that points at it. It has a full field reference (28 schema objects), a formula-language grammar,
a CLI reference, a wallet implementation guide, and a graded recipe sequence ending in a complete
lending protocol. Its **"Worked example: a Last Will covenant"** chapter is exactly the template
the allowance contract needed, and the draft manifest was written from it. Positive finding
G7.+2.

But for a finance firm the hosting matters and is a legitimate blocker to adoption, not a
nitpick. txmanifest is pitched on the official page as the interoperability standard that
"teaches wallets" what a contract means — and the same page's security section says a deceptive
manifest "could allow users' assets to be lost or stolen". A format with that threat model,
whose specification and reference parser both live on a personal account with no versioned
release, no stated governance, and no ELIP number, is not something a regulated firm can
standardize on. Logged as **G7.-1 (Major friction)**. The fix is cheap: mirror or vendor the book
under `docs.simplicity-lang.org`, or say plainly on the official page what the governance plan is.

#### A cross-corpus contradiction on a deprecated jet

The book's Last Will recipe — its flagship covenant example — is built on
`jet::check_lock_distance`:

```
fn inherit_spend(inheritor_sig: Signature) {
    let blocks: Distance = param::INHERIT_BLOCKS;
    jet::check_lock_distance(blocks);
    ...
}
```

The official jets reference marks that jet **"Deprecated; do not use."**, and the Timelocks page
carries a warning admonition: *"The Simplicity jets that directly enforce relative timelocks have
been deprecated due to an implementation error. However, a workaround is available."* The landing
page's annotation 9 says the same: *"This replaces the deprecated `jet::check_lock_distance`."*

So a reader following the official docs' own link to the official format's official
documentation is taught a pattern the official docs elsewhere forbid. **The same jet also appears
in `state.md`'s copy of `last_will.simf`, on docs.simplicity-lang.org itself, with no warning.**
Logged as **G7.-3 (Contradiction)** and **G7.-4 (Outdated)**; G7.-4 is entirely within the
official corpus and is a one-line fix.

#### What the manifest could and could not express

Mapped cleanly from the book: `manifest_version`, `contract_templates` with typed `fields`,
`utxo_types` wiring fields to `compile_params` (field names double as `param::` names),
constructor actions carrying `create_instance`, per-input `witnesses` with
`{"type":"Signature","sig_type":"sig_hash_all","source":{"type":"wallet","key":"instance.X"}}`,
`sequence: {"relative_blocks": …}` for BIP68, the `fee` reserved formula word, `required_index`,
and the rule that a change output appears only if an action declares
`"destination": "change"` — which is precisely what a fixed-output-count covenant needs. That
last rule is the single most important thing the book taught me, and nothing on
docs.simplicity-lang.org hints at it.

Could **not** be expressed with confidence:

1. **The commission destination.** Same blocker as G2.-4 — the covenant compares against
   SHA256(scriptPubKey), and neither the official docs nor the book documents how to produce it
   from an address. The book's `OutputDestination` supports destination *types*; whether one of
   them yields a value bindable to a `u256` compile param is not something I could confirm
   without reading the reference wallet's source, which would have meant leaving the corpus.
2. **A four-output covenant with no change output.** The book demonstrates a two-output recursive
   covenant (covenant + fee) and explains the no-change rule for it. A four-output covenant where
   outputs 1 and 2 are real payments and only output 3 is the fee is a shape the book never shows,
   and the interaction between `fee`, surplus folding, and three non-fee outputs is not stated.
   Logged as G7.-5. The manifest declares it anyway and flags the uncertainty.

#### What I still could not decide at G7

Whether 0.2.0 is stable enough to build against (the format is explicitly unfrozen); who owns the
spec; whether `required_index` is ever load-bearing or is always only documentation, as the book
says it is in the two-output case.

### G8 — Upload the TX manifest to the documented contract registry

**Status: Product not shipped** — and, more precisely than that, **not even documented as
forthcoming**.

I did not leave the corpus for this. The searches and their results:

| Term | `llms-full.txt` | `search_index.json` (475 sections) |
| --- | --- | --- |
| `registry` | 0 | 0 |
| `registries` | 1 | — |
| `contract directory`, `marketplace` (as a registry), `publish a contract` | 0 | 0 |

The single hit is one word in a list of things that do **not yet exist**, in the Road to Ecosystem
conclusion:

> It requires standards, **registries**, validation logic, contract metadata, asset metadata, and
> wallet implementations that reject what they cannot understand.

That is a statement of requirement, not of roadmap and certainly not of product. The Roadmap page
has no registry item. The txmanifest page describes distributing manifests entirely by trust
relationship — "Users and wallets must only import manifest files from appropriately trusted
sources, and not automatically accept manifest files posted online or sent to them by strangers"
— which is the opposite of a registry, and is arguably a deliberate position rather than a gap.

**There is no registry to upload to, and the docs do not claim there is.** No upload was
attempted. Per the protocol this is classified product-not-shipped rather than bad docs.

The documentation gap that *does* exist is smaller and worth fixing: a reader arrives at G8 with a
manifest in hand and no statement anywhere of **how a manifest is meant to reach a wallet**.
The txmanifest page says what a manifest is for and warns about trusting bad ones; it never says
whether distribution is "email it to your counterparty", "vendor it in your app", or "wait for a
registry". One sentence would close it. Logged as G8.-1.

---

### G9 — Request an audit from the documented Blockstream Audit Service

**Status: Product not shipped** — with a caveat I should state plainly rather than smooth over.

Searches, again without leaving the corpus:

| Term | `llms-full.txt` | `search_index.json` |
| --- | --- | --- |
| `audit service` / `Audit Service` | 0 | 0 |
| `Blockstream Audit` | 0 | 0 |
| `audit` (any sense) | 2 | 2 pages |

Both hits are the ordinary English word in the "Simplicity Compared" table — "how directly their
behavior can be **audited**", and "Security via patterns, **audits**, and tooling" as a
description of *Ethereum's* safety approach. Neither refers to a Blockstream service. The Roadmap
page has no audit item.

**The honest classification:** the corpus contains no Blockstream Audit Service. I cannot
distinguish from inside the corpus between "no such service exists" and "it exists and is
undocumented", and I deliberately did not go outside to find out, because the answer would not
change the documentation finding and would have cost the step its scoreability. The protocol
said to classify a roadmap-or-blog-only service as product-not-shipped; this one is not even that.

What a finance reader actually needed at this point, and did not get, is the adjacent question the
corpus *does* have material for and never assembles: **how do I get assurance about a contract
before I fund it?** The pieces exist and are scattered — the FAQ's "How do I prove my Simplicity
contract is correct?", the formal-semantics claims on the landing page, Simplex's integration
tests, `hal-simplicity simplicity pset run` for a dry run, the Roadmap's promised material on
"design patterns and avoiding pitfalls". There is no page that puts them in order as a
pre-deployment checklist. For the audience this site names — finance engineers, product
architects — that page is the one that decides whether a pilot gets funded. Logged as G9.-1.

---

### G10 — Migrate the contract from testnet to Liquid mainnet

**Status: Docs missing.** There is no migration page, no production checklist, and no page that
mentions mainnet other than in passing.

"mainnet" appears **four times** in the entire corpus: twice in Glossary entries, once in the
Roadmap's Unchained paragraph (about *Bitcoin* mainnet), and once on the landing page as the bare
assertion *"The tutorials on this site currently target Liquid testnet for learning purposes;
production deployments run on Liquid mainnet."* Nothing stands behind that sentence. Searches that
found nothing: `production checklist`, `going to production`, `deploy to mainnet`, `migration`.
Logged as G10.-1 (Blocker).

Here is the migration checklist, reconstructed. Each row says whether the corpus supports it.

| # | Step | Docs support |
| --- | --- | --- |
| 1 | **Address type.** Take `liquid_address_unconf` from `hal-simplicity simplicity info` instead of `liquid_testnet_address_unconf`. | **Documented** — both fields are listed on the toolchain page. Good. |
| 2 | **Signing network.** `hal-simplicity simplicity sighash` accepts `--liquid` and `-r/--elementsregtest` and `-g/--genesis-hash`. | **Partial, and a trap.** See below. |
| 3 | **Asset IDs.** | **Not documented — no asset ID appears anywhere in the corpus**, not even the L-BTC policy asset for either network. See below. |
| 4 | **Confidential assets.** | **Not documented, and consequential.** See below. |
| 5 | **Faucet removal.** Replace the `liquidtestnet.com/api/faucet` call with a real funding transaction. | Derivable, never stated. No "what changes in production" note anywhere in the Quickstart. |
| 6 | **Keys.** Replace the Quickstart's private keys 1, 2, 3. | **Documented, well.** "In a real contract these would be long random numbers, generated and held separately by each party." |
| 7 | **`MIN_DISTANCE`.** | **Documented, well.** The Quickstart states the `Distance` cap of 65535 ≈ 45 days at one block a minute, and points to a different enforcement method for longer periods. A monthly allowance (~43,200 blocks) fits; a quarterly one does not. This is exactly the kind of limit a finance reader must know before designing a product, and the docs state it unprompted. Positive finding G10.+1. |
| 8 | **Explorer / broadcast endpoints.** Change `/liquidtestnet/api` to the mainnet equivalent. | **Not documented — the mainnet Esplora URL appears nowhere in the corpus** (zero hits for `blockstream.info/liquid/`, `/liquid/api`). |
| 9 | **`COMMISSION_SCRIPT_HASH`.** | **Not documented, and the sharpest trap of all.** See below. |
| 10 | **`INTERNAL_KEY`.** The BIP-0341 unspendable internal key is network-independent. | Derivable from "the standard BIP-0341 unspendable internal key"; never stated as a migration non-issue. |

**Step 2 — signatures are network-bound, and the Quickstart never says which network it is
signing for.** The jets reference specifies `sig_all_hash()` as hashing `genesis_block_hash`
**twice**, then `tx_hash`, `tap_env_hash`, `current_index`. So a signature is cryptographically
bound to the chain's genesis block — which is reassuring (a testnet signature cannot be replayed
on mainnet) and operationally sharp (`sighash` must be told the right chain). The Quickstart
invokes `hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_HOT"` with **no network
flag at all**, on Liquid testnet; the documented flag list offers `--liquid` and
`--elementsregtest` but no testnet flag and **no statement of the default**. A reader cannot tell
how to target testnet explicitly, nor that mainnet needs `--liquid`. The facts are all present
and never joined. Logged as G10.-2.

**Step 3 — no asset IDs anywhere.** The corpus never prints a single Liquid asset ID, for either
network. It happens not to block *this* contract: the allowance covenant compares the input's
asset to each output's asset via `same_asset()` rather than to a constant, so it is asset-agnostic
and needs no change. But `state.md` explicitly advises the opposite for real applications —
"the contract should inspect the assets being transferred to confirm that they always of the
expected kinds. In most contexts, payments should not be allowed to be made with arbitrary assets"
— and a contract taking that advice must hardcode an asset ID that differs between networks, with
no documented source for either value. Logged as G10.-3.

**Step 4 — confidentiality is a mainnet problem this contract cannot dodge.** The commission
output must be explicit, because the contract reads its amount with `unwrap_right` (G2.-2).
On testnet with a faucet this is invisible. On mainnet it means **the commission destination must
publish an unconfidential address, and every commission payment is publicly visible in amount and
asset, on a chain whose headline feature is confidential transactions**. For a firm taking a
commission stream, that is a business disclosure, not a technical detail. No page anywhere
connects `unwrap_right`'s explicit-only requirement to the confidentiality cost it imposes in
production. Logged as G10.-4, and it is the finding I would raise first with a product owner.

**Step 9 — the silent one.** `hal-simplicity simplicity info` derives both
`liquid_address_unconf` and `liquid_testnet_address_unconf` from one compiled program, so the two
networks differ in address encoding, not in scriptPubKey. Therefore **`COMMISSION_SCRIPT_HASH`
is identical on testnet and mainnet**. A testnet commission destination carried into a mainnet
deployment will not error, will not look wrong, and will quietly send real money to a test key.
Every other migration step fails loudly if you forget it; this one fails silently. Logged as
G2.-7 / G10.-5.

**What I still could not decide at G10:** whether Simplicity is actually activated on Liquid
mainnet today. The Glossary says Liquid is "the first blockchain to have native support for
Simplicity" and that examples "assume that a program is running on the Liquid mainnet or Liquid
testnet", but no page states an activation height, a release, or a date. For a firm deciding
whether to start a pilot this is the first question, and the corpus does not answer it. Logged as
G10.-6.

### G11 — Can the same contract run in Liquid / a Simplicity-enabled Bitcoin testnet / Bitcoin mainnet via Unchained?

**Status: Docs partial.** Three environments, three different answers, and the corpus supports a
confident classification for each — which is more than it managed for several earlier goals.

#### (a) Liquid — testnet and mainnet

| Environment | Classification | Evidence |
| --- | --- | --- |
| Liquid testnet | **Supported** | The entire Quickstart runs on it, with a live faucet and named endpoints. Directly demonstrated. |
| Liquid mainnet | **Supported, asserted but undemonstrated** | Glossary: Liquid is "the first blockchain to have native support for Simplicity", and "Most Simplicity examples as of 2026 assume that a program is running on the Liquid mainnet or Liquid testnet". Landing page: "production deployments run on Liquid mainnet". `hal-simplicity` emits mainnet addresses and has a `--liquid` mode. |

The mainnet classification deserves the qualifier. Support is asserted three times and
demonstrated zero times: no activation height, no version, no date, no mainnet endpoint, no worked
example, no migration page (G10.-1, G10.-6). The jets reference is scoped as "the available jets
in the Elements Simplicity integration **on Liquid Network**", which reads as covering both. I
classify it Supported because the docs say so plainly and consistently, while noting I could not
verify it and neither could any other reader.

The contract itself is portable between the two without source changes: it hardcodes no asset ID
and no address. What changes is entirely outside the `.simf` — see the G10 checklist.

#### (b) A Simplicity-enabled Bitcoin testnet

**Classification: Prototype / in progress.** Not "not documented" — the corpus names it precisely,
once, on the Roadmap:

> An integration of Simplicity in [Mutinynet](https://github.com/MutinyWallet/mutiny-net), a
> signet (test network) that remains architecturally closer to Bitcoin Core, **is in progress**.
> This will demonstrate the potential for development with Simplicity on a Bitcoin-like chain
> without Elements extensions.

That is one sentence on a roadmap page, and it is enough to classify but not to plan against.
**This contract would not survive the move regardless of integration status**, and the reason is
structural rather than incidental — the docs give a reader everything needed to work this out,
without ever saying it:

* `jet::output_is_fee(2)` exists because "Elements has explicit fee outputs" (landing-page
  annotation 5). Bitcoin has no fee output; fees are the input/output difference. `recursive_covenant()`
  asserts the fee output exists, so it fails by construction.
* `Asset1` / `Amount1` and the whole `same_asset()` check presuppose Elements' multi-asset,
  optionally-confidential value model. Bitcoin has one asset and no blinding, so
  `unwrap_right::<(u1,u256)>` has nothing to unwrap.
* `jet::num_outputs() == 3` (or 4) counts a fee output that would not be there.

The phrase "**without Elements extensions**" in the Roadmap sentence is the tell, and a reader who
notices it can derive all of the above. But nothing in the corpus states the practical
consequence: **contracts written against the Liquid jet set are not portable to a Bitcoin-like
chain, and the Elements-specific dependencies are not marked as such anywhere.** The jets
reference is a single undifferentiated list with no portability column. Logged as G11.-1.

#### (c) Bitcoin mainnet via a "Simplicity Unchained cosigner"

**Classification: Not documented as described — and the description in the question is not the
docs' model.** Two separate findings here, and the second is the important one.

First, maturity. "Unchained" appears three times: a bullet on the Use Cases overview ("Bitcoin
native smart contracts via Simplicity Unchained", under a heading of things Simplicity "is
**expected** to support"), a Roadmap section, and the Roadmap's own cross-reference. The Roadmap
text is future tense throughout: Unchained "**will offer** Simplicity scripting support". No
repository, no spec, no API, no example, no date. **Product not shipped.**

Second, and this is the part worth flagging: **the word "cosigner" does not appear in the corpus
at all — zero occurrences.** The docs describe something materially different from a cosigner:

> an **oracle-based Simplicity interpreter** called Simplicity Unchained will offer Simplicity
> scripting support. **The oracle can make statements confirming when contract conditions
> (expressed in Simplicity programs) have been met** and thereby approve transactions permitted by
> those conditions. This **indirectly** brings the power and determinism of Simplicity scripting
> to other chains.

An oracle attesting that conditions were met, and a cosigner holding a key in a multisig, are
different trust models with different failure modes — and for a finance firm, the difference
between them is the entire risk assessment. The protocol's own instruction, "Do not assume Bitcoin
mainnet native Simplicity exists", is correct and the docs are honest on that point: they say
plainly that native integration "isn't present" on Bitcoin mainnet and that Unchained is an
indirect workaround. Credit where due — that is an easy claim to fudge and the corpus does not
fudge it. Positive finding G11.+1.

But the corpus gives **one paragraph** on the mechanism and nothing on the trust model: who runs
the oracle, whether it is federated or single-party, what happens if it lies or goes offline,
whether a user can verify its attestation. A firm cannot evaluate counterparty risk from this.
Logged as G11.-2.

**This contract on Unchained:** the (b) analysis applies with more force. The contract is built on
Elements fee outputs, Elements assets, and Elements confidentiality. Nothing suggests an oracle
attesting to Simplicity conditions would supply a Bitcoin transaction with an `output_is_fee` to
introspect.

#### Summary table

| Environment | Classification | Would *this* contract run? |
| --- | --- | --- |
| Liquid testnet | Supported (demonstrated) | Yes — modulo G2.-4 |
| Liquid mainnet | Supported (asserted, never demonstrated) | Yes in principle; migration undocumented (G10) |
| Simplicity-enabled Bitcoin testnet (Mutinynet) | Prototype / in progress | **No** — Elements fee outputs and asset model are load-bearing |
| Bitcoin mainnet via Unchained | Product not shipped; and the docs' model is an **oracle**, not a cosigner | **No**, and the trust model is undocumented |

**What I still could not decide at G11:** whether Simplicity is live on Liquid mainnet today;
which jets are Elements-specific versus portable; and anything at all about Unchained's trust
model or timeline.

---

## 2. Documentation Audit Log

Field names follow the required schema exactly. `corpus` is one of `official` (a page on
docs.simplicity-lang.org), `official-linked-repo` (a repository or site linked from an official
page as the source of a contract, tool, or example), or `left-corpus`. **No row in this audit is
`left-corpus`** — see §6.

Positive findings (`G#.+#`) are interleaved so the report can be prioritized rather than only
complained at.

### G1 — Allowance covenant

---
- **id:** G1.-1
- **topic_component:** Allowance covenant example
- **doc_page_url:** https://docs.simplicity-lang.org/
- **corpus:** official
- **gap_friction:** The Allowance covenant exists in exactly one place on the site — a landing-page marketing section — with no filename, no `.simf` source file, no repository link, and no nav entry. It is absent from `llms.txt` and `llms-full.txt`.
- **expected_by_reader:** A named, linkable, downloadable contract I can put in a repo, diff against upstream, and cite in a design document. Every other contract on the site has one (`last_will.simf`, `htlc.simf`, `p2pk.simf`).
- **attempted_resolution:** Searched `llms-full.txt` for `allowance` (0 hits). Queried `search/search_index.json` across all 475 indexed sections (1 hit, the landing page). Checked whether the linked `SimplicityHL/examples` directory is referenced for it (it is not).
- **evidence:** Fence caption is `title="Allowance Covenant"` — a prose title, not a path. Site search index returns one location: `#write-in-a-language-you-already-know`.
- **severity:** Major friction
- **suggested_fix:** Add `docs/examples/allowance.simf` (or upstream it to `SimplicityHL/examples`) and link the landing-page fence to it, the way the Covenants page links `last_will.simf`.
- **duplicated_with:** none

---
- **id:** G1.-2
- **topic_component:** llms.txt corpus completeness
- **doc_page_url:** https://docs.simplicity-lang.org/llms-full.txt
- **corpus:** official
- **gap_friction:** `llms-full.txt` omits the landing page entirely. It begins with the Try-it page. The flagship covenant, the "what does Simplicity look like" pitch, and the annotated explanations of covenant/confidentiality semantics are therefore invisible to any consumer of the machine-readable corpus.
- **expected_by_reader:** `llms-full.txt` advertises itself as "all content in a single file". A reader (or an agent) relying on it to answer "show me a covenant example" gets nothing.
- **attempted_resolution:** Diffed the `# ` page boundaries in `llms-full.txt` against `llms.txt`; fetched `/index.md` separately to recover the content.
- **evidence:** `llms.txt`: "For all content in a single file, see Simplicity full docs". First page in `llms-full.txt` is "Try it in your browser"; `grep -c allowance llms-full.txt` → 0.
- **severity:** Major friction
- **suggested_fix:** Include the landing page as the first entry in `llms.txt` and `llms-full.txt`.
- **duplicated_with:** none

---
- **id:** G1.-3
- **topic_component:** `.args` / compile-time parameters
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/ (only occurrence of the format)
- **corpus:** official
- **gap_friction:** There is no reference page for `.args` files, and no parameter types or units are declared for the allowance contract. Worse, the units contradict across the same page: contract-side amounts are satoshis (`jet::current_amount()`), tool-side amounts are whole LBTC (`hal-simplicity` wants `0.00099900`).
- **expected_by_reader:** The same treatment `.wit` gets — a reference page stating types, whether explicit `{"value","type"}` annotations are allowed, whether unknown keys error, and what unit an amount parameter is in.
- **attempted_resolution:** Read the `.wit` File Reference in full looking for a parallel `.args` section; searched `llms-full.txt` for `.args`, `arguments file`, `ARGUMENTS_FILE`. The only substantive occurrence is one Quickstart code block.
- **evidence:** `.wit` reference is ~230 lines with a types table and annotation syntax. `.args` gets: "Now write out the `.args` file substituting these values into the contract's parameters". Quickstart: "`hal-simplicity` expects an amount in LBTC".
- **severity:** Major friction
- **suggested_fix:** Add an `.args` File Reference beside the `.wit` reference, with a warn-box stating that contract-side amounts are satoshis while `hal-simplicity` amounts are LBTC.
- **duplicated_with:** none

---
- **id:** G1.-4
- **topic_component:** Confidential funding warning
- **doc_page_url:** https://docs.simplicity-lang.org/
- **corpus:** official
- **gap_friction:** The most severe warning attached to the contract — funds sent confidentially are permanently unspendable — is delivered as numbered code annotation 3, not as a `!!! warning` admonition, and sits on a landing-page marketing section.
- **expected_by_reader:** A visually distinct warn-box. The contributing standard for this site asks for "⚠" notes on foot-guns and security pitfalls; permanent loss of funds is the canonical case.
- **attempted_resolution:** Checked whether the warning is repeated on the Covenants, Witnesses, or Quickstart pages. It is not.
- **evidence:** Annotation 3: "A confidential output sent to this contract can therefore never be spent, and its funds would be stuck permanently."
- **severity:** Major friction
- **suggested_fix:** Promote to an admonition immediately above the fence, and repeat it on any page describing funding a covenant.
- **duplicated_with:** none

---
- **id:** G1.-5
- **topic_component:** llms.txt corpus hygiene
- **doc_page_url:** https://docs.simplicity-lang.org/llms-full.txt
- **corpus:** official
- **gap_friction:** The Simplex page is included **twice**, byte-identically (lines 550–628 and 1613–1689), because `llms.txt` lists it under both "Get Started" and "Learn". ~80 duplicated lines.
- **expected_by_reader:** Each page once.
- **attempted_resolution:** Listed all `# ` page boundaries; diffed the two regions.
- **evidence:** `grep -n '^# Simplex' llms-full.txt` → lines 550 and 1613.
- **severity:** Duplication
- **suggested_fix:** De-duplicate by URL when generating `llms-full.txt`; a page listed in two nav sections should still be emitted once.
- **duplicated_with:** https://docs.simplicity-lang.org/documentation/simplex.md (itself)

---
- **id:** G1.-6
- **topic_component:** llms.txt corpus hygiene
- **doc_page_url:** https://docs.simplicity-lang.org/llms-full.txt
- **corpus:** official
- **gap_friction:** Eight raw HTML comments survive into the published machine-readable corpus, including an internal editorial note and two build-provenance stamps.
- **expected_by_reader:** Published output free of in-progress editorial state.
- **attempted_resolution:** `grep -n '<!--' llms-full.txt` → 8 hits.
- **evidence:** Line 1234: "Let's figure out a clearer way to talk about this issue, as we don't have a concrete example relevant to it here…". Lines 619/1682: the commented-out `examples/last_will` bullet. Line 3426: "Generated from elements.json by jets.md.py on 2026-04-06".
- **severity:** Minor friction
- **suggested_fix:** Strip HTML comments when generating `llms-full.txt`.
- **duplicated_with:** none

---
- **id:** G1.+1 (positive)
- **topic_component:** Allowance covenant annotations
- **doc_page_url:** https://docs.simplicity-lang.org/
- **corpus:** official
- **gap_friction:** — (this unblocked me)
- **expected_by_reader:** —
- **attempted_resolution:** —
- **evidence:** The ten numbered annotations are the best technical writing in the corpus. Annotation 6 explains `param::` at the exact point of confusion; annotation 2 names the free-asset-issuance attack and explains why the same-asset check is fused to the amount read; annotation 8 explains the single-input restriction, the attack it prevents, *and* its consequence for fees; annotation 7 explains why arithmetic returns a borrow flag. Annotations 2 and 8 directly determined two of my five G2 decisions.
- **severity:** —
- **suggested_fix:** Use this annotation style as the house pattern for every contract on the site; it is the site's strongest asset and appears on only one page.
- **duplicated_with:** none

### G2 — Adding a commission

---
- **id:** G2.-1
- **topic_component:** `hal-simplicity simplicity pset create`
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/ vs https://docs.simplicity-lang.org/getting-started/quickstart/
- **corpus:** official
- **gap_friction:** Two official pages give incompatible argument shapes for the same command, and each demonstrates a capability the other omits. Neither page shows both.
- **expected_by_reader:** One syntax that works, or a version note saying which release changed it.
- **attempted_resolution:** Compared both pages line by line; checked for a version/changelog note on either (none). Implemented neither silently; chose the Quickstart form for G4 because the input `sequence` is mandatory for this contract, and said so in the artifact.
- **evidence:** Toolchain: `[{"address": "<addr>", "asset": "<assetid>", "amount": <amt>}, {"fee": <feeamt>}]`. Quickstart: `'[ { "'"$CONTRACT_ADDRESS"'": 0.00099900 }, { "fee": 0.00000100 } ]'`. Toolchain inputs document only `txid`/`vout`; Quickstart passes `"sequence"` too.
- **severity:** Contradiction
- **suggested_fix:** Pick one form, fix the other page, document the input `sequence` field on the toolchain reference, and pin the version the syntax applies to.
- **duplicated_with:** the two URLs above

---
- **id:** G2.-2
- **topic_component:** Confidential amounts on inspected outputs
- **doc_page_url:** https://docs.simplicity-lang.org/ (annotation 3) and https://docs.simplicity-lang.org/glossary/#confidential
- **corpus:** official
- **gap_friction:** The corpus states both halves — a confidential address carries a blinding key; `unwrap_right` panics on a confidential value — and joins them only for *funding* the contract. It never says that any output the covenant *inspects* must also be explicit, so the destination must be an unconfidential address.
- **expected_by_reader:** A rule of the form "any output your contract reads the amount or asset of must be paid to an unconfidential address."
- **attempted_resolution:** Read the Glossary entries for Confidential/Unconfidential and all of annotation 3; searched `llms-full.txt` for `confidential` (30 hits, none stating this).
- **evidence:** Annotation 3 draws the conclusion only for outputs "sent to this contract". Glossary Confidential: "the transaction must be sent to a 'confidential address' which includes a cryptographic blinding key."
- **severity:** Major friction
- **suggested_fix:** Add the general rule to the Covenants page and to the jets reference entries for `output_amount` / `output_asset`.
- **duplicated_with:** none

---
- **id:** G2.-3
- **topic_component:** Allowance covenant — `full_withdrawal` path
- **doc_page_url:** https://docs.simplicity-lang.org/
- **corpus:** official
- **gap_friction:** On the `full_withdrawal() == true` branch the contract enforces **no output constraints at all** — no `num_outputs`, no fee check, nothing. The page never mentions this asymmetry, and the Mermaid diagram presents the two branches as symmetric alternatives.
- **expected_by_reader:** An explicit statement that the terminal path deliberately drops covenant enforcement, because anyone extending the contract (adding a commission, a cap, a destination restriction) must extend both branches.
- **attempted_resolution:** Read the source and the diagram; searched the page and the Covenants page for any note on the terminal path.
- **evidence:** `match full_withdrawal() { true => (), false => partial_withdrawal() }` — the `true` arm is the unit expression.
- **severity:** Major friction
- **suggested_fix:** Add annotation 11 on the `match` explaining that the terminal path intentionally enforces nothing further, and warning that extensions must cover both arms.
- **duplicated_with:** none

---
- **id:** G2.-4
- **topic_component:** `jet::output_script_hash` / binding a destination
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/jets/
- **corpus:** official
- **gap_friction:** The jet compares against SHA256(scriptPubKey), and **no page documents how to obtain that value for a chosen Liquid address**. Without it a covenant cannot bind any payment destination — the most ordinary requirement a financial contract has.
- **expected_by_reader:** A one-line recipe: address → scriptPubKey → SHA256, with the command that does it.
- **attempted_resolution:** Read the full `hal-simplicity` section (it derives addresses *from* programs; no inverse subcommand documented). Searched `llms-full.txt` for `scriptpubkey` (7 hits — 2 are `jq` on an Esplora response for an already-funded UTXO, 5 are jet descriptions), `script hash`, `address inspect`, `decode address`, `hal-elements address`. The toolchain page says `hal-simplicity` "also includes the subcommands from `hal-elements`" but documents none of them.
- **evidence:** `output_script_hash(u32) -> Option<u256>` — "Return the SHA256 hash of the scriptPubKey of the output at the given index."
- **severity:** Blocker
- **suggested_fix:** Add a worked "bind a payment to a fixed destination" recipe showing how to compute the script hash for an address, and document the `hal-elements` subcommands that `hal-simplicity` inherits.
- **duplicated_with:** none

---
- **id:** G2.-5
- **topic_component:** `hal-simplicity` inherited subcommands
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** "`hal-simplicity` is based on `hal-elements` and also includes the subcommands from `hal-elements`" — and then documents only the three Simplicity-specific ones. A reader cannot discover what else the tool can do without leaving the corpus.
- **expected_by_reader:** At least a list of inherited subcommand names, or a link to their reference.
- **attempted_resolution:** Searched for any enumeration of `hal-elements` subcommands in the corpus (none). The page links the `hal-simplicity` README on GitHub for "some additional information and sample invocations".
- **evidence:** "The `hal-simplicity` subcommands that differ from `hal-elements` are `hal-simplicity simplicity info`, `… pset`, and `… sighash`."
- **severity:** Major friction
- **suggested_fix:** Inline the inherited subcommand list (even just names and one-liners), since one of them is very likely the answer to G2.-4.
- **duplicated_with:** none

---
- **id:** G2.-6
- **topic_component:** Covenant design pitfalls
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** No page discusses covenant self-lock / dust traps: a covenant whose own rules become unsatisfiable once the balance drops below the sum of its mandatory outputs, permanently freezing the UTXO. Adding any mandatory output (a commission) creates one.
- **expected_by_reader:** A pitfalls page. The Roadmap promises one — "significant new and updated documentation is in preparation, including material on design patterns and avoiding pitfalls in smart contract design" — but it does not exist yet.
- **attempted_resolution:** Searched `llms-full.txt` for `dust` (0), `self-lock` (0), `fee donation` (0), `pitfall` (1 — the Roadmap's future-tense promise), `unspendable` (4 — all the Taproot "unspendable internal key"), `stuck` (4 — three are "if you get stuck in this tutorial"). The nearest real hit is the Execution Model page's remark that a timeout branch "prevents assets from being stuck inside the contract if some party fails to perform its role", which gestures at the right idea in general terms but is not about a covenant whose own arithmetic becomes unsatisfiable.
- **evidence:** Roadmap → Documentation updates: "material on design patterns and avoiding pitfalls in smart contract design" (future tense).
- **severity:** Major friction
- **suggested_fix:** Ship the promised pitfalls page; lead with (1) confidential funding, (2) dust self-lock, (3) unconstrained output paths, (4) fee donation.
- **duplicated_with:** none

---
- **id:** G2.-7
- **topic_component:** Script hash is network-independent
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** A destination bound by script hash is identical on testnet and mainnet. A testnet commission address carried into production fails **silently** — no error, nothing visibly wrong, real money to a test key.
- **expected_by_reader:** A warning wherever script-hash binding is described, and in a migration checklist.
- **attempted_resolution:** Inferred from `hal-simplicity simplicity info` emitting both `liquid_address_unconf` and `liquid_testnet_address_unconf` from one program. Searched for any statement of this (none).
- **evidence:** Both address fields are listed as outputs of the same command on the same compiled program.
- **severity:** Blocker
- **suggested_fix:** Warn-box on the jets reference entry for `output_script_hash`, and a row in the (missing) migration checklist.
- **duplicated_with:** none

---
- **id:** G2.-8
- **topic_component:** Proportional / percentage amounts
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/stdlib/
- **corpus:** official
- **gap_friction:** The primitives for basis-point math exist and are well documented, but live in the **stdlib** reference while the reader is on the **jets** reference, where `multiply_64` returns a `u128` that no jet can divide. No worked example of proportional fee logic exists anywhere, and reaching the stdlib requires adopting Simplex (`simplex install std`).
- **expected_by_reader:** A "percentage fee" recipe. It is the first thing a finance engineer asks for.
- **attempted_resolution:** Searched jets for `multiply_64`/`divide_64`; found the `u128` mismatch; then found `mul_128_64`, `div_mod_128_64`, `div_128`, `safe_u128_to_u64` in the stdlib.
- **evidence:** jets: `multiply_64(u64, u64) -> u128`, `divide_64(u64, u64) -> u64`. stdlib: `mul_128_64(u128, u64) -> u256`, `safe_u128_to_u64(u128) -> u64`.
- **severity:** Minor friction
- **suggested_fix:** Add a short "basis-point fee" example to the stdlib page, and cross-link from the jets arithmetic section to the stdlib's wide-arithmetic helpers.
- **duplicated_with:** none

---
- **id:** G2.-9
- **topic_component:** `hal-simplicity simplicity pset update-input` `-s` flag
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/state/ vs https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** The State page says `update-input` "has also been updated with a `-s` flag that provides an input state value to the program". The toolchain reference's syntax for `update-input` has no `-s` — only `-i`, `-c`, `-p`. (`-s` is documented on `simplicity info`, a different subcommand.)
- **expected_by_reader:** One place that lists the flags a subcommand accepts.
- **attempted_resolution:** Compared both pages; searched for any other `update-input` syntax block.
- **evidence:** Toolchain: `hal-simplicity simplicity pset update-input <pset> <inputindex> -i <hex>:<asset>:<value> -c <cmr> -p <internalkey>`.
- **severity:** Contradiction
- **suggested_fix:** Add `-s` to the toolchain reference's `update-input` syntax, or correct the State page.
- **duplicated_with:** the two URLs above

---
- **id:** G2.+1 (positive)
- **topic_component:** Fee outputs on Elements
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/jets/ + landing-page annotation 5 + toolchain `pset create`
- **corpus:** official
- **evidence:** Three independent places make the extra-output-vs-fee-output decision unambiguous: `output_is_fee` is a classification of an output; annotation 5 explains *why* Elements has explicit fee outputs; and the toolchain page states "Network fees are currently always automatically paid in LBTC", which independently rules out a fee output carrying a non-LBTC commission.
- **severity:** —
- **suggested_fix:** Keep. This is what good coverage looks like: a decision confirmable from three angles.
- **duplicated_with:** none

---
- **id:** G2.+2 (positive)
- **topic_component:** Same-asset checking
- **doc_page_url:** https://docs.simplicity-lang.org/ (annotation 2)
- **corpus:** official
- **evidence:** "anyone can issue a new Liquid asset carrying any amount at no cost, so an amount check on its own can be satisfied with a worthless asset. Returning the amounts from the same function that checks the assets means the amounts can't be read without the check happening." This names the attack, explains the mitigation, and explains why the mitigation is structured as it is. It determined the design of `enforce_commission()` directly and supplied one of the five G3 test cases.
- **severity:** —
- **suggested_fix:** Promote this reasoning to a general security page; it applies to every multi-asset contract, not just this one.
- **duplicated_with:** none

### G3 — Simplex testing

---
- **id:** G3.-1
- **topic_component:** Simplex testing
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/simplex/
- **corpus:** official
- **gap_friction:** The page's entire specification of how to write a test is a function signature with the body `// Test code goes here.` No `TestContext` method, no type, no builder, no assertion helper is documented anywhere on the site.
- **expected_by_reader:** An API reference, or at minimum a narrated walkthrough of one real test: fund an address, read a UTXO, add outputs, sign, broadcast, assert failure.
- **attempted_resolution:** Searched `llms-full.txt` for `TestContext`, `FinalTransaction`, `PartialOutput`, `add_output`, `broadcast`, `get_default_signer`, `mine`, `generatetoaddress`, `regtest block` — all 0. Followed the page's "Examples" link to `BlockstreamResearch/smplx/examples` and reconstructed the entire API from `basic_test.rs`, `confidential_test.rs`, `Simplex.toml`, `p2pk.simf`, `README.md`.
- **evidence:** The complete documented API: ```rust\n#[simplex::test]\nfn test_name(context: simplex::TestContext) -> anyhow::Result<()> {\n    // Test code goes here.\n    Ok(())\n}\n```
- **severity:** Blocker
- **suggested_fix:** Add a Simplex testing reference covering `TestContext`, `Signer`, `Provider`, `FinalTransaction`, `PartialInput`/`PartialOutput`, `ProgramInput`, `RequiredSignature`, `TxReceipt` — or link the generated rustdoc from this page.
- **duplicated_with:** none

---
- **id:** G3.-2
- **topic_component:** Simplex testing — negative paths
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/simplex/
- **corpus:** official
- **gap_friction:** Four of the five tests the protocol asks for are failure cases, and nothing states how a Simplicity assertion failure surfaces (build time? sign time? broadcast?) or what the error text is.
- **expected_by_reader:** Per the contributing standard's own Errors rule — "document the specific error messages or codes it can produce, alongside their cause and fix. Readers often search the exact error text."
- **attempted_resolution:** Searched for error strings in the corpus. The only concrete one is `non-BIP68-final` (Quickstart step 6), which is a *consensus* rejection, not a Simplicity assertion failure.
- **evidence:** No error text for a failed Simplicity assertion appears anywhere in the corpus.
- **severity:** Major friction
- **suggested_fix:** Document the failure taxonomy with real strings — contract assertion failure, witness type mismatch, consensus rejection — and show a negative test asserting on each.
- **duplicated_with:** none

---
- **id:** G3.-3
- **topic_component:** Simplex generated artifacts
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/simplex/
- **corpus:** official
- **gap_friction:** The code-generation contract — how a `.simf` filename and its `param::`/`witness::` names map to generated Rust types and fields — is the core of the framework and is documented nowhere. It is inferable from exactly one example.
- **expected_by_reader:** A naming-convention table: file → module and `XProgram`; `param::FOO` → `XArguments { foo }`; `witness::BAR` → `XWitness`.
- **attempted_resolution:** Read `simf/p2pk.simf` (`param::PUBLIC_KEY`) against `basic_test.rs` (`P2pkArguments { public_key: … }`) in the linked repo and generalized from that single data point.
- **evidence:** Page says only: `simplex build` "creates corresponding Rust library files in `src/artifacts`".
- **severity:** Major friction
- **suggested_fix:** Add the naming-convention table with one worked `.simf` → generated-API example.
- **duplicated_with:** none

---
- **id:** G3.-4
- **topic_component:** Simplex examples
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/simplex/
- **corpus:** official
- **gap_friction:** The only covenant example is **commented out** in the published Markdown, so the corpus has zero examples of testing the contract class the rest of the site promotes. The raw comment is visible in `llms-full.txt`.
- **expected_by_reader:** A covenant example — recursive covenant, timelock, multi-output — since that is the shape of every non-trivial contract on the site.
- **attempted_resolution:** Verified against the linked repo that `examples/` contains only `basic`, so the comment is honest rather than stale; the example does not exist.
- **evidence:** `<!-- * \`examples/last_will\` (demonstrates a recursive covenant with a timeout-based inheritance mechanism, called \`last_will.simf\`) -->`
- **severity:** Major friction
- **suggested_fix:** Ship `examples/last_will` (the txmanifest book already has a working parameterized `last_will.simf` that could seed it) and uncomment the bullet.
- **duplicated_with:** none

---
- **id:** G3.+1 (positive)
- **topic_component:** Simplex project model
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/simplex/
- **corpus:** official
- **evidence:** Project layout, `simplex init/build/test/regtest`, `Simplex.toml`, and the persistent-regtest workflow are all clear and correct. Crucially it states that tests run "against a local instance of `elementsd`… without broadcasting transactions publicly on Liquid testnet" — exactly the reassurance a finance reader needs before putting a strategy in a test file.
- **severity:** —
- **suggested_fix:** Keep; extend with the API reference from G3.-1.
- **duplicated_with:** none

---
- **id:** G3.+2 (positive)
- **topic_component:** Contract-vs-consensus timelock split
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/ + https://docs.simplicity-lang.org/documentation/timelocks/
- **corpus:** official
- **evidence:** "the contract's own check only compares against the *declared* distance. The broadcast, though, should fail with something like `non-BIP68-final`: the node independently checks how many blocks have *actually* passed". Naming a real rejection string and explaining a two-layer enforcement model by making the reader watch it fail is excellent teaching, and it determined the structure of my too-soon-withdrawal test (split into 3a contract-rejects and 3b consensus-rejects).
- **severity:** —
- **suggested_fix:** Use this failure-first pattern elsewhere, especially for the missing Simplicity-assertion error taxonomy (G3.-2).
- **duplicated_with:** none

### G4 — Testnet deployment

---
- **id:** G4.-1
- **topic_component:** PSET construction for multi-output covenants
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** Same contradiction as G2.-1, encountered again when it actually blocks work: the form with `asset` and the form with input `sequence` are different forms, and a covenant with both a timelock and a non-LBTC output needs both.
- **expected_by_reader:** One documented syntax that can express a four-output spend with a relative timelock.
- **attempted_resolution:** Used the Quickstart form and documented the choice in the artifact.
- **evidence:** See G2.-1.
- **severity:** Contradiction
- **suggested_fix:** Reconcile, and add a worked multi-output covenant spend to the toolchain page.
- **duplicated_with:** https://docs.simplicity-lang.org/getting-started/quickstart/

---
- **id:** G4.-2
- **topic_component:** `pset create` output ordering
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** Nothing states whether `pset create` preserves the order of the outputs array. Every covenant on this site pins output indices (`output_script_hash(0)`, `output_is_fee(n)`), so order preservation is a correctness precondition — and output shuffling is a common privacy default in Bitcoin tooling.
- **expected_by_reader:** An explicit guarantee, or a documented way to pin an index.
- **attempted_resolution:** Read the `pset create` section in full; searched for `order`, `index`, `shuffle`, `randomize`.
- **evidence:** "The second argument is a JSON string consisting of a list of JSON objects mapping destination addresses to assets and amounts" — no ordering statement.
- **severity:** Major friction
- **suggested_fix:** State the guarantee explicitly on the toolchain page, and note it wherever `output_script_hash(0)` is used.
- **duplicated_with:** none

---
- **id:** G4.-3
- **topic_component:** `simc -Z` unstable features
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** `-Z, --unstable-feature <FEATURE>` is listed with no accepted values, and no page maps language features to the flags they need. The Quickstart passes `-Z enums` and explains why for that contract only.
- **expected_by_reader:** A table of `-Z` values, what each enables, and stability status.
- **attempted_resolution:** Searched for `-Z`, `unstable`, `enums` across the corpus; only the Quickstart's one-off explanation exists.
- **evidence:** Quickstart: "(This contract uses SimplicityHL's `enum` feature, which is still experimental. Compiling it requires passing `-Z enums` to `simc`.)"
- **severity:** Minor friction
- **suggested_fix:** Add a `-Z` values table to the toolchain reference.
- **duplicated_with:** none

---
- **id:** G4.-4
- **topic_component:** Guaranteeing explicit funding
- **doc_page_url:** https://docs.simplicity-lang.org/
- **corpus:** official
- **gap_friction:** The contract warns that confidential funding loses the money permanently, and never tells a funder how to comply. The reassuring answer (contract addresses are always unconfidential, so a blinded output is impossible) is inferable but never stated.
- **expected_by_reader:** "You cannot get this wrong, because X" — or, if you can get it wrong, how to check.
- **attempted_resolution:** Read `hal-simplicity simplicity info`'s output fields (`*_address_unconf` only) and the Glossary's Confidential/Unconfidential entries, and assembled the reassurance myself.
- **evidence:** Annotation 3 states the loss; no page states the mitigation.
- **severity:** Minor friction
- **suggested_fix:** One sentence next to the warning: contract addresses are derived in unconfidential form, so payments to them are necessarily explicit.
- **duplicated_with:** none

---
- **id:** G4.-5
- **topic_component:** Esplora host choice
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/
- **corpus:** official
- **gap_friction:** The same tutorial fetches transaction data from `liquid.network` but broadcasts to and polls status from `blockstream.info`, with no explanation. An implementer cannot tell which host is canonical or why it switches.
- **expected_by_reader:** One host, or a sentence explaining the split.
- **attempted_resolution:** Compared every `curl` in the bash tab; checked the Ecosystem page, which names Esplora generically and links its GitHub repo rather than any instance.
- **evidence:** Step 4: `curl https://liquid.network/liquidtestnet/api/tx/$FAUCET_TXID`. Step 4 (broadcast): `curl -X POST "https://blockstream.info/liquidtestnet/api/tx"`.
- **severity:** Minor friction
- **suggested_fix:** Use one host throughout, or add a note on why two.
- **duplicated_with:** none

---
- **id:** G4.-6
- **topic_component:** `hal-simplicity simplicity pset run`
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** The one command that turns "my spend was rejected" into a jet-by-jet trace gets a single paragraph, no worked example, and no mention in the Quickstart — which instead walks the reader through a failing broadcast without suggesting it could have been diagnosed locally first.
- **expected_by_reader:** This command featured in the Quickstart, with real output, as the standard debugging step before broadcasting.
- **attempted_resolution:** Searched for `pset run` elsewhere in the corpus (only the toolchain paragraph).
- **evidence:** "You can see whether the transaction succeeds and some the details of individual jet invocations, their inputs, and their outputs." (Note also the typo "and some the details".)
- **severity:** Major friction
- **suggested_fix:** Add a worked `pset run` example with real output to the Quickstart, before the broadcast step. Highest value-per-word fix in this report.
- **duplicated_with:** none

---
- **id:** G4.-7
- **topic_component:** Toolchain worked example
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** The toolchain page's link to "a complete worked example of the actions above, both commit-time and redeem-time" points at `../getting-started/bash-quickstart.md`, which **404s**.
- **expected_by_reader:** The worked example, or a link to the Quickstart's bash/CLI tab, which is presumably its replacement.
- **attempted_resolution:** Requested both `https://docs.simplicity-lang.org/getting-started/bash-quickstart/` and `…/bash-quickstart.md` — both HTTP 404.
- **evidence:** "You can see a complete worked example of the actions above… in the old [bash quickstart](../getting-started/bash-quickstart.md), which is no longer suggested for most beginning users."
- **severity:** Dead link
- **suggested_fix:** Repoint to `https://docs.simplicity-lang.org/getting-started/quickstart/#__tabbed_1_2` (the bash/CLI tab) and drop the "old"/"no longer suggested" framing, which now describes a page that does not exist.
- **duplicated_with:** none

---
- **id:** G4.+1 (positive)
- **topic_component:** Quickstart
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/
- **corpus:** official
- **evidence:** A complete, copy-pasteable testnet round trip in two independent tabs (Rust driver and raw bash), which deliberately fails before it succeeds, explains its own satoshi→LBTC arithmetic digit by digit, and explains why waiting for confirmation matters ("a relative timelock's clock starts at the confirming block, not at broadcast time"). This is the page that makes the site usable.
- **severity:** —
- **suggested_fix:** Make it the model for a second Quickstart built on the allowance covenant, which would close G1.-1, G2.-4 and G4.-2 at once.
- **duplicated_with:** none

---
- **id:** G4.+2 (positive)
- **topic_component:** `.wit` signature format
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **evidence:** "Note that the version of the signature used in a `.wit` must begin with `0x` before the hexadecimal signature." A tiny, exact detail that would otherwise cost an afternoon of debugging.
- **severity:** —
- **suggested_fix:** More of this.
- **duplicated_with:** none

---
- **id:** G4.+3 (positive)
- **topic_component:** Endpoint freshness
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/
- **corpus:** official
- **evidence:** Every documented network endpoint responded on 2026-09-23: the two Esplora hosts (200), the faucet host (200), the community forum (200), the Simplex install host (301→resolves). No funds were requested. Documented URLs rotting is the most common failure mode in tutorials of this kind and it has not happened here.
- **severity:** —
- **suggested_fix:** Keep whatever link-checking is in place.
- **duplicated_with:** none

### G5 — Wallet / UI

---
- **id:** G5.-1
- **topic_component:** Humid integration
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** "Humid" does not appear anywhere in the official corpus. A requirement to "sign and submit via their own Humid wallet" is unimplementable and unrecognizable from inside the docs; a reader cannot even determine whether Humid is a wallet, a library, or a misremembered name.
- **expected_by_reader:** If Humid is a real part of the Simplicity wallet story, a page naming it, saying what it is, and linking it. If it is not, nothing — but then the ecosystem page should be explicit about which wallets actually exist today.
- **attempted_resolution:** `grep -c -i humid llms-full.txt` → 0. Searched `search_index.json` across all 475 sections → 0. Read the Ecosystem page's "Wallet connection mechanisms" section in full, which names Blockstream Jade, the Blockstream App and "other wallet applications" and never mentions Humid. Did not leave the corpus to look for it.
- **evidence:** "no page found"
- **severity:** Blocker
- **suggested_fix:** Add a "which wallets can sign a Simplicity transaction today" table to the Ecosystem page, listing each wallet, its status (shipping / lightly-customized demo build / planned), and a link. Name Humid there if it exists.
- **duplicated_with:** none

---
- **id:** G5.-2
- **topic_component:** LWK wasm / web integration
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official
- **gap_friction:** The docs say to build the UI with LWK targeting WASM and give not one function, package name, or import path. Zero occurrences of `npm`, `package.json`, `@blockstream`, `lwk_wasm`, `wasm-bindgen`, `TypeScript` in the corpus.
- **expected_by_reader:** A minimal "hello, contract balance" JS/TS snippet: install line, import, one call. Front-load the how, per the site's own contributing standard.
- **attempted_resolution:** Read the whole Ecosystem page; followed its links (all off-site: `github.com/Blockstream/lwk`, `docs.liquid.net`); searched the corpus for every JS-ecosystem term above.
- **evidence:** "LWK can generate native apps or provide JavaScript bindings, with a WASM compile target, for building web apps." — then nothing.
- **severity:** Blocker
- **suggested_fix:** Add an LWK-wasm quickstart page: install, connect to Esplora, read a contract UTXO, build a redeem PSET, hand it out for signature. Pin the LWK version and the `simplicity` feature flag.
- **duplicated_with:** none

---
- **id:** G5.-3
- **topic_component:** Reference web application
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official-linked-repo
- **gap_friction:** The only working web reference is the lending demo. It is linked but never distilled: no page extracts the reusable pattern (connect → discover UTXO → build PSET → request signature → broadcast) from it into a generic covenant shape.
- **expected_by_reader:** A generic walkthrough, with the lending demo as the worked instance rather than the only instance.
- **attempted_resolution:** Noted both linked demos (`demolending.distributedlab.com`, `lending.dev.blockstream.com`) and the source repo; did not fetch them, as the pattern I needed was the abstraction, which is what is missing.
- **evidence:** "A sample web app built in JavaScript using LWK's WASM target to generate Simplicity transactions is the lending contract demo."
- **severity:** Major friction
- **suggested_fix:** Write "Build a web UI for a covenant" using the allowance contract, citing the lending demo for the parts that are identical.
- **duplicated_with:** https://docs.simplicity-lang.org/use-cases/lending-protocol/

---
- **id:** G5.-4
- **topic_component:** Clear signing / what the user is authorizing
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/road-to-ecosystem/
- **corpus:** official
- **gap_friction:** The Road to Ecosystem page argues, correctly and at length, that users must understand what they sign — and the site's own flagship contract has two properties that make this urgent, neither of which is stated anywhere: (1) `jet::sig_all_hash()` means one signature authorizes the entire output set, not "a withdrawal"; (2) the beneficiary's own output is **completely unconstrained** by the contract, so a malicious UI can redirect it while the covenant still validates.
- **expected_by_reader:** For each contract shown, a short "what a signature on this contract actually authorizes, and what the contract does *not* protect" note.
- **attempted_resolution:** Derived both properties by reading the contract against the `sig_all_hash` jet definition; searched for any statement of either (none).
- **evidence:** Jets reference: `sig_all_hash()` hashes `genesis_block_hash` ×2, `tx_hash`, `tap_env_hash`, `current_index`. Contract: output 1 is referenced only by the implicit remainder; no jet inspects it.
- **severity:** Blocker
- **suggested_fix:** Add a "what this signature authorizes" subsection to every contract example, and make "which outputs does the contract NOT constrain?" a standard annotation.
- **duplicated_with:** none

---
- **id:** G5.+1 (positive)
- **topic_component:** Ecosystem architecture and its trust boundary
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official
- **evidence:** States the architecture plainly (web app in LWK-wasm, keys external, PSET out / signature into the witness) and then states the trust consequence without spin: "if the wallet does not provide UI support for a specific contract, the web application must be trusted to accurately represent the meaning and effects of the contract state and requested signatures." Honest about a weakness most projects would leave implicit.
- **severity:** —
- **suggested_fix:** Keep; connect it to G5.-4.
- **duplicated_with:** none

---
- **id:** G5.+2 (positive)
- **topic_component:** Clear-signing requirements
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/road-to-ecosystem/
- **corpus:** official
- **evidence:** "I understand for what I am paying" is the right frame for a finance audience, and the clear-signing checklist (parses transaction, interprets inputs/outputs, validates assets/amounts, explains fees, explains protocol metadata, explains Simplicity covenants, rejects what it cannot understand) is a requirements spec I could design Screen 2 of the UI against directly.
- **severity:** —
- **suggested_fix:** Link this page from the Quickstart's next-steps and from every contract example; it is currently reachable only from the Resources nav section.
- **duplicated_with:** none

### G6 — Indexing and discovery

---
- **id:** G6.-1
- **topic_component:** Indexing / discovery
- **doc_page_url:** https://docs.simplicity-lang.org/use-cases/lending-protocol/#indexing-and-discovery-mechanism
- **corpus:** official
- **gap_friction:** The corpus's only treatment of indexing is buried in one use case and written entirely in that protocol's vocabulary ("Pre-lock covenants", "Parameter UTXOs", "bit-packed lending protocol structure", "minimum of 5 inputs and 6 outputs"). Nothing generalizes.
- **expected_by_reader:** An "Indexing and discovery" page describing the pattern for any covenant, with lending as one worked example.
- **attempted_resolution:** Searched `llms-full.txt` for `indexer`, `indexing`, `discovery`; checked `llms.txt` and the site nav for an indexing entry (none); checked the Ecosystem page's indexing section (one sentence naming Esplora, no link to the lending material).
- **evidence:** Ecosystem page, entire indexing section: "The main API for discovering and analyzing transactions on an Elements blockchain, including to determine smart contract state, is Esplora."
- **severity:** Major friction
- **suggested_fix:** Promote the pattern to `documentation/indexing.md`, add it to `nav` and `llms.txt`, and link it from the Ecosystem page.
- **duplicated_with:** none

---
- **id:** G6.-2
- **topic_component:** Indexing / discovery discoverability
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official
- **gap_friction:** The Ecosystem page is where a reader looking for indexing lands, and it does not link the one page that discusses it.
- **expected_by_reader:** A cross-link.
- **attempted_resolution:** Read the Ecosystem page's "Tooling (blockchain indexing and discovery)" section in full.
- **evidence:** The section is two sentences: Esplora, and the 50 GB footprint of a local Elements node.
- **severity:** Minor friction
- **suggested_fix:** Link the lending page's indexing section (or the new pattern page) from here.
- **duplicated_with:** https://docs.simplicity-lang.org/use-cases/lending-protocol/

---
- **id:** G6.-3
- **topic_component:** CMR vs output script hash
- **doc_page_url:** https://docs.simplicity-lang.org/use-cases/lending-protocol/#indexing-and-discovery-mechanism
- **corpus:** official
- **gap_friction:** The lending page conflates the CMR with the output script hash. They are different values; an indexer written literally from this text compares the wrong two things.
- **expected_by_reader:** Correct terminology, or an explicit note on how CMR relates to the Taproot output key.
- **attempted_resolution:** Cross-checked against the toolchain page (`cmr` and `liquid_testnet_address_unconf` are separate output fields), the Glossary's CMR entry, and the allowance covenant (which compares `current_script_hash` to `output_script_hash`, neither of which is a CMR).
- **evidence:** "It compares the resulting script hash ([CMR](../glossary.md#cmr)) with the script hash of output 0."
- **severity:** Contradiction
- **suggested_fix:** Reword to "derives the covenant's address from the compiled program and compares it with output 0's scriptPubKey", and add a Glossary note on how the CMR relates to the address.
- **duplicated_with:** none

---
- **id:** G6.-4
- **topic_component:** Esplora endpoints
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official
- **gap_friction:** The endpoint that answers "what UTXOs does this contract hold" is never shown. The Quickstart only fetches transactions whose txid it already has, because the faucet hands it over.
- **expected_by_reader:** The address-UTXO call, since "show balances without scanning the chain" is the whole point of using an indexer.
- **attempted_resolution:** Searched every Esplora URL in the corpus: `/api/tx/{txid}`, `/api/tx/{txid}/status`, `/api/blocks/tip/height`, `POST /api/tx`. No address-scoped endpoint appears. The Ecosystem page links Esplora's GitHub repo rather than an endpoint reference.
- **evidence:** No `/address/` endpoint appears anywhere in the corpus.
- **severity:** Major friction
- **suggested_fix:** Add a short Esplora-for-Simplicity endpoint table, or link Esplora's API reference directly rather than its repository root.
- **duplicated_with:** none

---
- **id:** G6.-5
- **topic_component:** Indexing state-committed covenants
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/state/
- **corpus:** official
- **gap_friction:** The State page says every state update moves funds to a **different address**, and that "client software must be programmed to observe that this has happened" — then gives no method. No derivation-chain walk, no scan strategy, no worked indexer. Any stateful contract (i.e. anything a finance firm would ship) is undiscoverable from the docs.
- **expected_by_reader:** The algorithm for following a covenant across address changes.
- **attempted_resolution:** Read the State page's "Wallet-side state storage" and "Basic state management mechanism" sections in full; followed its link to `simplicity-contracts/.../bytes32_tr_storage` as the only concrete artifact.
- **evidence:** "Client software meant to interact with the contract must be programmed to observe that this has happened so that new transactions are always performed with the most current updated copy."
- **severity:** Blocker
- **suggested_fix:** Add "Tracking a stateful covenant" to the State page, with the address-derivation walk and a recovery procedure for a client that has lost its state file.
- **duplicated_with:** none

---
- **id:** G6.+1 (positive)
- **topic_component:** Covenant identification by recompilation
- **doc_page_url:** https://docs.simplicity-lang.org/use-cases/lending-protocol/#indexing-and-discovery-mechanism
- **corpus:** official
- **evidence:** "It attempts to compile the Pre-lock covenant using the parameters extracted from the transaction data… compares the resulting [hash] with… output 0. If the hashes match, the transaction is confirmed as a valid…" — compile-with-candidate-params-then-match is the general technique every covenant indexer needs, and it is stated clearly. It is simply in the wrong place.
- **severity:** —
- **suggested_fix:** Promote verbatim into the new indexing page (with the CMR wording fixed per G6.-3).
- **duplicated_with:** none

### G7 — txmanifest

---
- **id:** G7.-1
- **topic_component:** txmanifest governance and hosting
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/txmanifest/
- **corpus:** official
- **gap_friction:** The entire specification and the reference implementation of a format positioned as the wallet-interoperability standard live on an individual contributor's personal GitHub account, with no versioned release, no stated governance, and no ELIP number — while the same official page's security section warns that a deceptive manifest can get users' assets "lost or stolen".
- **expected_by_reader:** For a format with that threat model, a Blockstream-hosted or ELIP-tracked spec, or an explicit statement of the governance plan and how a manifest's provenance is meant to be established.
- **attempted_resolution:** Followed both links from the official page; confirmed the book is the spec (28 schema objects, formula grammar, CLI reference, wallet implementation guide) and that no Blockstream-hosted copy exists in the corpus. Checked the Road to Ecosystem page's ELIP list — txmanifest is not among the named ELIPs.
- **evidence:** Spec: `https://stringhandler.github.io/tx_manifest_book/`. Reference implementation: `https://github.com/stringhandler/txmanifest-wallet/`. Security section: "Trusting an inaccurate or deceptive manifest file can result in wallets misinterpreting the meaning or effect of transactions… users' assets to be lost or stolen."
- **severity:** Major friction
- **suggested_fix:** Mirror the book under `docs.simplicity-lang.org`, or state the governance plan (ELIP track? Blockstream ownership? contributor-maintained?) on the official page.
- **duplicated_with:** none

---
- **id:** G7.-2
- **topic_component:** txmanifest version
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/txmanifest/
- **corpus:** official
- **gap_friction:** The official page states the freeze status but not the version; the book states the version but is not where a reader starts. Neither fact appears in both places.
- **expected_by_reader:** "Current format version: 0.2.0. Not yet frozen." on the page that introduces the format.
- **attempted_resolution:** Read the official page in full; found the version only in the book's introduction.
- **evidence:** Official page: "work-in-progress and has not yet been frozen as a released specification" (no version). Book: "This book describes manifest format 0.2.0."
- **severity:** Minor friction
- **suggested_fix:** Add the version number and a link to the book's version history to the official page.
- **duplicated_with:** https://stringhandler.github.io/tx_manifest_book/

---
- **id:** G7.-3
- **topic_component:** Deprecated timelock jets in linked documentation
- **doc_page_url:** https://stringhandler.github.io/tx_manifest_book/ (Worked example: a Last Will covenant)
- **corpus:** official-linked-repo
- **gap_friction:** The book's flagship covenant recipe — reached by following the official docs' own link — is built on `jet::check_lock_distance`, which the official jets reference marks "Deprecated; do not use."
- **expected_by_reader:** Linked documentation that does not teach a pattern the linking documentation forbids.
- **attempted_resolution:** Cross-checked the book's recipe against the jets reference's "Deprecated jets" section and the Timelocks page's deprecation warning.
- **evidence:** Book: `jet::check_lock_distance(blocks);`. Jets reference: "`check_lock_distance(Distance) -> ()` — **Deprecated; do not use.**" Timelocks: "The Simplicity jets that directly enforce relative timelocks have been deprecated due to an implementation error."
- **severity:** Contradiction
- **suggested_fix:** Update the book's recipe to the `parse_sequence` workaround the landing page uses; meanwhile add a note on the official txmanifest page that the linked book predates the deprecation.
- **duplicated_with:** https://docs.simplicity-lang.org/documentation/state/ (same deprecated jet, see G7.-4)

---
- **id:** G7.-4
- **topic_component:** Deprecated timelock jets on the official site
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/state/
- **corpus:** official
- **gap_friction:** The Covenants & State Management page's copy of `last_will.simf` calls `jet::check_lock_distance(days_180)` with **no deprecation note**, while three other official pages say the jet must not be used. This is entirely within the official corpus and is a one-line fix.
- **expected_by_reader:** A warn-box, or an updated snippet.
- **attempted_resolution:** `grep -n check_lock_distance llms-full.txt` → line 985 (the State page snippet) and line 4002 (the jets reference marking it deprecated).
- **evidence:** State page: `jet::check_lock_distance(days_180);`. Landing-page annotation 9: "This replaces the deprecated `jet::check_lock_distance`."
- **severity:** Outdated
- **suggested_fix:** Update the snippet to the `parse_sequence` idiom, or add a warn-box above it pointing at the Timelocks workaround.
- **duplicated_with:** https://stringhandler.github.io/tx_manifest_book/

---
- **id:** G7.-5
- **topic_component:** txmanifest for multi-output covenants
- **doc_page_url:** https://stringhandler.github.io/tx_manifest_book/
- **corpus:** official-linked-repo
- **gap_friction:** The book demonstrates a two-output recursive covenant (covenant + fee) and explains the no-change rule that makes the count exact. A four-output covenant with two real payment outputs plus a fee is never shown, and the interaction of the `fee` keyword, surplus folding, and three non-fee outputs is not stated.
- **expected_by_reader:** A recipe for a covenant with a mandatory third-party payment output — the shape of any contract with a fee, commission, or split.
- **attempted_resolution:** Read the Last Will chapter and the "Outputs & destinations" chapter headings; the surplus/change/fee discussion is framed around the two-output case.
- **evidence:** Book: "a recursive covenant can't add a wallet change output to return the leftover, so the will pays its own fee and shrinks by it each refresh."
- **severity:** Major friction
- **suggested_fix:** Add a recipe covering a covenant with a mandatory payment output, including how surplus is handled when the fee is not the only non-covenant output.
- **duplicated_with:** none

---
- **id:** G7.+1 (positive)
- **topic_component:** txmanifest maturity disclosure
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/txmanifest/
- **corpus:** official
- **evidence:** "The `txmanifest` format is work-in-progress and has not yet been frozen as a released specification." Unhedged, and it let me classify the goal immediately instead of guessing. The security-considerations section is equally direct about the format's central weakness (no way to verify a manifest's claims) and spells out a concrete deception scenario.
- **severity:** —
- **suggested_fix:** Keep. Apply the same candour to Unchained's trust model (G11.-2) and to Liquid mainnet activation status (G10.-6).
- **duplicated_with:** none

---
- **id:** G7.+2 (positive)
- **topic_component:** txmanifest book
- **doc_page_url:** https://stringhandler.github.io/tx_manifest_book/
- **corpus:** official-linked-repo
- **evidence:** Genuinely first-rate: graded recipes, a 28-object generated field reference, a formula-language grammar, a CLI reference, a wallet implementation guide, a complete lending walkthrough, and a "Worked example: a Last Will covenant" chapter that was the direct template for my draft manifest. It also states, clearly, the rule that decides whether a covenant manifest works at all — "A change output is added only when an action lists a `\"destination\": \"change\"` output" — which appears nowhere on docs.simplicity-lang.org.
- **severity:** —
- **suggested_fix:** Bring it into the corpus (see G7.-1); it is better than the page that links to it.
- **duplicated_with:** none

### G8 / G9 — Registry and audit service

---
- **id:** G8.-1
- **topic_component:** Manifest distribution
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/txmanifest/
- **corpus:** official
- **gap_friction:** No contract registry exists and the docs do not claim one does — but nothing says how a manifest is *meant* to reach a wallet either. A reader finishes G7 holding a manifest with no distribution story.
- **expected_by_reader:** One sentence: vendor it in your app / send it to your counterparty / a registry is planned.
- **attempted_resolution:** `registry` → 0 hits in `llms-full.txt` and 0 in the site search index. `registries` → 1 hit, in a list of things the ecosystem still "requires". Checked the Roadmap for a registry item (none) and the txmanifest page for distribution guidance (none).
- **evidence:** Road to Ecosystem conclusion: "It requires standards, registries, validation logic, contract metadata, asset metadata, and wallet implementations that reject what they cannot understand." The txmanifest page's only distribution guidance is negative: "Users and wallets must only import manifest files from appropriately trusted sources, and not automatically accept manifest files posted online or sent to them by strangers."
- **severity:** Product not shipped
- **suggested_fix:** Add a "Distributing a manifest" section stating current practice and whether a registry is planned.
- **duplicated_with:** none

---
- **id:** G9.-1
- **topic_component:** Contract assurance before deployment
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** No Blockstream Audit Service appears in the corpus — not as product, not as roadmap, not as blog reference. Separately, the adjacent question the corpus *can* answer — how do I gain assurance about a contract before funding it? — has its pieces scattered across five pages and is never assembled.
- **expected_by_reader:** A pre-deployment assurance checklist. For the audiences this site names (finance engineers, product architects), that page is what decides whether a pilot gets funded.
- **attempted_resolution:** `audit service` / `Audit Service` / `Blockstream Audit` → 0 hits in both indexes. `audit` → 2 hits, both the ordinary English word in the "Simplicity Compared" table (one of them describing *Ethereum's* safety approach). Checked the Roadmap for an audit item (none). Deliberately did not leave the corpus: the answer would not change the documentation finding.
- **evidence:** "no page found"
- **severity:** Product not shipped
- **suggested_fix:** Add "Assurance before you deploy", pulling together the FAQ's "How do I prove my Simplicity contract is correct?", the formal-verification claims, Simplex integration testing, `hal-simplicity simplicity pset run`, and the promised pitfalls material. If an audit service exists, name it there.
- **duplicated_with:** none

### G10 / G11 — Production and multi-environment

---
- **id:** G10.-1
- **topic_component:** Testnet → mainnet migration
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** No migration page, no production checklist. "mainnet" appears four times in the whole corpus, none of them instructional. The landing page asserts "production deployments run on Liquid mainnet" with nothing behind it.
- **expected_by_reader:** A checklist: address form, signing network, asset IDs, confidentiality, funding, keys, timelock limits, endpoints, and which values are network-independent traps.
- **attempted_resolution:** Searched `mainnet`, `production checklist`, `going to production`, `deploy to mainnet`, `migration`. Reconstructed the ten-step checklist in §1 G10 from scattered facts.
- **evidence:** Landing page: "The tutorials on this site currently target Liquid testnet for learning purposes; production deployments run on Liquid mainnet."
- **severity:** Blocker
- **suggested_fix:** Add `documentation/going-to-production.md` with the ten-row checklist from §1 G10, and link it from the Quickstart's next-steps.
- **duplicated_with:** none

---
- **id:** G10.-2
- **topic_component:** Network selection when signing
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/toolchain/
- **corpus:** official
- **gap_friction:** `sig_all_hash()` binds a signature to the chain's genesis block, so `sighash` must be told the network. The Quickstart invokes it with **no network flag** on Liquid testnet; the flag list offers `--liquid` and `--elementsregtest` but no testnet flag and no statement of the default. A reader cannot target testnet explicitly, nor knows mainnet needs `--liquid`.
- **expected_by_reader:** The default stated, a testnet flag documented, and a migration note that signing must switch networks.
- **attempted_resolution:** Compared the `sighash` flag list against every `sighash` invocation in the Quickstart; read the `sig_all_hash` jet definition to confirm genesis binding.
- **evidence:** Jets: `sig_all_hash()` hashes "The result of `genesis_block_hash` (32 bytes). The result of `genesis_block_hash` again (32 bytes)…". Quickstart: `hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_HOT"`.
- **severity:** Major friction
- **suggested_fix:** Document the default network for `sighash` and `info`, document the testnet selector, and add a warn-box that signatures are genesis-bound.
- **duplicated_with:** none

---
- **id:** G10.-3
- **topic_component:** Liquid asset IDs
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** No Liquid asset ID appears anywhere in the corpus — not even the L-BTC policy asset for testnet or mainnet — while `state.md` advises contracts to check asset IDs explicitly, which requires hardcoding one that differs per network.
- **expected_by_reader:** A small table of the asset IDs a contract is likely to bind (L-BTC on both networks, at minimum), and a note that they differ.
- **attempted_resolution:** Searched `asset id`, `policy asset`, `L-BTC`, `LBTC`, `tLBTC`. Every hit is prose or a `jq` expression reading an asset from an API response; no literal value appears.
- **evidence:** state.md: "the contract should inspect the assets being transferred to confirm that they always of the expected kinds. In most contexts, payments should not be allowed to be made with arbitrary assets."
- **severity:** Major friction
- **suggested_fix:** Add an asset ID table to the Glossary or a new reference page, with an explicit "these differ between testnet and mainnet" warning.
- **duplicated_with:** none

---
- **id:** G10.-4
- **topic_component:** Confidentiality cost of explicit-only contracts
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** A contract that reads amounts with `unwrap_right` forces every inspected output to be explicit, so on mainnet those payment streams are publicly visible in amount and asset — on a chain whose headline feature is confidential transactions. No page connects the language-level requirement to the production disclosure it causes.
- **expected_by_reader:** A statement that introspecting amounts costs confidentiality, so a reader can decide whether to accept it before building.
- **attempted_resolution:** Read all 30 `confidential` hits; the Glossary explains the feature, annotation 3 explains the panic, and nothing joins them to a business consequence.
- **evidence:** Glossary: Liquid transactions "may be confidential… preventing third parties from determining the amount and asset". Annotation 3: `unwrap_right` "assumes explicit and panics on a confidential value".
- **severity:** Major friction
- **suggested_fix:** Add "Confidentiality and introspection: what you give up" to the Covenants page, and cover it in the production checklist.
- **duplicated_with:** none

---
- **id:** G10.-5
- **topic_component:** Network-independent parameters
- **doc_page_url:** not found
- **corpus:** official
- **gap_friction:** Script-hash parameters are identical across networks, so a testnet destination carried to mainnet fails silently. Every other migration step fails loudly; this one does not.
- **expected_by_reader:** A "these params do not change between networks, and that is the danger" warning.
- **attempted_resolution:** Inferred from both address forms being derived from one compiled program; searched for any statement (none).
- **evidence:** See G2.-7.
- **severity:** Blocker
- **suggested_fix:** Warn-box in the production checklist and on the `output_script_hash` jet entry.
- **duplicated_with:** G2.-7

---
- **id:** G10.-6
- **topic_component:** Liquid mainnet activation status
- **doc_page_url:** https://docs.simplicity-lang.org/glossary/#liquid
- **corpus:** official
- **gap_friction:** No page states when or whether Simplicity activated on Liquid mainnet — no height, no version, no date. Support is asserted three times and demonstrated zero times. For a firm deciding whether to start a pilot this is the first question.
- **expected_by_reader:** "Simplicity has been active on Liquid mainnet since block N / release X / date D", or an honest "not yet; testnet only".
- **attempted_resolution:** Searched `activat`, `deployed on liquid`, `live on liquid`, `mainnet` (4 hits, none instructional). Checked the FAQ's eight questions (none covers it) and the Roadmap (no activation item).
- **evidence:** Glossary: Liquid is "the first blockchain to have native support for Simplicity"; "Most Simplicity examples as of 2026 assume that a program is running on the Liquid mainnet or Liquid testnet."
- **severity:** Blocker
- **suggested_fix:** State activation status, with height or release, on the landing page and in the FAQ.
- **duplicated_with:** none

---
- **id:** G10.-7
- **topic_component:** Reference freshness
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/jets/ and https://docs.simplicity-lang.org/documentation/wallet/
- **corpus:** official
- **gap_friction:** Dated statements have aged without review. The jets reference was generated 2026-04-06 (the stdlib reference, 2026-09-16, is five months fresher); the Ecosystem page says LWK Simplicity support is "still being added… as of April 2026" and gives a local Elements node footprint "as of April 2026".
- **expected_by_reader:** Either a refresh, or a visible "last reviewed" date so I can judge staleness myself.
- **attempted_resolution:** Compared the generation stamps embedded in both generated pages; noted the "as of April 2026" statements.
- **evidence:** `<!-- Generated from elements.json by jets.md.py on 2026-04-06 -->` vs `<!-- Generated from stdlib.json by stdlib.md.py on 2026-09-16 -->`.
- **severity:** Outdated
- **suggested_fix:** Surface the generation date on the rendered page rather than only in an HTML comment, and re-check "as of <month>" claims on a schedule.
- **duplicated_with:** none

---
- **id:** G11.-1
- **topic_component:** Jet portability across chains
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/jets/
- **corpus:** official
- **gap_friction:** The jets reference is one undifferentiated list with no portability marking, while a large fraction of it (`output_is_fee`, `Asset1`/`Amount1` handling, issuance, confidentiality) is Elements-specific and cannot exist on a Bitcoin-like chain. A reader planning for the promised Mutinynet integration has no way to tell which parts of their contract will survive.
- **expected_by_reader:** A column or section marking Elements-only jets, given that the Roadmap explicitly promises a chain "without Elements extensions".
- **attempted_resolution:** Read the jets reference's scope statement and the Roadmap's Mutinynet paragraph; derived the incompatibilities from annotation 5 and the type-alias table.
- **evidence:** Jets reference: "a complete list of the available jets in the Elements Simplicity integration on Liquid Network". Roadmap: Mutinynet "remains architecturally closer to Bitcoin Core… without Elements extensions".
- **severity:** Major friction
- **suggested_fix:** Mark Elements-specific jets in the reference, and add a short "what does not port to a Bitcoin-like chain" note to the Roadmap's Mutinynet section.
- **duplicated_with:** none

---
- **id:** G11.-2
- **topic_component:** Simplicity Unchained trust model
- **doc_page_url:** https://docs.simplicity-lang.org/resources/roadmap/#simplicity-unchained
- **corpus:** official
- **gap_friction:** Unchained gets one paragraph describing an oracle-based interpreter and nothing on the trust model: who runs the oracle, whether it is federated or single-party, what happens if it lies or goes offline, whether attestations are verifiable. Separately, the word "cosigner" appears **zero** times in the corpus — an oracle attesting to conditions and a cosigner holding a multisig key are different risk propositions.
- **expected_by_reader:** A trust-model paragraph. For a firm, the difference between "an oracle attests" and "a cosigner signs" is the entire counterparty risk assessment.
- **attempted_resolution:** `grep -c -i "cosigner\|co-signer" llms-full.txt` → 0. Read all three Unchained mentions; searched for a repo, spec or example (none).
- **evidence:** "an oracle-based Simplicity interpreter called Simplicity Unchained **will offer** Simplicity scripting support. The oracle can make statements confirming when contract conditions… have been met."
- **severity:** Product not shipped
- **suggested_fix:** When Unchained is documented, lead with the trust model; meanwhile add one sentence stating that the design is an oracle attestation, not a cosigner, so readers do not carry the wrong mental model.
- **duplicated_with:** none

---
- **id:** G10.+1 (positive)
- **topic_component:** Timelock limits
- **doc_page_url:** https://docs.simplicity-lang.org/getting-started/quickstart/
- **corpus:** official
- **evidence:** "`Distance` is capped at 65535, which at one block a minute is only about 45 days. A real deployment wanting something like a 180-day check-in period would need to use a different timelock enforcement method instead" — with a link to that method. Stated unprompted, in the middle of a tutorial, about a limit that would otherwise be discovered during production design. This is exactly the kind of constraint a finance reader must know before choosing a product shape, and it let me confirm a monthly allowance fits while a quarterly one does not.
- **severity:** —
- **suggested_fix:** Keep; repeat it in the production checklist.
- **duplicated_with:** https://docs.simplicity-lang.org/documentation/timelocks/

---
- **id:** G11.+1 (positive)
- **topic_component:** Honesty about Bitcoin mainnet
- **doc_page_url:** https://docs.simplicity-lang.org/resources/roadmap/#simplicity-unchained
- **corpus:** official
- **evidence:** "For blockchains where a native Simplicity integration isn't present, like the Bitcoin Mainnet…" and "This **indirectly** brings the power… to other chains." The docs do not imply native Bitcoin mainnet Simplicity exists, and mark Unchained as future work in plain future tense. Easy to fudge; not fudged.
- **severity:** —
- **suggested_fix:** Keep; extend the same candour to mainnet activation status (G10.-6).
- **duplicated_with:** none

---
- **id:** G11.+2 (positive)
- **topic_component:** Security guidance on covenant output constraints
- **doc_page_url:** https://docs.simplicity-lang.org/documentation/state/#constraining-state-updates
- **corpus:** official
- **evidence:** "Without this constraint, the updater could add an additional output that leaks contract funds to an unrelated address", plus the fee-donation attack: "constrain fee amounts in order to prevent parties from intentionally donating the contract's assets to miners via excessive fees." I checked both against the adapted contract — the first is why `num_outputs()` is pinned, and the second turns out not to bite here because the retained-amount inequality bounds the fee on the partial path. Good guidance is guidance that sends you to check something specific, and this did.
- **severity:** —
- **suggested_fix:** This material is stranded on a state-management page; it applies to every covenant. Move or duplicate it into the promised pitfalls page (G2.-6).
- **duplicated_with:** none

---

## 3. Coverage scorecard (0–5, integer)

Scoring the **official corpus** (docs.simplicity-lang.org), not the ecosystem as a whole.

| Dimension | Score | Basis |
| --- | :-: | --- |
| Discoverability | **2** | See below |
| Completeness for this journey | **2** | See below |
| Technical correctness / freshness | **3** | See below |
| Security guidance | **3** | See below |
| Production readiness | **1** | See below |
| Wallet / non-technical UX path | **1** | See below |
| Multi-environment story | **3** | See below |

### Discoverability — 2

The site is navigable and the search index works, but the two things this journey needed most were
findable only by accident or not at all. **Driven by:** G1.-1 (the flagship covenant has no
filename, no source file, and lives only on a marketing section of the landing page), G1.-2 (the
landing page is absent from `llms-full.txt` entirely, so the covenant is invisible to the
machine-readable corpus that advertises itself as containing "all content"), G6.-1 and G6.-2
(indexing exists only inside the lending use case and is not linked from the page where a reader
looks for it), G4.-7 (the toolchain page's worked-example link 404s).

What keeps this from a 1: `llms.txt` is well organized, the search index is complete for what it
covers, and the Quickstart's next-steps links are genuinely well chosen.

### Completeness for this journey — 2

Four of eleven goals completed from docs alone; three blocked outright. **Driven by:** G2.-4 (no
documented way to bind a payment destination — the contract cannot be compiled to an address),
G3.-1 (the Simplex test API is one commented-out function body), G5.-2 (no LWK-wasm API at all),
G6.-5 (no method for tracking a stateful covenant), G1.-3 (no `.args` reference).

The pattern: **reference material is strong, procedural material is thin.** The jets reference
(600 lines), the stdlib reference (400), the `.wit` reference (230) and the Glossary (270) are
thorough. What is missing is consistently the page that says "here is how you do the thing".

### Technical correctness / freshness — 3

No broken URLs among the network endpoints, and the generated references are accurate where they
overlap. Held down by: G2.-1 and G4.-1 (two pages give incompatible `pset create` syntax, and
neither form can express what this contract needs), G2.-9 (`update-input -s` documented on one
page, absent from the reference), G6.-3 (CMR conflated with output script hash), G7.-4 (the State
page teaches a deprecated jet with no warning, while three other pages forbid it), G10.-7 (the
jets reference is five months staler than the stdlib reference; two "as of April 2026" claims).

Not 2, because every one of these is a small, locatable correction rather than a systemic problem,
and the single-source-of-truth generated pages are in good shape.

### Security guidance — 3

Genuinely the corpus's strongest area relative to its peers, and still short where it counts.

Strong: G2.+2 (the free-asset-issuance attack, named with its mitigation and the reason the
mitigation is structured as it is), G1.+1 (annotation 8's single-input restriction, the attack it
prevents *and* its fee consequence), G11.+2 (output-leak and fee-donation attacks), G5.+2
(clear-signing requirements), G7.+1 (txmanifest's deception scenario, spelled out).

Short: G5.-4 (nothing says the beneficiary's own output is unconstrained, or that one signature
authorizes the whole transaction — the exact thing the site's own clear-signing page demands be
explained), G2.-3 (the terminal spending path enforces nothing, and the page presents the branches
as symmetric), G2.-6 (no pitfalls page; the Roadmap promises one), G2.-2 (the
confidential-inspection rule is stated only for funding), G1.-4 (the permanent-loss warning is a
code annotation rather than an admonition).

The shape of the gap is consistent: **attacks on the contract are well covered; attacks on the
user through the contract are not.**

### Production readiness — 1

**Driven by:** G10.-1 (no migration page or production checklist of any kind; "mainnet" appears
four times in the corpus, none instructionally), G10.-6 (activation status on Liquid mainnet is
never stated — the first question a firm asks), G10.-5 / G2.-7 (the one migration error that fails
silently is undocumented), G10.-3 (no asset IDs anywhere, while the docs advise binding them),
G10.-4 (the confidentiality cost of introspection is never stated), G10.-2 (signatures are
genesis-bound and the Quickstart never selects a network), G9.-1 (no assurance checklist),
G8.-1 (no manifest distribution story).

Not 0: G10.+1 is real and load-bearing — the `Distance` cap is stated unprompted, with the
consequence and the alternative, and it is exactly the sort of thing that derails a product
design if found late. The material for a production page largely exists; it has never been
assembled.

### Wallet / non-technical UX path — 1

**Driven by:** G5.-1 (the wallet the brief named does not appear in the corpus at all), G5.-2 (no
LWK-wasm function, package, or import is documented anywhere), G5.-3 (the only working reference
is a lending demo whose pattern is never generalized), G5.-4 (the site's own clear-signing
requirements are not applied to its own contracts).

Not 0: G5.+1 and G5.+2 mean the *architecture* and the *requirements* are well described, and the
Road to Ecosystem page is a better statement of the problem than most projects produce. What is
missing is every line of code between the architecture and a running page.

### Multi-environment story — 3

The best-scoring dimension that is not a reference page, because the docs are **honest** here in a
way that makes classification possible: G11.+1 (no pretence that native Bitcoin mainnet Simplicity
exists; Unchained is marked indirect and future). Liquid testnet is demonstrated end to end,
Mutinynet is named precisely as in-progress, Unchained is plainly future work.

Held down by: G11.-1 (the jets reference has no portability marking, though the Roadmap promises a
chain "without Elements extensions" — so a reader cannot tell what ports), G11.-2 (no trust model
for Unchained, and the docs' oracle design is not the cosigner model outsiders assume), G10.-6
(mainnet asserted, never demonstrated).

---

## 4. Priority list

The ten highest-leverage changes, ordered by impact on completing G1–G11 without leaving the
corpus — not by how easy they are to write.

1. **Document how to bind a payment destination.** (G2.-4, G2.-5, G2.-7) A recipe for address →
   scriptPubKey → SHA256, the `hal-elements` subcommands `hal-simplicity` inherits, and a warn-box
   that script hashes are network-independent. *This single gap blocked G2, G4, G7 and half of G3.*
   It is not an exotic requirement — it is "pay someone", the most ordinary thing a financial
   contract does, and the corpus cannot get you to a fundable address.

2. **Write a Simplex testing reference.** (G3.-1, G3.-2, G3.-3, G3.-4) `TestContext`, `Signer`,
   `Provider`, `FinalTransaction`, `PartialInput`/`PartialOutput`, `ProgramInput`,
   `RequiredSignature`; the generated-artifact naming convention; the error taxonomy with real
   strings; and ship `examples/last_will` so a covenant test exists at all. Today the documented
   API is `// Test code goes here.` and everything else must be reverse-engineered from one
   example project.

3. **Add a "Going to production" page.** (G10.-1 through G10.-6, G9.-1) The ten-row checklist in
   §1 G10, led by the two items that fail silently or decide the business case: script-hash
   params do not change between networks, and introspecting amounts forfeits confidentiality.
   State Liquid mainnet activation status in the first paragraph.

4. **Give the allowance covenant a real home.** (G1.-1, G1.-2, G1.-3, G1.-4, G2.-3) A named
   `.simf` file, a page of its own in the nav and in `llms.txt`, an `.args` reference with units,
   the permanent-loss warning as an admonition, and an annotation saying the terminal spending
   path enforces nothing. The contract is the site's best teaching asset and is currently a
   screenshot on a marketing page.

5. **Document an LWK-wasm path.** (G5.-2, G5.-3) Install line, import, connect to Esplora, read a
   contract UTXO, build a redeem PSET, hand it out for signature — with a pinned LWK version and
   the `simplicity` feature flag. Plus a "which wallets can sign a Simplicity transaction today"
   table with honest status per wallet (G5.-1).

6. **Apply the site's own clear-signing standard to the site's own contracts.** (G5.-4, G2.-3)
   For each example: what a signature actually authorizes, and which outputs the contract does
   **not** constrain. The Road to Ecosystem page argues for exactly this and no contract page does
   it. For the allowance covenant the answer is alarming and currently invisible.

7. **Promote indexing out of the lending use case.** (G6.-1, G6.-2, G6.-3, G6.-4, G6.-5) A generic
   indexing page: compile-with-candidate-params-then-match, the Esplora endpoints including the
   address-UTXO call, the CMR/script-hash wording fixed, per-UTXO rather than summed balances, and
   — the real hole — how to track a covenant whose address changes on every state update.

8. **Ship the promised pitfalls page.** (G2.-6, G2.-2, G2.-3, G11.+2) The Roadmap already commits
   to it. Lead with confidential funding, dust self-lock, unconstrained output paths, and fee
   donation, and move the stranded security guidance off the state-management page.

9. **Reconcile the toolchain reference with the Quickstart.** (G2.-1, G4.-1, G4.-2, G4.-3, G4.-7,
   G2.-9, G10.-2) One `pset create` syntax that supports both `asset` and input `sequence`; an
   explicit output-ordering guarantee; the `-Z` values table; the `-s` flag on `update-input`; the
   default signing network; and repoint the 404ing bash-quickstart link.

10. **Feature `hal-simplicity simplicity pset run` in the Quickstart.** (G4.-6) The one command
    that turns "rejected" into a jet-by-jet trace currently gets one paragraph and no example,
    while the Quickstart walks readers through a failing broadcast without mentioning it. Highest
    value per word of anything in this list, and the cheapest to write.

**Also worth doing, below the top ten:** bring the txmanifest book into the corpus or state its
governance (G7.-1); mark Elements-specific jets for portability (G11.-1); state Unchained's trust
model and that it is an oracle rather than a cosigner (G11.-2); de-duplicate and comment-strip
`llms-full.txt` (G1.-5, G1.-6); publish Liquid asset IDs (G10.-3).

---

## 5. Artifacts

All under `artifacts/`. **Every one is "not executed — docs-only reconstruction"**: no `simc`,
`hal-simplicity`, `simplex`, `cargo`, `node`, `npm`, `elementsd`, `jq` or `curl` exists in this
environment. No transcripts are fabricated anywhere in this report.

| File | What it is | Confidence |
| --- | --- | --- |
| `allowance_with_commission.simf` | The adapted contract. Base copied verbatim from the landing page; commission check, 4-output shape, and a new `final_withdrawal()` closing the unenforced terminal path. | Base **high**; commission structure **medium**; `COMMISSION_SCRIPT_HASH` **guessed** (G2.-4) |
| `allowance_with_commission.args` | Compile-time parameters. | **medium**; the script-hash value is a placeholder |
| `allowance_with_commission.args.NOTES.md` | Why each type was inferred, and the satoshi/LBTC unit trap. | — |
| `tests/allowance_commission_test.rs` | The five required Simplex tests plus a sixth the protocol did not ask for. Blocked lines are `todo!()` naming their gap, never an invented method. | Test macro **high**; all other API **medium** (from the linked example repo); output shape, timelocks and negative assertions **guessed** |
| `deploy-testnet.sh` | The documented testnet flow, adapted. Two BLOCKED markers. | Flow **medium-high**; the two blocked points **guessed** |
| `ui-sketch.md` | Three screens, with provenance per element. Screens 1–2 buildable today; screen 3 is not. | Screens 1–2 **high**; screen 3 **guessed** / unbuildable |
| `indexer-spec.md` | Allowance-covenant indexer, generalized from the lending page's verification step. | Approach **medium**; the address-UTXO endpoint **guessed** |
| `txmanifest.json` | Manifest draft, `manifest_version` 0.2.0, three signing stages. | Schema **medium**; commission destination and 4-output shape **unresolved** |

Supporting evidence is under `evidence/`: `llms.txt`, `llms-full.txt`, `index.md.txt`,
`index.html`, `search_index.json`, `try-it.html`, the txmanifest book (`txmanifest-book.html`,
`txm-print.html`, `txm-lastwill.txt`), and the five files read from the linked `smplx` examples
(`smplx-basic/`).

---

## 6. Corpus discipline

**I did not leave the official corpus at any point.** Every row in §2 is `official` or
`official-linked-repo`. No blog post, Office Hours recording, Telegram message, X post, Stack
Overflow answer, or third-party article was consulted, and no pretraining recollection of
unpublished APIs was used to fill a gap. Where the corpus could not answer a question, the
artifact says so and the code says `todo!()` or `DOC-GAP invented` rather than guessing.

`official-linked-repo` sources were used at exactly two points, each reached by following a link
on an official page that names it as the source of the material:

| Source | Linked from | Used for |
| --- | --- | --- |
| `github.com/BlockstreamResearch/smplx/examples` (`basic/README.md`, `Simplex.toml`, `tests/basic_test.rs`, `tests/confidential_test.rs`, `simf/p2pk.simf`) | Simplex page, "Examples" | G3 — the entire Simplex test API |
| `stringhandler.github.io/tx_manifest_book/` | txmanifest page, "Online documentation" | G7 — the manifest schema, version, and the Last Will recipe |

Both are load-bearing in a way worth stating plainly: **remove those two outbound links and G3 and
G7 both become impossible.** That is the single clearest summary of this audit — the official
corpus explains what things are, and delegates how to do them.

Three deliberate non-searches, each of which would have been outside the corpus and none of which
would have changed a documentation finding: I did not search the web for Humid (G5.-1), for a
contract registry (G8.-1), or for a Blockstream Audit Service (G9.-1). For each, the finding is
that the official corpus does not document it, and that finding is complete without going outside.

**Persona discipline:** I did not become a Simplicity developer during this evaluation. Where a
decision required knowledge of combinators, CMR/IMR internals, the Bit Machine, Elements issuance,
LWK internals, or Unchained protocols, the artifact records the gap rather than filling it. The
one place I came closest to overstepping is the Simplex test artifact, where I reconstructed an
undocumented Rust API from example source — and that reconstruction is labelled **CONFIDENCE:
medium** throughout, with its provenance named file by file.


---

## 7. Addendum, 2026-10-02 — correction to G2.-1 / G4.-1

Added after review feedback from the repository maintainer. The original rows are left as written,
because what an attentive reader concluded from these two pages is itself part of the finding.

**Correction.** G2.-1 and G4.-1 classified the `pset create` discrepancy as a *Contradiction*
between `toolchain.md` and the Quickstart. That is wrong on two of the three points:

* **`asset` is optional, and `toolchain.md` says so.** "If the asset is not specified, it is
  assumed by default to be the asset corresponding to Liquid bitcoin (LBTC)." The Quickstart
  omitting it is the documented default, not a conflicting syntax. I misread optionality as
  conflict.
* **`sequence` is optional too.** Also not a conflict.

Consequences for the report:

* The severity of G2.-1 / G4.-1 should be **Minor friction (documentation completeness)**, not
  Contradiction.
* **The G2 reasoning that depended on it is void.** G2's §"A contradiction that blocks writing the
  transaction" concluded that "neither documented form shows both `asset` and `sequence`", and
  therefore that a non-LBTC commission and a relative timelock could not be expressed together.
  Since both fields are optional on the same command, they compose, and `deploy-testnet.sh`'s
  BLOCKED #2 marker overstates the problem. The G4 claim that this "bites twice" is likewise void.

**What survives.** Two real, smaller gaps:

1. **`sequence` is undocumented, not merely unmarked.** `toolchain.md` specifies outpoints as
   "each a JSON object containing a `txid` and a `vout`" and stops. The field is discoverable only
   from the Quickstart's second invocation (`quickstart.md:397`) or the published demo script
   (`docs/assets/last-will-demo.sh:408`, whose header comment at line 27 notes it needs a
   `hal-simplicity` "whose `simplicity pset create` accepts a per-input `sequence` field").
   *Fix:* document `sequence` on the toolchain reference and mark both it and `asset` as optional.
2. **An internal inconsistency inside `toolchain.md`, newly identified and not in the original
   rows.** Its prose describes an address-keyed map — "a list of JSON objects mapping *destination
   addresses to assets and amounts*" — while the code block immediately beneath shows literal
   `address` / `asset` / `amount` keys. Removing optional `asset` from the example yields
   `{"address": "<addr>", "amount": <amt>}`, which is still not the Quickstart's
   `{"<addr>": 0.00099900}`. Optionality does not reconcile these two spellings. Either the tool
   accepts both and each page shows one, or the example is incorrect. Unresolved from docs; needs
   someone with tool knowledge. *Fix, if both are accepted:* show both spellings and say the
   address-keyed form is the shorthand for the LBTC default.

**Also noted in this review, outside the `pset create` question:** G7.-4 (the deprecated
`jet::check_lock_distance` in the Covenants & State Management page) was initially set aside as
belonging to an unpublished draft. It does not: the occurrence is `docs/documentation/state.md:57`,
which is tracked and published. The untracked `docs/documentation/covenant.md` is a different file
and correctly out of scope.

**G7.-4 is now closed.** The maintainer substituted the updated `last_will.simf` from
`SimplicityHL/examples` into `state.md` on 2026-10-02. The snippet now uses the
`jet::parse_sequence` workaround via a `pub fn enforce_relative_distance`, and the only remaining
mention of the old jet is a comment correctly identifying it as deprecated. Verified that the
substitution introduced no prose drift: the timelock figure changed from 180 to 18 days (25920
blocks at Liquid's one-minute interval), and the body prose, the Mermaid diagram, and the snippet
comments were all updated to match. G4.-7 (the 404ing `bash-quickstart.md` link) is also fixed.

**Standing caveat.** The body of this report describes the corpus as of 2026-09-23. Documentation
review and editing has continued since; findings should be re-checked against the current tree
before being acted on.
