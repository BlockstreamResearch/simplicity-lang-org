# Simply CLI + Elements - Complete Workflow

## Overview

This guide shows the complete command-line workflow for developing and deploying Simplicity contracts using `simply` and `elements-cli`.

**Tools used:**
- `simply` - SimplicityHL development toolkit
- `elements-cli` - Liquid node client
- `curl` - API requests to Liquid testnet

**Note:** `hal-simplicity` is under active development. This guide uses `simply` which is production-ready.

---

## Setup

### Install Tools

**simply:**
```bash
cargo install --git https://github.com/starkware-bitcoin/simply simply
```

**Elements Core** (includes elements-cli):

Download from https://github.com/ElementsProject/elements/releases and install.

### Verify Installation

```bash
simply --version
elements-cli --version
```

---

## Complete Workflow

### 1. Create Contract

**File: `always_true.simf`**
```rust
fn main() {
    // Contract that always succeeds
}
```

### 2. Compile Contract

```bash
simply build --entrypoint always_true.simf
```

**Output:**
```
Compiled: always_true
CMR: <32_byte_hex>
Cost: <number>
```

### 3. Generate P2TR Address

```bash
simply deposit --entrypoint always_true.simf
```

**Output:**
```
P2TR address: tex1p...
```

### 4. Fund Address

**Request from faucet:**
```bash
curl "https://liquidtestnet.com/faucet?address=tex1p5m8j7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x&action=lbtc"
```

Replace `tex1p5m8j...` with your actual address.

**Check balance:**
```bash
curl "https://blockstream.info/liquidtestnet/api/address/tex1p5m8j7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x/utxo"
```

**Response:**
```json
[{
  "txid": "c2f44551601034af3cc0d004b5b486d558c867bd9bc4f97123e48e4ddd3b8d42",
  "vout": 0,
  "value": 100000
}]
```

### 5. Create Witness (If Required)

**For contracts needing witness data:**

**File: `witness.wit`**
```json
{
  "signature": {
    "value": "0x<64_byte_hex>",
    "type": "Signature"
  }
}
```

**For always_true:** No witness needed (empty file or omit).

### 6. Build Spending Transaction

```bash
simply withdraw --entrypoint always_true.simf --txid c2f44551601034af3cc0d004b5b486d558c867bd9bc4f97123e48e4ddd3b8d42 --destination tex1qrecipient7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x
```

Replace:
- `<txid>` - From step 4
- `<destination>` - Where to send funds

**What this does:**
- Fetches UTXO from blockchain
- Builds complete transaction
- Encodes Simplicity program and witness
- Broadcasts to Liquid testnet

**Output:**
```
Transaction ID: xyz789...
```

### 7. Verify Transaction

```bash
curl "https://blockstream.info/liquidtestnet/api/tx/xyz789abc..."
```

**Check status:**
```bash
curl "https://blockstream.info/liquidtestnet/api/tx/xyz789abc.../status"
```

**Response:**
```json
{
  "confirmed": true,
  "block_height": 2137590
}
```

---

## P2PK Contract Example

### Create P2PK Contract

**File: `p2pk.simf`**
```rust
fn main() {
    let pk: Pubkey = 0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798;
    let msg: u256 = jet::sig_all_hash();
    let sig: Signature = witness::signature;
    jet::bip_0340_verify(pk, msg, sig)
}
```

### Compile

```bash
simply build --entrypoint p2pk.simf
```

### Get Address

```bash
simply deposit --entrypoint p2pk.simf
```

**Output:** `tex1p7a8b9c...`

### Fund

```bash
curl "https://liquidtestnet.com/faucet?address=tex1p7a8b9c...&action=lbtc"
```

### Get UTXO Details

```bash
curl "https://blockstream.info/liquidtestnet/api/address/tex1p7a8b9c.../utxo"
```

### Understanding Sighash (Internal Process)

**Note:** When using `simply withdraw`, sighash computation is **automatic**. You don't manually compute it.

**What simply does internally:**

