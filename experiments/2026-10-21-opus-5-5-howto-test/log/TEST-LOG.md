# Test log: allowance covenant HOWTO

- Document under test: `simplicity-lang-org/docs/getting-started/allowance-howto/HOWTO.md`
- Tester: Claude Opus 5.5 (Claude Code), acting as a developer following the guide, with the user running commands the sandbox can't.
- Date: 2026-10-21
- Work tree: `../work/simplicity-demo` (fresh clone, HEAD `7864241`)

Severity tags: **[blocker]** stops progress, **[major]** costs real time or risks loss, **[minor]** friction, **[nit]** wording.

## Get the files

- Clone succeeded. `allowance-web/HOWTO.md` in the clone is byte-identical to the docs-site copy under test.
- [nit] "Read these steps in a browser and run the commands in that directory" is odd on the docs site, where the reader already is in a browser; it reads as written for the repo copy.
- [nit] "No step here costs money": true, but the repo's own guidelines ask for "tLBTC"/"test Liquid bitcoin" rather than "testnet L-BTC" (line 3).

## Step 1. Get the contract

- `contracts/allowance.simf` exists, 164 lines, ends in `fn main()`. Matches "about 160 lines". Pass.

## What you need (tool check)

- Sandbox: `curl`, `cargo`, `wasm-pack`, `bun`, `clang` all missing for the agent. Asked the user to run the check block.

