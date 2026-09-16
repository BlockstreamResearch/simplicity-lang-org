# Anonymized contract recreation set

These are ordered from easiest to hardest to recreate. Each entry is written as a request from a person to an engineer. The IDs are stable labels; they carry no meaning beyond the implementation index in the companion file.

Unless stated otherwise, “signature” means a valid signature over the transaction data specified by the contract, and “height” means the current blockchain height.

## C01

I want funds locked so that exactly one public key can spend them by signing the complete transaction.

- Parameter: one public key.
- Accept only a valid signature from that key over the complete transaction digest.

## C02

I want the same single-key spend, but the contract should store only the hash of the expected public key. The spender must reveal the public key and prove that it both hashes to the stored value and signs the transaction.

- Parameter: expected public-key hash `132f39a98c31baaddba6525f5d43f2954472097fa15265f45130bfdb70e51def`.
- Require the supplied public key to hash to that value.
- Require a valid signature from the supplied key over the complete transaction digest.

## C03

I want a shared account controlled by three keys where any two can authorize a spend, but one key alone cannot.

- Parameters: three public keys and threshold `2`.
- The witness may contain zero or one signature for each key.
- Every supplied signature must verify.
- Accept exactly two valid signatures.

## C04

I want a payment that needs both the sender and recipient before a deadline, while allowing the sender to recover the funds after the deadline.

- Parameters: sender key, recipient key, absolute timeout height `1000`.
- Before height `1000`, require valid signatures from both keys.
- At or after height `1000`, accept a valid sender signature alone.

## C05

I want an escrow with three participants. Any two may agree immediately, but the sender must be able to reclaim the funds alone after a waiting period.

- Parameters: sender key, recipient key, escrow key, relative delay `1000` blocks.
- Before the delay, accept exactly two valid signatures among the three keys.
- After the relative delay, accept the sender key alone.
- The escrow key must not be able to spend alone.

## C06

I want a payment that the recipient can claim by revealing a secret, while the sender can cancel it after a timeout.

- Parameters: recipient key, sender key, absolute timeout height `1000`, expected SHA-256 preimage hash `66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925`.
- Completion requires a 32-byte preimage whose SHA-256 hash equals the expected hash and a valid recipient signature.
- At or after height `1000`, cancellation requires a valid sender signature.

## C07

I want a vault with a hot key that can withdraw only after a delay and a cold key that can cancel and sweep the funds at any time.

- Parameters: hot key, cold key, relative delay `1000` blocks.
- After the delay, accept a valid hot-key spend.
- At any time, accept a valid cold-key spend that sweeps the funds.

## C08

I want a holding vault that opens only when a signed oracle report says both that a minimum height has been reached and that a target price has been met.

- Parameters: minimum height `1000`, target price `100000`, oracle key, owner key.
- The witness supplies `oracle_height` and `oracle_price`.
- Require `oracle_height >= 1000`.
- Require the transaction lock height to equal `oracle_height`.
- Require `oracle_price >= 100000`.
- Require an oracle signature over the ordered pair `(oracle_height, oracle_price)`.
- Require a valid owner signature over the transaction.

## C09

I want a will-like vault. An inheritor can claim after a long inactivity period, a cold key can take the funds at any time, and a hot key can refresh the vault only if it recreates the same protected output.

- Parameters: inheritor key, cold key, hot key, relative delay `25920` blocks.
- After the delay, accept an inheritor-key spend.
- At any time, accept a cold-key spend.
- A hot-key refresh must reproduce the same protected contract state in output `0`.
- A hot-key refresh must have exactly two outputs; output `1` is the fee output.

## C10

I want a cryptographic challenge that asks the spender to reveal two different 32-byte values producing the same SHA-256 hash.

- Parameters: two 32-byte values supplied by the spender.
- Require the values to be different.
- Require their SHA-256 hashes to be equal.
- No practical witness is known; the contract is still useful as a verifier challenge.

## C11

I want a cryptographic challenge that accepts a 32-byte value only when hashing it with SHA-256 returns the value itself.

- Parameter: one 32-byte value.
- Require `SHA256(value) == value`.
- No practical witness is known; the contract is still useful as a verifier challenge.

## C12

I want funds spendable only by a transaction whose structure matches a predetermined commitment.

