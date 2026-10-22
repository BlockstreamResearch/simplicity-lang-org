# HOWTO test report: 2026-10-07-sonnet-5-howto-test-2

- Model: Claude Sonnet 5 (`claude-sonnet-5`), run as Claude Code
- Date: 2026-10-07 (US Pacific)
- Session: `3ea34a3b-1e9c-4670-9ecb-4242e73b5bc4` (transcript in `session-transcripts/`)
- Working directory: ~/src/allowance-howto-test (a copy of howto-standalone; the copy in this directory was refreshed on 2026-10-11, after the run)

This run didn't write a log file. The prompt and the agent's final report below are
extracted verbatim from the session transcript.

## Prompt

````text
Hi! 

<pasted_content id="8e62">
❯ Hi! I would like you to test some instructions that we made here called HOWTO.md. Please see how far you can get (working in a   
  scratch subdirectory) following those instructions, optionally using other resources inside of this directory                    
  (howto-standalone). There are tons of other resources, checkouts, tools, experiments, logs, etc., on this computer and even in   
  this repo, but I would like you to deliberately ignore those for this experiment because I want to know how complete and useful  
  the HOWTO.md itself and the other items in howto-standalone are.                                                                 
                                                                                                                                   
  You can ask me questions or point out gaps if you have them.                                                                     
                                                                                                                                   
  I also want to point out that the sandbox may restrict running various things in which case you can ask me to run commands (or   
  try things in a browser as a human) instead of trying to work around the sandbox. It is fine to use the existing prebuilt        
  examples (e.g. for the web app) instead of trying to recreate them. If you want to try to recreate them you might find that you  
  need other documentation which I might be able to provide to you, but it might be simpler to first see if everything works       
  properly using the existing documentation.                                                                                       
</pasted_content id="8e62">

 (`howto-standalone` was subsequently *renamed* to `allowance-howto-test` so these instructions refer to this current directory here).

Really please try to avoid reading or accessing resources elsewhere. My development laptop is *FULL* of tools and docs related to this technology but my question for you is *NOT* how to achieve something but to what extent `HOWTO.md` and the provided files teach and help you to achieve it. We already have 6 working versions of this project elsewhere, so the question is "can you make a working version of this from what I gave you here?" not "can you make a working version of this at all costs?".
````

## Final report

I worked through `HOWTO.md` as the target reader (knows HTML/JS, no Simplicity/Liquid background), using only files inside this directory plus the three network calls the guide and `TESTER-PROMPT.md` explicitly permit (the Liquid-testnet faucet and both Esplora mirrors — no other URLs, no GitHub, no docs.simplicity-lang.org). Everything below is reproducible; I did real checks rather than just reading the prose.

**Environment note, not a documentation bug:** `cargo`, `rustc`, `bun`, `node`, `wasm-pack`, and `chromium` are all absent from this sandbox. That blocks executing Chapter 3 (Simplex, needs Rust), Chapter 7 (needs bun + Chromium + the Humid extension), and Chapter 8 (needs Rust + wasm-pack) — but the guide warns about all three toolchain needs before you'd sink work in, so this is an environment limit on me, not a gap in the document. I did not try to work around it.

## Findings, most severe first

