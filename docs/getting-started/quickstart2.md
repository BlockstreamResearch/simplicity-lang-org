# SimplicityHL Quickstart

This is a quickstart document to help you perform your first <glossary:transaction> on <glossary:Liquid> Testnet using a <glossary:Simplicity> <glossary:contract>.

Before beginning this tutorial, please <a href="/getting-started/toolchain">make sure you have installed the toolchain applications</a> (`simc` and `hal-simplicity`).

Now that you have the tools ready to go, we have a *demo walkthrough* below.  The demo walkthrough takes you through a transaction with a Simplicity contract on the Liquid Testnet, explaining the individual steps one by one and inviting you to run them yourself on the command line. At the end, we also have a *demo script* that you can use to run these same steps automatically. Both of these require `jq` and `curl` (for parsing JSON data and connecting to Liquid Testnet API endpoints).

## Demo walkthrough

In what follows, we assume you have already installed `simc` and `hal-simplicity` and also have `curl` and `jq` available.

### Step 1: Set up some parameters in your shell

Run these commands in the shell where you're following the walkthrough.

```bash
INTERNAL_KEY="50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"
PRIVKEY="0000000000000000000000000000000000000000000000000000000000000001"
DESTINATION_ADDRESS="tex1q9hgs7pj8etd92rw5qz3dymvujffxzylmj6a28h"
```

These set up some parameters that will be referenced later on in this process.

The `$INTERNAL_KEY` is a parameter used to construct the <glossary:address> of the Simplicity contract. The value given here is a hard-coded default value based on BIP 0341.

The `$PRIVKEY` variable represents a <glossary:private key> held by the beneficiary of the contract, who can approve a proposed transaction by digitally signing it with the this private key. This value is intentionally chosen to be the number `1` for demonstration purposes, but in a real contract application it would be a long random number.

The `$DESTINATION_ADDRESS` above, ending `...uwkjy`, is a specifically hardcoded value for sending tLBTC to a particular Blockstream test wallet. In the absence of anywhere else to send a payment, we'll make our contract send a payment to this address.

??? "Using your own wallet instead"
    If you prefer, you can generate a Liquid Testnet wallet of your own and send the tLBTC from the contract to your own wallet instead. You can do this by installing `elementsd` and `elements-cli` and then generating a local wallet with `elements-cli`. Alternatively, you can install a wallet application with Liquid Network support like the <a href="https://blockstream.com/app/">Blockstream App</a>. In the latter case, you'll need to create a Liquid Testnet wallet and account. You must provide an <glossary:unconfidential> <glossary:address> as the value of `DESTINATION_ADDRESS` here, not a <glossary:confidential> address. The command `hal-simplicity address inspect` can derive the unconfidential equivalent of a confidential address if required.

### Step 2: Compile the contract

The SimplicityHL contract below implements a simple Pay to Public Key (P2PK) rule, allowing anyone who possesses the private key `1` to spend any assets controlled by the contract. (The hardcoded key in the contract is the public key corresponding to the private key `1`.)

Copy the contract source code shown here and save it into a file called `example.simf`.

```rust
fn main() {
    let sighash: u256 = jet::sig_all_hash();
    let pubkey: Pubkey = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798; // 1 * G
    let signature: Signature = witness::SIGNATURE;
    jet::bip_0340_verify((pubkey, sighash), signature);
}
```

Now compile the contract with `simc`.

```bash
simc example.simf
```

The compiled version of the program is the second line of the `simc` output. It's a single long line of base64-encoded Simplicity program data, which begins `5lk2l5`...

We'll save the compiled program into a shell variable by extracting the `program` field from `simc`'s JSON output.

```bash
COMPILED_PROGRAM=$(simc --json example.simf | jq -r .program)
```

You can view some data about the compiled program by running `hal-simplicity simplicity info` on it.

```bash
hal-simplicity simplicity info $COMPILED_PROGRAM | jq
```

We'll extract two of these JSON parameters which are identifiers for this contract and which will be needed in several later steps.

```bash
CMR=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .cmr)
CONTRACT_ADDRESS=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .liquid_testnet_address_unconf)
```

These commands are using `jq` to extract specific named fields from the `hal-simplicity simplicity info` JSON output. In this case we are looking for the program's <glossary:CMR> and <glossary:address> and saving them into variables for future use.

