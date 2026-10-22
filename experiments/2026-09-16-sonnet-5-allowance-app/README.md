# SimplicityHL allowance contract — experiment

An evaluation of SimplicityHL/Liquid Network for building a small financial app: a
benefactor deposits tLBTC into the `allowance.simf` covenant (from
docs.simplicity-lang.org's homepage) and a beneficiary withdraws a limited amount, no
more than once per a set number of blocks, until the balance is exhausted. Full task
description: `prompt`. This README is a map of the repo; the actual narrative —
including dead ends, a couple of real mistakes and how they were caught, and doc gaps
found along the way — is in `logs/LOG.md`.

## Layout

- `contracts/allowance.simf` — the contract, copied verbatim from the docs homepage.
- `logs/LOG.md` — the main experiment log. Start here for the full story.
  - `logs/backend-implementation-log.md`, `logs/txmanifest-implementation-log.md` —
    detailed sub-logs for two implementation efforts (see below), referenced from the
    main log rather than duplicated into it.
- `docs-notes/` — reasoning too long for the log's narrative flow:
  `txmanifest-notes.md` (what txmanifest actually is, corrected after an early
  research mistake), `mainnet-notes.md` (what would need to change for Liquid
  mainnet — not attempted, no mainnet funds available).
- `examples/allowance/` — the working `txmanifest.json` (+ schema, params, and
  real recorded state from a live testnet run) that drives the actual app.
- `webapp/` — the web app:
  - `webapp/server/` — **the real, working backend** (Python, stdlib only). Drives
    the `tx-manifest-wallet` engine as a subprocess for every contract-touching
    operation. See `webapp/server/README.md` to run it.
  - `webapp/frontend/` — static frontend (benefactor / beneficiary / about tabs),
    served by the Python backend.
  - `webapp/API.md` — the endpoint contract for the above.
  - `webapp/backend/` — an earlier, abandoned attempt: a hand-rolled Rust server
    doing PSET construction and signing directly against the `simplicityhl` crate.
    Real, substantial code, but **never compiled or ran** — this sandbox has no C
    compiler. Kept for the record with `webapp/backend/STATUS.md` explaining why.

## Running it

See `webapp/server/README.md`. Short version: download the `tx-manifest-wallet`
binary, then `python3 webapp/server/app.py`. Each running instance is one party's own
wallet — a benefactor and a beneficiary each run their own copy.

## The short version of what happened

1. Read the contract and the docs, found the reference `simplicity-demo` Rust repo
   the quickstart points to, and used it to plan a bespoke Rust backend.
2. That backend's code was written but **never compiled** — this sandbox has no C
   toolchain and no way to install one. A real developer's machine wouldn't hit this.
3. Separately, a first research pass wrongly concluded the "txmanifest book" and its
   reference wallet didn't exist — a self-inflicted research failure (a summarizing
   fetch dropped the actual page links), caught when directly asked "what URL did you
   try, and what did you get back?". They're real:
   `stringhandler/txmanifest-wallet` is a working, prebuilt-binary, generic
   txmanifest-consuming engine.
4. Rebuilt around that instead: wrote a manifest for the allowance contract, and ran
   a full, real, independently-verified lifecycle on Liquid testnet — fund, a
   correctly-rejected early claim, a correct partial claim, a correct final claim —
   driven entirely by that engine.
5. Built a thin Python backend + web frontend around it (Python because it needs no
   compiler either). Found and fixed a real concurrency bug of my own along the way,
   and hit (and documented) real rate-limiting from the shared public block explorer
   this all depends on.

Every "found a mistake" moment above is treated as a first-class result, not
something to bury — see `logs/LOG.md` for the full account, written to be useful for
revising the prompt for a future iteration of this experiment.
