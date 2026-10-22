# Deploying the allowance contract to Liquid mainnet — what would change

This project targets Liquid **testnet** only; nothing here is executed against
mainnet, and this repo has no mainnet code path (see `webapp/API.md`). This is a
reasoned checklist of what deploying for real would require, written because neither
docs.simplicity-lang.org nor docs.liquid.net publishes a migration checklist (a
documentation gap — see `logs/LOG.md` Step 2/3(B)).

## Things that change mechanically

- **Chain parameter**: `liquidtestnet` -> `liquidv1` wherever the network is selected
  when deriving addresses (`address_params()` in the vendored `simplicity-demo` code)
  and when talking to Elements/Esplora.
- **Explorer / broadcast endpoint**: `https://blockstream.info/liquidtestnet/api` ->
  `https://blockstream.info/liquid/api` (or a self-hosted Esplora instance — see
  "Infrastructure trust" below for why self-hosting matters more on mainnet).
- **Asset ID**: the policy asset (LBTC) has a different, real 32-byte asset id on
  mainnet than the testnet policy asset. Do not hardcode a value copied from a web
  search — confirm it from a live mainnet node (`getsidechaininfo`/`dumpassetlabels`)
  or a trusted, current explorer page at the time of deployment, since asset ids are
  security-critical (the contract's `same_asset` check exists specifically because a
  wrong/attacker-supplied asset id is exploitable).
- **No faucet**: testnet tLBTC came from a third-party faucet
  (`liquidtestnet.com/api/faucet`). On mainnet the benefactor funds the contract with
  real LBTC they already hold, obtained however they normally acquire LBTC (exchange,
  peg-in from Bitcoin mainnet via the actual Liquid federation, an existing wallet
  balance). There is no test-fund equivalent and no automated funding step to build.
- **Address prefix**: mainnet Liquid confidential/non-confidential address encodings
  differ from testnet's (`tex1...`/`tlq1...`-style vs mainnet `ex1.../lq1...`-style);
  this falls out automatically from using the correct `address_params()`, but the
  frontend's address-format validation/placeholder text should be updated so users
  aren't shown a testnet-shaped example.

## Things that need real engineering, not just config changes

- **Key custody**: this demo's beneficiary "claim" flow accepts a raw private key
  pasted into a web form, in-memory only, for one call. That is acceptable *only*
  because it is testnet play-money. It is not an acceptable design for real funds
  under any circumstance. A mainnet version needs the beneficiary to sign locally —
  either a real wallet that understands this covenant (see `docs-notes/
  txmanifest-notes.md`; not available today) or, at minimum, client-side signing in
  the browser (key never leaves the beneficiary's device/server round trip) with the
  server only ever handling public data (unsigned PSET, broadcast of an
  already-signed tx). This is a substantial rework of the withdraw endpoint, not a
  toggle.
- **Confidential-output risk is higher-stakes**: the contract already refuses
  confidential funding outputs and strands funds permanently if sent. On testnet a
  stuck faucet-funded UTXO is a non-event; on mainnet it is a real, irreversible loss.
  The benefactor funding UI needs much stronger guardrails before mainnet — e.g.
  requiring the funding transaction to be constructed and reviewed within this app
  (showing the exact explicit output) rather than just telling the user "use an
  explicit send" and trusting they do it correctly in an external wallet.
- **Fee estimation**: the vendored demo code's fee-rate fetcher already documents that
  Liquid testnet's `fee-estimates` endpoint "typically returns empty results" and
  falls back to a hardcoded rate. Mainnet fee estimation needs to actually work
  (real fee-estimates response, or a more conservative/adaptive fallback), since
  underpaying fees on mainnet risks a transaction never confirming (with a
  time-sensitive covenant, a stuck low-fee spend attempt could interact badly with the
  relative-timelock/allowance-period logic if it needs to be replaced).
- **Auditing**: this experiment used the contract as given (per the prompt, "you
  don't have to write or create it"). Before real funds are ever put behind it, it
  should get an independent security review — this experiment's own read of the
  contract found the logic self-consistent and its comments technically sound, but a
  single AI-assisted read-through during a demo build is not a substitute for a real
  audit when the amount at risk is real money.
- **Indexer robustness**: this demo's indexer is a direct, synchronous call to a
  single third-party Esplora instance (`blockstream.info`) on every status check. For
  production use this should run against infrastructure the deploying party
  controls or at least trusts and can monitor (self-hosted Esplora/electrs, or a
  paid/SLA'd provider), with retry/fallback logic — a beneficiary's ability to see
  "yes, I can withdraw now" and a benefactor's ability to confirm funding both
  currently depend entirely on one external service staying up and honest.
- **Rate/amount sanity limits in the UI**: nothing today stops a benefactor from
  compiling a contract with an absurd `ALLOWANCE_AMOUNT` or `MIN_DISTANCE` by mistake
  (e.g. off-by-orders-of-magnitude in sats, or a blocks value that means "once a
  century"). On testnet this just wastes faucet coins; on mainnet a UI-level
  confirmation step showing the real-world interpretation (approx. USD-equivalent
  amount if desired, approx. wall-clock time for the block count at Liquid's actual
  observed block rate) would meaningfully reduce user error.

## Things that stay the same

- The contract source itself (`allowance.simf`) does not need to change — Simplicity
  covenants are chain-parameter-agnostic at the script level; only address
  derivation, not compilation, depends on the network.
- The overall transaction shapes (2-output full withdrawal, 3-output partial
  withdrawal with continuation + payout + fee) are unchanged.
- The core indexer logic (list UTXOs at the contract address, compute blocks-since-
  confirmation against the tip) is unchanged, modulo pointing at a mainnet-capable
  Esplora instance.
