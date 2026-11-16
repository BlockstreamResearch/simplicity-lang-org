# Role

You are grading one run of the documentation test in
`tests/ecosystem-documentation-coverage.md`. An AI agent performed that run.
Read that file first: it is the task the agent was given.

The test measures the Simplicity documentation, not the agent. Your job is
to establish how far the run's claims and findings can be trusted, so that
its documentation findings can be compared with other runs. You don't grade
the documentation yourself, and you don't fix the agent's work.

# Inputs

- `RUN_DIR`: the run directory. It holds `LOG.md`, `REPORT.md`, possibly
  `AUDIT.md`, and `artifacts/`. A run made by hand may also hold build trees
  the agent left; a run made in a container usually holds only what the agent
  wrote to its output directory. Don't count a missing build tree against the
  run, but don't verify a claim that depends on one either.
- `REFERENCE_DIR`: a checkout of `allowance-web` from
  https://github.com/BlockstreamResearch/simplicity-demo. It is the worked
  example for the *unmodified* contract, and `build-end-to-end-app.md` in it
  is the source of the tutorial published at
  https://docs.simplicity-lang.org/getting-started/build-end-to-end-app/.
  This file calls that tutorial "the tutorial".
- Optionally, `OPERATOR_CHECKS`: notes from a human who loaded this run's
  page and extension in a browser. If present, see "Calibration".

Unlike the agent, you may read anything in `REFERENCE_DIR` and anything on
docs.simplicity-lang.org. Don't read other run directories.

Write your result to `RUN_DIR/GRADE.md`. Don't change anything else in
`RUN_DIR`, and don't commit.

# What the agent was asked to produce

The agent had no browser and no human operator. It was told to:

- build every artifact a browser would load, mark browser steps “built,
  not run in a browser”, and describe what a reader would do and see;
- do for real anything possible without a browser, and record the txid of
  every transaction it broadcast;
- if it used a worked example for the unmodified contract, report a table
  with one row per step of that example: followed as written, adapted,
  blocked, built but not run, or skipped.

The task's central change is G2: every successful withdrawal also pays a
commission of at least 1% of the withdrawal amount to a destination the
agent chose and hardcoded into the contract.

# Checks

Work through these in order. For each, record what you checked, what you
found, and the evidence (a file path and line, a command and its output, or
a txid). If the run has nothing for a check to examine, such as no web page
or no manifest, record the check as not applicable and say why, then go on.

## 1. Protocol compliance

- `LOG.md` starts with the date, the protocol's commit hash and the model ID.
- `REPORT.md` has sections 0 to 6, and section 1 covers G1 to G11
  separately.
- Section 0 says how each important page was found, and lists txids.
- If the agent found the tutorial, the step table is present and covers
  every numbered step of the tutorial. Each “skipped” row has an audit-log
  id.
- Browser steps are marked “built, not run in a browser”, not “done”.
- Every artifact carries `SOURCE` and `CONFIDENCE` annotations.

Record whether and how the agent found the tutorial: by a link from another
page, the site navigation, `llms.txt`, the search index (with the query),
or not at all.

Collect every `DOC-GAP` annotation in `artifacts/`, for example with
`grep -rn -i -A6 'DOC-GAP' RUN_DIR/artifacts`. Agents often explain a gap
in a code comment and never move it to the report. List each annotation
whose gap doesn't appear in `REPORT.md` or `AUDIT.md`, with its path, line
and a one-line summary of the agent's reasoning.

## 2. The adapted contract

Find the adapted `.simf` file. Compare it with
`REFERENCE_DIR/contracts/allowance.simf` and read the diff. Check that:

- the commission output is checked for amount, asset and destination, and
  each check reads from the place the agent's report says (parameter,
  witness or constant);
- the contract guarantees the 1% minimum for every withdrawal it accepts,
  not just for the amounts the agent tested. Agents meet this in different
  ways: comparing against the withdrawal amount with division or 128-bit
  arithmetic, or a fixed commission together with an on-chain bound on the
  withdrawal size. Check the arithmetic for rounding and overflow, and say
  which approach the contract takes;
- the commission is enforced on both spend paths. In the unmodified
  contract the full-withdrawal path doesn't check the transaction's shape at
  all (`EXPLANATION.md`, “The full-withdrawal path enforces no transaction
  shape at all”), so a commission added only to `partial_withdrawal()`
  isn't enforced on the last withdrawal;
