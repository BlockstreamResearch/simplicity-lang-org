# Timelocks

Timelocks are a basic feature of Bitcoin and [Elements](../glossary.md#elements). You can use timelocks in Simplicity and SimplicityHL to enforce a rule that a [transaction](../glossary.md#transaction) may only happen after a certain amount of time has passed.

This is useful for *timeout* logic. It's often useful to have a timeout branch in a contract to represent a time after which the contract is no longer relevant or will no longer be resolved in some other way. This timeout branch can allow parties to receive a refund of their assets, so that assets don't get permanently stuck in the contract. For example, a swap contract can have a timeout where the underlying asset can be refunded to the sender if the other party doesn't claim it within a period of time.

A [vault contract](../glossary.md#vault) can also use timelocks to require a series of transactions, with a specific time delay between them, in order to achieve a withdrawal.

## Timelock measurement scales

Timelocks can be expressed in various ways. An *absolute* timelock gives an absolute time when a transaction may occur ("starting next Monday"), while a *relative* timelock says how much later one transaction may occur in comparison to a prior transaction ("at least one week later than this input").

Time can be expressed in terms of *blocks* on the blockchain. A blockchain consists of an ever-growing series of blocks, which can be counted to obtain an ever-increasing timescale. In Simplicity, an absolute timelock measured in blocks is [called](../../simplicityhl-reference/type_alias/) a `Height`, while a relative timelock measured in blocks is called a `Distance`.

!!! note "Block creation intervals"
    **[Liquid Network](../glossary.md#liquid) blocks are created once per minute.** This is different from Bitcoin, where a block is created (on average) once every ten minutes.

    For example, [Liquid block 3800000](https://liquid.network/block/59d271b0df9808eb59e686be30bf0e3c3faf121a72dbd751e90df7bcaed90533) was created at 12:08:10 UTC on March 16, 2026.

Time can also be expressed in terms of *real time*. In Simplicity, an absolute timelock measured in real time is called a `Time`, while a relative timelock measured in blocks is called a `Duration`.

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

## Timelock enforcement mechanisms

When a UTXO enforces a timelock, any transaction that attempts to spend resources from that UTXO must *assert* its compliance with the timelock. This is done by setting the `sequence` or `locktime` fields inside the transaction.

The timelock enforcement is a two-step process.

(1) The timelock-related [jets](../glossary.md#jet) in Simplicity can read the fields from the transaction and determine whether they obey the applicable timelock requirements.

(2) The blockchain consensus rules (applied by [nodes](../glossary.md#node) verifying transactions) will reject a transaction that asserts `sequence` or `locktime` fields that are still in the future compared to the current block.

Thus, Simplicity logic checks "is my timelock rule satisfied by this transaction's `sequence` or `locktime`?"; blockchain consensus checks "according to its `sequence` or `locktime`, is this transaction acceptable to include in the blockchain yet?".

??? "Detailed example"
    Consider a SimplicityHL contract that, at some point, enforces a minimum relative distance of 100.  (A concrete version of the required code appears further below.)

    If you want to build a transaction claiming assets from this contract, you will need to set `sequence` on each input to at least 100. Suppose there is only one input to your transaction. Then...

    * If you don't set `sequence` at all, it will be assumed to be 0, and the timelock enforcement code further below will fail.

    * If you set `sequence` to 50, the timelock enforcement code will fail because the `sequence` value is smaller than required.

    * If you set `sequence` to 150, the timelock condition *succeeds*. However, if you *submit* this transaction to the Liquid Network blockchain less than 150 minutes after the input transaction, the <glossary:node> to which you submitted it will reject it with a `non-BIP68-final` (meaning that it's still too early for the proposed transaction to be valid).

    * If you set `sequence` to 150 and submit the transaction at least 150 minutes after the input transaction, the transaction should be valid and accepted on the blockchain (at least as far as the timelock condition is concerned!).

!!! note
    Note that the timelock jets can't "look up" the real time in the outside world. Rather, they can look up *minimum* times that the transaction creator claimed the transaction would be submitted.

    In lower-level libraries and documentation, these fields are also called `nSequence` and `nLockTime`.

## Absolute timelock in SimplicityHL

Enforcing an absolute timelock in SimplicityHL uses the jets `check_lock_height` (for absolute block height) or `check_lock_time` (for absolute Unix time).

`check_lock_height(Height)`: Assert that the transaction's locktime is a block height strictly greater than or equal to the provided value. Such a transaction cannot be included on the blockchain prior to that block height.

`check_lock_time(Time)`: Assert that the transaction's locktime is a Unix timestamp strictly greater than or equal to the provided value. Such a transaction cannot be included on the blockchain prior to that timestamp.

## Relative timelock in SimplicityHL

A relative timelock is calculated based on the time when a particular UTXO was included in a block.

The Simplicity jets that directly enforce relative timelocks have been deprecated due to an implementation error. However, a workaround is available.

This function enforces a relative distance timelock by calling a combination of related jets.

```rust
fn enforce_relative_distance(min_distance: Distance) {
    // Assert that the current input is spent in a transaction that can
    // only appear a distance of at least d blocks after the input's
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
        // This is either a distance or a duration, but only a distance is
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

<!--
These are hal-simplicity commands that implement the example in the note above. As hal-simplicity is not so widely used for building transactions, these examples may confuse users more than enlighten them.
It would be great to make a kind of sandbox for experimenting with timelock behavior.

Now consider several different transactions created with different parameter values.  (You may need to scroll to the right to see the entire command line in each `hal-simplicity` command below.) For each example, the associated comment indicates whether the transaction will succeed or fail, and why.

```
hal-simplicity simplicity pset create '[ { "txid": "'"$INPUT_TX"'", "vout": 0 } ]' '[ { "'"$OUTPUT_ADDR"'": 0.00099900 }, { "fee": 0.00000100 } ]'
# [...]
# This transaction ultimately fails because sequence is assumed to be 0
# when not explicitly specified. The check_lock_distance jet will always
# fail as a result.

hal-simplicity simplicity pset create '[ { "txid": "'"$INPUT_TX"'", "vout": 0, "sequence": 50 } ]' '[ { "'"$OUTPUT_ADDR"'": 0.00099900 }, { "fee": 0.00000100 } ]'
# [...]
# By its sequence value, this transaction would be valid for mempool submission
# once 50 blocks have been confirmed following the input transaction. However,
# the sequence value 50 is less than 100, so the check_lock_distance jet will
# again always fail because the asserted sequence value is too low.

hal-simplicity simplicity pset create '[ { "txid": "'"$INPUT_TX"'", "vout": 0, "sequence": 150 } ]' '[ { "'"$OUTPUT_ADDR"'": 0.00099900 }, { "fee": 0.00000100 } ]'
# [...]
# By its sequence value, this transaction would be valid for mempool
# submission once 150 blocks have been confirmed following the input
# transaction. If it is submitted to a Liquid Network node before that,
# the node will reject it with the error "non-BIP68-final".
#
# If it is submitted after that, the check_lock_distance jet will
# succeed and the transaction as a whole will be valid. The transaction
# can be successfully added to the blockchain. (On Liquid, the block
# time is one minute, so the 150-block delay is complete 150 minutes after
# the input transaction.)
```
-->

## No maximum time constraints

Because of the *monotonicity* property of Bitcoin and related blockchain systems, there is no way to directly express a requirement that a transaction occur *before* a certain block height and not after. These systems enforce a rule that a specific transaction that was valid at some point remains valid at all times in the future. Although you can write SimplicityHL code that asserts that a lock distance is *smaller than* rather than *larger than* a specific numerical value, the person creating the transaction can simply assert a small `sequence` value which will be accepted as valid by the blockchain consensus.

**Architecturally, timelocks in SimplicityHL contracts can only be usefully used to enforce minimum times, not maximum times, when transactions can occur.**

For example, if a contract was funded with an specific input at block height 5000, and the contract asserts that the relative `Distance` when spending that input should be *less than* 100, a transaction spending that input while asserting `sequence` equal to 50 will still be valid when committed at block height 10000, as the criteria 50<10000-5000 (required by the nodes enforcing blockchain consensus rules in the transaction sequence) and 50<100 (for the contract's own logic) are both true. Asserting the `lock_distance` is small requires the use of a correspondingly small `sequence` value, but this does *not* imply that the resulting transaction is necessarily committed to the blockchain within a short time after the inputs it consumes.

An effective "maximum time" might be achieved by having another contract branch that allows funds to be transferred elsewhere (one common pattern is that they can be refunded to their senders, for example). This requires some party to proactively create a transaction to take advantage of this option. The usual pattern for a timeout option is to say that, after a certain minimum time, assets transferred to the contract may be transferred back to their senders. If this option is used, other transactions then cannot occur after that time, because the contract no longer holds those assets.
