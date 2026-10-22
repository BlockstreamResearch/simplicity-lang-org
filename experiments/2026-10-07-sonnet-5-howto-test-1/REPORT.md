# HOWTO test report: 2026-10-07-sonnet-5-howto-test-1

- Model: Claude Sonnet 5 (`claude-sonnet-5`), run as Claude Code
- Date: 2026-10-07 (US Pacific)
- Session: `df12a8b7-80ef-4d21-8574-9ccd57f4d222` (transcript in `session-transcripts/`)
- Working directory: ~/src/simplicity-dev-experiment-1/howto-standalone (later moved to ~/src/allowance-demo-howto/howto-standalone and revised)

This run didn't write a log file. The prompt and the agent's final report below are
extracted verbatim from the session transcript.

## Prompt

````text
Hi! I would like you to test some instructions that we made here called `HOWTO.md`. Please see how far you can get (working in a scratch subdirectory) following those instructions, optionally using other resources *inside of this directory* (`howto-standalone`). There are tons of other resources, checkouts, tools, experiments, logs, etc., on this computer and even in this repo, but I would like you to deliberately ignore those for this experiment because I want to know how complete and useful the `HOWTO.md` itself and the other items in `howto-standalone` are.

You can ask me questions or point out gaps if you have them.

I also want to point out that the sandbox may restrict running various things in which case you can ask me to run commands (or try things in a browser as a human) instead of trying to work around the sandbox. It is fine to use the existing prebuilt examples (e.g. for the web app) instead of trying to recreate them. If you want to try to recreate them you might find that you need other documentation which I might be able to provide to you, but it might be simpler to first see if everything works properly using the existing documentation.
````

## Final report

I've gone as far as this sandbox allows. Here's what I found, organized by what actually got tested versus what's blocked by missing tools.

## Sandbox limits (confirmed, not worked around)
No `cargo`/`rustc`, no `node`/`npm`/`bun`, no `wasm-pack`, no Chromium, and no `curl` binary (Python's `urllib` substitutes fine). The sandbox also silently blocks writing/extracting a downloaded binary (tried fetching the real `tx-manifest-wallet` release — every file in the tarball failed to extract with "Operation not permitted"). That rules out *running* Chapters 3, 7 (live Humid), 8, and the `simc`/LWK-build parts of 9. Network access itself works fine — I could reach GitHub, both Liquid testnet Esplora mirrors, and the faucet.

## What I could actually run, and what it found

**Chapter 6 (manifest) — ran `jsonschema` against all 4 manifest copies.** The 0.2.0 manifest validates clean. All three 0.1.0/Humid-dialect manifests (including the one Chapter 7, the *recommended* path, hands to Humid) fail schema validation: they carry a `confidential: false` field in `utxo_types.allowance` that `txmanifest.schema.json` rejects via `additionalProperties: false`. So step 1 of Chapter 6's own "how to check a manifest cheaply" doesn't actually work for the dialect most readers will use.

**Chapter 9 webapp indexer — ran `indexer.py` live against a real Liquid testnet address with real UTXOs.** It crashed: `KeyError: 'value'`. Esplora returns `valuecommitment`/`assetcommitment` (no `value` key at all) for confidential outputs, and `instances_for()` doesn't handle that. I then checked the Chapter 7 and Chapter 8 worked examples' own JS for the same pattern — both do `BigInt(u.value)` with no guard, which throws `TypeError` on `undefined` the same way. **This matters a lot given the whole document's central warning**: if a confidential output ever lands at a covenant address (Chapter 1's "costliest mistake," e.g. a user fat-fingering their own funding step), it doesn't just strand those funds as documented — it crashes the *entire* status refresh for that address in all three implementations, hiding every other legitimate instance there too, not just the bad one. None of the three worked examples defend against this.

**Same indexer — a smaller, separate bug:** `webapp/server/indexer.py:48` computes `blocks_since = tip - block_height` (no `+1`), while both `allowance-humid-only/index.html:797` and `allowance-lwk/index.html:1171` use `tip - block_height + 1`. The `+1` version matches standard "confirmations" and real BIP68 mempool-acceptance math; the webapp is one block (~1 min on Liquid) more conservative than it needs to be.

**Chapter 2 (contract text) — diffed `contracts/allowance.simf` against the live docs.simplicity-lang.org homepage.** They're no longer byte-identical, despite Chapter 2's claim. The live site currently has terser comments and 10 mkdocs annotation markers; every copy in this repo has longer prose and only 6 markers.

**Line-count claims — ran `wc -l`.** HOWTO.md Ch4/Ch7 and README.md say the recommended worked example is "486 lines," "a quarter of the code," "~4x" vs. the LWK example. Actual: 976 lines vs. 2144 — about 2.2x, not 4x.

**Version drift — hit the GitHub releases API.** `tx-manifest-wallet` latest is v0.3.0; HOWTO.md says its own observations were made against v0.2.2. Expected, given the doc's own warning that this tool is a moving target — just confirming it's already one release stale today.

## What I couldn't run at all
Chapter 3 (Simplex/regtest — needs `cargo`), Chapter 7's live Humid flow and Chapter 8's LWK wasm build (need `bun`/Chromium/`wasm-pack`/`cargo`), and the Chapter 9 CLI tool (binary download blocked by sandbox policy).

How do you want to handle the blocked parts — should I ask you to run specific commands and paste output (e.g. the Humid clone/build, or `cargo install simplicityhl`), or is the static-review-plus-what-I-could-execute level of pass what you were after for those chapters?