- the recursive output still balances: input value equals remainder plus
  payout plus commission plus fee, in whatever form the contract states it;
- the output indexes the contract checks match the output order the page,
  manifest and tests build.

If `simc` or `simplex` is available to you, or you can install it by
following the docs, compile the contract and paste the output. Otherwise
write “not compiled, read only”.

## 3. Tests

Find the Simplex tests. Check which of the five G3 cases exist (happy path,
insufficient remainder, too-soon withdrawal, wrong asset, missing commission
output), and whether each asserts what its name says. A test marked
`#[ignore]` doesn't count as existing; record the reason the agent gave and
whether the docs bear it out. Check whether the log or `artifacts/`
contains real `simplex test` output, and whether the tests that output
names are the ones in the files.

An agent may test some cases another way, such as `hal-simplicity pset run`
with hand-built transactions. Count those, but say which tool produced the
evidence.

## 4. On-chain evidence

For every txid the run reports, fetch it from Liquid testnet Esplora:

```bash
python3 - <txid> <<'EOF'
import json, sys, urllib.request
txid = sys.argv[1]
url = f"https://liquid.network/liquidtestnet/api/tx/{txid}"
print(json.dumps(json.load(urllib.request.urlopen(url, timeout=30)), indent=2))
EOF
```

Space requests at least half a second apart. If a response takes more than
about five seconds, wait a minute before the next one.

For each transaction, record whether it exists and is confirmed, and
whether it does what the report says:

- A funding transaction has an explicit `v1_p2tr` output at the covenant
  address. In Esplora's JSON an explicit output has `value` and `asset`; a
  confidential one has `valuecommitment` instead, and is unspendable by
  this contract.
- A withdrawal spends a covenant output, and its outputs match the order
  and amounts the adapted contract requires, including the commission
  output to the stated destination.
- At least one withdrawal includes the commission. A run whose only
  withdrawals used the unmodified contract has not exercised G2 on chain,
  whatever its report says.

Record any txid that is claimed but not found, or that doesn't do what the
report says. That is the strongest evidence that a claim is unreliable.

A run may also contain a `run-metadata.json` with `candidate_txids`. That
list is every 64-digit hex string in the report, so it also holds CMRs,
asset IDs and hashes; check only the ones the report presents as
transactions.

If the run broadcast nothing, find out why from its log. A run blocked by a
service failure, such as a faucet or Esplora error, is blocked by its
environment, not by the docs. Quote the error text, and record the goal as
“Environment” in the per-goal table.

## 5. The web page

Find the page the agent built for G5. Compare it with
`REFERENCE_DIR/examples/allowance-lwk/index.html` if the agent started from
it, and read `REFERENCE_DIR/examples/allowance-lwk/README.md`, “Constraints
to keep when changing the page”, before judging any library calls.
Check that:

- the files it imports or fetches exist at the paths it uses, and that it
  would be served over `http://` as the tutorial says;
- compiling passes every parameter the adapted contract declares, with the
  right types;
- funding uses an explicit output to the covenant address;
- every withdrawal it builds has the outputs the contract checks, in the
  order it checks them, including the commission;
- the confirmation the beneficiary sees before signing names the commission
  output and its amount;
- any `lwk_wasm` calls the agent added or changed follow the ownership rules
  in that README section: builders move on every call, `TxOut` arrays are
  consumed, and the two `Address` constructors are not interchangeable.

You can't run the page, so judge each point from the source and say so.
Name any code path that you expect to throw at run time, and why.

## 6. The manifest

Find the manifest handed to Humid. In the tutorial, the page passes
`REFERENCE_DIR/examples/allowance-lwk/txmanifest.humid.json` to Humid. Humid
reads the `0.1.0` dialect described in
`REFERENCE_DIR/examples/allowance-humid/README.md`, which differs from the
`0.3.0` dialect in `REFERENCE_DIR/examples/allowance/`. Check the manifest
against the dialect the agent says it targeted, and against the adapted
contract, using the method in `EXPLANATION.md`, “Checking a manifest you
didn't write”. Check in particular that it declares the
commission output, that its parameters match the contract's, and that its
output order matches the contract's.

If the run used `txmanifest-wallet` to exercise a manifest, note which
dialect that tool read. A manifest that `txmanifest-wallet` accepted hasn't
thereby been shown to work in Humid.

