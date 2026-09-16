# High-level specifications for the use-case examples

This document translates the examples linked from the [Use Cases Overview](https://docs.simplicity-lang.org/use-cases/) into language-neutral behavioral specifications. It describes what each example must accept, reject, and produce. It intentionally omits source syntax, compiler structure, and implementation techniques.

`Asset`, `signature`, `public key`, `hash`, `height`, and `time` mean the corresponding blockchain or cryptographic values. A transaction is valid only when every stated condition holds.

## 1. Blockstream reference implementations

### 1.1 Options marketplace and options contract

Sources: [DEX overview](https://docs.simplicity-lang.org/use-cases/simplicity-dex/), [options contract](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/simf/options.simf), [option-offer contract](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/simf/option_offer.simf).

#### Options contract parameters

- `start_time`: earliest time at which exercise or settlement is allowed.
- `expiry_time`: time after which the expiry path is allowed.
- `collateral_asset`: asset locked by the option writer.
- `settlement_asset`: asset paid by the option holder to exercise.
- `collateral_per_contract`: collateral backing one option token.
- `settlement_per_contract`: settlement asset required for one exercised option.
- `option_asset`: token proving the right to exercise.
- `grantor_asset`: token proving the right to claim the collateral or deposited settlement asset.
- Reissuance-token identifiers for the option and grantor assets.

The ratios must be exact: for `n` contracts, collateral is `n × collateral_per_contract` and settlement is `n × settlement_per_contract`.

#### Funding

The creator supplies equal quantities of the option and grantor reissuance tokens and creates the option covenant. The transaction must:

- keep both reissuance-token positions under the same covenant control;
- lock the exact collateral amount;
- create equal quantities of option and grantor tokens;
- preserve the covenant for the collateral and token positions;
- carry the exact settlement amount expected for the created contract count.

#### Cancellation

Before the option has been exercised or settled, a holder of equal quantities of option and grantor tokens may cancel that portion. The transaction must:

- burn equal quantities of both tokens;
- return the corresponding collateral amount;
- preserve any remaining collateral under the same covenant;
- support either a full cancellation or a partial cancellation with change.

#### Exercise

At or after `start_time`, the option-token holder may exercise `n` contracts. The transaction must:

- burn exactly `n` option tokens;
- pay exactly `n × settlement_per_contract` of the settlement asset into the covenant;
- release exactly `n × collateral_per_contract` of collateral to the exercising party;
- preserve any unused collateral under the same covenant;
- preserve the settlement asset under the covenant so the grantor-token holder can claim it.

#### Settlement

At or after `start_time`, the grantor-token holder may claim settlement asset deposited by exercise. The transaction must:

- burn grantor tokens in the quantity being claimed;
- pay exactly `n × settlement_per_contract` of settlement asset for `n` grantor tokens;
- preserve any remaining settlement asset under the same covenant.

#### Expiry

At or after `expiry_time`, the grantor-token holder may claim the collateral for unexercised contracts. The transaction must:

- burn the grantor tokens being settled;
- pay exactly `n × collateral_per_contract` of collateral;
- preserve any remaining collateral under the same covenant.

The implementation allows exercise from `start_time` onward; it does not require exercise to wait until `expiry_time`.

#### Current DEX configuration

The published DEX uses USDt as collateral, LBTC as settlement asset, sells the grantor token, and keeps the option token with the maker. A maker deposits collateral, receives one option token and one grantor token per contract, sells the grantor token plus a premium to a taker for LBTC, and keeps the option token. If the maker exercises, the maker receives USDt and the taker later receives LBTC. If the maker does not exercise by expiry, the taker receives USDt.

The example uses a 115,000 USDt collateral amount, a 115,000 USD LBTC strike, and a 30-day term. These are demonstration values, not universal constants.

#### Option-offer contract

Parameters:

- `collateral_asset`;
- `premium_asset`;
- `settlement_asset`;
- `collateral_per_contract`: settlement amount required per unit of collateral;
- `premium_per_collateral`: premium paid per unit of collateral;
- `expiry_time`;
- `user_public_key` controlling withdrawals and expiry recovery.

The offer contract holds collateral and premium together.

- **Counterparty swap:** a counterparty pays settlement asset at the exact collateral ratio and receives the corresponding collateral plus premium. Partial swaps are allowed; unused collateral and premium remain in the covenant, and the received settlement asset is added to it.
- **User withdrawal:** the user signs a transaction that withdraws the entire accumulated settlement-asset balance to any destination.
- **Expiry recovery:** at or after `expiry_time`, the user signs a transaction that withdraws all remaining collateral and premium.

#### Four position configurations

The same option contract can express four positions:

| Collateral | Token sold by maker | Maker position | Taker position |
|---|---|---|---|
| USDt | Grantor | Long call | Short call |
| USDt | Option | Short call | Long call |
| LBTC | Grantor | Long put | Short put |
| LBTC | Option | Short put | Long put |

Collateral type determines whether the contract is call-like or put-like; the token sold determines which party retains the exercise right.

### 1.2 P2P lending protocol

Source: [Lending Protocol](https://docs.simplicity-lang.org/use-cases/lending-protocol/).

#### Common parameters

- `borrower` and `lender` identities;
- collateral asset `A` and loan asset `B`;
- `collateral_amount` in `A`;
- `loan_amount` in `B`;
- `lending_term`;
- fixed `loan_fee` in `B`, or an annual `interest_rate` in the interest-rate variant;
- fixed `origination_fee` in `A`;
- `protocol_fee` / reserve factor, taken from the lender compensation and paid to the protocol address;
- borrower, lender, protocol, and liquidation destinations.

#### Simplified fixed-fee contract

1. The borrower publishes an offer by locking collateral and the origination fee and committing to the loan amount, collateral amount, term, loan fee, and protocol fee.
2. Any lender may accept by supplying the exact loan amount in asset `B`. The borrower receives the principal and the lender receives the origination fee.
3. Before the term, the borrower may repay principal plus the fixed loan fee. The protocol receives its configured share; the lender receives the remainder; the borrower receives all collateral back.
4. If the loan is not fully repaid by the term, the lender may claim all collateral.
5. A borrower may cancel an unaccepted offer and recover the locked collateral.

#### Price-aware contract with partial repayment

Add:

- `price_oracle`: signed price of collateral asset `A` in loan asset `B`;
- `LLTV`: maximum loan-to-value ratio;
- `liquidation_protocol_fee`: percentage of collateral retained by the protocol when a third party liquidates;
- `liquidation_penalty`: fixed collateral amount used by the partial-liquidation invariant;
- third-party liquidator identity.

Origination requires:

`loan_amount < LLTV × collateral_amount × oracle_price`.

During the term, the borrower may repay part of the principal. A third-party liquidator may liquidate before or after the term when:

`outstanding_loan > LLTV × collateral_amount × oracle_price`.

The liquidator fully repays the outstanding loan, receives the collateral less the liquidation protocol fee, and the protocol receives that fee.

After the term, the lender may still take the full collateral on default. The partial-liquidation alternative may instead be initiated by the lender or borrower and pays the lender the collateral value of the outstanding principal plus the fixed penalty; the borrower receives:

`collateral_amount − outstanding_loan / oracle_price − liquidation_penalty`.

The liquidation penalty is itself subject to the protocol fee.

#### Integrated-interest variant

Replace the fixed loan fee with a fixed annual percentage rate. The borrower repays principal plus interest accrued under that rate. The LLTV liquidation test becomes:

`outstanding_loan + accrued_interest > LLTV × collateral_amount × oracle_price`.

All other origination, repayment, third-party liquidation, full-default liquidation, partial-liquidation, and fee rules remain the same.

#### First implementation and discovery

The first implementation specializes the protocol to fixed-term USDT loans collateralized by LBTC. Borrower and lender positions are represented by transferable one-time assets. The state sequence is:

`offer with collateral → lender funds principal → active loan → repayment and collateral return`,

or:

`offer with collateral → term expires → lender liquidation`.

An indexer discovers offers by identifying the published transaction shape, decoding the encoded lending parameters, independently reconstructing the expected covenant, and accepting the offer only when the reconstructed identity matches the locked output. It then tracks each resulting output through active, repaid, cancelled, and liquidated states.

### 1.3 SHRINCS post-quantum signature verifier

Sources: [verifier repository](https://github.com/BlockstreamResearch/shrincs-simplicity-verifier), [deployment description](https://blog.blockstream.com/blockstream-research-demonstrates-quantum-resistant-transaction-signing-on-liquid-using-simplicity-smart-contracts/).

The spending condition is a post-quantum, hash-based signature check for a message. The contract accepts a message, a public key, and either a normal stateful signature or a stateless recovery signature. It validates the selected signature path, reconstructs the expected commitment-tree root, and accepts only when that root equals the public-key root.

The published parameter set is:

`n=16`, `w=4`, `l=64`, `S_wn=140`, `h_sf=207`, `h_sl=24`, `d=2`, `k=6`, `a=22`, `R_SIZE=32`.

The verifier includes Lamport one-time signatures, Winternitz one-time signatures, and a two-layer hash-tree construction. Stateful mode uses a tracked one-time-key position and compact signatures. Stateless mode carries the recovery material needed to verify without trusted signer state. The published repository also contains standalone Lamport and SHRINCS examples.

This is a verifier specification, not a complete cryptographic standard: exact domain-separation encodings, tree-address rules, and signature serialization must be taken from the referenced verifier specification or source before implementing a compatible signer.

## 2. Projects built by others

### 2.1 Astrolabe

Source: [Astrolabe demo](https://docs.simplicity-lang.org/news/2026/02/20/video-resolvr-astrolabe-demo/).

Astrolabe is an early tokenized risk-investment and reinsurance product. The public page establishes the concept but does not publish the contract parameters, state transitions, payout formulas, underwriting rules, or token lifecycle. A compatible contract cannot be recreated perfectly from the public use-case page alone.

### 2.2 Deadcat binary prediction market

Sources: [Deadcat repository](https://github.com/Resolvr-io/deadcat), [market contract design](https://github.com/Resolvr-io/deadcat/blob/master/src-tauri/crates/deadcat-sdk/simplicityhl-contract-design-doc.md).

#### Market parameters

- `oracle_public_key`;
- collateral asset identifier;
- YES outcome asset identifier;
- NO outcome asset identifier;
- YES reissuance-token identifier;
- NO reissuance-token identifier;
- `collateral_per_token` (CPT);
- `expiry_time` as a block height.

The market identifier is the hash of the YES asset identifier followed by the NO asset identifier. The oracle signs the market identifier plus one byte: `1` for YES or `0` for NO.

#### State and persistent positions

The market has five states:

1. **Dormant:** the YES and NO reissuance tokens exist; no collateral is locked.
2. **Unresolved:** the market is live; reissuance tokens and one collateral position exist.
3. **Resolved YES:** only YES can redeem collateral.
4. **Resolved NO:** only NO can redeem collateral.
5. **Expired:** the oracle was not used; YES and NO have equal expiry claims.

The persistent positions are distinct by role: dormant YES reissuance token, dormant NO reissuance token, unresolved YES reissuance token, unresolved NO reissuance token, unresolved collateral, resolved-YES collateral, resolved-NO collateral, and expired collateral.

#### Creation and issuance

Creation establishes the two reissuance-token positions but creates no YES/NO outcome tokens and locks no collateral.

Initial issuance consumes both dormant reissuance-token positions, mints equal quantities of YES and NO tokens, and locks:

`pairs × 2 × CPT`

of collateral in the unresolved collateral position. Subsequent issuance keeps the market unresolved, adds the same collateral amount for each new pair, consolidates the collateral position, and mints equal YES and NO quantities.

#### Cancellation

While unresolved, a holder may burn equal quantities of YES and NO tokens and recover the corresponding paired collateral:

`pairs × 2 × CPT`.

Partial cancellation keeps the market unresolved. Full cancellation also returns both reissuance-token positions to dormant state.

#### Oracle resolution

While unresolved, the oracle may commit either YES or NO. The transaction must verify the oracle signature over `hash(market_id || outcome_byte)`, burn both reissuance-token positions, and move the entire collateral position into the selected terminal state. No reissuance-token position survives resolution.

#### Expiry

After `expiry_time`, anyone may finalize an unresolved market without an oracle. The transaction burns both reissuance-token positions and moves the entire collateral position into the expired state.

#### Redemption

- In resolved-YES state, each YES token redeemed pays `2 × CPT`; NO tokens have no value.
- In resolved-NO state, each NO token redeemed pays `2 × CPT`; YES tokens have no value.
- In expired state, either YES or NO token redeems at `1 × CPT`.

Every redemption consumes the terminal collateral position and recreates it with the remaining balance until it is empty.

Deadcat also provides an application-level trading layer with YES/NO market orders, limit orders, liquidity pools, Nostr discovery, and wallet integration. Those features are not one single settlement contract and require their separate published designs for exact reconstruction.

### 2.3 Swaption

Source: [Swaption](https://swaption.io/).

Swaption is described as a noncustodial binary-options marketplace. The public use-case page does not publish its complete contract parameters, token accounting, exercise rules, settlement oracle, expiry behavior, or order-matching constraints. Exact recreation is therefore not possible from the linked overview alone.

### 2.4 STARK verifier

Source: [StarkWare description](https://starkware.co/blog/building-starks-in-simplicity/).

The example is an on-chain verifier for an off-chain STARK proof. It accepts public inputs and a proof, checks the proof's hash-based integrity and claimed computation, and permits the transaction only when verification succeeds. The intended applications include rollup state verification, privacy-preserving payments, and other large computations performed off-chain.

The linked article does not define a concrete proof format, field, trace layout, public-input encoding, hash domain separation, or acceptance constants. It is a capability demonstration, not a reconstructable contract specification.

### 2.5 Anchor constant-product AMM

Sources: [Anchor repository](https://github.com/0ceanSlim/anchor), [protocol specification](https://github.com/0ceanSlim/anchor/blob/master/docs/spec.md).

#### Immutable pool parameters

- `asset0` and `asset1`;
- `fee_num` and `fee_den`, compiled into the pool and immutable after creation;
- `LP_PREMINT = 2,000,000,000,000,000` LP units;
- deterministic LP asset identifier derived from the creation input;
- pool addresses and the LP-reserve address;
- transaction-fee asset and fee output policy.

The pool is permissionless and has no administrator, treasury, upgrade path, or off-chain coordinator.

#### Persistent state

Three covenant-controlled positions always represent the pool:

1. `Pool A` holds the reserve of asset 0.
2. `Pool B` holds the reserve of asset 1.
3. `LP reserve` holds undistributed LP units.

The circulating LP supply is derived as:

`LP_PREMINT − current LP-reserve balance`.

Each LP unit represents a proportional claim on both reserves.

#### Pool creation

The creator supplies initial amounts `deposit0` and `deposit1`. The pool issues the full fixed LP supply and gives the creator:

`floor(sqrt(deposit0 × deposit1))`

LP units. The remainder stays in the LP reserve. Creation must place the two deposits in the two pool positions, place the LP remainder in the LP reserve, and verify the square-root floor exactly.

#### Swap

A swap consumes both pool positions and a user input.

For asset 0 input:

- the asset-0 reserve increases by `amount_in`;
- the asset-1 reserve decreases by `amount_out`;
- the user receives asset 1.

For asset 1 input, the direction is reversed. The output is bounded by the fee-adjusted constant-product rule:

`(reserve_in × fee_den + amount_in × fee_num) × new_reserve_out ≥ reserve_in × reserve_out × fee_den`.

The input-side fee remains in the pool and increases LP value. A user-side minimum-output/slippage check may reject the transaction before construction; the covenant enforces the reserve invariant.

#### Add liquidity

The user supplies both assets in the pool's current ratio. The transaction must:

- increase both reserves by the deposits;
- decrease the LP reserve by the newly issued LP amount;
- send the new LP amount to the depositor;
- preserve the pool positions;
- enforce proportional deposits and the floor/ceiling bounds for LP issuance.

When the circulating supply is zero, the pool accepts any positive two-asset deposit and prices new LP units by the square-root rule.

#### Remove liquidity

The user returns `lp_burned` LP units. The transaction must pay:

- `floor(lp_burned × reserve0 / total_supply)` of asset 0;
- `floor(lp_burned × reserve1 / total_supply)` of asset 1;

with the contract's one-unit floor/ceiling checks ensuring the integer result is exact. The pool reserves decrease by those payouts, the LP reserve increases by `lp_burned`, and any unreturned LP change goes back to the user.

## 3. Introductory SimplicityHL examples

The linked [examples directory](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples) contains both transaction predicates and small language-independent computation examples. The following descriptions cover every standalone example in that directory. Dependency files and flattened build outputs are represented by the corresponding conceptual example, not repeated.

### Basic spending conditions

#### Pay to public key

Parameters: one public key. A spend is valid only when a signature by that key verifies against the complete transaction signature digest.

The checked example parameter is:

`79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798`.

#### Pay to public-key hash

Parameters: one expected public-key hash. A spender supplies a public key and signature; the public key is hashed, must equal the expected hash, and must verify the transaction digest.

Expected hash:

`132f39a98c31baaddba6525f5d43f2954472097fa15265f45130bfdb70e51def`.

#### Two-of-three multisignature

Parameters: three public keys and threshold 2. The spend supplies zero or one signature for each key. Every supplied signature must verify, and exactly two signatures must be present.

The example keys are:

1. `79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798`
2. `c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5`
3. `f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9`

### Timelocked custody and payment examples

#### Transfer with timeout

Parameters: sender key 1, recipient key 2, absolute height 1000.

- Before the timeout, both sender and recipient signatures are required.
- At or after height 1000, the sender signature alone is sufficient.

#### Escrow with delay

Parameters: sender key 1, recipient key 2, escrow key 3, relative delay 1000 blocks.

- Immediate cooperative spend: exactly two of the three signatures, with every supplied signature valid.
- Refund spend: sender key 1 alone after the relative delay.

The escrow key can cooperate with either party but cannot spend alone.

#### Hash-time-locked transfer

Parameters: recipient key 1, sender key 2, absolute height 1000, and expected preimage hash:

`66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925`.

- Completion: supply a 32-byte preimage whose SHA-256 hash equals the expected hash and a valid recipient signature.
- Cancellation: at or after height 1000, supply a valid sender signature.

#### Presigned vault

Parameters: hot key 1, cold key 2, relative delay 1000 blocks.

- After the delay, the hot key may withdraw.
- At any time, the cold key may cancel and sweep the funds.

The intended use is a pre-signed unvaulting transaction followed by a delayed hot-key withdrawal, with a cold-key escape path.

#### Oracle-gated HODL vault

Parameters: minimum block height 1000, target price 100,000, oracle key 1, owner key 2.

The spend must provide:

- an oracle height at least 1000;
- a transaction lock height equal to the oracle height;
- an oracle price at least 100,000;
- an oracle signature over the ordered pair `(oracle_height, oracle_price)`;
- an owner signature over the transaction.

Both the oracle threshold and the time condition must pass.

#### Last-will vault

Parameters: inheritor key 1, cold key 2, hot key 3, relative delay 25,920 blocks.

- After the delay, the inheritor may spend with key 1.
- At any time, the cold key may spend.
- The hot key may refresh the owner-controlled covenant, but the first output must reproduce the same covenant and the transaction must contain exactly two outputs, with the second output being the fee output.

### Hash and transaction-commitment examples

#### Reveal a hash collision

Supply two distinct 32-byte values whose SHA-256 hashes are equal. The contract accepts only when both distinctness and hash equality hold. No known practical witness is provided.

#### Reveal a hash fixed point

Supply a 32-byte value whose SHA-256 hash equals the value itself. No known practical witness is provided.

#### CTV-style transaction commitment

The contract computes a commitment from, in order: transaction version, lock time, all input script-signature hashes, input count, all input sequence hashes, output count, all output hashes, and the current input index. It accepts only when the resulting digest equals:

`ae3d019b30529c6044d2b3d7ee2e0ee5db51a7f05ed5db8f089cd5d455f1fc5d`.

This commits the selected transaction structure while requiring the caller to provide the individual committed components rather than a precomputed template identifier.

#### Non-interactive fee bumping

Parameters: signer key
`9bef8d556d80e43ae7e0becb3a7e6838b95defe45896ed6075bb9035d06c9964`, broadcast baseline time `1734967235`, and baseline fee `1000` units of the fee asset.

The signature commits to the network domain, transaction version, all inputs, the first output, all output script destinations, all input UTXOs, the taproot environment, and the current input index. It deliberately does not commit to transaction lock time or output amounts for change/fee outputs.

The transaction lock time must not precede the baseline time, and total fees must be strictly less than:

`1000 + (current_lock_time − 1734967235)`.

This lets a third party delay the transaction and increase the fee by reducing change without obtaining a new signature.

#### SIGHASH_ALL | ANYONECANPAY

The fixed key 1 signs a digest containing the network domain, transaction version, lock time, taproot environment, the current input's identity and UTXO, every output, every issuance, and every output-surjection-proof commitment. Other input identities are not committed, and the current input index is not included.

#### SIGHASH_ALL | ANYPREVOUT

The fixed key 1 signs a digest containing the network domain, transaction version, lock time, taproot environment, the current input sequence, the current annex, the current input UTXO, every output, every issuance, and every output-surjection-proof commitment. The current input outpoint is omitted, other input identities are omitted, and the current input index is omitted.

#### SIGHASH_ALL | ANYPREVOUTANYSCRIPT

The fixed key 1 signs a digest containing the network domain, transaction version, lock time, taproot environment, the current input sequence, the current annex, every output, every issuance, and every output-surjection-proof commitment. The current input outpoint, amount, asset, script, other input identities, and current input index are omitted.

#### SIGHASH_NONE

The fixed key 1 signs a digest containing the network domain, transaction version, lock time, taproot environment, all input identities, all input UTXOs, and the current input index. No output commitment is included.

#### SIGHASH_SINGLE

The fixed key 1 signs a digest containing the network domain, transaction version, lock time, taproot environment, all input identities, all input UTXOs, the output at the current input index, and the current input index. Other outputs are not committed.

### Small computation and data-shape examples

#### Array fold

The contract folds a seven-element array `[1,2,3,4,5,6,7]` from initial accumulator `0` using addition and requires the result to be `28`.

#### Power-of-two array fold

The regression example folds eight ones from initial accumulator `0` using addition and requires the result to be `8`.

#### Byte concatenation

The example verifies two packing operations:

- `(0x10, 0x01)` becomes `0x1001`;
- the two four-bit values `1011` and `1101` become the byte `10111101`.

#### Pattern matching

The input is the tagged value `Left((32, 3, (0, 1)))`. The contract requires the second field to be `3`, the nested fields to be `0` and `1`, and returns the first field, which must equal `32`. The alternate tag returns `0`.

#### Streaming hash loop

The active case hashes every byte from `0x00` through `0xff` in order and requires:

`40aff2e9d2d8922e47afd4648e6967497158785fbd1da870e7110266bf944880`.

The source also contains a disabled variant that hashes every 16-bit value from `0x0000` through `0xffff` and expects:

`281f79f89f0121c31db2bea5d7151db246349b25f5901c114505c18bfaa50ba1`.

#### Modules

Parameters: `base_price=15`, `tax=5`. The result is `2 × base_price + tax`, and must equal `35`.

#### Local dependency example

Adds two supplied unsigned integers. The checked case is `2 + 2 = 4`.

#### Single dependency example

Uses imported constants `2` and `5`, adds them, and requires `7`. The example also demonstrates that the shared value type is an unsigned 32-bit integer.

#### Multiple dependency example

For inputs `previous=5`, `transaction_1=10`, and `transaction_2=20`, computes:

`previous XOR (transaction_1 XOR transaction_2)`

and requires `27`. It also computes `15 AND 22` and requires `6`.

#### Multiple dependency with hashing

Adds `2 + 3`, then hashes the resulting value with SHA-256. The hash is produced as an output of the computation; no fixed expected digest is asserted.

## 4. Ideas listed on the overview but not complete examples

The overview also lists cross-chain atomic swaps, crowdfunding, Bitcoin-native contracts through Simplicity Unchained, and multi-stage vault withdrawals. These are roadmap/use-case ideas rather than published example contracts on that page. They do not have enough parameters or transition rules there to support exact reconstruction.

## Sources and scope

- [Use Cases Overview](https://docs.simplicity-lang.org/use-cases/)
- [SimplicityHL examples](https://github.com/BlockstreamResearch/SimplicityHL/tree/master/examples)
- [Simplicity contracts workspace](https://github.com/BlockstreamResearch/simplicity-contracts)
- [SHRINCS verifier](https://github.com/BlockstreamResearch/shrincs-simplicity-verifier)
- [Deadcat](https://github.com/Resolvr-io/deadcat)
- [Anchor](https://github.com/0ceanSlim/anchor)

