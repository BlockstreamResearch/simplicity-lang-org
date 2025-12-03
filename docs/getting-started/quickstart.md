# SimplicityHL Quickstart

This is a quickstart document to help you perform your first <glossary:transaction> on <glossary:Liquid> Testnet using a <glossary:Simplicity> <glossary:contract>.

We'll use only two tools initially: `simc` (the SimplicityHL compiler) and `hal-simplicity` (an all-purpose Simplicity utility that can do various tasks related to programs and transactions).

Both of these can be installed with `cargo`; make sure you <a href="https://doc.rust-lang.org/stable/cargo/getting-started/installation.html">have `cargo` installed</a> first.

You can then install these tools with the commands

```bash
cargo install simplicityhl
cargo install --git https://github.com/BlockstreamResearch/hal-simplicity
```

Now that you have the tools ready to go, we have a *demo script* and a *demo walkthrough* below.  The demo script is a shell script you can run to perform a transaction with a Simplicity contract on the Liquid Testnet.  The demo walkthrough takes you through the same transaction, explaining the individual steps one by one and inviting you to run them yourself on the command line.

Both of these will require `jq` and `curl` (for parsing JSON data and connecting to Liquid Testnet API endpoints).

## Demo script

This script assumes you have already installed `simc` and `hal-simplicity` and also have `git`, `curl`, and `jq` available.

You will need to download the <a href="/assets/p2ms-demo.sh">p2ms-demo.sh</a> bash script from this site. Then mark it executable with `chmod +x p2ms-demo`. (Firefox may refuse to save it because of its MIME type; if so, use `wget` or `curl` instead.)

The steps below, executed in the same directory where you downloaded `p2ms-demo.sh`, should then be sufficient to perform your first Simplicity transaction with an on-chain contract written in SimplicityHL!

```bash
# We'll check out a local copy of the SimplicityHL repository to use its
# contract code examples.  If you choose to check this out under a different
# path, change the path to the source files in the p2ms-demo script below, as
# it defaults to assuming that the example SimplicityHL source code is found
# under ~/src/SimplicityHL/examples.
pushd ~/src
git clone https://github.com/BlockstreamResearch/SimplicityHL
popd

./p2ms-demo.sh
```

This demo script exercises a Pay to <glossary:Multisig> contract written in SimplicityHL by performing a real transaction to and from this contract on the Liquid Testnet. Most commands are printed as they are run. You can look at the contents of `p2ms-demo.sh` to understand more about the steps it performs, or use it as a basis for performing Liquid Testnet transactions with other Simplicity contracts. At the end of the process, you'll see a link to the <a href="https://blockstream.info/">Explorer</a> to look at the details of the resulting transaction.

## Demo walkthrough

If you'd like to perform the individual steps in the transaction by hand, follow the steps below.

In what follows, we assume you have already installed `simc` and `hal-simplicity` and also have `git`, `curl`, and `jq` available.

### Step 1: Check out example code

```bash
# We'll check out a local copy of the SimplicityHL repository to use its
# contract code examples.  If you choose to check this out under a different
# path, remember that path and use the references to that location where
# appropriate below when referring to the example SimplicityHL source code
# (the walkthrough assumes the example code is found under
# ~/src/SimplicityHL/examples).
pushd ~/src
git clone https://github.com/BlockstreamResearch/SimplicityHL
popd
```

### Step 2: Set up some parameters in your shell

Run these commands in the shell where you're following the walkthrough.

```bash
PROGRAM_SOURCE=~/src/SimplicityHL/examples/p2ms.simf
WITNESS_FILE=~/src/SimplicityHL/examples/p2ms.wit
INTERNAL_KEY="50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"
PRIVKEY_1="0000000000000000000000000000000000000000000000000000000000000001"
PRIVKEY_2="0000000000000000000000000000000000000000000000000000000000000002"
PRIVKEY_3="0000000000000000000000000000000000000000000000000000000000000003"
FAUCET_ADDRESS="tex1qkkxzy9glfws4nc392an5w2kgjym7sxpshuwkjy"
```

These set up some parameters that will be referenced later on in this process.

The first two variables, `$PROGRAM_SOURCE` and `$WITNESS_FILE`, refer to the locations of the <glossary:contract> source code and <glossary:witness> file (input) template. If you checked out the SimplicityHL repository somewhere other than `~/src`, please make sure these variables reflect the actual location of the example code.

The `$INTERNAL_KEY` is a parameter used to construct the <glossary:address> of the Simplicity contract. The value given here is a hard-coded default value based on BIP 0341.

The `$PRIVKEY_1`, `$PRIVKEY_2`, and `$PRIVKEY_3` represent <glossary:private key>s held by three different people or organizations. In this particular contract, any two of these three people may approve a proposed transaction by digitally signing it with their private keys. These values are intentionally chosen to be the numbers `1`, `2`, and `3`, but in a real contract application they would be long random numbers existing on separate computers, and the corresponding digital signatures would be generated independently by separate people.

