# Timelocks

Timelocks are a scripting feature of Bitcoin and inherited by [Elements](../glossary.md#elements). Timelocks can be used in Simplicity and SimplicityHL to enforce a rule that a [transaction](../glossary.md#transaction) may only happen after a specified amount of time has passed.

This is useful for *timeout* logic. Contracts will often have a timeout branch as a fallback mechanism. This timeout branch can allow parties to receive a refund of their assets if the [contract](../glossary.md#contract) is not successfully completed. For example, an atomic swap contract has a timeout where the initiator can be refunded if the other party doesn't complete the swap in a specified period of time.

A [vault contract](../glossary.md#vault) can also use timelocks to require a series of transactions, with a specific time delay between them, in order to achieve a withdrawal.

## Timelock measurement units

Timelocks can be expressed in various ways. An *absolute* timelock gives an absolute time after which a transaction may occur ("starting next Monday"), while a *relative* timelock specifies how much later a transaction may occur after a prior transaction ("at least one week after this input was confirmed").

Time can be expressed in terms of *blocks* on the blockchain. A blockchain consists of an ever-growing series of blocks, which can be counted to obtain an ever-increasing timescale. In Simplicity, an absolute timelock measured in blocks is [called](../../simplicityhl-reference/type_alias/) a `Height`, while a relative timelock measured in blocks is called a `Distance`.

!!! note "Block creation intervals"
    **[Liquid Network](../glossary.md#liquid) blocks are created once per minute.** This is different from Bitcoin, where a block is created (on average) once every ten minutes.

    For example, [Liquid block 3800000](https://liquid.network/block/59d271b0df9808eb59e686be30bf0e3c3faf121a72dbd751e90df7bcaed90533) was created at 12:08:10 UTC on March 16, 2026.

Time can also be expressed in terms of *real time*. In Simplicity, an absolute timelock measured in real time is called a `Time`, while a relative timelock measured in real time is called a `Duration`.

!!! note "Absolute time scale"
    In both Bitcoin and Liquid, **the *real time* scale for absolute timelock measurement is [*Unix time*](https://en.wikipedia.org/wiki/Unix_time)** (seconds since January 1, 1970).

    For example, `Time` 1234567890 occurred on February 13, 2009, while `Time` 1800000000 will occur on January 15, 2027.

!!! note "Relative time scale"
    In both Bitcoin and Liquid, **the units of *real time* for relative timelock measurement are *intervals of 512 seconds***.

    Note that the unit of `Duration` is 512 seconds, while the increment of `Time` is 1 second.

    For example, one day of real time is slightly less than 169 units of `Duration`.

### Summary

| Item | Absolute/Relative | Type name | Unit/scale |
| ----| --- | --- | --- |
| Blocks<br>*(specified block height)* | Absolute | `Height` | Blockchain blocks |
| Blocks<br>*(block count interval)* | Relative | `Distance` | Blockchain blocks |
| Real time<br>*(specified time)* | Absolute | `Time` | Unix timestamp (seconds since 1970) |
| Real time<br>*(interval)* | Relative | `Duration` | Units of 512 seconds |

You can pick any of these forms of timelock to use in any context in a Simplicity contract. Do not enforce more than one simultaneously, as it may be impossible to verify more than one form of timelock within a single transaction.

## Timelock enforcement mechanisms

When a [UTXO](../glossary.md#utxo) enforces a timelock, any transaction that attempts to spend resources from that UTXO must *assert* its compliance with the timelock. This is done by setting the `sequence` or `locktime` fields inside the transaction.

The timelock enforcement is a two-step process.

(1) The timelock-related [jets](../glossary.md#jet) in Simplicity can read the fields from the transaction and determine whether they obey the applicable timelock requirements.

(2) The blockchain consensus rules (applied by [nodes](../glossary.md#node) verifying transactions) will reject a transaction that asserts `sequence` or `locktime` fields that are still in the future compared to the current block.

Thus, Simplicity logic checks "is my timelock rule satisfied by this transaction's `sequence` or `locktime`?"; blockchain consensus checks "according to its `sequence` or `locktime`, is this transaction acceptable to include in the blockchain yet?".

??? "Detailed example"
    Consider a SimplicityHL contract that, at some point, enforces a minimum relative `Distance` of 100 blocks. (A concrete version of the required code appears further below.)

    If you want to build a transaction claiming assets from this contract, you will need to set the `sequence` field on each input to at least 100. Suppose there is only one input to your transaction. Then...

    * If you don't set `sequence` at all, it will be assumed to be 0, and the timelock enforcement code further below will fail.

    * If you set `sequence` to 50, the timelock enforcement code will fail because the `sequence` value is smaller than required.

    * If you set `sequence` to 150, the timelock condition *succeeds*. However, if you *submit* this transaction to the Liquid Network blockchain less than 150 minutes after the input transaction, the [node](../glossary.md#node) to which you submitted it will reject it with a `non-BIP68-final` (meaning that it's still too early for the proposed transaction to be valid).

    * If you set `sequence` to 150 and submit the transaction at least 150 blocks after the input transaction, the transaction should be valid and accepted on the blockchain (at least as far as the timelock condition is concerned!).

!!! note
    Note that the timelock jets can't "look up" the real time in the outside world. Rather, they can look up *minimum* times that the transaction creator claimed the transaction would be submitted.

    In lower-level libraries and documentation, these fields are also called `nSequence` and `nLockTime`.

## Absolute timelock in SimplicityHL

Enforcing an absolute timelock in SimplicityHL uses the jets `check_lock_height` (for absolute block height) or `check_lock_time` (for absolute Unix time).

`jet::check_lock_height(min_height: Height)`: Assert that the transaction's locktime is a block height greater than or equal to the provided value. Such a transaction cannot be included on the blockchain prior to that block height.

`jet::check_lock_time(min_time: Time)`: Assert that the transaction's locktime is a Unix timestamp strictly greater than or equal to the provided value. Such a transaction cannot be included on the blockchain prior to that timestamp.

## Relative timelock in SimplicityHL

A relative timelock is calculated based on the time when a particular UTXO was included in a block.

The Simplicity jets that directly enforce relative timelocks have been deprecated due to an implementation error. However, a workaround is available.

This function enforces a relative distance timelock by calling a combination of related jets.

```rust
fn enforce_relative_distance(min_distance: Distance) {
    // Assert that the current input is spent in a transaction that can
    // only appear a distance of at least min_distance blocks after the input's
    // UTXO. Panic otherwise.

    // Transaction version must be at least 2.
    assert!(jet::le_32(2, jet::version()));

    // Fetch and parse sequence for current transaction
    let parsed_seq: Option<Either<Distance, Duration>> = jet::parse_sequence(jet::current_sequence());

    match parsed_seq {
        // Failure condition
        None => assert!(false),
        // This is either a distance or a duration, but only a distance is
        // acceptable here.
        Some(actual_data: Either<Distance, Duration>) => match actual_data {
            // Is the actual distance greater than or equal to the specified min_distance?
            Left(actual_distance: Distance) => assert!(jet::le_16(min_distance, actual_distance)),
            // A duration is not acceptable in this context.
            Right(actual_duration: Duration) => assert!(false),
        },
    }
}
```

And this is the equivalent function to enforce a relative duration timelock.

```rust
fn enforce_relative_duration(min_duration: Duration) {
    // Assert that the current input is spent in a transaction that can only
    // appear a duration of at least min_duration units of 512 seconds after
    // the input's UTXO. Panic otherwise.

    // Transaction version must be at least 2.
    assert!(jet::le_32(2, jet::version()));

    // Fetch and parse sequence for current transaction
    let parsed_seq: Option<Either<Distance, Duration>> = jet::parse_sequence(jet::current_sequence());

    match parsed_seq {
        // Failure condition
        None => assert!(false),
        // This is either a distance or a duration, but only a duration is
        // acceptable here.
        Some(actual_data: Either<Distance, Duration>) => match actual_data {
            // A distance is not acceptable in this context.
            Left(actual_distance: Distance) => assert!(false),
            // Is the actual duration greater than or equal to the specified min_duration?
            Right(actual_duration: Duration) => assert!(jet::le_16(min_duration, actual_duration)),
        },
    }
}
```

For real-time-based timelocks, Bitcoin and Elements use a rule called [Median Time Past](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki) when determining the effective current time. This rule induces an extra delay (six minutes for Liquid Network, or about one hour for Bitcoin) for the validity of a transaction that using a real-time-based timelock.

## Creating appropriate transactions

Transactions that consume UTXOs with timelock conditions must be constructed appropriately to assert the appropriate timelock. The necessary properties can be set as follows:

| Kind | Type name | Transaction property |
| ---- | --- | --- |
| Absolute blocks | `Height` | `nSequence = 0xfffffffe`<br>`nLockTime < 500000000`<br> `nLockTime` equal to desired `Height` |
| Absolute time | `Time` | `nSequence = 0xfffffffe`<br>`nLockTime >= 500000000`<br>`nLockTime` equal to desired `Time` (Unix timestamp) |
| Relative blocks | `Distance` | `nSequence < 0x10000`<br>`nSequence` equal to desired `Distance` (`0` ... `0xffff`) |
| Relative time | `Duration` | `nSequence = 0x00400000` + desired `Duration` (`0` ... `0xffff`) |

!!! note "More details"
    The values in the table above are simple heuristics for common timelock assertions and do not include all scenarios and options.

    For more details on timelock implementation and semantics, please see the Bitcoin timelock specifications in [BIP-65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki), [BIP-68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki), and [BIP-112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki).

    As noted above, transaction-building tools and APIs may simply refer to the fields as `sequence` and `locktime`.

## No maximum time constraints

In some smart contracts, one might be tempted to use timelock jets to require a transaction to happen *before* a certain time rather than *after*. However, this is not supported. **Architecturally, timelocks in Simplicity contracts can only be usefully used to enforce minimum times, not maximum times, when transactions can occur.**

Because of the *monotonicity* property of Bitcoin and related blockchain systems, there is no way to directly express a requirement that a transaction occur *before* a certain block height and not after. These systems enforce a rule that a specific transaction that was valid at some point remains valid at all times in the future. Although you can write SimplicityHL code that asserts that a lock distance is *smaller than* rather than *larger than* a specific numerical value, the person creating the transaction can simply assert a small `sequence` value which will be accepted as valid by the blockchain consensus.

For example, if a contract was funded with a specific input at block height 5000, and the contract asserts that the relative `Distance` when spending that input should be *less than* 100, a transaction spending that input while asserting `sequence` equal to 50 will still be valid when committed at block height 10000, as the criteria 50<10000-5000 (required by the nodes enforcing blockchain consensus rules in the transaction sequence) and 50<100 (for the contract's own logic) are both true. Asserting the lock distance is small requires the use of a correspondingly small `sequence` value, but this does *not* imply that the resulting transaction is necessarily committed to the blockchain within a short time after the inputs it consumes.

### A workaround: state updates and preemption

Because permitted transactions cannot automatically expire or become forbidden, Simplicity requires a different approach to enforce deadlines. Instead, you can achieve an *effective* maximum time for an action using a preemption pattern.

The core logic is simple: you can make it impossible to perform an action by removing the assets or state that it relies upon. This requires some party to proactively submit a transaction that performs the preempting action after some time limit has passed. It does not happen automatically.

A simple example is a timeout-and-refund mechanism. A contract can provide that, after a certain time period, assets may be transferred back to their original senders. Once a sender proactively claims such a refund, no further actions can be taken with the associated assets because the contract no longer holds them.

In general, a preempting transaction transfers the assets elsewhere, or it updates the [covenant's](../glossary.md#covenant) [state](../state.md) to a new version that restricts previously allowed actions. A covenant can be written to permit an authorized party to perform a state update at a certain time which causes previously permitted actions to be forbidden. For example, an authorized update could perform an internal state change to declare a contract "closed" to new claims after a deadline.

An effective deadline is enforced provided that a party is incentivized to perform the required transfer or update action.
