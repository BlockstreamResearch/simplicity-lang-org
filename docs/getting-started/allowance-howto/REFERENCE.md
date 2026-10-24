# Reference

Lookup material, organised for finding one fact rather than for reading through.

**To run it yourself, start with [Run an allowance covenant end to end](HOWTO.md).** For why any of this is
shaped the way it is, see [`EXPLANATION.md`](EXPLANATION.md).

- [Errors and what causes them](#errors-and-what-causes-them)
- [Talking to the Humid wallet](#talking-to-the-humid-wallet)
- [`processConfidentialTransaction`](#processconfidentialtransaction)
- [Deriving keys and addresses from the wallet](#deriving-keys-and-addresses-from-the-wallet)
- [How Humid treats a manifest](#how-humid-treats-a-manifest)
- [Chain access](#chain-access)
- [Other ways to drive the same contract](#other-ways-to-drive-the-same-contract)

Facts about Humid were established by reading its source; paths are relative to a Humid
checkout. They were current when this was written and the project is moving.

## Errors and what causes them

| Message | Cause | Fix |
|---|---|---|
| `{"reject": "unimplemented-construct"}` on any withdrawal | the relative-timelock bug | apply the patch from Step 3c, rebuild, reload the extension |
| `"FullWithdraw" pays nothing, so there is nothing to build.` | the change-only-output bug | same patch |
| `Unlock the wallet to continue.` | the wallet is locked | open it from the Extensions button and enter the password; it re-locks periodically |
| `X is neither a parameter nor an argument of this action` | usually `instance` single-nested instead of double-nested | see the nesting rule below |
| `[object Object]` instead of a message | the real text is in the thrown error's data | read `reject` and `reason` off it |
| `No handler for method` | a chain method called directly | tunnel it through `wallet_invokeMethod` |
| `non-BIP68-final` | not enough blocks have passed | wait; the [timelock](../../glossary.md#timelock) is working |
| `insufficient fee, rejecting replacement` | a previous attempt already reached the mempool | check the explorer before retrying; it probably succeeded |
| `window.humid is missing` | extension disabled, wrong profile, or page opened as `file://` | enable it and serve over `http://` |
| `Import #0 "wbg": module is not an object or function` | a web-target wasm build overwrote the bundler-target `pkg/` | rebuild `pkg/` with `--target bundler` |
| `null pointer passed to rust` | a wasm handle used after a call consumed it | build a fresh `TxOut` per call; reassign after every builder step |
| `Expected a blinded address but got a non-blinded one` | `Address.parse` requires a [confidential](../../glossary.md#confidential) address | use `new Address(s)` and check the network with `isMainnet()` |

## Talking to the Humid wallet

The injected provider is `window.humid`, with `request({method, params})`. Its content
script matches `file://`, `http://` and `https://`, with no pairing step.

It exposes only six CAIP-25/27 session methods (`core/caip25/methods.ts`):
`wallet_createSession`, `wallet_getSession`, `wallet_revokeSession`,
`wallet_invokeMethod`, `wallet_addChain`, `wallet_switchChain`. Anything else as a
top-level `method` returns "No handler for method".

Every chain method is tunnelled:

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
`signPset`. There is no `getAddress`, so a page cannot ask the wallet where to send funds.

### Sessions and prompts

`wallet_createSession` shows a "Connect this dapp?" prompt unconditionally, and revokes
any existing session for that origin first
(`extension-background/dapp-authorization/createDappAuthorization.ts`). Calling it before
each action destroys a working authorization and re-approves it every time. Attempt the
method first and create a session only if the call is refused.

`wallet_getSession` is read-only and never prompts. `{sessionScopes: {}}` means no scopes
are granted.

Sessions carry a 30-day TTL, but they live in the account model and require the wallet
unlocked, so in practice they expire far sooner.

A separate second layer: each method has its own grant. The connect screen lists only the
read-only methods the page requested, such as `getWalletDescriptor`, and ticks them by
default. `processConfidentialTransaction` can't be pre-approved, so it never appears there
(`methodPolicyPresentation.ts`): every call shows Humid's own "Perform a contract action?"
confirmation, which is where you review and approve the transaction.

## `processConfidentialTransaction`

Parameters, Zod-validated in `packages/tx-manifest/src/request/validation.ts`:

```js
{ manifest, contractSources, action, params?, instance?, state?, broadcast? }
// broadcast defaults to false
```

`contractSources` keys must match the path the [manifest](../../glossary.md#manifest) names for the source, for example
`{"./allowance.simf": "<source text>"}`.

**`instance` is double-nested and `state` is not.** `normaliseInstance()` reads
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
locally: a taproot `scriptPubKey` is the fixed pattern `22·5120·<32 bytes>`, and bech32m
encodes it with the `tex` HRP on testnet. Identify the output by shape rather than
position, since the wallet chooses the order of a funding transaction's outputs.

## Deriving keys and addresses from the wallet

```js
invoke("getWalletDescriptor", {
  descriptorType: "publicWalletDescriptor",
  descriptorFormat: [{ format: "bip380-split-branches" }],
})
```

`descriptors[0].branchDescriptors` holds `elwpkh([fingerprint/84h/1h/0h]xpub…/0/*)` for
`branch: "external"`, which is plain BIP-84 segwit v0 rather than [Taproot](../../glossary.md#taproot).

For `BENEFICIARY_KEY`: the xpub is already at `m/84'/1'/0'`, so take two non-hardened
`CKDpub` steps, `/0` for the external chain then `/0` for the first address, and drop the
leading parity byte for the 64-hex x-only key. Decoding the receive address instead does
not work, because P2WPKH commits to `HASH160(pubkey)`.

For a receive address, which the wallet exposes no method for: P2WPKH of
`HASH160(pubkey)`, bech32 ([witness](../../glossary.md#witness) v0, so bech32 rather than the bech32m used for the
taproot covenant), with the `tex` HRP. The wallet's own receive screen may show the
confidential `tlq1…` form of the same wallet.

## How Humid treats a manifest

Humid never fetches a manifest. It arrives in the RPC call, validated only as being an
object. There is no origin binding, no hash pinning, and no registry of known protocols.

`manifest_version` is read and never validated; the corpus tests delete the field to prove
it is not load-bearing. Both the `contract_templates` and the older `classes` container are
accepted.

`document/registry.ts` is a machine-readable list of which fields this build reads, shows,
ignores, or has not implemented. It is the fastest way to check a manifest for fields that
will be silently dropped.

`attestation_version` is unread. In the registry's own words it is "a signature slot that
does not exist, and read by no implementation including the reference one".

Descriptions shown to the user come from the manifest and are untrusted text. Amounts do
not: `confirmation/provenance.ts` tags every displayed value as `verified`, `chain`,
`computed` or `dapp`, and the amounts a user sees are `computed` by the wallet.

### The two manifest dialects here

`examples/allowance-humid-only/txmanifest.json` is `manifest_version 0.1.0`, for the
wallet. `examples/allowance/txmanifest.json` is `0.3.0`, for the CLI engine below. They
describe the same contract.

`examples/allowance/txmanifest.schema.json` is the machine-checkable form of the `0.3.0`
dialect only. ⚠️ Validating the `0.1.0` manifest against it reports exactly one error, on
`utxo_types.allowance`:

```
Additional properties are not allowed ('confidential' was unexpected)
```

`python3 -m jsonschema` prints the whole `utxo_types.allowance` object before that message.

That is a dialect difference, not a fault. The schema permits `confidential` on an output
but not on a utxo type, while Humid reads it there and every Humid fixture sets it. Any
other error is worth investigating.

## Installing and running Simplex

**Two installations can collide.** `cargo install` puts `simplex` in `~/.cargo/bin`;
`simplexup` puts it in `~/.simplex/bin` and appends that to `PATH`. The cargo copy
therefore normally wins, silently replacing the one `simplexup` manages. `simplexup`
warns when it notices this.

**Only the library is on crates.io.** `smplx-std`, which the generated project depends
on, is published; `smplx-cli`, which provides the `simplex` command, is not, so the
binary has to come from the repository or the installer script.

**The binary and the library must be the same release.** `simplex` generates the code in
`src/artifacts/`, so an older library rejects what a newer binary writes, failing with a
type error about `Program::new`. `simplex init` writes the newest `smplx-std` from
crates.io regardless of the binary's version, so a mismatch is easy to create by pinning
only one of the two.

**If `git apply` rejects a hunk of the Humid patch,** that fix has landed upstream
already. Apply the rest with `git apply --reject`, or check which of the two refusal
strings the patch header quotes still appear in the Humid source and skip the hunk that
no longer applies. The patch header describes both fixes well enough to redo by hand.

**What `simplex init` leaves you to fix.** It scaffolds `tests/p2pk_test.rs` whose body
is `todo!()`, so it panics if left in place, and `simf/p2pk.simf` alongside it. It derives
the package name by prefixing the directory, so `allowance_example` becomes the crate
`simplex_allowance_example`, and a test importing the crate under its own name will not
resolve until the package is renamed. It declares only `smplx-std`, while a test in the
style of the Simplex repository's own examples also needs `anyhow`.

## Chain access

Use `https://blockstream.info/liquidtestnet/api` from a browser, since it is the only
Liquid Esplora mirror that sends CORS headers.
`https://liquid.network/liquidtestnet/api` has gentler rate limits and is the better
choice server-side.

`blockstream.info` refuses everything for minutes after a burst, so pace automatic
refreshing against how long there is left to wait and stop when nothing is pending.

Sync the page's wallet through Waterfalls at
`https://waterfalls.liquidwebwallet.org/liquidtestnet/api`, with a client created as
`new EsploraClient(network, url, true, 1, false)`, where `true` enables Waterfalls. A plain
Esplora scan sends one request per address, 40 or more per sync, while Waterfalls returns the
whole wallet's history in one request. The server sends CORS headers but isn't a full Esplora,
so covenant lookups, the tip height and broadcasts still go to `blockstream.info`. The
Waterfalls operator learns the wallet's addresses.

The faucet at `liquidtestnet.com/api/faucet?address=…&action=lbtc` doesn't send any CORS headers. A
browser can dispatch the request with `mode: "no-cors"` and the faucet receives it, but the
reply cannot be read. Confirm by checking the balance instead.

## Other ways to drive the same contract

Each of these is useful for one thing. The page used in the HOWTO, `examples/allowance-lwk/`,
is the one to copy for an application.

**`examples/allowance-humid-only/`.** The wallet half of that page with the library taken
out: no wasm, no build step, no Rust, under 1,000 lines. It hands a manifest to Humid for
every operation and keeps its own indexer. Worth copying when a page doesn't need to do anything a
wallet cannot already do for it, and worth reading in any case, because it shows exactly
which work stays yours once the contract itself is handed over. What it gives up is the
ability to check anything: with no compiler it takes the covenant address from the funding
transaction or from a handoff blob, on the benefactor's word.
[`EXPLANATION.md`](EXPLANATION.md#who-signs-and-what-that-changes) covers
where that matters.

**`simc` and `hal-simplicity`.** `cargo install simplicityhl` gives `simc`, which compiles
a `.simf` with concrete parameters to a base64 program plus its [CMR](../../glossary.md#cmr).
`cargo install hal-simplicity` inspects programs and can build a [PSET](../../glossary.md#pset) by hand. Neither
path in the HOWTO needs them, but running `simc` once confirms the toolchain and contract
are sound before you suspect anything else. The
[quickstart](https://docs.simplicity-lang.org/getting-started/quickstart) has the exact
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
only path here that runs without a browser. It still prompts for a fee rate, so it needs a
terminal. Use 0.3.0 or a later 0.3.x release: this engine checks `manifest_version` at
parse time against its own `FORMAT_VERSION`, citing ELIP-205, unlike Humid, and a 0.2.x
release rejects the `0.3.0` manifest outright. Its README says not to use it with real funds.
