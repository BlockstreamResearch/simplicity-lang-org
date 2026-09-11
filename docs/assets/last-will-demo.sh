#!/bin/bash

# Fund and spend an example "last will" SimplicityHL contract on Liquid Testnet.
#
# The testator (owner) deposits coins into the contract, then periodically
# proves they're still alive by signing with a "hot" key, which re-creates
# the same covenant and resets a timelock. If the inheritor ever sees that
# timelock elapse without a fresh "still alive" transaction, they can claim
# the coins with their own key. The owner also holds a "cold" key that can
# break out of the covenant entirely at any time (not exercised below).
#
# This walks through all three stages of that story:
#   1. Fund the contract, then prove the owner is alive (a "hot" spend that
#      re-creates the covenant, resetting the timelock).
#   2. Attempt to inherit right away. This is expected to FAIL: the
#      contract's own check is satisfied (it only looks at the *declared*
#      relative-locktime distance), but the Liquid Testnet node itself
#      independently enforces BIP-68 and rejects the broadcast because not
#      enough blocks have actually passed yet.
#   3. Wait for enough blocks to actually pass, then retry the identical
#      transaction. This time it succeeds.
#
# Dependencies: simc hal-simplicity jq curl
#
# Requires SimplicityHL 0.7.0+ compiled with -Z enums (the last_will.simf
# contract below uses the enums feature). Requires hal-simplicity 0.2.0+,
# whose `simplicity pset create` accepts a per-input "sequence" field (used
# below to declare the inheritor's claimed relative-locktime distance).

set -u

pause() { echo -n "Press Enter to continue. "; read -r; echo; echo; }
# pause() { echo; echo; }

BASE_URL=https://blockstream.info/liquidtestnet
FAUCET_URL=https://liquidtestnet.com/api/faucet

TMPDIR=$(mktemp -d)
PROGRAM_SOURCE="$TMPDIR/last_will.simf"
ARGS_FILE="$TMPDIR/last_will.args"
WITNESS_FILE="$TMPDIR/last_will.wit"

# This is the BIP-0341 nothing-up-my-sleeve internal key: a Taproot internal
# key with no known private key. Used here so the only way to spend the
# contract is via one of its script paths -- there is no hidden key-path
# spend. (See bash-quickstart.md for more on why this matters.)
INTERNAL_KEY="50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"

# Private keys for the contract's three roles. These are intentionally
# chosen to be the numbers 1, 2, and 3 for demonstration purposes -- in a
# real last-will contract these would be long random numbers held by three
# different people (the inheritor, and the owner's cold and hot keys), and
# in particular the owner's cold key would usually be kept offline.
PRIVKEY_INHERITOR="0000000000000000000000000000000000000000000000000000000000000001"
PRIVKEY_COLD="0000000000000000000000000000000000000000000000000000000000000002"
PRIVKEY_HOT="0000000000000000000000000000000000000000000000000000000000000003"

# The public keys corresponding to the private keys above (1*G, 2*G, 3*G).
INHERITOR_PUBLIC_KEY="0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
COLD_PUBLIC_KEY="0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5"
HOT_PUBLIC_KEY="0xf9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9"

# How many blocks the inheritor must wait, after the contract is funded or
# last refreshed, before they can claim the coins. Liquid Testnet blocks
# land roughly once a minute, so this keeps the whole walkthrough to a few
# minutes. A real last-will contract would use something like 180 days'
# worth of blocks instead.
MIN_DISTANCE_BLOCKS=3

