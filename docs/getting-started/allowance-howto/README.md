# The allowance-covenant guide

Start with `HOWTO.md`: eleven steps that lock testnet L-BTC in a Simplicity covenant, draw
it down, close it out, and then run the same contract through a browser-extension wallet.

Three documents, split by purpose:

- `HOWTO.md` is the task. Commands to run, and what you should see after each one.
- `EXPLANATION.md` is the background: what the contract enforces and why the architecture
  looks like this. Not needed to finish the steps.
- `REFERENCE.md` is for lookup while you work: exact RPC shapes, manifest field
  behaviour, an error-to-cause table, and other ways to drive the same contract.

Everything the guide needs is in this directory. A few files it cross-references live
elsewhere; the last section lists them so that nothing here looks accidentally missing.

## What is here

```
HOWTO.md                              the steps
EXPLANATION.md                        background, optional
REFERENCE.md                          lookup material
contracts/allowance.simf              the contract, also published on docs.simplicity-lang.org
examples/
  allowance-simplex/                   regtest integration tests (Step 2)
  allowance/                           the manifest, its schema, and one set of call values
  allowance-lwk/                       the page the steps use
  allowance-humid/                     the wallet patch and manifest dialect notes
  allowance-humid-only/                a wasm-free variant, for reference
webapp/                               a CLI-driven two-party app, reference only
docs-notes/mainnet-notes.md           the long form of the mainnet notes
```

`examples/allowance-lwk/` is the page the steps drive. It compiles the contract and builds
transactions itself through LWK compiled to wasm, and it can also hand the same contract to
the Humid extension as a manifest, which is what Step 11 does.
`examples/allowance-humid-only/` does the wallet half alone, with no wasm and no build
step, and `REFERENCE.md` says when that shape is worth copying. Each has its own README.

## External things you will need

Nothing in this directory needs building, but the guide points at four projects that live
elsewhere:

- [Humid](https://github.com/BlockstreamResearch/humid), the browser-extension wallet,
  built in Step 3c and used in Step 11. Apply
  `examples/allowance-humid/humid-allowance-fixes.patch` to it; without that patch no
  withdrawal through the wallet works. Step 3c has the exact commands.
- [Simplex](https://github.com/BlockstreamResearch/smplx) for Step 2's tests, installed
  with `cargo install`; needs a Rust toolchain.
- [LWK](https://github.com/Blockstream/lwk) for the page itself, built to wasm with
  `--features simplicity`. Step 3b has the commands.
- [`txmanifest-wallet`](https://github.com/stringhandler/txmanifest-wallet) as a prebuilt binary. Optional.

A Liquid testnet faucet supplies coins (Step 4). Everything here is testnet only.

## Not included

- `examples/allowance-lwk/vendor/`: the 15 MB compiled wasm module. It is specific to the
  machine that built it, and Step 3b of `HOWTO.md` says how to build it.
- `logs/LOG.md`: a build log that several files under `webapp/` and a few of the example
  READMEs cite by step number. Those citations do not resolve here, and nothing in the
  guide depends on them.
- `webapp/backend/`: a Rust tree that `webapp/API.md` mentions and `REFERENCE.md` tells
  you to ignore. `webapp/server/` is the implementation that runs.
- Wallet files holding plaintext mnemonics, and saved instance and state files. Both
  worked examples create their own.
- `examples/last_will/`: a second manifest worth comparing against, which lives in the
  `txmanifest-wallet` repository.

`examples/allowance-humid/HUMID-BUGS.md` is a copy. The maintained version lives in the
Humid checkout it describes, so check there before relying on its status lines.
