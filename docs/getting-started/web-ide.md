# How to make a transaction using the web IDE

The Simplicity Web IDE is a browser-based development environment for writing, compiling, and deploying Simplicity contracts to Liquid testnet.

Repository: https://github.com/BlockstreamResearch/simplicity-webide
Live Demo: (Deploy locally or https://ide.simplicity-lang.org)

**Features:**
- Write SimplicityHL contracts in browser
- Compile to Simplicity bytecode
- Generate P2TR addresses
- Build transactions
- Deploy to Liquid testnet

The SimplicityHL web IDE can only make a restricted form of transaction: There is 1 transaction input, 1 transaction output and 1 fee output _(Liquid has explicit fee outputs)_. Confidential transactions or assets other than Bitcoin are not supported.

![Screenshot of mempool.space](https://docs.simplicity-lang.org/assets/mempool1.png)

## Write the main function

Open [the SimplicityHL web IDE](https://ide.simplicity-lang.org/) and write the main function of your program.

_You can leave the default main function as it is. Customize it if you want._

![Screenshot of the web IDE](https://docs.simplicity-lang.org/assets/webide0.png)

## Generate an address

Click the "Address" button to copy the address of your program to the clipboard.

Leave the web IDE tab open. You will need it later.

![Screenshot of the web IDE](https://docs.simplicity-lang.org/assets/webide1.png)

## Fund the address

Paste the address into [the Liquid testnet faucet](https://liquidtestnet.com/faucet) and press the "Send assets" button.

![Screenshot of the Liquid testnet faucet](https://docs.simplicity-lang.org/assets/faucet1.png)

Copy the ID of the funding transaction to your clipboard.

![Screenshot of the Liquid testnet faucet](https://docs.simplicity-lang.org/assets/faucet2.png)

## Look up the funding transaction

Paste the ID of the funding transaction into the [Blockstream Explorer for Liquid testnet](https://blockstream.info/liquidtestnet/).

![Screenshot of the Blockstream Explorer](https://docs.simplicity-lang.org/assets/esplora1.png)

Scroll down and find the SimplicityHL UTXO. The Liquid testnet faucet always sends 100000 tL-BTC. In our example, the SimplicityHL UTXO is vout = 1.

![Screenshot of the Blockstream Explorer](https://docs.simplicity-lang.org/assets/esplora2.png)

## Enter UTXO data into the web IDE

Enter the ID of the funding transaction and the vout into the web IDE.

_You can leave the remaining fields as they are. Feel free to customize._

![Screenshot of the SimplicityHL web IDE](https://raw.githubusercontent.com/BlockstreamResearch/simplicity-webide/master/doc/webide2.png)

## Sign the spending transaction

Click the "Sig 0" button to generate a signature for a transaction that spends the SimplicityHL UTXO.

![Screenshot of the SimplicityHL web IDE](https://docs.simplicity-lang.org/assets/webide3.png)

Paste the signature into the `mod witness {...}` section.

![Screenshot of the SimplicityHL web IDE](https://docs.simplicity-lang.org/assets/webide4.png)

## Generate the spending transaction

Click the "Transaction" button to copy the spending transaction to your clipboard.

![Screenshot of the SimplicityHL web IDE](https://docs.simplicity-lang.org/assets/webide5.png)

## Broadcast the spending transaction

Paste the spending transaction into the [Blockstream Liquid testnet explorer](https://blockstream.info/liquidtestnet/tx/push) and click the "Broadcast transaction" button.

![Screenshot of the SimplicityHL web IDE](https://docs.simplicity-lang.org/assets/esplora3.png)

If everything worked, the explorer will open the broadcast transaction. In this case, congratulations, you made a SimplicityHL transaction on Liquid testnet!!! You can also look up your transaction on [mempool.space](https://liquid.network/testnet).

If you see an error message, take a look at the following "Troubleshooting" section.

## Cryptic error message

Cause.

Action to take.

## "Transaction not found" (Blockstream Explorer)

Fake error. The transaction actually worked :)

Wait for 1 minute and reload the page.

## `bad-txns-inputs-missingorspent`

The UTXO doesn't exist.

Double check the txid. You might have to wait for one minute for the UTXO to be included in the blockchain.

## `bad-txns-in-ne-out, value in != value out`

The input value does not equal the output value.

Double-check the UTXO info (vout and value). Check that the fee is lower than the input value.

## `bad-txns-fee-outofrange`

The fee does not cover the transaction weight.

Increase the fee.

## `non-final`

The lock time is higher than the current block height.

Decrease the locktime or wait until the block height is high enough.

## `non-BIP68-final`

The sequence is higher than the current block height plus the UTXO height.

Decrease the sequence or wait until the block height is high enough.

## `dust`

You are creating a dust transaction output.

The fee consumes the entire input value. Decrease the fee.

## `non-mandatory-script-verify-flag (Assertion failed inside jet)`

A Simplicity jet fails.

Double-check the conditions that your SimplicityHL program enforces. Update the witness data or transaction parameters.

Every time you change the transaction parameters, the signature hash of the transaction changes. In this case, you need to **regenerate signatures** using the "Key Store" tab.

## `non-mandatory-script-verify-flag (Witness program hash mismatch)`

The CMR of the Simplicity program inside the UTXO is different from the CMR of the program inside the transaction input.

Use a backup to restore the original program that you used to create the UTXO. Alternatively, try to fix your current program to match the UTXO program.

## Web IDE Internals

### What Happens When You Compile

**Code reference:** [`simplicity-webide/src/compile.rs`](https://github.com/BlockstreamResearch/simplicity-webide)

1. Parse SimplicityHL source
2. Compile to Simplicity
3. Compute CMR
4. Generate P2TR address with internal key:
   ```
   0x50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0
   ```
5. Display results

### Transaction Building

**What the IDE does:**

1. Create transaction structure
2. Build sighash from transaction data + genesis hash
3. Satisfy Simplicity program with witness
4. Encode program and witness to bytes
5. Build complete witness stack
6. Serialize transaction to hex

## Next Steps

- **Learn SimplicityHL:** [Language Reference](../simplicityhl-reference/)
- **CLI Development:** [Simply CLI Guide](simply-cli-guide.md)
- **Use Cases:** [Example Contracts](../use-cases/)