# Hardcoded address for returning tLBTC to the Liquid Testnet Faucet (so
# that it isn't wasted!). If a different address is provided as a command
# line argument, send the inherited coins there instead.
if [ $# -gt 0 ]
then
	INHERITOR_DESTINATION="$1"
	echo "Using specified recipient address $1 as the inheritor's withdrawal destination."
else
	INHERITOR_DESTINATION=tex1q9hgs7pj8etd92rw5qz3dymvujffxzylmj6a28h
	echo "Using faucet-return address $INHERITOR_DESTINATION as the default withdrawal destination."
fi

if echo "$INHERITOR_DESTINATION" | grep -E "^t?lq1" >/dev/null
then
	# Get the unconfidential address from a confidential address.
	INHERITOR_DESTINATION=$(hal-simplicity address inspect "$INHERITOR_DESTINATION" | jq -r .unconfidential)
	echo "Using unconfidential version: $INHERITOR_DESTINATION"
fi

echo

# --------------------------------------------------------------------------
# Helper functions
# --------------------------------------------------------------------------

# Wait until the Esplora API has details about a transaction (it may not be
# visible yet immediately after being broadcast). Writes the vout[0] JSON to
# $TMPDIR/tx-vout0.json and echoes nothing else.
propagation_check() {
	local txid=$1
	echo -n "Checking for transaction $txid via Liquid API..."
	for _ in {1..60}; do
		if curl -sSL "$BASE_URL/api/tx/$txid" 2>/dev/null | jq ".vout[0]" 2>/dev/null | tee "$TMPDIR"/tx-vout0.json | jq -e >/dev/null 2>&1
		then
			echo " found."
			return 0
		fi
		echo -n "."
		sleep 2
	done
	echo " timed out."
	return 1
}

# Wait until a transaction is confirmed (mined into a block), then print the
# height of the block that confirmed it. This matters here specifically
# because BIP-68 relative locktimes are counted from the height of the block
# that confirms the input being spent -- an unconfirmed input hasn't started
# "counting" yet.
#
# Prints ONLY the confirming block's height on stdout (so callers can
# capture it with $(...)); all progress narration goes to stderr instead,
# so it doesn't get swept into that captured value.
wait_for_confirmation() {
	local txid=$1
	echo -n "Waiting for $txid to confirm..." >&2
	for _ in {1..120}; do
		local status
		status=$(curl -sSL "$BASE_URL/api/tx/$txid/status" 2>/dev/null)
		if echo "$status" | jq -e ".confirmed == true" >/dev/null 2>&1
		then
			local height
			height=$(echo "$status" | jq -r .block_height)
			echo " confirmed at height $height." >&2
			echo "$height"
			return 0
		fi
		echo -n "." >&2
		sleep 5
	done
	echo " timed out." >&2
	return 1
}

# Wait until the chain tip reaches (at least) the given height.
wait_for_tip_height() {
	local target=$1
	echo "Waiting for the Liquid Testnet chain tip to reach block $target..."
	while :
	do
		local tip
		tip=$(curl -sSL "$BASE_URL/api/blocks/tip/height" 2>/dev/null)
		echo "  current tip: $tip (need $target)"
		if [ -n "$tip" ] && [ "$tip" -ge "$target" ] 2>/dev/null
		then
			break
		fi
		sleep 15
	done
}

# Broadcast a raw transaction. Prints the resulting txid and returns success
# if the node accepted it; otherwise prints the node's rejection message and
# returns failure. (Esplora returns a plain 64-character hex txid on
# success, and a non-2xx status with a human-readable error body on
# rejection -- e.g. "non-BIP68-final" for an unmet relative locktime.)
broadcast_tx() {
	local raw_tx=$1
	local response
	response=$(curl -sS -X POST "$BASE_URL/api/tx" -d "$raw_tx" 2>&1)
	if echo "$response" | grep -qE "^[0-9a-f]{64}$"
	then
		echo "$response"
		return 0
	else
		echo "REJECTED: $response" >&2
		return 1
	fi
}

# --------------------------------------------------------------------------
# The contract
# --------------------------------------------------------------------------

# This is adapted from the last_will.simf example in the SimplicityHL
# repository (https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/last_will.simf),
# with one important change: the original example enforces its timelock with
# jet::broken_do_not_use_check_lock_distance, which SimplicityHL's
# maintainers renamed and deprecated -- that jet checks the *maximum*
# relative-locktime distance declared across ALL of a transaction's inputs,
# not the distance actually declared by the specific input being spent, so a
# spender could defeat it by attaching an unrelated extra input with a high
# sequence value. The enforce_relative_distance function below replaces it
# with a manual, per-input check built from jet::current_sequence(),
# following https://github.com/BlockstreamResearch/simplicityhl-std/pull/45.
#
# The three public keys and the minimum distance are compile-time
# parameters (see last_will.args below), substituted into the `param::`
# constants at compile time.
cat > "$PROGRAM_SOURCE" << 'EOF'
fn checksig(pk: Pubkey, sig: Signature) {
    let msg: u256 = jet::sig_all_hash();
    jet::bip_0340_verify((pk, msg), sig);
}

// Assert that the current input is spent in a transaction that can only appear a
// distance of at least min_distance blocks after the block containing the input's UTXO.
// Panics otherwise. This is a non-broken replacement for jet::broken_do_not_use_check_lock_distance.
fn enforce_relative_distance(min_distance: Distance) {
    // Transaction version must be at least 2 for BIP68 relative locktime to apply.
    assert!(jet::le_32(2, jet::version()));

    // Fetch and parse the current input's own sequence number.
    let actual_data: Either<Distance, Duration> = unwrap(jet::parse_sequence(jet::current_sequence()));
    let actual_distance: Distance = unwrap_left::<Duration>(actual_data);

    assert!(jet::le_16(min_distance, actual_distance));
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
EOF

cat > "$ARGS_FILE" << EOF
{
    "INHERITOR_PUBLIC_KEY": "$INHERITOR_PUBLIC_KEY",
    "COLD_PUBLIC_KEY": "$COLD_PUBLIC_KEY",
    "HOT_PUBLIC_KEY": "$HOT_PUBLIC_KEY",
    "MIN_DISTANCE_BLOCKS": "$MIN_DISTANCE_BLOCKS"
}
EOF

for variable in PROGRAM_SOURCE ARGS_FILE INTERNAL_KEY MIN_DISTANCE_BLOCKS INHERITOR_DESTINATION
do
	echo -n "$variable="
	eval echo \$"$variable"
done

pause

echo "==================="
echo "Step 1: Compile the contract"
echo "==================="

echo simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE"
simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE"

pause

COMPILED_PROGRAM=$(simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE" --json | jq -r .program)

echo hal-simplicity simplicity info "$COMPILED_PROGRAM"
hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq

CMR=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .cmr)
CONTRACT_ADDRESS=$(hal-simplicity simplicity info "$COMPILED_PROGRAM" | jq -r .liquid_testnet_address_unconf)

for variable in CMR CONTRACT_ADDRESS
do
	echo -n "$variable="
	eval echo \$"$variable"
done

pause

echo "==================="
echo "Step 2: Fund the contract"
echo "==================="

echo "Running curl to connect to the Liquid Testnet Faucet..."
FAUCET_TXID=$(curl "$FAUCET_URL?address=$CONTRACT_ADDRESS&action=lbtc" 2>/dev/null | jq -r .txid)
echo "FAUCET_TXID=$FAUCET_TXID"

pause

# We don't need the funding tx's own confirmation height for anything (the
# BIP-68 clock that matters starts at the *hot-spend*'s confirmation, below)
# -- we just need it confirmed at all before spending from it.
wait_for_confirmation "$FAUCET_TXID" >/dev/null || { echo "Funding transaction did not confirm; aborting." >&2; exit 1; }

pause

echo "==========================================="
echo "Step 3: Prove the owner is alive (hot spend)"
echo "==========================================="
echo "This spends the funding UTXO straight back to the same contract address"
echo "(minus a fee), signed with the hot key. Re-creating the exact same"
echo "covenant script is what resets the inheritor's timelock."
echo

propagation_check "$FAUCET_TXID"
FUND_HEX=$(jq -r .scriptpubkey < "$TMPDIR"/tx-vout0.json)
FUND_ASSET=$(jq -r .asset < "$TMPDIR"/tx-vout0.json)
FUND_VALUE=$(jq -r '.value' < "$TMPDIR"/tx-vout0.json | awk '{printf "%.8f", $1/100000000}')

echo hal-simplicity simplicity pset create "[...utxo...]" "[...contract, fee...]"
PSET=$(hal-simplicity simplicity pset create \
	'[ { "txid": "'"$FAUCET_TXID"'", "vout": 0 } ]' \
	'[ { "'"$CONTRACT_ADDRESS"'": 0.00099900 }, { "fee": 0.00000100 } ]' \
	| jq -r .pset)

PSET=$(hal-simplicity simplicity pset update-input "$PSET" 0 -i "$FUND_HEX:$FUND_ASSET:$FUND_VALUE" -c "$CMR" -p "$INTERNAL_KEY" | jq -r .pset)

pause

echo "Signing on behalf of the owner using the hot private key $PRIVKEY_HOT"
HOT_SIGNATURE=$(hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_HOT" | jq -r .signature)
echo "Hot signature is $HOT_SIGNATURE"

cat > "$WITNESS_FILE" << EOF
{
    "ACTION": "Action::HotSpend(0x$HOT_SIGNATURE)"
}
EOF

echo "Contents of witness:"
cat "$WITNESS_FILE"

pause

PROGRAM=$(simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE" -w "$WITNESS_FILE" --json | jq -r .program)
WITNESS=$(simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE" -w "$WITNESS_FILE" --json | jq -r .witness)

PSET=$(hal-simplicity simplicity pset finalize "$PSET" 0 "$PROGRAM" "$WITNESS" | jq -r .pset)
RAW_TX=$(hal-simplicity simplicity pset extract "$PSET" | jq -r)

echo "Raw transaction is $RAW_TX"

pause

echo "Broadcasting hot-spend transaction..."
HOT_TXID=$(broadcast_tx "$RAW_TX") || { echo "Unexpected rejection -- see above."; exit 1; }
echo "Broadcasted txid: $HOT_TXID"
echo "You can view it online at $BASE_URL/tx/$HOT_TXID?expand"

pause

HOT_CONFIRM_HEIGHT=$(wait_for_confirmation "$HOT_TXID") || { echo "Hot-spend transaction did not confirm; aborting." >&2; exit 1; }
TARGET_HEIGHT=$((HOT_CONFIRM_HEIGHT + MIN_DISTANCE_BLOCKS))
echo "The inheritor's timelock is now satisfied starting at block $TARGET_HEIGHT."

pause

echo "==============================================="
echo "Step 4: Attempt to inherit early (should fail!)"
echo "==============================================="
echo "This declares a relative-locktime distance of $MIN_DISTANCE_BLOCKS blocks on"
echo "the spent input (via hal-simplicity simplicity pset create's \"sequence\""
echo "field), which is enough to satisfy the *contract's own* check. But block"
echo "$TARGET_HEIGHT hasn't been mined yet, so the node's own independent BIP-68"
echo "enforcement should reject this broadcast."
echo

propagation_check "$HOT_TXID"
HOT_HEX=$(jq -r .scriptpubkey < "$TMPDIR"/tx-vout0.json)
HOT_ASSET=$(jq -r .asset < "$TMPDIR"/tx-vout0.json)
HOT_VALUE=$(jq -r '.value' < "$TMPDIR"/tx-vout0.json | awk '{printf "%.8f", $1/100000000}')

echo hal-simplicity simplicity pset create "[...utxo, sequence=$MIN_DISTANCE_BLOCKS...]" "[...destination, fee...]"
PSET=$(hal-simplicity simplicity pset create \
	'[ { "txid": "'"$HOT_TXID"'", "vout": 0, "sequence": '"$MIN_DISTANCE_BLOCKS"' } ]' \
	'[ { "'"$INHERITOR_DESTINATION"'": 0.00099800 }, { "fee": 0.00000100 } ]' \
	| jq -r .pset)

PSET=$(hal-simplicity simplicity pset update-input "$PSET" 0 -i "$HOT_HEX:$HOT_ASSET:$HOT_VALUE" -c "$CMR" -p "$INTERNAL_KEY" | jq -r .pset)

pause

echo "Signing on behalf of the inheritor using private key $PRIVKEY_INHERITOR"
INHERITOR_SIGNATURE=$(hal-simplicity simplicity sighash "$PSET" 0 "$CMR" -x "$PRIVKEY_INHERITOR" | jq -r .signature)
echo "Inheritor signature is $INHERITOR_SIGNATURE"

cat > "$WITNESS_FILE" << EOF
{
    "ACTION": "Action::Inherit(0x$INHERITOR_SIGNATURE)"
}
EOF

echo "Contents of witness:"
cat "$WITNESS_FILE"

pause

PROGRAM=$(simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE" -w "$WITNESS_FILE" --json | jq -r .program)
WITNESS=$(simc -Z enums "$PROGRAM_SOURCE" -a "$ARGS_FILE" -w "$WITNESS_FILE" --json | jq -r .witness)

# Local finalization succeeds here: the contract's own check only compares
# against the sequence value declared above, and that's >= MIN_DISTANCE_BLOCKS.
PSET=$(hal-simplicity simplicity pset finalize "$PSET" 0 "$PROGRAM" "$WITNESS" | jq -r .pset)
INHERIT_RAW_TX=$(hal-simplicity simplicity pset extract "$PSET" | jq -r)

echo "Raw transaction is $INHERIT_RAW_TX"

pause

echo "Attempting to broadcast the inheritance transaction early..."
if broadcast_tx "$INHERIT_RAW_TX" > "$TMPDIR"/early-attempt.txt 2>&1
then
	echo "Unexpected: the node accepted this early! (Did the wait step above already finish?)"
else
	echo "As expected: the node rejected the early attempt."
	cat "$TMPDIR"/early-attempt.txt
fi

pause

echo "==================================================="
echo "Step 5: Wait for the timelock to genuinely elapse"
echo "==================================================="

wait_for_tip_height "$TARGET_HEIGHT"

pause

echo "======================================"
echo "Step 6: Inherit for real (should work)"
echo "======================================"
echo "Rebroadcasting the identical transaction from Step 4 now that block"
echo "$TARGET_HEIGHT has actually been mined."
echo

INHERIT_TXID=$(broadcast_tx "$INHERIT_RAW_TX") || { echo "Unexpected rejection -- see above."; exit 1; }
echo "Broadcasted txid: $INHERIT_TXID"
echo
echo "You can view it online at $BASE_URL/tx/$INHERIT_TXID?expand"
echo
echo "The inheritor has successfully claimed the coins."