### Step 3: Fund the contract on Liquid Testnet

We'll use the Liquid Testnet Faucet to send some tLBTC (a test <glossary:asset> used on <glossary:Liquid> Testnet, representing LBTC on Liquid Network) to this contract. Go to the <a target="_blank" href="https://liquidtestnet.com/faucet">Liquid Testnet Faucet</a> page in your web browser, and paste the address from `CONTRACT_ADDRESS` into the first box (destination).

??? "Alternative using `curl`"
    You can do this via `curl` on your command line.

    ```bash
    curl "https://liquidtestnet.com/faucet?address=$CONTRACT_ADDRESS&action=lbtc"
    ```

    However, the output is HTML and not easily parsed on the command line. You need to Look in the output for a line ending with "with transaction" followed by a hexadecimal string (which looks something like 3a0c1aa913358937ce6a71ba4bd12933c9b4ccdb7907d418ded72143b499eab1). Use the actual hexadecimal string that appears in the output of your `curl` command. Save it into the shell variable `FAUCET_TRANSACTION`.

Once this transaction occurs, the Liquid Testnet blockchain will include a transaction that funded the contract (allowing the contract's logic to control if and when this test asset may be spent). The output will include a line reading `Sent 10000 sats to address [your address] with transaction [txid].`; copy the txid value and save it into the shell variable `FAUCET_TRANSACTION`.

```bash
FAUCET_TRANSACTION=[insert your transaction ID from the Faucet here]
```

### Step 4: Create a minimal PSET

We'll now begin to build a <glossary:transaction> requesting this contract to spend these <glossary:asset>s by sending them to `$DESTINATION_ADDRESS`. Eventually, when it's complete, this transaction will satisfy the contract and be approved as valid, causing the assets to be transferred.

```bash
PSET1=$(hal-simplicity simplicity pset create '[ { "txid": "'"$FAUCET_TRANSACTION"'", "vout": 0 } ]' '[ { "'"$DESTINATION_ADDRESS"'": 0.00099900 }, { "fee": 0.00000100 } ]' | jq -r .pset)
```

Here we run `hal-simplicity-simplicity pset create` to create a new minimal <glossary:PSET> representing a transaction whose <glossary:input> comes from the prior contract-funding transaction and whose <glossary:output>, less a fee, goes to `$DESTINATION_ADDRESS`.

We save the PSET into a shell variable `$PSET1`. We'll gradually modify our PSET into different environment variables as we attach additional <glossary:parameter>s and details to it.

### Step 5: Get more input transaction details

We need to get some more details about the <glossary:UTXO> that this transaction is proposing to spend. These details are available via the Explorer API.

First, run

```bash
curl https://liquid.network/liquidtestnet/api/tx/$FAUCET_TRANSACTION
```

Make sure that its output reflects details about the transaction. If you do this too quickly (e.g. within less than a minute after the Faucet transaction in step 3), the API may not have these details available yet. Once the details are visible, run this command again to save them into a text file

```bash
curl https://liquid.network/liquidtestnet/api/tx/$FAUCET_TRANSACTION > input-tx.json
```

We need to extract three specific details related to this UTXO in order to allow other tools to reference it properly as an input to be spent in our new transaction. These details are called the scriptpubkey, asset, value. We'll save them into shell variables called `$HEX`, `$ASSET`, and `$VALUE`. (Note that `$VALUE` gets `0.00` prefixed to it because this API is measuring the value in a different numeric scale than the tools we use later expect.)

```bash
HEX=$(jq -r '.vout[0].scriptpubkey' < input-tx.json)
ASSET=$(jq -r '.vout[0].asset' < input-tx.json)
VALUE="0.00"$(jq -r '.vout[0].value' < input-tx.json)
```

Now we need to attach many details related to our new transaction to our PSET. We use `hal-simplicity simplicity pset update-input` to do this.

```bash
PSET2=$(hal-simplicity simplicity pset update-input "$PSET1" 0 -i "$HEX:$ASSET:$VALUE" -c "$CMR" -p "$INTERNAL_KEY" | jq -r .pset)
```

The modified PSET data is stored in the shell variable `$PSET2`.

### Step 6: Digitally sign the transaction

The contract we're using for this demonstration enforces, via its program logic, that a valid signature is present for the transaction. This means that the contract approves transactions when a prespecified entity (identified by a <glossary:public key> inside the contract's source code) provides a digital signature for those transactions. In this demo version, we have the matching private key already (in fact, it's just the number `1`), so we can make that signature ourselves.

First, let's create the witness file `example.wit`. Copy this JSON and save it into a file with that name.

```json
{
    "SIGNATURE": {
        "value": "0x1234567890",
        "type": "Signature"}
}
```

After we generate the transaction signature, we're going to edit the copy of the witness file to insert it into the appropriate place in the file. Let's generate the signature now:

```bash
hal-simplicity simplicity sighash "$PSET2" 0 "$CMR" -x "$PRIVKEY"
```

Copy the hexadecimal value that appears as `signature` in the output. Edit the `example.wit` file that you created above, and place the hexadecimal value in the *first* signature position. This is after the `0x` (the value you're replacing is `1234567890`). Make sure that the `0x` prefix remains before the signature value.

### Step 7: Create the serialized witness file

We're going to run `simc` again to obtain a version of our updated <glossary:witness> file suitable for publication on the blockchain. (This represents the *input* to our contract as the contract is being run in the context of this transaction. The presence of the valid signature on this transaction will convince our contract logic to approve the transaction.)

```bash
simc example.simf example.wit
```

Now we see an additional line of output representing the witness data. We'll store this into a shell variable too so that we can include it as part of our overall transaction. The data we need is the fourth line of output above, or the `witness` property in `simc`'s JSON output:

```bash
WITNESS=$(simc --json example.simf example.wit | jq -r .witness)
```

### Step 8: Finalize and extract the raw transaction

Two more `hal-simplicity` commands will transform our <glossary:PSET> and <glossary:witness> data into a <glossary:transaction> suitable for submission to the Liquid Testnet blockchain.

```bash
PSET3=$(hal-simplicity simplicity pset finalize "$PSET2" 0 "$COMPILED_PROGRAM" "$WITNESS" | jq -r .pset)
RAW_TX=$(hal-simplicity simplicity pset extract "$PSET3" | jq -r)
```

The first command attached the compiled program and the serialized witness file to our ever-growing PSET.

The second command transformed the PSET into a transaction in hex format that can be submitted to the blockchain.

### Step 9: Submit the transaction to the Liquid Testnet

You can now submit this transaction publicly to the Liquid Testnet. In your web browser, go to <a target="_blank" href="https://blockstream.info/liquidtestnet/tx/push">the "broadcast raw transaction" page</a>, and paste the transaction hex data from

```bash
echo $RAW_TX
```

When your transaction is submitted, you'll receive a link to let you view your successful transaction <a href="https://blockstream.info/liquidtestnet/">on the Explorer</a>.

??? "Alternative using `curl`"
    ```bash
    curl -X POST "https://blockstream.info/liquidtestnet/api/tx" -d "$RAW_TX"
    ```

    The output of this should be a new transaction ID, indicating that our transaction has been accepted and our Simplicity contract has approved spending its input!

    You can look up the details of your successful transaction <a href="https://blockstream.info/liquidtestnet/">on the Explorer</a>.

## Demo script

If you'd like to see the whole process above happen automatically, a bash script that executes these steps is available.

The script assumes you have `simc`, `hal-simplicity`, `curl`, and `jq` available.

You can download the <a href="/assets/example-demo.sh">example-demo.sh</a> bash script from this site. (Firefox may refuse to save it because of its MIME type; if so, use `wget` or `curl` instead.)

Then just run `bash example-demo.sh`. This should be sufficient to perform your first Simplicity transaction with an on-chain contract written in SimplicityHL!

Just like the walkthrough, the script exercises a Pay to Public Key (P2PK)-style contract written in SimplicityHL by performing a real transaction to and from this contract on the Liquid Testnet. Most commands, and their output, are printed as they're run. You can look at the contents of `example-demo.sh` to understand more about the steps it performs, or use it as a basis for performing Liquid Testnet transactions with other Simplicity contracts. At the end of the process, you'll see a link to the <a href="https://blockstream.info/liquidtestnet/">Liquid Testnet Explorer</a> to look at the details of the resulting transaction.
