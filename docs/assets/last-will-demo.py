#!/usr/bin/env python3

"""Fund and spend an example "last will" SimplicityHL contract on Liquid Testnet.

The testator (owner) deposits coins into the contract, then periodically
proves they're still alive by signing with a "hot" key, which re-creates
the same covenant and resets a timelock. If the inheritor ever sees that
timelock elapse without a fresh "still alive" transaction, they can claim
the coins with their own key. The owner also holds a "cold" key that can
break out of the covenant entirely at any time (not exercised below).

This walks through all three stages of that story:
  1. Fund the contract, then prove the owner is alive (a "hot" spend that
     re-creates the covenant, resetting the timelock).
  2. Attempt to inherit right away. This is expected to FAIL: the
     contract's own check is satisfied (it only looks at the *declared*
     relative-locktime distance), but the Liquid Testnet node itself
     independently enforces BIP-68 and rejects the broadcast because not
     enough blocks have actually passed yet.
  3. Wait for enough blocks to actually pass, then retry the identical
     transaction. This time it succeeds.

Requires a patched `lwk` Python wheel -- see the setup box at the top of
last-will-python-quickstart.md for how to build one. `pip install lwk`
alone is not enough (it doesn't currently ship a compatible SimplicityHL,
and doesn't build with Simplicity support at all).

Usage: python3 last-will-demo.py [destination_address]
"""

import json
import sys
import time
import urllib.error
import urllib.request

from lwk import (
    Address,
    Network,
    Keypair,
    OutPoint,
    PsetBuilder,
    PsetInputBuilder,
    PsetOutputBuilder,
    Script,
    SimplicityArguments,
    SimplicityLogLevel,
    SimplicityProgram,
    SimplicityTypedValue,
    SimplicityWitnessValues,
    Txid,
    TxOut,
    TxSequence,
    XOnlyPublicKey,
)

BASE_URL = "https://blockstream.info/liquidtestnet"
FAUCET_URL = "https://liquidtestnet.com/api/faucet"

# This is the BIP-0341 nothing-up-my-sleeve internal key: a Taproot internal
# key with no known private key. Used here so the only way to spend the
# contract is via one of its script paths -- there is no hidden key-path
# spend. (See last-will-quickstart.md for more on why this matters.)
INTERNAL_KEY = XOnlyPublicKey.from_string(
    "50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"
)

# Private keys for the contract's three roles. These are intentionally
# chosen to be the numbers 1, 2, and 3 for demonstration purposes -- in a
# real last-will contract these would be long random numbers held by three
# different people (the inheritor, and the owner's cold and hot keys), and
# in particular the owner's cold key would usually be kept offline.
PRIVKEY_INHERITOR = "0000000000000000000000000000000000000000000000000000000000000001"
PRIVKEY_COLD = "0000000000000000000000000000000000000000000000000000000000000002"
PRIVKEY_HOT = "0000000000000000000000000000000000000000000000000000000000000003"

# How many blocks the inheritor must wait, after the contract is funded or
# last refreshed, before they can claim the coins. Liquid Testnet blocks
# land roughly once a minute, so this keeps the whole walkthrough to a few
# minutes. A real last-will contract would use something like 180 days'
# worth of blocks instead (via Duration rather than Distance -- see
# last-will-quickstart.md).
MIN_DISTANCE_BLOCKS = 3

