# Build a complete Simplicity application, from contract to web to wallet

**Goal**: test a [Simplicity](../../glossary.md#simplicity)
[covenant](../../glossary.md#covenant) on a local [regtest](../../glossary.md#regtest)
network, then lock test Liquid bitcoin (tLBTC) in it on [Liquid](../../glossary.md#liquid)
testnet, withdraw from it on a schedule, and close it, using a web page you can
edit.

<figure markdown="span">
  ![The allowance page listing two allowance instances: one ready to claim with a PartialWithdraw, the other timelocked with one block left](../../assets/allowance-page.png)
  <figcaption>The page you'll build, for claiming testnet coins locked by a Simplicity contract: one allowance can be claimed now, the other unlocks in one block.</figcaption>
</figure>

## What you need

You'll need `git`, `curl`, `python3` and a Chromium-compatible browser. Each step that
needs another tool installs it or checks for it.

## Architecture

The page doesn't have a server of its own. It reads the chain from public
[Esplora](../../glossary.md#esplora) and Waterfalls servers, and gets each
[transaction](../../glossary.md#transaction) signed in one of two ways: by
the [LWK](../../glossary.md#lwk) library inside the page (Steps 4 to 10), or by the
[Humid](../../glossary.md#humid) wallet extension, which works from a
[manifest](../../glossary.md#manifest) (Step 11).

```mermaid
flowchart TD
  source["allowance.simf"]
  manifest["txmanifest.humid.json"]
  subgraph page["The page: one HTML file"]
    form["terms, amounts,<br/>buttons"]
    index["indexer:<br/>list UTXOs,<br/>compare depth and balance"]
  end
  subgraph lib["lwk_wasm, loaded by the page"]
    l["compiles the covenant and<br/>derives the address (Steps 4-11)<br/>builds and signs (Steps 4-10)"]
  end
  subgraph wallet["Humid extension (Step 11)"]
    w["compiles the covenant<br/>builds and signs<br/>asks the user<br/>broadcasts"]
  end
  chain[("Liquid testnet")]
  source --> l
  source --> w
  manifest --> w
  form -->|"terms + amounts"| l
  form -->|"action + params"| w
  l -->|"signed transaction<br/>via Esplora"| chain
  w -->|"signed transaction"| chain
  chain -->|"UTXOs, tip height<br/>via Esplora"| index
  chain -->|"wallet balance<br/>via Waterfalls"| l
  index -->|"which action is valid now"| form
```

---

## 1. Get the files

```bash
git clone https://github.com/BlockstreamResearch/simplicity-demo
cd simplicity-demo/allowance-web
```

The [contract](../../glossary.md#contract), the manifests, the worked examples and the
wallet patch are all there.

Run every command in the rest of this guide from `allowance-web`. If you open another
terminal, `cd` to `allowance-web` in it first. All commands that need a different directory
are wrapped in parentheses, which run them there and leave your shell where it was. If a
command fails, look up its message in [`REFERENCE.md`, "Errors and what causes
them"](REFERENCE.md#errors-and-what-causes-them).

Open `contracts/allowance.simf` in your editor or viewer, and
look through it to see what [SimplicityHL](../../glossary.md#simplicityhl) code looks
like. Every later step builds on this one contract. You don't need to change anything.

For what each function enforces, see
[`EXPLANATION.md`, "What the contract enforces"](EXPLANATION.md#what-the-contract-enforces).

## 2. Run the contract's tests on regtest

Make sure you have [Rust](https://rust-lang.org/tools/install/) 1.91 or newer and `cargo`,
from `rustup`.

Install [Simplex](../../glossary.md#simplex), which runs SimplicityHL integration tests against a local
[Elements](../../glossary.md#elements) regtest [node](../../glossary.md#node) that it starts and supplies with test coins. It
can take some time to compile:

```bash
git clone https://github.com/BlockstreamResearch/smplx
cargo install --path smplx/crates/cli --locked
simplex --version
```

You should see `Simplex` followed by a version number, 0.2.0 or newer.

Then set up the project and run the tests:

```bash
simplex init allowance_example
(
  cd allowance_example
  rm tests/p2pk_test.rs simf/p2pk.simf      # init's own sample
  cargo add anyhow@1                        # the test needs it
  cp ../examples/allowance-simplex/simf/allowance.simf ./simf/
  cp ../examples/allowance-simplex/tests/allowance_test.rs ./tests/
  simplex build && simplex test
)
```

You should see both tests `PASS`:

```console
[...]
    Starting 2 tests across 2 binaries
        PASS [  20.046s] simplex_allowance_example::allowance_test allowance_drains_over_successive_withdrawals__smplx_test
        PASS [   1.564s] simplex_allowance_example::allowance_test withdrawing_before_the_interval_is_rejected__smplx_test
────────────
     Summary [  21.611s] 2 tests run: 2 passed, 0 skipped
Exit Status: 0
```

The first test runs through a full lifecycle. The second attempts a
withdrawal before the [timelock](../../glossary.md#timelock), which the node rejects
under [BIP68](../../documentation/timelocks.md#timelock-enforcement-mechanisms).

"Going further", at the end of this tutorial, suggests more tests you can write yourself.

## 3. Build webpage dependencies

Check that you have LLVM `clang` with the wasm32 target, which this build needs:

```bash
clang -print-targets | grep -q wasm32 && echo present || echo MISSING
```

If you see `MISSING`, or `clang` isn't found, install LLVM and run the check again. On
Linux, install your distribution's `clang` and `llvm` packages, which include the
`llvm-ar` the build also needs.

!!! warning "`clang` on macOS"
    On macOS, install from `brew install llvm`, as the system `clang` doesn't support wasm.
    Homebrew doesn't put this LLVM on your `PATH`, so run this in every terminal you use for
    the rest of the tutorial:

    ```bash
    export PATH="$(brew --prefix llvm)/bin:$PATH"
    ```

Then install `wasm-pack` and build LWK, the library the page uses to compile the contract and build transactions, for
wasm with its Simplicity feature, which the published builds leave out. The `wasm-pack`
build can take some time, often without printing anything.

```bash
cargo install wasm-pack
git clone https://github.com/Blockstream/lwk
(
  cd lwk/lwk_wasm
  wasm-pack build --release --target web --out-dir pkg-web -- --features simplicity
)
```

When the build finishes, `lwk/lwk_wasm/pkg-web/` contains `lwk_wasm.js` and
`lwk_wasm_bg.wasm`, the two files the page loads. Copy them:

```bash
mkdir -p examples/allowance-lwk/vendor
cp lwk/lwk_wasm/pkg-web/lwk_wasm.js lwk/lwk_wasm/pkg-web/lwk_wasm_bg.wasm \
   examples/allowance-lwk/vendor/
```

## 4. Serve the page and fund its wallet

Open a second terminal in `allowance-web` and start a web server for the page:

```bash
python3 -m http.server 8099 --directory examples/allowance-lwk
```

You should see `Serving HTTP on … port 8099`. Leave it running through Step 11, then stop
it with Ctrl-C. If it prints `Address already in use`, run it again with another port
number and use that port below.

Open <http://localhost:8099/>. The page doesn't work opened as a file. Keep the same port
throughout, because the page stores its wallet and key per origin.

You should see `Simplicity API: present` under "Library". If the build lacks the
feature, that section instead starts `Failed: This build is missing:`; redo the build in
Step 3.

The page has its own single-key wallet.

!!! warning "The mnemonic is stored in plaintext"
    The page keeps its mnemonic in `localStorage` in plaintext. Use it only for testnet
    funds, and don't paste in a mnemonic from elsewhere.

On the **I'm the benefactor** tab, leave the mnemonic box blank, press **Open wallet**,
then **Request testnet funds**.

You should see a balance within about a minute. Press **Sync & show balance** to check
again. If it stays at zero, use the [web form](https://liquidtestnet.com/faucet) with the
[address](../../glossary.md#address) the page shows.

## 5. Generate the beneficiary's key

Open the **I'm the beneficiary** tab and press **Generate / show my key**. This creates
the BIP340 x-only [public key](../../glossary.md#public-key) that the page compiles into the contract in Step 6; only a signature from
its private half can withdraw.

You should see 64 hex characters.

In a real allowance, the beneficiary does this on a separate machine and sends the 64
characters to the benefactor. Testing on your own, return to the **I'm the benefactor** tab and press **Use my
own key (single-wallet test)**, which fills the field from the key you just generated.

## 6. Set the terms and compile the contract

Open the **I'm the benefactor** tab and fill in the three values the page compiles into the contract:

- **Beneficiary's public key**, from Step 5.
- **Withdrawable per period**, which is `ALLOWANCE_AMOUNT` in sats. Keep it well above
  500: the page uses a fixed [fee](../../glossary.md#fee) of 500 sats for every withdrawal and pays it out of the
  allowance, so an allowance of 500 sats or less can't be withdrawn. In Step 7, lock a whole
  multiple of this amount, such as `15000` for an allowance of `5000`, so that the last
  withdrawal also takes a full allowance.
- **Blocks between withdrawals**, which is `MIN_DISTANCE`. `3` means about three
  minutes, convenient for a first run; `1440` is about a day.

Press **Compile & derive address**.

??? example "The code behind that button"

    ```js
    const args = new L.SimplicityArguments()
      .addValue("BENEFICIARY_KEY", L.SimplicityTypedValue.fromU256Hex(params.benkey))
      .addValue("ALLOWANCE_AMOUNT", L.SimplicityTypedValue.fromU64(params.allowance))
      .addValue("MIN_DISTANCE", L.SimplicityTypedValue.fromU16(params.mindist));

    const program = L.SimplicityProgram.load(source, args);
    const address = program.createP2trAddress(
      L.XOnlyPublicKey.fromString(NUMS_INTERNAL_KEY), network);
    ```

You should see the [CMR](../../glossary.md#cmr) and a `tex1p…` covenant address. Changing
any of the terms gives a different allowance at a different address.

## 7. Fund the allowance

Set the amount to lock, leave **Broadcast for real** unchecked, and press **Fund**.

??? example "The code behind that button"

    ```js
    const pset = new L.TxBuilder(network)
      .addExplicitRecipient(c.address, amount, policyAsset)
      .finish(wollet);
    const tx = wollet.finalize(signer.sign(pset)).extractTx();
    ```

You should see a dry run reporting the txid it would have sent, the [output](../../glossary.md#output) count and
the fee, with nothing broadcast.

Select **Broadcast for real** and press **Fund** again.

You should see a txid. The transaction's output at the covenant address is the first
allowance instance.

??? example "Check it on chain"

    ```bash
    curl -s "https://blockstream.info/liquidtestnet/api/tx/<fund-txid>" | python3 -m json.tool
    ```

    You should see one output with `scriptpubkey_type` `v1_p2tr` and the value you
    locked. Its position among the outputs can vary.

## 8. Watch the allowance

Steps 8 to 10 follow the loop below; in this step, you watch the chain for live
allowance instances. A partial withdrawal pays the beneficiary and recreates the covenant
with the remainder, so the timelock starts again from the block that confirmed it.

```mermaid
flowchart TD
  start(["your wallet, funded"]) -->|"Fund"| inst
  inst["allowance instance:<br/>one UTXO at the covenant address"]
  inst -->|"wait MIN_DISTANCE blocks"| ready["spendable"]
  ready -->|"PartialWithdraw<br/>balance above ALLOWANCE_AMOUNT"| split
  split["payout to the beneficiary, plus the<br/>remainder back to the same address"] --> inst
  ready -->|"FullWithdraw<br/>balance at or below ALLOWANCE_AMOUNT"| done(["closed"])
```

Open the **I'm the beneficiary** tab and press **Refresh status**. The instance list and
the withdrawal controls are on that tab, and Steps 9 and 10 stay there.

You should see one instance listed with a balance and either `PartialWithdraw` or
`FullWithdraw` as its action. Its status reads `unconfirmed (~1 min)` until the funding
transaction confirms, and then shows a timelock countdown. Each
[UTXO](../../glossary.md#utxo) at the covenant address is a separate allowance with its
own timelock.

??? example "Run the same query by hand"

    ```bash
    ADDR=<covenant-address>
    curl -s "https://blockstream.info/liquidtestnet/api/address/$ADDR/utxo" | python3 -m json.tool
    curl -s "https://blockstream.info/liquidtestnet/api/blocks/tip/height"
    ```

    You should see a JSON array with one entry per instance, each with a `value` and a
    `status`, then the tip [height](../../glossary.md#height) as a bare number. A confirmed
    entry has `status.block_height`; an unconfirmed one has `status.confirmed: false` and
    isn't spendable yet.

    Compute `depth = tip - block_height + 1`; an instance becomes spendable once
    `depth >= MIN_DISTANCE`. The action follows the balance: `FullWithdraw` when
    `value <= ALLOWANCE_AMOUNT`, otherwise `PartialWithdraw`.

## 9. Withdraw

Wait for the timelock. The button reads **Unconfirmed**, then **Timelocked**, and
**Claim** once the instance is old enough. The page refreshes the list about once a minute; press
**Refresh status** to check sooner.

On the **I'm the beneficiary** tab, press **Use my wallet address** to set where the payout goes, then
press **Claim** and read the confirmation panel, which lists every output before the page
signs anything.

For a `PartialWithdraw` you should see output 0 returning the remainder to the covenant
address, output 1 paying you, and output 2 as the fee. A `FullWithdraw` has no
remainder, so output 0 pays you and output 1 is the fee. Confirm it.

You should see a broadcast txid. After a `PartialWithdraw`, a new instance holding the
remainder appears within about a minute.

??? example "Check the payout on chain"

    ```bash
    curl -s "https://blockstream.info/liquidtestnet/api/tx/<withdraw-txid>" | python3 -m json.tool
    ```

    In `vout`, you should see an output whose `scriptpubkey_address` is the address in
    the payout field, with a `value` of `ALLOWANCE_AMOUNT` minus the 500-sat fee for a
    `PartialWithdraw`, or the instance's whole balance minus the fee for a
    `FullWithdraw`. The last output, with `scriptpubkey_type` `fee`, is the fee.

A refusal reading `non-BIP68-final` means not enough blocks have passed; wait and claim
again. One reading `insufficient fee, rejecting replacement` means an earlier
attempt already reached the mempool and probably succeeded. For anything else, look up
the message in [`REFERENCE.md`, "Errors and what causes
them"](REFERENCE.md#errors-and-what-causes-them).

## 10. Close the allowance

Repeat Step 9 until the balance is at or below `ALLOWANCE_AMOUNT`. The action then shows
`FullWithdraw`, which takes everything remaining and ends the covenant.

After each claim, the page refreshes the list: the instance you just spent shows
**Spent**, and the new one holding the remainder appears as **Unconfirmed**, then
**Timelocked**, then **Claim** once its own timelock has passed.

You should see an empty instance list once it confirms, and the locked amount, less the
fee for each withdrawal, at your payout address. The covenant address still works:
a later payment to it starts a separate allowance, as in Step 8.

??? example "Check the close-out on chain"

    ```bash
    ADDR=<covenant-address>
    curl -s "https://blockstream.info/liquidtestnet/api/address/$ADDR/utxo" | python3 -m json.tool
    # -> []
    curl -s "https://blockstream.info/liquidtestnet/api/address/<payout-address>/utxo" | python3 -m json.tool
    ```

    An empty array for the covenant address means every instance is spent. The second
    command's list should include the payouts sent to that address, each `value`
    matching a payout from Step 9.

## 11. Run the same contract through the wallet

Steps 4 to 10 kept the key in the browser. In this step, the page passes the Humid
extension the same contract source together with a manifest, which tells Humid how to
build each transaction. Humid signs each one and shows you its own confirmation.

!!! warning "This creates a second, separate allowance"
    Humid signs with its own key, so this allowance gets a new covenant address. In
    Humid mode, the page can't fund or claim the allowance from Steps 6 to 10.

### 11a. Build the extension

Install Bun, which builds the extension, with
[npm](https://docs.npmjs.com/cli/v12/configuring-npm/install). You need Bun 1.3.14 or
newer:

```bash
npm install -g bun
bun --version
```

Then clone and build Humid 1.1.4. The two `build:wasm` scripts can each take some time, often without
printing anything.

```bash
git clone --recursive --branch 1.1.4 https://github.com/BlockstreamResearch/humid
(
  cd humid
  bun run build:wasm:lwk
  bun run build:wasm:smplx
  bun install
  git apply ../examples/allowance-humid/humid-allowance-fixes.patch
  bun run build
)
```

The patch lets Humid build this contract's withdrawals. If `git apply` rejects a
hunk, see [`REFERENCE.md`, "Building Humid"](REFERENCE.md#building-humid).

You should see `bun run build` finish by writing `humid/dist/`. If it stops with
`No compiled lwk wasm at …` or `No compiled smplx wasm at …`, that module's build failed:
run the command the message gives, from inside `humid`, and read its error, which names
the missing tool.

### 11b. Load the extension in your browser

Open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and
select the `humid/dist` folder inside `allowance-web`. You should see Humid listed and
enabled. Then reload the allowance page, because the browser adds the extension only to
pages loaded after it.

To create a wallet, click the puzzle piece in the top right of the browser, select Humid,
and press **Create wallet**. Write the 12 words on the **Recovery phrase** panel on paper,
press **I saved it**, and enter them again when asked. Don't switch to another application
during setup, because the setup window closes. Then enter a password twice and press
**Create wallet**.

You should see Humid's account panel, with a network menu reading **Liquid** at the top
left, a balance, and **Receive** and **Send** buttons.

!!! warning "Switch Humid to Liquid Testnet"
    Humid starts on Liquid mainnet. Open the **Liquid** menu at the top left of the panel
    and select **Liquid Testnet**.

Press **Receive**. You should see a [confidential](../../glossary.md#confidential) address starting `tlq1`, the Liquid
testnet form.

### 11c. Fund and withdraw through Humid

Select **Humid extension** under "Who signs", then press **Check for Humid**.

You should see `Humid is available on this page.` The page's own wallet and key
sections disappear, along with the results from Steps 4 to 10, because none of them apply
to Humid.

Fund Humid first: send testnet coins to the `tlq1…` address on Humid's **Receive** panel,
not to the page's wallet, using the [faucet website](https://liquidtestnet.com/faucet).

You should see the payment in Humid's balance within about a minute.
Humid spends only confirmed funds, so wait for it there before you fund the allowance.
Then press **Get my key from Humid**.

??? example "The call behind that button"

    ```js
    await invokeHumid("getWalletDescriptor", {
      descriptorType: "publicWalletDescriptor",
      descriptorFormat: [{ format: "bip380-split-branches" }],
    });
    // then derive the x-only key: see REFERENCE.md, "Deriving keys and addresses from the wallet"
    ```

The first call opens Humid's `Connect this dapp?` prompt; press **Connect**. From then on,
every press of **Fund** or **Claim** opens Humid's own `Perform a contract action?`
confirmation, which describes the transaction. Approve it with **Sign** for a dry run, or
**Sign and send** when **Broadcast for real** is selected. [`REFERENCE.md`, "Sessions and
prompts"](REFERENCE.md#sessions-and-prompts) explains when the connect prompt appears again.

You should see 64 hex characters in the beneficiary key field, which differ from Step 5's.

Repeat Steps 6 and 7: compile with this key, then fund
the allowance with **Broadcast for real** unchecked.

??? example "The call behind Fund in this mode"

    ```js
    await invokeHumid("processConfidentialTransaction", {
      manifest, contractSources: { "./allowance.simf": source },
      action: "Fund",
      params: { BENEFICIARY_KEY, ALLOWANCE_AMOUNT, MIN_DISTANCE, amount_sat },
      broadcast: false,
    });
    ```

You should see a response carrying `txid`, `feeSats` and `transactionHex`, with
`broadcast: false`. Nothing was sent.
[`REFERENCE.md`, "`processConfidentialTransaction`"](REFERENCE.md#processconfidentialtransaction)
documents the call.

Fund the allowance with **Broadcast for real** selected. Once you approve it in Humid, you should see `Humid broadcast
the funding transaction.` and a txid, and the new instance under **Refresh status** on the **I'm the beneficiary** tab. Wait out
`MIN_DISTANCE`, then claim through Humid as in Step 9, and keep claiming as in Step 10
until the allowance closes. There is no payout field in this mode, because Humid pays to
its own change address.

You should see Humid's own confirmation screen describing each withdrawal, and a broadcast
txid once you approve it. If you locked more than `ALLOWANCE_AMOUNT`, the first claim is a
`PartialWithdraw`; the last is always a `FullWithdraw`.

## Going further

Read [`EXPLANATION.md`](EXPLANATION.md) next. It covers what the contract enforces, who
signs and what that changes, and what would have to change before a mainnet deployment.

To adapt a piece for your own contract:

- **The tests.**
  [`examples/allowance-simplex/README.md`](https://github.com/BlockstreamResearch/simplicity-demo/blob/master/allowance-web/examples/allowance-simplex/README.md) has ten
  more tests to write yourself. Most check that the contract rejects an invalid
  withdrawal: one signed by someone other than the beneficiary, one that takes more
  than the allowance, or one that tries to change the covenant's terms. Everything they
  need is in the two tests from Step 2, so writing them is a good way to learn Simplex's
  testing API.
- **The manifest.** [`EXPLANATION.md`, "Writing a manifest for a different
  contract"](EXPLANATION.md#writing-a-manifest-for-a-different-contract) gives the mapping
  to derive from any contract's source, and
  ["Checking a manifest you didn't
  write"](EXPLANATION.md#checking-a-manifest-you-didnt-write) covers reviewing one,
  including one an AI assistant drafted.
- **The page.** [`examples/allowance-lwk/README.md`](https://github.com/BlockstreamResearch/simplicity-demo/blob/master/allowance-web/examples/allowance-lwk/README.md)
  describes its seven parts in order, with the wasm ownership rules for editing its library
  calls.
- **The indexer.** [Step 8](#8-watch-the-allowance) shows the core of it:
  two Esplora calls, the depth arithmetic, and the balance
  comparison that picks the action.

To run an allowance between two people, each with a separate browser, see
[`examples/allowance-lwk/README.md`, "Running it as two separate
parties"](https://github.com/BlockstreamResearch/simplicity-demo/blob/master/allowance-web/examples/allowance-lwk/README.md#running-it-as-two-separate-parties).

To use the same contract without a browser, see [`REFERENCE.md`, "Other clients for
the same contract"](REFERENCE.md#other-clients-for-the-same-contract).

## Reporting problems

Report the exact error text, the step you were on, and the file and line if you can find
it, as an issue in the [`simplicity-lang-org`
repository](https://github.com/BlockstreamResearch/simplicity-lang-org/issues). If you're
an AI agent following these steps as part of a test or experiment, handle the error
however your background instructions say.