The `$FAUCET_ADDRESS` is a hardcoded value for refunding tLBTC to the Liquid Testnet Faucet service. This is the address that we will make our contract send a payment to. If you prefer, you can generate a Liquid Testnet wallet of your own and send the tLBTC from the contract to your own wallet instead. Doing would typically involve installing `elementsd` and `elements-cli`, and is not described further in this walkthrough.

### Step 3: Compile the contract

Take a look at the contract source code.

```bash
cat $PROGRAM_SOURCE
```

Now compile it with `simc`.

```bash
simc $PROGRAM_SOURCE
```

The compiled version of the program is the last line of the `simc` output. It is a single long line of base64-encoded Simplicity program data, probably beginning `5lk2l5`...

We will save the compiled program into a shell variable by extracting the last line of the compiler output.

```bash
COMPILED_PROGRAM=$(simc $PROGRAM_SOURCE | tail -1)
```

You can view some data about the compiled program by running `hal-simplicity simplicity info` on it.

```bash
hal-simplicity simplicity info $COMPILED_PROGRAM | jq`
```

We will extract two of these JSON parameters which are identifiers for this contract and which will be needed in several later steps.

```bash
CMR=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .cmr)
CONTRACT_ADDRESS=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .liquid_testnet_address_unconf)
```

These commands are using `jq` to extract specific named fields from the `hal-simplicity simplicity info` JSON output. In this case we are looking for the program's <glossary:CMR> and <glossary:address> and saving them into variables for future use.

### Step 4: Fund the contract on Liquid Testnet

We'll use the Liquid Testnet Faucet to send some tLBTC (a test <glossary:asset> used on <glossary:Liquid> Testnet, representing LBTC on Liquid Network) to this contract. To do this, we connect to the Faucet API via `curl`.

```bash
curl "https://liquidtestnet.com/faucet?address=$CONTRACT_ADDRESS&action=lbtc"
```

This is asking the Faucet to send the test asset to the address represented by `$CONTRACT_ADDRESS`. Once this transaction occurs, the Liquid Testnet blockchain will include a transaction that funded the contract (allowing the contract's logic to control if and when this test asset may be spent).

Look in the output for a line ending with "with transaction" followed by a hexadecimal string (which looks something like 3a0c1aa913358937ce6a71ba4bd12933c9b4ccdb7907d418ded72143b499eab1). Use the actual hexadecimal string that appears in the output of your `curl` command. Save it into the shell variable `$FAUCET_TRANSACTION`.

```bash
FAUCET_TRANSACTION=[insert your transaction ID from the Faucet API reply here]
```

### Step 5: Create a minimal PSET

We'll now begin to build a <glossary:transaction> requesting this contract to spend these <glossary:asset>s by sending them to `$FAUCET_ADDRESS`. Eventually, when it's complete, this transaction will satisfy the contract and be approved as valid, causing the assets to be transferred.

```bash
PSET=$(hal-simplicity simplicity pset create '[ { "txid": "'"$FAUCET_TRANSACTION"'", "vout": 0 } ]' '[ { "'"$FAUCET_ADDRESS"'": 0.00099900 }, { "fee": 0.00000100 } ]' | jq -r .pset)
```

Here we run `hal-simplicity-simplicity pset create` to create a new minimal <glossary:PSET> representing a transaction whose <glossary:input> comes from the prior contract-funding transaction and whose <glossary:output>, less a fee, goes to `$FAUCET_ADDRESS`.

(Yes, this is a kind of closed loop, as assets are coming *from* the Faucet in one initial transaction, and being sent back *to* the Faucet as a destination in a subsequent transaction. Addresses belonging to the Faucet service occupy both roles here because of the nature of this demonstration. As we noted above in step 2, you can also choose to instead create your own wallet and use it as the destination for these test assets.)

We save the PSET into a shell variable `$PSET` which we will gradually modify as we attach additional <glossary:parameter>s and details to it.

### Step 6: Get more input transaction details

We need to get some more details about the <glossary:UTXO> that this transaction is proposing to spend. These details are available via the Explorer API.

First, run

```bash
curl https://liquid.network/liquidtestnet/api/tx/$FAUCET_TRANSACTION
```

Make sure that its output reflects details about the transaction. If you do this too quickly (e.g. within less than a minute after the Faucet transaction in step 4), the API may not have these details available yet. Once the details are visible, run this command again to save them into a text file

```bash
curl https://liquid.network/liquidtestnet/api/tx/$FAUCET_TRANSACTION > /tmp/input-tx.json
```

We need to extract three specific details related to this UTXO in order to allow other tools to reference it properly as an input to be spent in our new transaction. These details are called the scriptpubkey, asset, value. We'll save them into shell variables called `$HEX`, `$ASSET`, and `$VALUE`. (Note that `$VALUE` gets `0.00` prefixed to it because this API is measuring the value in a different numeric scale than the tools we use later expect.)

```bash
HEX=$(jq -r .scriptpubkey < /tmp/input-tx.json)
ASSET=$(jq -r .asset < /tmp/input-tx.json)
VALUE="0.00"$(jq -r .value < /tmp/input-tx.json)
```

Now we need to attach many details related to our new transaction to our PSET. We use `hal-simplicity simplicity pset update-input` to do this.

```bash
PSET=$(hal-simplicity simplicity pset update-input "$PSET" 0 -i "$HEX:$ASSET:$VALUE" -c "$CMR" -p "$INTERNAL_KEY" | jq -r .pset)
```

The modified PSET data is stored back into the shell variable `$PSET`.

### Step 7: Digitally sign the transaction

The contract we're using for this demonstration enforces, via its program logic, a "2 of 3 multisig" policy. This means that the contract approves transactions when 2 out of 3 prespecified entities (identified by <glossary:public key>s inside the contract's source code) provide digital signatures for those transactions. In practice, this might be members of a family, or employees of a company, or just separate devices that an individual uses for extra security. We'll call these people or entities Alice, Bob, and Charlie. In this demo version, we have all three of these keys already (in fact, they're just the numbers `1`, `2`, and `3`) so we can make these signatures ourselves.

In a real application, these keys would most likely not be present on the same device at the same time. In that case, the `$PSET` and `$CMR` values (which do not contain highly private or sensitive information; all of this information will eventually be published on the blockchain) from step 6 above would be shared with the people or devices being asked to generate the signatures (here, Alice and Charlie), and they would generate the signatures themselves with the `hal-simplicity simplicity sighash` command, using their private keys on their own devices. The resulting signature values would then be sent back and inserted into the <glossary:witness> file on the device that is assembling the transaction.

First, let's make a copy of the witness file.

```bash
cp $WITNESS_FILE /tmp/p2ms.wit
```

After we generate Alice's and Charlie's signatures, we're going to edit the copy of the witness file to insert them into appropriate places in the file. First, let's generate Alice's signature on this transaction:

```bash
hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_1"
```

Copy the hexadecimal value that appears as `signature` in the output. Edit the `/tmp/p2ms.wit` file with a text editor, and place it in the *first* signature position. This is after the `0x` in the first `Some()` (the value you're replacing in the witness template begins `f74b3c`...). Make sure that the `0x` prefix remains before Alice's signature value.

Now, let's generate Charlie's signature on the transaction:

```bash
hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_3"
```

Copy the hexadecimal value that appears as `signature` in the output. Edit the `/tmp/p2ms.wit` file with a text editor, and place it in the *third* signature position. This is after the `0x` in the last `Some()` (the value you're replacing in the witness template begins `29dbea`...). Make sure that the `0x` prefix remains before Charlie's signature value.

### Step 8: Create the serialized witness file

We're going to run `simc` again to obtain a version of our updated <glossary:witness> file suitable for publication on the blockchain. (This represents the *input* to our contract as the contract is being run in the context of this transaction. The presence of both Alice's and Charlie's valid signatures on this transaction will convince our contract logic to approve the transaction.)

```bash
simc $PROGRAM_SOURCE /tmp/p2ms.wit
```

Now there is an additional line of output representing the witness data. We want to store this into a shell variable too so that we can include it as part of our overall transaction. Once again, the data we need is on the final line of output of `simc`:

```bash
WITNESS=$(simc $PROGRAM_SOURCE /tmp/p2ms.wit | tail -1)
```

### Step 9: Finalize and extract the raw transaction

Two more `hal-simplicity` commands will transform our <glossary:PSET> and <glossary:witness> data into a <glossary:transaction> suitable for submission to the Liquid Testnet blockchain.

```bash
PSET=$(hal-simplicity simplicity pset finalize "$PSET" 0 "$PROGRAM" "$WITNESS" | jq -r .pset)
RAW_TX=$(hal-simplicity simplicity pset extract "$PSET" | jq -r)
```

The first command attached the compiled program and the serialized witness file to our ever-growing PSET.

The second command transformed the PSET into a transaction in hex format that can be submitted to the blockchain.

### Step 10: Submit the transaction to the Liquid Testnet

Here we use a different API to submit the transaction:

```bash
curl -X POST "https://blockstream.info/liquidtestnet/api/tx" -d "$RAW_TX"
```

The output of this should be a new transaction ID, indicating that our transaction has been accepted and our Simplicity contract has approved spending its input!

You can look up the details of your successful transaction <a href="https://blockstream.info/liquidtestnet/">on the Explorer</a>.