- Commit, in order: transaction version, lock time, all input script-signature hashes, input count, all input sequence hashes, output count, all output hashes, and the current input index.
- Require the resulting digest to equal `ae3d019b30529c6044d2b3d7ee2e0ee5db51a7f05ed5db8f089cd5d455f1fc5d`.
- The spender supplies the committed transaction components; the contract recomputes and compares the digest.

## C13

I want a signed transaction that can be delayed and fee-bumped by reducing change, without asking the signer to sign again.

- Parameter: signer key `9bef8d556d80e43ae7e0becb3a7e6838b95defe45896ed6075bb9035d06c9964`.
- The signature commits to the network domain, transaction version, all inputs, the first output, all output destinations, all input UTXOs, the transaction execution environment, and the current input index.
- It intentionally does not commit to lock time or change/fee output amounts.
- Require lock time `>= 1734967235`.
- Require total fees to be strictly less than `1000 + (lock_time - 1734967235)` fee units.

## C14

I want the signer to approve every output and issuance and the current input, while allowing anyone to add or replace the other inputs.

- Parameters: fixed signer key, network domain, transaction version, lock time, transaction execution environment.
- Commit to the current input identity and UTXO.
- Commit to every output, every issuance, and every output-surjection-proof commitment.
- Do not commit to other input identities.
- Do not commit to the current input index.
- Require a valid signature over exactly that digest.

## C15

I want the signer to approve all outputs and the current input’s spending conditions, while allowing the same transaction intent to move between different previous outpoints.

- Parameters: fixed signer key, network domain, transaction version, lock time, transaction execution environment.
- Commit to the current input sequence, annex, and UTXO data.
- Commit to every output, every issuance, and every output-surjection-proof commitment.
- Omit the current input outpoint.
- Omit other input identities and the current input index.

## C16

I want a signature that approves the transaction outputs and spending context but can be reused with a different previous output, amount, asset, or script.

- Parameters: fixed signer key, network domain, transaction version, lock time, transaction execution environment.
- Commit to the current input sequence and annex.
- Commit to every output, every issuance, and every output-surjection-proof commitment.
- Omit the current input outpoint, amount, asset, script, other input identities, and current input index.

## C17

I want to authorize all current inputs and their previous outputs without authorizing any output destination or amount.

- Parameters: fixed signer key, network domain, transaction version, lock time, transaction execution environment.
- Commit to all input identities and all input UTXOs.
- Commit to the current input index.
- Include no output commitment.

## C18

I want to authorize all inputs but only the output at the current input’s index, so unrelated outputs can be added or changed.

- Parameters: fixed signer key, network domain, transaction version, lock time, transaction execution environment.
- Commit to all input identities and all input UTXOs.
- Commit only to the output at the current input index.
- Commit to the current input index.
- Do not commit to other outputs.

## C19

I want a collateral-backed option position. A creator locks collateral, creates one exercise token and one claim token per contract, and lets the two token holders perform different actions over time.

- Parameters: `start_time`, `expiry_time`, collateral asset, settlement asset, option asset, grantor asset, collateral and settlement reissuance-token IDs, `collateral_per_contract`, `settlement_per_contract`.
- For `n` contracts, require exactly `n * collateral_per_contract` collateral and `n * settlement_per_contract` settlement.
- Funding creates equal quantities of option and claim tokens and keeps the reissuance-token positions and remaining collateral under the same protected contract state.
- Cancellation burns equal quantities of option and grantor tokens and returns the corresponding collateral; partial cancellation preserves change.
- At or after `start_time`, burning `n` option tokens requires payment of `n * settlement_per_contract` settlement and releases `n * collateral_per_contract` collateral; unused collateral and the received settlement remain protected.
- At or after `start_time`, burning grantor tokens claims the matching settlement amount.
- At or after `expiry_time`, burning grantor tokens claims the matching unexercised collateral.

## C20

I want to post a collateral offer. A counterparty can exchange settlement assets for collateral plus a premium, I can withdraw the accumulated settlement later, and I can recover anything left after expiry.

- Parameters: collateral asset, premium asset, settlement asset, `collateral_per_contract`, `premium_per_collateral`, `expiry_time`, user public key.
- A counterparty’s swap must pay settlement at the exact configured collateral ratio and receive the corresponding collateral plus premium.
- Partial swaps are allowed; unused collateral and premium stay protected, and settlement received by the offer is added to the protected balance.
- The user key may withdraw the entire accumulated settlement balance to any destination.
- At or after `expiry_time`, the user key may withdraw all remaining collateral and premium.

## C21