LAST_WILL_SOURCE = """
fn checksig(pk: Pubkey, sig: Signature) {
    let msg: u256 = jet::sig_all_hash();
    jet::bip_0340_verify((pk, msg), sig);
}

// The non-broken relative-timelock workaround from the Timelocks page.
fn enforce_relative_distance(min_distance: Distance) {
    assert!(jet::le_32(2, jet::version()));

    let parsed_seq: Option<Either<Distance, Duration>> = jet::parse_sequence(jet::current_sequence());
    match parsed_seq {
        None => assert!(false),
        Some(actual_data: Either<Distance, Duration>) => match actual_data {
            Left(actual_distance: Distance) => assert!(jet::le_16(min_distance, actual_distance)),
            Right(actual_duration: Duration) => assert!(false),
        },
    }
}

// Enforce the covenant to repeat in the first output.
//
// Elements has explicit fee outputs, so enforce a fee output in the second output.
// Disallow further outputs.
fn recursive_covenant() {
    assert!(jet::eq_32(jet::num_outputs(), 2));
    let this_script_hash: u256 = jet::current_script_hash();
    let output_script_hash: u256 = unwrap(jet::output_script_hash(0));
    assert!(jet::eq_256(this_script_hash, output_script_hash));
    assert!(unwrap(jet::output_is_fee(1)));
}

fn inherit_spend(inheritor_sig: Signature) {
    let min_distance: Distance = param::MIN_DISTANCE_BLOCKS;
    enforce_relative_distance(min_distance);
    let inheritor_pk: Pubkey = param::INHERITOR_PUBLIC_KEY;
    checksig(inheritor_pk, inheritor_sig);
}

fn cold_spend(cold_sig: Signature) {
    let cold_pk: Pubkey = param::COLD_PUBLIC_KEY;
    checksig(cold_pk, cold_sig);
}

fn refresh_spend(hot_sig: Signature) {
    let hot_pk: Pubkey = param::HOT_PUBLIC_KEY;
    checksig(hot_pk, hot_sig);
    recursive_covenant();
}

enum Action {
    Inherit(Signature),
    ColdSpend(Signature),
    HotSpend(Signature),
}

fn main() {
    match witness::ACTION {
        Action::Inherit(sig: Signature) => inherit_spend(sig),
        Action::ColdSpend(sig: Signature) => cold_spend(sig),
        Action::HotSpend(sig: Signature) => refresh_spend(sig),
    }
}
"""


def pause():
    input("Press Enter to continue. ")
    print()


# --------------------------------------------------------------------------
# Helper functions
# --------------------------------------------------------------------------


def get_json(url):
    with urllib.request.urlopen(url) as resp:
        return json.load(resp)


def get_text(url):
    with urllib.request.urlopen(url) as resp:
        return resp.read().decode().strip()


