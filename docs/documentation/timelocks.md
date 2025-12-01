# Timelocks

## Relative timelock with check_lock_distance()

One straightforward way to express a timelock condition in a SimplicityHL <glossary:contract> is via the `check_lock_distance()` <glossary:jet>, which lets you specify a minimum required "distance" from the <glossary:input> transaction(s) that must elapse before an asset can be claimed from the contract.

This is a *relative* timelock condition. That means it's defined in terms of the age of its input(s). In contracts running on the <glossary:Liquid> Network, its "distance" is expressed as a count of <glossary:Elements> blocks. Since Elements blocks are published one minute apart, the `check_lock_distance()` time constraint in such contracts is expressed in *minutes*.

For example, if a certain code path in a contract calls `jet::check_lock_distance(1440)`, that code path enforces the condition that assets cannot be claimed by a transaction until (at least) 1440 minutes have elapsed following the newest input to such a transaction. (This delay corresponds to 24 hours, or one day.)

As a way of committing to obey timelock conditions, transactions claiming assets from contracts that use `check_lock_distance()` must set the `sequence` <glossary:parameter> on each <glossary:input>. This is normally set when first creating a <glossary:PSET> for the transaction; if you're using `hal-simplicity`, then `sequence` appears as a JSON parameter attached to one or more inputs you supply `hal-simplicity simplicity pset create`. The `sequence` value on an input is an assertion that the new transaction will not be confirmed on the blockchain until (at least) the specified number of blocks have been confirmed following that input. By default, it is equal to 0 (that is, there is *no* required delay before spending the input).

When building a transaction, to assert compliance with a relative timelock, you need to set `sequence` on each input to your transaction to a value at least as large as the smallest `check_lock_distance()` jet call that will occur inside the transaction. Your transaction is then only considered valid for submission after this actual amount of time has passed.

## Example (descriptive)

For example, consider a SimplicityHL contract that, at some point, calls `jet::check_lock_distance(100)`.  (A concrete version of this example appears in code form below.)

If you want to build a transaction claiming assets from this contract, you will need to set `sequence` on each input to at least 100. Suppose there is only one input to your transaction. Then...

* If you don't set `sequence` at all, it will be assumed to be 0, and the timelock condition (the call to `jet::check_lock_distance(100)`) will fail.

* If you set `sequence` to 50, the timelock condition (the call to `jet::check_lock_distance(100)`) will fail because the `sequence` value is smaller than required.

* If you set `sequence` to 150, the timelock condition *succeeds*. However, if you *submit* this transaction to the Liquid Network blockchain less than 150 minutes after the input transaction, the <glossary:node> to which you submitted it will reject it with a `non-BIP68-final` (meaning that it's still too early for the proposed transaction to be valid).

* If you set `sequence` to 150 and submit the transaction at least 150 minutes after the input transaction, the transaction should be valid and accepted on the blockchain (at least as far as the timelock condition is concerned!).

## Example (code)

Consider this contract which enforces a spending delay.

```
fn main(){
    // This contract can be spent by anyone... but only after waiting 100
    // minutes or more.
    let minimum_distance: Distance = 100;
    jet::check_lock_distance(minimum_distance);
}
```

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

## No maximum time

Because of the *monotonicity* property of Bitcoin and related blockchain systems, there is no way to directly express a requirement that a transaction occur *before* a certain block height and not after. These systems enforce a rule that a specific transaction that was valid at some point remains valid at all times in the future. Although you can write SimplicityHL code that asserts that a lock distance is *smaller than* rather than *larger than* a specific numerical value, the person creating the transaction can simply assert a small `sequence` value which will be accepted as valid by the blockchain consensus.

E.g. if a contract was funded with an specific input at block height 5000, and the contract asserts that the `lock_distance` when spending that input should be *less than* 100, a transaction spending that input while asserting `sequence` equal to 50 will still be valid when committed at block height 10000, as the criteria 50<10000-5000 (required by the nodes enforcing blockchain consensus rules in the transaction sequence) and 50<100 (for the contract's own logic) are both true. Thus, asserting the `lock_distance` is small only requires the use of a correspondingly small `sequence` value, but this does *not* imply that the resulting transaction is actually committed within a short time after the inputs it consumes.

Architecturally, timelocks in SimplicityHL contracts can only be usefully used to enforce minimum times, not maximum times, when transactions can occur.

An effective "maximum time" might be achieved by having another contract branch that allows funds to be transferred elsewhere (one common pattern is that they can be refunded to their senders, for example). This does require someone to proactively create a transaction to take advantage of this option. The usual pattern for a timeout option is to say that, after a certain minimum time, assets transferred to the contract may be transferred back to their senders. If this option is used, other transactions then cannot occur after that time because the contract no longer holds those assets.