Results (user's machine): git 2.43.0, curl 8.5.0, Python 3.12.3, cargo 1.91.1 (meets 1.91), wasm-pack 0.15.0, clang wasm32 present, `simplex` already at `~/.simplex/bin/simplex` (installer route). **bun missing.**

- [minor] The table's first Bun route is `npm install -g bun`, but `npm`/Node isn't among the assumed tools (`git`, `curl`, `python3`). A reader without Node hits a second missing tool. The `curl | bash` installer further down needs only what's already assumed, so it may be the better first suggestion.
- [minor] The check block chains `git && curl && python3` with `&&`, then runs the rest unconditionally, so it works, but `bun` failing prints Ubuntu's command-not-found noise. Fine, just noisy.
- [minor] User's `!` shells are fresh per command, so every block gets `GUIDE=<abs path>` prepended, which the guide anticipates. Works, but means the guide's `cd "${GUIDE:?}"` convention costs every block an edit.
- Bun only matters for 3c; proceeding with Step 2 using the existing installer-route `simplex`, as the guide allows ("If you already have `simplex` that way, use it and skip both builds above").

## Step 2. Regtest tests

- `simplex init`, the `rm`, the `sed` and `cargo add anyhow@1` all worked.
- **[blocker as written]** `cargo update -p proptest --precise 1.11.0` now fails:
  ```
  error: failed to select a version for the requirement `proptest = "=1.12.0"`
  required by package `smplx-test v0.1.1`
      ... of package `smplx-std v0.1.1`
  ```
  `simplex init` pulled `smplx-std 0.1.1`, whose `smplx-test 0.1.1` now pins `proptest = "=1.12.0"` exactly. Upstream has evidently fixed the `rand` 0.9/0.10 mismatch, so the pin is now both unnecessary and fatal. Because the guide joins this into the setup block, a reader running the block with `&&` (or `set -e`) stops here and never reaches `simplex build`. Run line-by-line, the error is loud and the reader is likely to stop anyway.
- [major] The HOWTO's warning says "`REFERENCE.md` explains why, and when the pin can go." REFERENCE.md explains why, but doesn't say when the pin can go, and its error table doesn't list this message. A reader has to work out on their own that the failure means "skip this line".
- Suggested fix: drop the pin line, or make it conditional on `smplx-std` 0.1.0, and add this exact error to the REFERENCE error table with "skip the pin".
- [nit] `simplex --version` printed nothing visible in the user's paste (to confirm).
- Workaround as a reader: skip the pin line and continue.
- After skipping the pin: `simplex build && simplex test` → **2 tests passed** (`allowance_drains_over_successive_withdrawals`, 28.3s; `withdrawing_before_the_interval_is_rejected`, 1.7s). Matches "You should see two passing tests". The runner is nextest, which the guide doesn't mention, though nothing about that is confusing.
- Binary is `Simplex 0.1.0` (installer route) with library `smplx-std 0.1.1`. The guide's version-skew warning didn't fire on this combination. The warning is plausible but couldn't be reproduced here.
- Didn't run the optional `simplex test -- -vv` trace.
- No elementsd install was needed; `simplex` provided the regtest node as described.

## Step 3b. LWK wasm build (in progress)

- [minor] The guide warns about the long, silent wait but doesn't give the reader anything to do during it. 3c's Humid clone and `build:wasm` scripts build from Humid's own submodules and don't depend on 3b, so the guide could suggest starting 3c in a second terminal. Reading `EXPLANATION.md` ("What the contract enforces") is another natural use of the wait. Either would turn dead time into progress. (Prompted by the user pointing out that a human would get bored here.)
- Finished: LWK `7ad29620` ("wasm: use Jade cache"), `wasm-pack` reported "Done in 3m 32s". `Simplicity feature: present`. `vendor/lwk_wasm.js` (385 KB) and `vendor/lwk_wasm_bg.wasm` (15.3 MB) copied. Pass.
- [nit] The `wasm-pack` output ends with two `[INFO]` lines about a missing `repository` field and a missing LICENSE file. These are harmless, but a reader may wonder about them. A one-line "ignore these" would settle it.
- [nit] "`wasm-opt` runs for several minutes on a module this size" sits *after* the blocks and the success check, so the reader learns about the wait after it's over. It belongs before the build block, next to the 3-intro warning. The whole build, including wasm-opt, took about 3.5 minutes here.

## Step 4. Serve the page

- Port 8099 was already in use (a leftover server from the user's own earlier manual run of this guide, serving a different clone of the same page). `python3 -m http.server 8099` failed with `OSError: [Errno 98] Address already in use`.
- [major] Worse than the error: a reader who misses that one-line failure (easy with `&`, which backgrounds the job and returns the prompt immediately) will open `http://localhost:8099/` and get a page **from some other directory**. Here it was byte-identical, so it would look right while loading another clone's `vendor/`. A fixed port is a realistic collision for any developer, e.g. a leftover server from an earlier run of this guide.
- [major] The cleanup line `pkill -f "http.server 8099"` kills *any* process matching that pattern, including someone else's server. Prefer `kill %1` in the same shell, or recording `$!`.
- Suggested fix: add a sentence "If the port is in use, pick another and use it in the URL", and document `Address already in use` in the error table.
- Workaround: served on 8199 from the agent sandbox (`python3 -m http.server 8199`), confirmed `application/wasm` MIME type and full 15.3 MB wasm served.
- Browser (user, port 8199): Library row loaded, Simplicity feature present, Open wallet → Request testnet funds → Sync & show balance all worked "properly and smoothly". Pass.

## Steps 5–9 (done by the user in the browser, ahead of the agent)

Covenant `tex1pzpkq29fxh5h0xgaj889f4pnfg0ugz9lltfufpzn7jnyd3ws23f3qrwl5fw`, MIN_DISTANCE 3 (inferred from nSequence 3).

- **Fund** `0a456a7a…85df`, block 2671225, fee 27 sats. vout0 `v1_p2tr` explicit 8000 to the covenant; vout1 change is confidential (value hidden); vout2 fee. Matches Step 7 ("One output has type `v1_p2tr` and the value you locked"). The covenant output is explicit, as the guide requires.
- **PartialWithdraw** `b3db506f…41a4`, block 2671231 (6 blocks after funding, so past the 3-block timelock). vin0 spends the covenant with `sequence 3` and a 4-item witness. vout0 `v1_p2tr` 3000 back to the same covenant address; vout1 `v0_p2wpkh` 4500 to the beneficiary; vout2 fee 500. **Output order matches Step 9's description exactly** (0 remainder, 1 payout, 2 fee).
- [minor] 8000 − 3000 = 5000 left the covenant, but the beneficiary received 4500: the 500-sat fee comes out of the withdrawn allowance. Step 9 says "output 1 paying you" without saying the payout is `ALLOWANCE_AMOUNT` minus the fee. A reader checking the numbers may think 500 sats went missing. (Assumes ALLOWANCE_AMOUNT = 5000; confirming with the user.)
- [nit] A 500-sat fee against a 27-sat funding fee looks large. If it's a fixed fee in the contract or page, one sentence saying so would preempt the question.
- Step 8 by hand (Python `urllib` in place of `curl`, against the guide's Esplora endpoints): one UTXO at the covenant, 3000 sats, height 2671231, tip 2671231 → depth 1 < 3, so timelocked. Formula and endpoints work as documented.