def broadcast(raw_tx_hex):
    """Broadcast a raw transaction. Returns the txid on success, or raises
    RuntimeError with the node's rejection message (e.g. "non-BIP68-final"
    for an unmet relative locktime)."""
    req = urllib.request.Request(f"{BASE_URL}/api/tx", data=raw_tx_hex.encode(), method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode().strip()
    except urllib.error.HTTPError as e:
        raise RuntimeError(e.read().decode().strip()) from e


def wait_for_confirmation(txid):
    """Wait until a transaction is confirmed (mined into a block), then
    return the height of the block that confirmed it. This matters here
    specifically because BIP-68 relative locktimes are counted from the
    height of the block that confirms the input being spent -- an
    unconfirmed input hasn't started "counting" yet."""
    print(f"Waiting for {txid} to confirm", end="", flush=True)
    for _ in range(120):
        status = get_json(f"{BASE_URL}/api/tx/{txid}/status")
        if status.get("confirmed"):
            height = status["block_height"]
            print(f" confirmed at height {height}.")
            return height
        print(".", end="", flush=True)
        time.sleep(5)
    raise TimeoutError(f"{txid} did not confirm in time")


def wait_for_tip_height(target):
    print(f"Waiting for the Liquid Testnet chain tip to reach block {target}...")
    while True:
        tip = int(get_text(f"{BASE_URL}/api/blocks/tip/height"))
        print(f"  current tip: {tip} (need {target})")
        if tip >= target:
            return
        time.sleep(15)


def fetch_utxo(txid, script):
    """Fetch vout[0]'s asset/value for txid and wrap it as a TxOut sitting
    at the given script (which is always the contract's own address in
    this demo, since every spend here is either a check-in or a claim)."""
    vout0 = get_json(f"{BASE_URL}/api/tx/{txid}")["vout"][0]
    return vout0["value"], vout0["asset"], TxOut.from_explicit(script, vout0["asset"], vout0["value"])


# --------------------------------------------------------------------------
# Setup
# --------------------------------------------------------------------------

if len(sys.argv) > 1:
    inheritor_destination = sys.argv[1]
    print(f"Using specified recipient address {inheritor_destination} as the inheritor's withdrawal destination.")
else:
    inheritor_destination = "tex1q9hgs7pj8etd92rw5qz3dymvujffxzylmj6a28h"
    print(f"Using faucet-return address {inheritor_destination} as the default withdrawal destination.")
print()

network = Network.testnet()

kp_inheritor = Keypair.from_secret_bytes(bytes.fromhex(PRIVKEY_INHERITOR))
kp_cold = Keypair.from_secret_bytes(bytes.fromhex(PRIVKEY_COLD))
kp_hot = Keypair.from_secret_bytes(bytes.fromhex(PRIVKEY_HOT))

for name, value in [
    ("MIN_DISTANCE_BLOCKS", MIN_DISTANCE_BLOCKS),
    ("INHERITOR_DESTINATION", inheritor_destination),
]:
    print(f"{name}={value}")

pause()

print("===================")
print("Step 1: Compile the contract")
print("===================")

args = SimplicityArguments()
args = args.add_value("INHERITOR_PUBLIC_KEY", SimplicityTypedValue.u256(kp_inheritor.x_only_public_key().to_bytes()))
args = args.add_value("COLD_PUBLIC_KEY", SimplicityTypedValue.u256(kp_cold.x_only_public_key().to_bytes()))
args = args.add_value("HOT_PUBLIC_KEY", SimplicityTypedValue.u256(kp_hot.x_only_public_key().to_bytes()))
args = args.add_value("MIN_DISTANCE_BLOCKS", SimplicityTypedValue.u16(MIN_DISTANCE_BLOCKS))

program = SimplicityProgram.load_with_unstable_features(LAST_WILL_SOURCE, args, ["enums"])
action_type = program.witness_type("ACTION")
print("CMR:", program.cmr())

contract_address = program.create_p2tr_address(INTERNAL_KEY, network)
contract_script = contract_address.script_pubkey()
print("Address:", contract_address)

pause()

print("===================")
print("Step 2: Fund the contract")
print("===================")

print("Requesting funds from the Liquid Testnet Faucet...")
faucet_txid = get_json(f"{FAUCET_URL}?address={contract_address}&action=lbtc")["txid"]
print("FAUCET_TXID =", faucet_txid)

pause()

# We don't need the funding tx's own confirmation height for anything (the
# BIP-68 clock that matters starts at the *hot-spend*'s confirmation, below)
# -- we just need it confirmed at all before spending from it.
wait_for_confirmation(faucet_txid)

pause()

print("===========================================")
print("Step 3: Prove the owner is alive (hot spend)")
print("===========================================")
print("This spends the funding UTXO straight back to the same contract address")
print("(minus a fee), signed with the hot key. Re-creating the exact same")
print("covenant script is what resets the inheritor's timelock.")
print()

funding_value, funding_asset, tx_out = fetch_utxo(faucet_txid, contract_script)

input_builder = PsetInputBuilder.from_prevout(OutPoint.from_parts(Txid(faucet_txid), 0))
input_builder.witness_utxo(tx_out)

pset_builder = PsetBuilder.new_v2()
pset_builder.add_input(input_builder.build())

fee = 100
pset_builder.add_output(
    PsetOutputBuilder.new_explicit(contract_script, funding_value - fee, funding_asset).build()
)
pset_builder.add_output(PsetOutputBuilder.new_explicit(Script.empty(), fee, funding_asset).build())

pset = pset_builder.build()
unsigned_tx = pset.extract_tx()

pause()

print(f"Signing on behalf of the owner using the hot private key {PRIVKEY_HOT}")
sighash = program.get_sighash_all(unsigned_tx, INTERNAL_KEY, [tx_out], 0, network)
hot_signature = kp_hot.sign_schnorr(sighash.hex())
print("Hot signature is", hot_signature)

action_value = SimplicityTypedValue.enum_variant(
    action_type, "HotSpend", [SimplicityTypedValue.byte_array(bytes.fromhex(hot_signature))]
)
witness_values = SimplicityWitnessValues().add_value("ACTION", action_value)

pause()

finalized_tx = program.finalize_transaction(
    unsigned_tx, INTERNAL_KEY, [tx_out], 0, witness_values, network, SimplicityLogLevel.NONE
)
raw_tx = finalized_tx.bytes().hex()
print("Raw transaction is", raw_tx)

pause()

print("Broadcasting hot-spend transaction...")
hot_txid = broadcast(raw_tx)
print("Broadcasted txid:", hot_txid)
print(f"You can view it online at {BASE_URL}/tx/{hot_txid}?expand")

pause()

hot_confirm_height = wait_for_confirmation(hot_txid)
target_height = hot_confirm_height + MIN_DISTANCE_BLOCKS
print(f"The inheritor's timelock is now satisfied starting at block {target_height}.")

pause()

print("===============================================")
print("Step 4: Attempt to inherit early (should fail!)")
print("===============================================")
print(f"This declares a relative-locktime distance of {MIN_DISTANCE_BLOCKS} blocks on")
print("the spent input (via PsetInputBuilder.sequence()), which is enough to")
print(f"satisfy the *contract's own* check. But block {target_height} hasn't been mined")
print("yet, so the node's own independent BIP-68 enforcement should reject this")
print("broadcast.")
print()

funding_value, funding_asset, tx_out = fetch_utxo(hot_txid, contract_script)

input_builder = PsetInputBuilder.from_prevout(OutPoint.from_parts(Txid(hot_txid), 0))
input_builder.witness_utxo(tx_out)
input_builder.sequence(TxSequence.from_height(MIN_DISTANCE_BLOCKS))

pset_builder = PsetBuilder.new_v2()
pset_builder.add_input(input_builder.build())

destination_script = Address(inheritor_destination).script_pubkey()
fee = 100
pset_builder.add_output(
    PsetOutputBuilder.new_explicit(destination_script, funding_value - fee, funding_asset).build()
)
pset_builder.add_output(PsetOutputBuilder.new_explicit(Script.empty(), fee, funding_asset).build())

pset = pset_builder.build()
unsigned_tx = pset.extract_tx()

pause()

print(f"Signing on behalf of the inheritor using private key {PRIVKEY_INHERITOR}")
sighash = program.get_sighash_all(unsigned_tx, INTERNAL_KEY, [tx_out], 0, network)
inheritor_signature = kp_inheritor.sign_schnorr(sighash.hex())
print("Inheritor signature is", inheritor_signature)

action_value = SimplicityTypedValue.enum_variant(
    action_type, "Inherit", [SimplicityTypedValue.byte_array(bytes.fromhex(inheritor_signature))]
)
witness_values = SimplicityWitnessValues().add_value("ACTION", action_value)

pause()

# Local finalization succeeds here: the contract's own check only compares
# against the sequence value declared above, and that's >= MIN_DISTANCE_BLOCKS.
finalized_tx = program.finalize_transaction(
    unsigned_tx, INTERNAL_KEY, [tx_out], 0, witness_values, network, SimplicityLogLevel.NONE
)
inherit_raw_tx = finalized_tx.bytes().hex()
print("Raw transaction is", inherit_raw_tx)

pause()

print("Attempting to broadcast the inheritance transaction early...")
try:
    broadcast(inherit_raw_tx)
    print("Unexpected: the node accepted this early! (Did the wait step above already finish?)")
except RuntimeError as e:
    print("As expected: the node rejected the early attempt.")
    print(e)

pause()

print("===================================================")
print("Step 5: Wait for the timelock to genuinely elapse")
print("===================================================")

wait_for_tip_height(target_height)

pause()

print("======================================")
print("Step 6: Inherit for real (should work)")
print("======================================")
print(f"Rebroadcasting the identical transaction from Step 4 now that block")
print(f"{target_height} has actually been mined.")
print()

inherit_txid = broadcast(inherit_raw_tx)
print("Broadcasted txid:", inherit_txid)
print()
print(f"You can view it online at {BASE_URL}/tx/{inherit_txid}?expand")
print()
print("The inheritor has successfully claimed the coins.")