I want a peer-to-peer lending offer. A borrower locks collateral and states the principal, term, and interest; a lender funds the exact principal; the borrower repays before expiry or the lender takes the collateral.

- Parameters: borrower and lender identities, collateral asset and amount, principal asset and amount, expiry height, interest rate in basis points, borrower/lender position asset IDs, borrower and lender destinations, protocol fee and protocol destination.
- Offer creation locks the collateral and publishes the exact loan parameters.
- Acceptance supplies the exact principal, transfers it to the borrower, and creates the lender’s position.
- Before expiry, the borrower may repay principal plus `principal * interest_rate / 10000`; the protocol receives its configured share, the lender receives the rest, and the borrower receives all collateral back.
- Partial repayment reduces the outstanding principal and preserves the remaining active loan.
- After expiry, the lender may liquidate and claim the collateral.
- Before acceptance, the borrower may cancel and recover the locked collateral.

## C22

I want a two-outcome prediction market backed by collateral. People mint equal YES and NO claims, an oracle can select the winner, and holders redeem according to the outcome or split the collateral evenly after expiry.

- Parameters: oracle public key, collateral asset, YES and NO outcome asset IDs, YES and NO reissuance-token IDs, collateral-per-token `CPT`, expiry height.
- The market ID is `SHA256(YES_asset_id || NO_asset_id)`.
- The oracle signs `SHA256(market_id || outcome_byte)`, with one byte for YES and one byte for NO.
- States: dormant, unresolved, resolved YES, resolved NO, expired.
- Creation establishes both reissuance-token positions without outcome tokens or collateral.
- Issuing `pairs` consumes both dormant reissuance positions, mints equal YES and NO quantities, and locks `pairs * 2 * CPT` collateral; later issuance adds to the unresolved position.
- While unresolved, burning equal YES and NO quantities returns `pairs * 2 * CPT`; full cancellation returns both reissuance positions to dormant state.
- Oracle resolution burns both reissuance positions and moves all collateral to the selected terminal state.
- After expiry, anyone may move all unresolved collateral to the expired state without an oracle.
- In the winning resolved state, one winning token redeems `2 * CPT`; losing tokens redeem nothing.
- In the expired state, either token redeems `1 * CPT`.

## C23

I want a permissionless two-asset exchange with no administrator. Liquidity providers receive proportional pool shares, traders swap either asset under a fee-adjusted constant-product rule, and shares can be added or removed.

- Parameters: assets `asset0` and `asset1`, immutable fee numerator and denominator, fixed LP supply `2,000,000,000,000,000`, deterministic LP asset ID, pool addresses, LP-reserve address, fee asset and fee output policy.
- Maintain three protected positions: asset-0 reserve, asset-1 reserve, and undistributed LP reserve.
- Circulating LP supply is fixed LP supply minus the LP-reserve balance; each circulating unit claims a proportional share of both reserves.
- Initial deposits `deposit0` and `deposit1` issue `floor(sqrt(deposit0 * deposit1))` LP units to the creator; the remainder stays in the LP reserve.
- For a swap, increase the input reserve by `amount_in`, decrease the output reserve by `amount_out`, and enforce:
  `(reserve_in * fee_den + amount_in * fee_num) * new_reserve_out >= reserve_in * reserve_out * fee_den`.
- The input-side fee remains in the pool.
- Adding liquidity requires both assets in the current ratio, decreases the LP reserve by the issued amount, and sends those LP units to the depositor.
- Removing `lp_burned` units pays `floor(lp_burned * reserve0 / total_supply)` and `floor(lp_burned * reserve1 / total_supply)`; reserves and the LP reserve change by those exact amounts.

## C24

I want a post-quantum, hash-based signature verifier. It must accept a message and public key, verify either a stateful or stateless signature path, and accept only when the reconstructed hash-tree root matches the public key.

- Parameters: message, public key root, signature, signature mode, and the state or recovery data required by that mode.
- Verify the selected one-time signature path.
- Verify the Winternitz one-time signature and the surrounding hash-tree authentication paths.
- Reconstruct the expected root and compare it byte-for-byte with the public key root.
- Published parameter set: `n=16`, `w=4`, `l=64`, `S_wn=140`, `h_sf=207`, `h_sl=24`, `d=2`, `k=6`, `a=22`, `R_SIZE=32`.
- Stateful mode tracks one-time-key position; stateless mode carries the recovery material needed to verify without trusted signer state.