**Code reference:** [`simply/src/transaction.rs`](https://github.com/starkware-bitcoin/simply/blob/main/src/transaction.rs)

```rust
// simply builds the transaction environment
let tx_env = ElementsEnv::new(
    transaction,
    vec![utxo],
    input_index,
    cmr,
    control_block,
    None,
    genesis_hash  // Liquid testnet: a771da8e...
);

// Computes sighash automatically
let sighash = tx_env.c_tx_env().sighash_all();
```

**Sighash includes:**
- All transaction inputs and outputs
- Genesis hash (network identifier)
- Spent UTXO data
- Locktime and sequence

**For contracts needing signatures:**

The contract code accesses sighash via:
```rust
let msg: u256 = jet::sig_all_hash();
```

This returns the sighash that signatures must commit to.

**If you need to sign manually (advanced):**

You would need to:
1. Build the transaction
2. Compute sighash using ElementsEnv
3. Sign with BIP-340 Schnorr
4. Provide signature in witness file

**But simply handles this for you** when you use `withdraw` with a witness file.

### Creating Signatures (For P2PK Contracts)

**For contracts requiring signatures, you need:**

1. A tool that computes transaction sighash
2. A signing tool supporting BIP-340 Schnorr signatures
3. Your private key

**Signing options:**
- Liquid wallet with signing capabilities
- Hardware wallet with Schnorr support  
- Software cryptographic libraries
- External signing services

**Once you have the 64-byte signature**, create the witness file.

### Create Witness File

**File: `witness.wit`**
```json
{
  "signature": {
    "value": "0x<your_64_byte_signature_here>",
    "type": "Signature"
  }
}
```

### Spend

```bash
simply withdraw --entrypoint p2pk.simf --txid abc123... --destination tex1qdest... --witness witness.wit
```

---

## Working with Elements Node

### Start Liquid Testnet Node

```bash
elementsd -chain=liquidtestnet -daemon
```

### Create Wallet

```bash
elements-cli -chain=liquidtestnet createwallet mywallet
```

### Generate Address

```bash
elements-cli -chain=liquidtestnet -rpcwallet=mywallet getnewaddress
```

### Get Balance

```bash
elements-cli -chain=liquidtestnet -rpcwallet=mywallet getbalance
```

### Send Transaction

```bash
elements-cli -chain=liquidtestnet sendrawtransaction 020000...
```

---

## API Workflow (No Node Required)

### Check Address Balance

```bash
curl "https://blockstream.info/liquidtestnet/api/address/tex1q.../utxo"
```

### Get Transaction

```bash
curl "https://blockstream.info/liquidtestnet/api/tx/abc123..."
```

### Get Transaction Hex

```bash
curl "https://blockstream.info/liquidtestnet/api/tx/abc123.../hex"
```

### Broadcast Transaction

```bash
curl -X POST "https://blockstream.info/liquidtestnet/api/tx" -d "020000..."
```

### Check Confirmation

```bash
curl "https://blockstream.info/liquidtestnet/api/tx/abc123.../status"
```

**Response:**
```json
{
  "confirmed": true,
  "block_height": 2137590,
  "block_hash": "abc..."
}
```

---

## Complete Example: Deploy & Execute

### Create Contract File

```bash
cat > my_contract.simf << 'EOF'
fn main() {
    // Always succeeds
}
EOF
```

### Compile

```bash
simply build --entrypoint my_contract.simf
```

### Get Address

```bash
simply deposit --entrypoint my_contract.simf
```

Copy the address, e.g., `tex1p5m8j7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x`

### Fund

```bash
curl "https://liquidtestnet.com/faucet?address=tex1p5m8j7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x&action=lbtc"
```

### Wait & Check

```bash
sleep 60
curl "https://blockstream.info/liquidtestnet/api/address/tex1p5m8j7r2qf9h8xvua5jk3n4l6p8r9t2s4v6w8x/utxo" | jq '.[0]'
```

### Spend

```bash
simply withdraw --entrypoint my_contract.simf --txid c2f44551601034af3cc0d004b5b486d558c867bd9bc4f97123e48e4ddd3b8d42 --destination tex1qrecipient7address
```

### Verify

```bash
curl "https://blockstream.info/liquidtestnet/api/tx/<new_txid>/status" | jq .
```

---

## Development Workflow

### Test Locally First

```bash
simply run --entrypoint contract.simf --logging debug
```

**Shows execution trace:**
- Each step
- Jet calls
- Debug output

### Run Test Suite

```bash
simply test
```

**Finds and runs all `test_*` functions in .simf files.**

### Build with Statistics

```bash
simply build --entrypoint contract.simf --stats
```

**Shows:**
- Cost bounds
- Memory usage
- Program size

---

## Network Parameters

### Liquid Testnet

**Genesis Hash:**
```
a771da8e52ee6ad581ed1e9a99825e5b3b7992225534eaa2ae23244fe26ab1c1
```

**L-BTC Asset ID:**
```
144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49
```

**Explorer API:**
```
https://blockstream.info/liquidtestnet/api
```

**Endpoints:**
- `/address/<address>/utxo` - Get UTXOs
- `/tx/<txid>` - Get transaction
- `/tx/<txid>/status` - Check confirmation
- `/tx` (POST) - Broadcast transaction

---

## Common Commands Reference

### simply Commands

```bash
simply build --entrypoint <file>
simply run --entrypoint <file> --logging <level>
simply test
simply deposit --entrypoint <file>
simply withdraw --entrypoint <file> --txid <txid> --destination <address>
```

### Liquid Testnet API

```bash
# Fund address
curl "https://liquidtestnet.com/faucet?address=<address>&action=lbtc"

# Check UTXOs
curl "https://blockstream.info/liquidtestnet/api/address/<address>/utxo"

# Get transaction
curl "https://blockstream.info/liquidtestnet/api/tx/<txid>"

# Broadcast transaction
curl -X POST "https://blockstream.info/liquidtestnet/api/tx" -d "<tx_hex>"

# Check status
curl "https://blockstream.info/liquidtestnet/api/tx/<txid>/status"
```

### elements-cli (If Running Node)

```bash
# Testnet operations
elements-cli -chain=liquidtestnet getblockchaininfo
elements-cli -chain=liquidtestnet getnewaddress
elements-cli -chain=liquidtestnet sendtoaddress <address> <amount>
elements-cli -chain=liquidtestnet sendrawtransaction <hex>
elements-cli -chain=liquidtestnet gettransaction <txid>
```

---

## Troubleshooting

### simply Command Not Found

```bash
# Check if installed
which simply

# Reinstall if needed
cargo install --git https://github.com/starkware-bitcoin/simply simply --force
```

### Connection Errors

```bash
# Test API connectivity
curl "https://blockstream.info/liquidtestnet/api"

# Should return API documentation
```

### Transaction Building Fails

```bash
# Verify UTXO exists
curl "https://blockstream.info/liquidtestnet/api/tx/<txid>/hex"

# Check if already spent
curl "https://blockstream.info/liquidtestnet/api/tx/<txid>/outspend/<vout>"
```

---

## Next Steps

- [SimplicityHL Complete Guide](simplicityhl-complete.md) - Deep dive into language
- [Web IDE Guide](web-ide.md) - Browser-based development
- [Use Cases](../use-cases/) - Real-world contract examples