**1. Chapter 2's "byte-identical to the docs homepage copy" is false.**
- Expected: `contracts/allowance.simf` to be a byte-for-byte copy of what Chapter 1 told me to read on docs.simplicity-lang.org first.
- Actual: `scratch/docs_homepage_contract_raw.txt` (a raw capture of that homepage text, already present in this standalone copy) diffs substantially against `contracts/allowance.simf` — the header comment is rewritten and tripled in length, several function comments are expanded, and the page's own `// (N)!` annotation markers go up to `(10)` while the local copy only has `(6)`, at different positions. The actual code (every jet call, assert, match arm) is identical. This is independently corroborated by `examples/allowance-simplex/README.md`, which already admits the docs-page original "strips the `// (N)!` ... markers ... and lightly rewords a couple of comments" relative to this repo's version — i.e., the repo's own notes know the two differ, but Chapter 2 still calls them byte-identical.
- Could proceed: yes — the logic is unaffected, I verified it line-by-line against the source and every substantive claim in Chapter 2 (full/partial withdrawal shapes, `same_asset`'s check-then-read idiom, `enforce_single_input` running unconditionally, the BIP68 Left/Right distance-vs-duration rejection) is accurate.
- Fix: say "functionally identical, comments rewritten for this guide" rather than "byte-identical."

**2. Chapter 6's manifest-review step 1 doesn't say the schema is dialect-specific.**
- Expected: "Validate it against `txmanifest.schema.json`" (step 1 of the "cheap check order") to be a safe, generic first move for any manifest, including the Chapter-7/Humid one.
- Actual: I ran `jsonschema` against both shipped manifests. `examples/allowance/txmanifest.json` (0.2.0) validates clean. `examples/allowance-humid-only/txmanifest.json` (0.1.0 — the manifest the *recommended* Chapter 7 path actually uses) fails: `Additional properties are not allowed ('confidential' was unexpected)`. That manifest is correct for Humid (its own fixtures require that field); the schema just doesn't cover the 0.1.0 dialect.
- Could proceed: yes, but misled — nothing in Chapter 6 flags this, so a reader would plausibly "fix" a working manifest by deleting the field the schema complains about.
- Fix: one sentence noting the schema only covers the 0.2.0/`tx-manifest-wallet` dialect, not Humid's 0.1.0.

**3. `webapp/API.md` points at files this standalone copy doesn't have.**
- Expected: Chapter 9 says `webapp/API.md` is "worth reading" as a self-contained endpoint contract.
- Actual: it cites `logs/LOG.md`, `webapp/backend/STATUS.md`, `docs-notes/txmanifest-notes.md`, and `logs/txmanifest-implementation-log.md` for "full reasoning trail" on nearly every endpoint — none exist here. The top-level `README.md` does warn that `logs/LOG.md` and `webapp/backend/` were deliberately dropped, but `docs-notes/txmanifest-notes.md` and `logs/txmanifest-implementation-log.md` aren't mentioned there at all, so there's no warning at all for those two.
- Could proceed: yes, the endpoint descriptions stand on their own; only the "see X for why" footnotes are dead ends.
- Fix: strip the dead cross-references, or add one line noting they're outside this standalone copy.

**4. (Minor, confirms the guide rather than contradicts it)** I ran the faucet and both Esplora mirrors for real. Results matched Chapter 5/Appendix exactly: `blockstream.info` sends `Access-Control-Allow-Origin: *`, `liquid.network` sends none, and the faucet sends none and returns `{"result":"Error"}` for a bad address rather than failing the request — all as documented. No finding here, just logging that I checked it rather than took it on faith.

**5.** Chapter 9's webapp needs the third-party `tx-manifest-wallet` binary (download from a GitHub release, run it as a subprocess). I didn't fetch or execute that binary myself — downloading and running an arbitrary third-party executable seemed like something to check with you first rather than just do. The server (`webapp/server/app.py`) does start cleanly stdlib-only with no binary present; I didn't get further than that.

## The two closing questions

1. **Where would a non-AI reader most likely give up?** Chapter 7, at the Humid build step — `git clone --recursive`, `bun install`, `bun run build`, load an unpacked extension, apply a patch, rebuild, reload — for someone who's never built a browser extension before, that's a lot of unfamiliar machinery stacked before the "486 lines of ordinary web code" payoff the chapter promises, and any one step failing (no `bun`, a submodule miss, a stale build) looks like it broke something in *this* guide rather than in Humid.

2. **Single highest-value change?** Fix finding #1 — the byte-identical claim. It's the first concrete, checkable claim in the whole document, it's placed right where Chapter 1 tells the reader to go cross-reference an external page, and it's wrong in a way that's trivial to verify (as I just did) and easy to fix (either make the files actually match, or soften the wording).

I stayed entirely inside this directory and the three explicitly-permitted network endpoints — no other URLs, repos, or local resources were touched. Want me to keep going (e.g., have you run the Humid/Simplex/LWK build steps and paste me the output so I can pick up from there), or is this enough to act on?
