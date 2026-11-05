# Reference

Lookup material, organized for finding one fact rather than for reading through.

**To run it yourself, start with [Build a complete Simplicity application, from contract to web to wallet](HOWTO.md).** For why any of this is
shaped the way it is, see [`EXPLANATION.md`](EXPLANATION.md).

- [Errors and what causes them](#errors-and-what-causes-them)
- [Humid wallet API](#humid-wallet-api)
- [`processConfidentialTransaction`](#processconfidentialtransaction)
- [Deriving keys and addresses from the wallet](#deriving-keys-and-addresses-from-the-wallet)
- [How Humid treats a manifest](#how-humid-treats-a-manifest)
- [Installing and running Simplex](#installing-and-running-simplex)
- [Chain access](#chain-access)
- [Other clients for the same contract](#other-clients-for-the-same-contract)

The Humid sections describe [Humid](../../glossary.md#humid) 1.1.4 (`a6d211d`), and their
file paths are relative to a Humid checkout. Humid changes quickly, so check a newer release against its source.

## Errors and what causes them

| Message | Cause | Fix |
|---|---|---|
| `asks for a relative timelock, and this wallet sets one sequence for the whole transaction — which would time-lock the outputs funding it as well`, with `reject: unimplemented-construct`, on any withdrawal | the relative-timelock bug in unpatched Humid | apply the patch from Step 11a, rebuild, reload the extension |
| `would inherit that wait`, with `reject: unimplemented-construct`, on a withdrawal in Humid mode | the instance holds less than the amount Humid reserves for the fee, so Humid would add a coin from its own wallet, and that coin can't share the instance's timelock | Humid can claim this instance only when its fee rate falls low enough, which may not happen for a small balance; to avoid it, lock a whole multiple of the allowance, as in Step 7 |
| `FullWithdraw failed: This instance holds less than the fee.` | the instance holds 500 sats or less, which the page's fixed 500-sat fee would use up | the page can't claim this instance; to avoid it, lock a whole multiple of the allowance, as in Step 7 |
| `"FullWithdraw" pays nothing, so there is nothing to build.` | the change-only-output bug | same patch |
| `unsupported platform: …` from `simplexup` | the Simplex installer supports only Linux and macOS | run the tutorial on Linux or macOS |
| ``error: linker `cc` not found``, or `failed to find tool "cc"` from `secp256k1-sys` or `simplicity-sys` | there isn't a C compiler and linker installed, which Rust builds need and `rustup` doesn't provide | install your system's C build tools, such as `build-essential` on Debian or Ubuntu, or the Xcode Command Line Tools on macOS with `xcode-select --install`, then run the command again |
| `cannot be built because it requires rustc 1.91.0 or newer` | Rust is older than `smplx-std`, the [Simplex](../../glossary.md#simplex) library the tests build against, needs | `rustup update stable`, then run `simplex build` again |
| ``no `ProgramSignature` in `transaction` `` and ``the `?` operator cannot be applied to type `u64` `` from `simplex test` | the project's `smplx-std` isn't 0.2.0, the release `allowance_test.rs` is written for | in `allowance_example`, run `cargo add smplx-std@0.2.0`, then test again |
| `No available targets are compatible with triple "wasm32-unknown-unknown"` | the `clang` on your `PATH` has no WebAssembly backend | install LLVM from your package manager, or from Homebrew on macOS, and put its `clang` first on your `PATH` |
| `npm error code EACCES` from `npm install -g bun`, with `permission denied, mkdir '…/lib/node_modules'` | npm's global install directory belongs to the system, not to your user | point npm at a directory you own with `npm config set prefix ~/.npm-global`, add `~/.npm-global/bin` to your `PATH`, and install again; see npm's [guide to `EACCES` errors](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) |
| `fatal: destination path '…' already exists and is not an empty directory`, or a similar complaint from `simplex init`, `rm` or `git apply`, when you run a step's block again | the first run already created that directory, removed that file or applied that patch | harmless; check the result the step says you should see, which comes from the block's last command |
| `reject: shortfall`, with `This account holds 0 of the … needed` | Humid's funds are unconfirmed, or it is on mainnet | wait a minute for the funding to confirm; check that **Liquid Testnet** is selected in Humid's network menu |
| `Unlock the wallet to continue.` | the wallet is locked | open it from the Extensions button and enter the password; it re-locks periodically |
| `X is neither a parameter nor an argument of this action` | usually `instance` single-nested instead of double-nested | see the nesting rule below |
| `[object Object]` instead of a message | the real text is in the thrown error's data | read `reject` and `reason` off it |
| `No handler for method` | a chain method called directly | tunnel it through `wallet_invokeMethod` |
| `non-BIP68-final` | not enough blocks have passed | wait; the [timelock](../../glossary.md#timelock) is working |
| `Expecting value: line 1 column 1 (char 0)` from `python3 -m json.tool` | Esplora replied with an error message instead of JSON, usually because a placeholder such as `<fund-txid>` is still in the command, or because of a rate limit | run the `curl` command on its own, without `python3 -m json.tool`, to see Esplora's reply; replace the placeholder with the value the page showed, or after an HTTP 429, see "Chain access" |
| `Esplora is rate-limiting this page (HTTP 429)`, or `Esplora is throttling requests, so the page won't scan the wallet…` | `blockstream.info` is refusing requests from your address after a burst | stop pressing **Sync & show balance**, **Refresh status** and **Claim**, and wait; the refusal can last an hour or more, and requests sent during it may extend it |
| `ALLOWANCE_AMOUNT is smaller than the fee.` on a claim | the allowance was compiled with an `ALLOWANCE_AMOUNT` of 500 sats or less, which the page's 500-sat fee would use up | the page can't claim from this allowance; compile a new one with a larger **Withdrawable per period**, as in Step 6 |
| `insufficient fee, rejecting replacement` | a previous attempt already reached the mempool | check the explorer before retrying; it probably succeeded |
| `window.humid is missing` | extension disabled, wrong profile, page opened as `file://`, or page already open when Humid was loaded, enabled or reloaded | enable it, serve over `http://`, and reload the page |
| `Manifest file is missing or unreadable` from **Load unpacked** | the folder selected isn't `humid/dist`, or Step 11a's `bun run build` didn't finish | run Step 11a again until `bun run build` writes `humid/dist`, then select that folder |
| `Import #0 "wbg": module is not an object or function` | a web-target wasm build overwrote the bundler-target `pkg/` | rebuild `pkg/` with `--target bundler` |
| `null pointer passed to rust` | a wasm handle used after a call consumed it | build a fresh `TxOut` per call; reassign after every builder step |
| `Expected a blinded address but got a non-blinded one` | `Address.parse` requires a [confidential](../../glossary.md#confidential) [address](../../glossary.md#address) | use `new Address(s)` and check the network with `isMainnet()` |

## Humid wallet API

The injected provider is `window.humid`, with `request({method, params})`. Its content
script matches `file://`, `http://` and `https://`, with no pairing step.

It exposes only six CAIP-25/27 session methods (`core/caip25/methods.ts`):
`wallet_createSession`, `wallet_getSession`, `wallet_revokeSession`,
`wallet_invokeMethod`, `wallet_addChain`, `wallet_switchChain`. Anything else as a
top-level `method` returns "No handler for method".

Every chain method is tunneled:

```js
await window.humid.request({
  method: "wallet_invokeMethod",
  params: {
    scope: "bip122:a771da8e52ee6ad581ed1e9a99825e5b",
    sessionId,
    request: { method: "processConfidentialTransaction", params },
  },
});
```

That scope is the [Liquid](../../glossary.md#liquid) testnet CAIP-2 id, from
`core/chains/liquid/domain/LiquidChain.ts`.

Ten chain methods are registered (`liquidRpcMethods.ts`): `getBalance`,
`getIdentityPublicKey`, `getIdentitySharedKey`, `getUTXOs`, `getWalletDescriptor`,
`processConfidentialTransaction`, `sendTransfer`, `signIdentity`, `signMessage`,
`signPset`. There is no `getAddress`, so a page can't ask the wallet where to send funds.

### Sessions and prompts

`wallet_createSession` shows a "Connect this dapp?" prompt unconditionally, and revokes
any existing session for that origin first
(`extension-background/dapp-authorization/createDappAuthorization.ts`). Calling it before
each action destroys a working authorization and re-approves it every time. Attempt the
method first and create a session only if the call is refused.

A session covers only the methods named when it was created, and Humid refuses any other
method with `Method "…" is not authorized for this session.`, so the page names every
method it uses when it creates one.

`wallet_getSession` is read-only and never prompts. `{sessionScopes: {}}` means no scopes
are granted.

Sessions have a 30-day TTL, but they're stored in the account model and require the wallet
unlocked, so in practice they expire far sooner.

A separate second layer: each method has its own grant. The connect screen lists only the
read-only methods the page requested, such as `getWalletDescriptor`, and selects them by
default. `processConfidentialTransaction` can't be pre-approved, so it never appears there
(`methodPolicyPresentation.ts`): every call shows Humid's own "Perform a contract action?"
confirmation, which is where you review and approve the [transaction](../../glossary.md#transaction).

### Building Humid

If `git apply` reports `patch does not apply` when you run Step 11a's block again, the
patch is probably applied already. Check from inside `humid`:

```bash
git apply --reverse --check ../examples/allowance-humid/humid-allowance-fixes.patch
```

If that prints nothing, the patch is in place, and you can ignore the error. The patch
header describes both fixes well enough to redo by hand.

## `processConfidentialTransaction`

Parameters, Zod-validated in `packages/tx-manifest/src/request/validation.ts`:

```js
{ manifest, contractSources, action, params?, instance?, state?, broadcast? }
// broadcast defaults to false
```

`contractSources` keys must match the path the [manifest](../../glossary.md#manifest) names for the source, for example
`{"./allowance.simf": "<source text>"}`.

**`instance` is double-nested and `state` isn't.** `normaliseInstance()` reads
`raw.instance.fields`:

```js
instance: { instance: { fields: { BENEFICIARY_KEY, ALLOWANCE_AMOUNT, MIN_DISTANCE } } }
state:    { utxos: [{ txid, vout, utxo_type: "allowance" }] }
```

Single-nesting `instance` fails silently and resurfaces much later as "X is neither a
parameter nor an argument of this action".

All parameter values are strings, including numbers.

The response is identical for a dry run and a broadcast:

```js
{ broadcast, feeSats, transactionHex, txid, deployment? }
```

`feeSats` is a string, so parse it before doing arithmetic. `deployment` appears for
actions with a `create_instance` block, that is `Fund`, and carries the instance fields the
wallet computed, so a page need not echo its own form back to itself.

A refusal throws rather than returning a field, carrying `reject` and `reason` in the error
data. So "refused" versus "built but not sent" is "did it throw" versus "did it resolve
with `broadcast: false`".

`transactionHex` is the full raw transaction, which is enough to read the [covenant](../../glossary.md#covenant) address
locally: a [taproot](../../glossary.md#taproot) `scriptPubKey` is the fixed pattern `22·5120·<32 bytes>`, and bech32m
encodes it with the `tex` HRP on testnet. Identify the [output](../../glossary.md#output) by shape rather than
position, since the wallet chooses the order of a funding transaction's outputs.

## Deriving keys and addresses from the wallet

```js
invoke("getWalletDescriptor", {
  descriptorType: "publicWalletDescriptor",
  descriptorFormat: [{ format: "bip380-split-branches" }],
})
```

`descriptors[0].branchDescriptors` holds `elwpkh([fingerprint/84h/1h/0h]xpub…/0/*)` for
`branch: "external"`, which is plain BIP84 segwit v0 rather than Taproot.

For `BENEFICIARY_KEY`: the xpub is already at `m/84'/1'/0'`, so take two non-hardened
`CKDpub` steps, `/0` for the external chain then `/0` for the first address, and drop the
leading parity byte for the 64-hex x-only key. Decoding the receive address instead doesn't
work, because P2WPKH commits to `HASH160(pubkey)`.

For a receive address, which the wallet exposes no method for: P2WPKH of
`HASH160(pubkey)`, bech32 ([witness](../../glossary.md#witness) v0, so bech32 rather than the bech32m used for the
taproot covenant), with the `tex` HRP. The wallet's own receive screen may show the
confidential `tlq1…` form of the same wallet.

## How Humid treats a manifest

Humid never fetches a manifest. It arrives in the RPC call, validated only as being an
object. There is no origin binding, no hash pinning, and no registry of known protocols.

`manifest_version` is read and never validated; the corpus tests delete the field to prove
it isn't load-bearing. Both the `contract_templates` and the older `classes` container are
accepted.

`document/registry.ts` is a machine-readable list of which fields this build reads, shows,
ignores, or hasn't implemented. It is the fastest way to check a manifest for fields that
will be silently dropped.

`attestation_version` is unread. In the registry's own words it is "a signature slot that
does not exist, and read by no implementation including the reference one".

Descriptions shown to the user come from the manifest and are untrusted text. Amounts
don't: `confirmation/provenance.ts` tags every displayed value as `verified`, `chain`,
`computed` or `dapp`, and the amounts a user sees are `computed` by the wallet.

### The two manifest dialects here

`examples/allowance-humid-only/txmanifest.json` is `manifest_version 0.1.0`, for the
wallet. `examples/allowance/txmanifest.json` is `0.3.0`, for the CLI engine below. They
describe the same [contract](../../glossary.md#contract).

`examples/allowance/txmanifest.schema.json` is the machine-checkable form of the `0.3.0`
dialect only. Validating the `0.1.0` manifest against it reports exactly one error, on
`utxo_types.allowance`:

```
Additional properties are not allowed ('confidential' was unexpected)
```

`python3 -m jsonschema` prints the whole `utxo_types.allowance` object before that message.

That is a dialect difference, not a fault. The schema permits `confidential` on an output
but not on a utxo type, while Humid reads it there and every Humid fixture sets it. Any
other error is worth investigating.

## Installing and running Simplex

**`simplex test` needs more than `simplex`.** It runs `smplx-nextest`, `elementsd` and
`electrs`, all found through `PATH`. `simplexup` installs them in `~/.simplex/bin` with
`simplex` itself. Building the command from the repository with `cargo install` provides
only `simplex`, so a source build needs the other three installed separately.

**Two installations can collide.** `cargo install` puts `simplex` in `~/.cargo/bin`, and
`simplexup` puts it in `~/.simplex/bin`. Whichever directory comes first in `PATH` takes
precedence. Step 2 puts `~/.simplex/bin` first. The `simplexup` install script on the
Simplex site appends it instead, so there a cargo copy takes precedence. `simplexup` warns
when it notices this.

**Only the library is on crates.io.** `smplx-std`, which the generated project depends
on, is published; `smplx-cli`, which provides the `simplex` command, isn't, so the
binary has to come from the repository or the installer script.

**The binary and the library must be the same release.** `simplex` generates the code in
`src/artifacts/`, so an older library rejects what a newer binary writes, failing with a
type error about `Program::new`. `simplex init` writes the newest `smplx-std` from
crates.io regardless of the binary's version, so a mismatch is easy to create by pinning
only one of the two. Step 2 pins both to 0.2.0.

**Step 2 makes 0.2.0 the active version.** If you already had a newer Simplex from
`simplexup`, `simplex` in `~/.simplex/bin` is now 0.2.0. `simplexup --list` shows the
installed versions, and `simplexup --use` followed by a version switches to it.

**What `simplex init` leaves you to fix.** It scaffolds `tests/p2pk_test.rs` whose body
is `todo!()`, so it panics if left in place, and `simf/p2pk.simf` alongside it. It names
the package after the directory with a `simplex_` prefix, so tests import the generated
code from `simplex_allowance_example::artifacts`. It declares only `smplx-std`, while a
test in the style of the Simplex repository's own examples
also needs `anyhow`.

## Chain access

From a browser, use `https://blockstream.info/liquidtestnet/api`, which sends the CORS
headers a page needs. Scripts and servers can use `https://liquid.network/liquidtestnet/api`,
which serves the same API.

`blockstream.info` answers a burst of requests with HTTP 429 and then refuses requests from
that address for a long time, so pace automatic refreshing against how long there is left
to wait, and stop when nothing is pending.

The page syncs its wallet through the same [Esplora](../../glossary.md#esplora), with a
client created as `new EsploraClient(network, url, false, 1, false)`. A sync sends one
request per wallet address, 40 or more, one after another, so the page runs one sync at a
time and doesn't start one while it's backing off after a 429. Covenant lookups, the tip
[height](../../glossary.md#height) and broadcasts go to the same server.

The faucet at `liquidtestnet.com/api/faucet?address=…&action=lbtc` doesn't send any CORS headers. A
browser can dispatch the request with `mode: "no-cors"` and the faucet receives it, but the
reply can't be read. Confirm by checking the balance instead.

## Other clients for the same contract

Each of these is useful for one thing. The page used in the HOWTO, `examples/allowance-lwk/`,
is the one to copy for an application.

**`examples/allowance-humid-only/`.** The wallet half of that page with the library taken
out. It doesn't use wasm, a build step or Rust, and it's under 1,000 lines. It passes a manifest to Humid for
every operation and keeps its own indexer. It's worth copying when a page doesn't need to do anything a
wallet can't already do for it, and worth reading in any case, because it shows exactly
which work stays yours once the contract itself is provided. What it gives up is the
ability to check anything: with no compiler it takes the covenant address from the funding
transaction or from the terms the benefactor sends, on the benefactor's word.
[`EXPLANATION.md`, "Who signs, and what that
changes"](EXPLANATION.md#who-signs-and-what-that-changes) covers where that matters.

**`simc` and `hal-simplicity`.** `cargo install simplicityhl` gives `simc`, which compiles
a `.simf` with concrete [parameters](../../glossary.md#parameter) to a base64 [program](../../glossary.md#program) plus its [CMR](../../glossary.md#cmr).
`cargo install hal-simplicity` inspects programs and can build a [PSET](../../glossary.md#pset) by hand. Neither
path in the HOWTO needs them, but running `simc` once confirms that the toolchain works and
the contract compiles, before you suspect anything else. The
[quickstart](../../getting-started/quickstart.md) has the exact
invocation.

**`tx-manifest-wallet`.** A prebuilt CLI engine that reads a manifest and runs the whole
lifecycle, from
[`stringhandler/txmanifest-wallet`](https://github.com/stringhandler/txmanifest-wallet).
Mind the hyphen: the repository is `txmanifest-wallet` and the binary is
`tx-manifest-wallet`. Its use here is checking a manifest with no browser or extension
involved:

```bash
tx-manifest-wallet run <manifest> <Action> --wallet w.json --params p.json
# answer N at the broadcast prompt
```

That exercises the real compile and witness path without spending anything, and it is the
only path here that runs without a browser. It still prompts for a [fee](../../glossary.md#fee) rate, so it needs a
terminal. Use 0.3.0 or a later 0.3.x release: this engine checks `manifest_version` at
parse time against its own `FORMAT_VERSION`, citing ELIP-205, unlike Humid, and a 0.2.x
release rejects the `0.3.0` manifest. Its README says not to use it with real funds.