## 7. The Humid extension

The tutorial has the reader download a released Humid archive, check its
SHA-256 hash, and unpack it. It doesn't build Humid. Check from the log
whether the agent:

- downloaded the release the tutorial names, and checked the hash against
  the one the tutorial gives;
- unpacked it, and whether `manifest.json` in the unpacked directory parses
  as JSON with `"manifest_version": 3`. Check this by command if the
  unpacked directory is in `RUN_DIR`; otherwise rely on the log and say so.

If all of these pass, record the extension as “installable as
downloaded”. If the agent built Humid from source instead, record which
page told it to. Humid itself is unmodified in this test, so you don't need
to judge its code.

## 8. Audit-log spot check

Take every audit row with severity Blocker or Contradiction, and up to five
rows with Major friction. Also take every statement anywhere in the report
that something isn't documented, doesn't exist, or contradicts the
toolchain. For each, open the cited page and check that it says what the
row's `evidence` says. Classify each row:

- confirmed: the page says that, and the gap is real;
- page covers it: the page does answer the reader's question, and the agent
  missed it;
- misquoted: the page doesn't say what the evidence claims;
- environment: a service or tool failed, and the docs aren't at fault;
- not checkable: no URL, or the page has changed since the run.

Agents often cite line numbers in `https://docs.simplicity-lang.org/llms-full.txt`.
That file joins every page, with a `Source:` line under each page's heading,
so find the nearest `Source:` line above the cited line to learn which page
it belongs to. A function that an agent calls missing from one reference
page may be on another: for example, check both the jets reference and the
standard library reference before confirming that a function isn't
documented. An agent's search can also miss what is there, for example
when it cuts off `grep` output with `head`.

Rows of the second and third kinds are the most important thing for the
operator to see, because they would otherwise be counted as documentation
defects.

## 9. Effort and outside knowledge

For G2, G3, G5 and G7, record:

- lines of code or manifest the agent wrote, excluding unchanged copies;
- API symbols it used that no in-corpus page names;
- every place it left the corpus, from its own log.

This measures what a human reader in the protocol's persona would have had
to do, which an agent run tends to understate.

Then check the agent's persona-fidelity table (report section 6) against
the log. Look for knowledge used before any page supplied it: a tool,
project, API or error message named before the log shows the agent reading
about it, or an install command, flag or package used without a cited page.
List every case missing from the table, with the log line where it first
appears. For each, say where a reader in the persona would get it: the
persona's background as listed under Role in the protocol, a docs page
(cite it), or neither. Also list table rows whose classification you
disagree with.

Check the `PERSONA LIMIT:` entries the same way. Look in the run directory
for supporting code the goals didn't ask for: tools, libraries, wrappers,
format converters, patches to dependencies, and any single step with more
than about 50 lines of code that no page provides. List every case without
a `PERSONA LIMIT:` entry, with its path and size.

If a goal scored “Docs sufficient” depended on knowledge that you or the
agent classified as “neither”, or on work past a persona limit, record that
as a Contradicted claim in the per-goal table.

# Calibration

If `OPERATOR_CHECKS` is present, compare it with your verdicts for checks 5
to 7 point by point, and list each disagreement. Don't change your verdicts
to match. The disagreements are how the operator learns how far to trust
static grading on runs nobody checked in a browser.

# Output: GRADE.md

Start with the run directory name, today's date, and your model ID.

Then one table with a row per goal, G1 to G11:

- the agent's claimed status;
- your verdict on that claim: Verified (checked by running something or on
  chain) / Plausible (consistent on reading, not run) / Unsupported (no
  evidence either way) / Contradicted (evidence shows it is false) /
  Environment (blocked by a service or tool failure, not by the docs);
- the evidence, in one line.

Then, in this order:

1. How the agent found the tutorial, or that it didn't.
2. The step table check: rows whose status you disagree with, and why.
3. The `DOC-GAP` annotations missing from the report, from check 1.
4. Checks 2 to 7, each with its findings and evidence.
5. The audit-log spot check, as a table of row id, classification and a
   one-line reason.
6. The effort table from check 9, then the unflagged prior knowledge and
   the disputed persona-fidelity rows, then the unlogged persona-limit
   work.
7. Calibration, if `OPERATOR_CHECKS` was given.
8. A summary of no more than five sentences: how far this run's
   documentation findings can be trusted, and the single most important
   reason.
